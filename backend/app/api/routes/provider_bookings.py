from fastapi import APIRouter, HTTPException, Depends, status
from app.models.booking import BookingInDB, BookingUpdate
from app.db.mongodb import get_database
from app.api.deps import get_current_user
from app.models.user import UserInDB
from bson.objectid import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timedelta
from typing import List
import traceback  # Add this import!

# Create the router with explicit tags
router = APIRouter(tags=["provider"])

# Debug endpoint to verify routes are working
@router.get("/provider/debug", response_model=dict)
async def debug_provider_route():
    """Debug endpoint to check if provider routes are working"""
    return {"status": "success", "message": "Provider routes are working"}

@router.get("/provider/bookings", response_model=List[dict])
async def get_provider_bookings(current_user: UserInDB = Depends(get_current_user)):
    """Get all bookings for the current service provider"""
    try:
        print(f"Provider bookings requested by: {current_user.id} with role: {current_user.role}")
        
        # Check if user is a service provider
        if current_user.role != "service_provider":
            print(f"Access denied: User {current_user.id} has role {current_user.role}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only service providers can access their bookings"
            )
        
        db = await get_database()
        
        # Get provider bookings
        print(f"Looking for bookings with providerId: {str(current_user.id)}")
        cursor = db.bookings.find({"providerId": str(current_user.id)})
        bookings = await cursor.to_list(length=100)
        print(f"Found {len(bookings)} bookings for provider {current_user.id}")
        
        # Process bookings
        result = []
        for booking in bookings:
            booking_dict = dict(booking)  # Convert to dict to avoid modification issues
            booking_dict["id"] = str(booking_dict["_id"])
            del booking_dict["_id"]
            
            # Get user information
            if "userId" in booking_dict:
                try:
                    # Handle possible invalid ObjectId format
                    user_id = booking_dict["userId"]
                    if ObjectId.is_valid(user_id):
                        user = await db.users.find_one({"_id": ObjectId(user_id)})
                        if user:
                            booking_dict["customerName"] = user.get("name", "Unknown Customer")
                            booking_dict["customerEmail"] = user.get("email", "")
                            booking_dict["customerPhone"] = user.get("phone", "")
                    else:
                        print(f"Invalid ObjectId format for user: {user_id}")
                        booking_dict["customerName"] = "Unknown Customer"
                        booking_dict["customerEmail"] = ""
                        booking_dict["customerPhone"] = ""
                except Exception as e:
                    print(f"Error processing user info: {str(e)}")
                    booking_dict["customerName"] = "Unknown Customer"
                    booking_dict["customerEmail"] = ""
                    booking_dict["customerPhone"] = ""
            
            result.append(booking_dict)
        
        print(f"Returning {len(result)} processed bookings")
        return result if result else []
        
    except Exception as e:
        # Log the detailed error
        print(f"Error in get_provider_bookings: {str(e)}")
        print(traceback.format_exc())
        
        # Return a generic error for security
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving bookings"
        )

@router.post("/provider/bookings/{booking_id}/cancel", response_model=dict)
async def provider_cancel_booking(
    booking_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Cancel a booking as a service provider"""
    if current_user.role != "service_provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can cancel their bookings"
        )
    
    db = await get_database()
    
    # Check if booking exists and belongs to this provider
    booking = await db.bookings.find_one({
        "_id": ObjectId(booking_id),
        "providerId": str(current_user.id)
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

@router.post("/provider/bookings/{booking_id}/mark-paid", response_model=dict)
async def mark_booking_paid(
    booking_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Mark a booking as fully paid"""
    if current_user.role != "service_provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can update their bookings"
        )
    
    db = await get_database()
    
    # Check if booking exists and belongs to this provider
    booking = await db.bookings.find_one({
        "_id": ObjectId(booking_id),
        "providerId": str(current_user.id)
    })
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if booking can be marked as paid
    if booking["status"] not in ["pending", "confirmed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot mark booking with status {booking['status']} as paid"
        )
    
    # Create payment record for the remaining amount
    remaining_amount = booking.get("remainingAmount", 0)
    if remaining_amount > 0:
        payment = {
            "amount": remaining_amount,
            "method": "marked_by_provider",
            "date": datetime.utcnow(),
            "status": "completed",
            "type": "balance"
        }
        
        # Update booking with new payment and status
        result = await db.bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {
                "$push": {"payments": payment},
                "$set": {
                    "remainingAmount": 0,
                    "status": "confirmed",
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to mark booking as paid"
            )
    
    # Get updated booking
    updated_booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    updated_booking["id"] = str(updated_booking["_id"])
    del updated_booking["_id"]
    
    return updated_booking
