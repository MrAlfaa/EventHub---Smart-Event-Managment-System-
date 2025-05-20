from fastapi import APIRouter, HTTPException, Depends, status
from app.models.user import UserInDB
from app.db.mongodb import get_database
from app.api.deps import get_current_user
from bson.objectid import ObjectId
from bson.errors import InvalidId
from datetime import datetime

router = APIRouter()

@router.get("/provider-stats", response_model=dict)
async def get_provider_dashboard_stats(current_user: UserInDB = Depends(get_current_user)):
    """Get provider dashboard statistics"""
    
    # Add more detailed error logging
    print(f"Accessing dashboard stats for user: {current_user.id}, role: {current_user.role}")
    
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        # Log the rejection reason
        print(f"Access denied. User role: {current_user.role}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can access their dashboard stats"
        )
    
    try:
        db = await get_database()
        
        # Get total packages count
        total_packages = await db.provider_packages.count_documents({"provider_id": str(current_user.id)})
        
        # Get active bookings count
        active_bookings = await db.bookings.count_documents({
            "providerId": str(current_user.id),
            "status": {"$in": ["pending", "confirmed"]}
        })
        
        # Get unique customers count
        customers_pipeline = [
            {"$match": {"providerId": str(current_user.id)}},
            {"$group": {"_id": "$userId"}},
            {"$count": "total"}
        ]
        customers_agg = await db.bookings.aggregate(customers_pipeline).to_list(length=1)
        total_customers = customers_agg[0]["total"] if customers_agg else 0
        
        # Get total revenue
        revenue_pipeline = [
            {"$match": {"providerId": str(current_user.id), "status": {"$in": ["confirmed", "completed"]}}},
            {"$group": {"_id": None, "total": {"$sum": "$totalAmount"}}}
        ]
        revenue_agg = await db.bookings.aggregate(revenue_pipeline).to_list(length=1)
        total_revenue = revenue_agg[0]["total"] if revenue_agg else 0
        
        # Get recent bookings
        recent_bookings_cursor = db.bookings.find(
            {"providerId": str(current_user.id)}
        ).sort("createdAt", -1).limit(5)
        
        recent_bookings = []
        async for booking in recent_bookings_cursor:
            # Get customer info
            customer = None
            if "userId" in booking:
                try:
                    # Safely try to convert to ObjectId
                    user_id = booking["userId"]
                    if isinstance(user_id, str) and len(user_id) == 24:
                        customer = await db.users.find_one({"_id": ObjectId(user_id)})
                    else:
                        customer = await db.users.find_one({"id": user_id})
                except (InvalidId, Exception) as e:
                    print(f"Error finding customer: {str(e)}")
            
            # Get package info
            package_name = "Custom Package"
            if "packageId" in booking:
                try:
                    # Safely try to convert to ObjectId
                    package_id = booking["packageId"]
                    if isinstance(package_id, str) and len(package_id) == 24:
                        package = await db.provider_packages.find_one({"_id": ObjectId(package_id)})
                        if package:
                            package_name = package.get("name", "Custom Package")
                except (InvalidId, Exception) as e:
                    print(f"Error finding package: {str(e)}")
            
            # Format booking data
            booking_data = {
                "id": str(booking["_id"]),
                "customerName": customer.get("name", "Unknown Customer") if customer else "Unknown Customer",
                "packageName": package_name,
                "date": booking.get("eventDate", booking.get("createdAt", datetime.utcnow())),
                "status": booking.get("status", "pending")
            }
            recent_bookings.append(booking_data)
        
        # Build response data
        response_data = {
            "total_packages": total_packages,
            "active_bookings": active_bookings,
            "total_customers": total_customers,
            "total_revenue": total_revenue,
            "recent_bookings": recent_bookings
        }
        
        print(f"Successfully retrieved dashboard stats for user {current_user.id}")
        return response_data
        
    except Exception as e:
        print(f"Error in dashboard stats endpoint: {str(e)}")
        # Return a generic error to avoid exposing internal details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving dashboard statistics: {str(e)}"
        )

@router.get("/dashboard-stats", response_model=dict)
async def get_dashboard_stats(current_user: UserInDB = Depends(get_current_user)):
    """Alias for get_provider_dashboard_stats - same functionality with different endpoint"""
    return await get_provider_dashboard_stats(current_user)