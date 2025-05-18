from fastapi import APIRouter, HTTPException, Depends, status
from app.models.booking import BookingCreate, BookingInDB, BookingUpdate
from app.db.mongodb import get_database
from app.api.deps import get_current_user
from app.models.user import UserInDB
from bson.objectid import ObjectId
from datetime import datetime, timedelta
from typing import List

router = APIRouter()

@router.post("/bookings", response_model=dict)
async def create_booking(
    booking_data: BookingCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    """Create a new booking"""
    db = await get_database()
    
    # Create booking object with user data
    new_booking = booking_data.dict()
    new_booking["userId"] = str(current_user.id)
    new_booking["status"] = "pending"  # Initial status is pending
    new_booking["createdAt"] = datetime.utcnow()
    
    # Add payment information
    new_booking["payments"] = [{
        "amount": booking_data.paymentAmount,
        "method": booking_data.paymentMethod,
        "date": datetime.utcnow(),
        "status": "completed",
        "type": "advance"
    }]
    
    # Calculate remaining amount
    new_booking["remainingAmount"] = booking_data.totalAmount - booking_data.paymentAmount
    
    # Insert into database
    result = await db.bookings.insert_one(new_booking)
    
    # Get the inserted booking
    booking = await db.bookings.find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string - IMPORTANT FIX
    if booking:
        booking["id"] = str(booking["_id"])
        del booking["_id"]  # Remove the ObjectId to prevent serialization issues
    
    return booking

@router.get("/bookings/user", response_model=List[dict])
async def get_user_bookings(current_user: UserInDB = Depends(get_current_user)):
    """Get all bookings for the current user"""
    db = await get_database()
    
    # First, auto-accept any pending bookings older than 12 hours
    current_time = datetime.utcnow()
    twelve_hours_ago = current_time - timedelta(hours=12)
    
    # Update bookings that are pending and older than 12 hours
    await db.bookings.update_many(
        {
            "userId": str(current_user.id),
            "status": "pending",
            "createdAt": {"$lt": twelve_hours_ago}
        },
        {"$set": {"status": "confirmed", "autoAcceptedAt": current_time}}
    )
    
    # Get user bookings
    cursor = db.bookings.find({"userId": str(current_user.id)})
    bookings = await cursor.to_list(length=100)
    
    # Add provider information to each booking
    for booking in bookings:
        booking["id"] = str(booking["_id"])
        del booking["_id"]
        
        # Add debug logging to see what's happening with the provider lookup
        if "providerId" in booking:
            print(f"Looking up provider for ID: {booking['providerId']}")
            # First try to get the provider profile
            provider_profile = await db.service_provider_profiles.find_one({"user_id": booking["providerId"]})
            if provider_profile:
                print(f"Found provider profile: {provider_profile.get('provider_name')}")
                booking["providerName"] = provider_profile.get("provider_name", "Unknown Provider")
                booking["businessName"] = provider_profile.get("business_name", "Unknown Business")
            else:
                # If profile not found, try to get basic user info
                provider_user = await db.users.find_one({"_id": ObjectId(booking["providerId"])})
                if provider_user:
                    print(f"Found provider user: {provider_user.get('name')}")
                    booking["providerName"] = provider_user.get("name", "Unknown Provider")
                    booking["businessName"] = provider_user.get("business_name", provider_user.get("name") + "'s Business")
                else:
                    print(f"No provider information found for ID: {booking['providerId']}")
                    booking["providerName"] = "Unknown Provider"
                    booking["businessName"] = "Unknown Business"
        
            # Make double sure these fields are in the response
            print(f"Final provider name: {booking.get('providerName')}")
            print(f"Final business name: {booking.get('businessName')}")
        
        # Ensure services field exists
        if "services" not in booking or not booking["services"]:
            # Try to get service information from the package
            if "packageId" in booking:
                package = await db.provider_packages.find_one({"_id": ObjectId(booking["packageId"])})
                if package:
                    booking["services"] = [package.get("name", "Unknown Package")]
            else:
                booking["services"] = []
    
    return bookings

@router.get("/bookings/{booking_id}", response_model=dict)
async def get_booking(
    booking_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Get a specific booking by ID"""
    db = await get_database()
    
    # Check if booking exists and belongs to this user
    booking = await db.bookings.find_one({
        "_id": ObjectId(booking_id),
        "userId": str(current_user.id)
    })
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Convert ObjectId to string
    booking["id"] = str(booking["_id"])
    del booking["_id"]
    
    return booking

@router.post("/bookings/{booking_id}/cancel", response_model=dict)
async def cancel_booking(
    booking_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Cancel a booking"""
    db = await get_database()
    
    # Check if booking exists and belongs to this user
    booking = await db.bookings.find_one({
        "_id": ObjectId(booking_id),
        "userId": str(current_user.id)
    })
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if booking can be cancelled (within 12 hours of creation)
    booking_created = booking.get("createdAt", datetime.utcnow())
    current_time = datetime.utcnow()
    time_difference = (current_time - booking_created).total_seconds() / 3600
    
    if time_difference > 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking can only be cancelled within 12 hours of creation"
        )
    
    # Check if booking status allows cancellation
    if booking["status"] not in ["pending", "confirmed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel booking with status: {booking['status']}"
        )
    
    # Update booking status
    result = await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "cancelled", "cancelledAt": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to cancel booking"
        )
    
    # Get updated booking
    updated_booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    updated_booking["id"] = str(updated_booking["_id"])
    del updated_booking["_id"]
    
    return updated_booking

@router.post("/bookings/{booking_id}/payment", response_model=dict)
async def make_payment(
    booking_id: str,
    payment_data: dict,
    current_user: UserInDB = Depends(get_current_user)
):
    """Add a payment to a booking"""
    db = await get_database()
    
    # Check if booking exists and belongs to this user
    booking = await db.bookings.find_one({
        "_id": ObjectId(booking_id),
        "userId": str(current_user.id)
    })
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if booking can accept payments
    if booking["status"] not in ["pending", "confirmed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot make payment for booking with status: {booking['status']}"
        )
    
    # Create payment record
    payment = {
        "amount": payment_data["amount"],
        "method": payment_data["method"],
        "date": datetime.utcnow(),
        "status": "completed",
        "type": "balance"
    }
    
    # Calculate new remaining amount
    remaining = booking.get("remainingAmount", 0) - payment["amount"]
    
    # Check if the payment completes the booking
    new_status = booking["status"]
    if remaining <= 0:
        new_status = "confirmed"
        remaining = 0
    
    # Update booking with new payment and status
    result = await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {
            "$push": {"payments": payment},
            "$set": {
                "remainingAmount": remaining,
                "status": new_status,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to process payment"
        )
    
    # Get updated booking
    updated_booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    updated_booking["id"] = str(updated_booking["_id"])
    del updated_booking["_id"]
    
    return updated_booking