from fastapi import APIRouter, HTTPException, Depends, status
from app.models.notification import NotificationCreate, NotificationInDB
from app.db.mongodb import get_database
from app.api.deps import get_current_user
from app.models.user import UserInDB
from bson.objectid import ObjectId
from datetime import datetime
from typing import List

router = APIRouter()

@router.get("/notifications", response_model=List[dict])
async def get_notifications(current_user: UserInDB = Depends(get_current_user)):
    """Get all notifications for the current user"""
    db = await get_database()
    
    # Get notifications for current user
    cursor = db.notifications.find({"recipient_id": str(current_user.id)})
    notifications = await cursor.to_list(length=100)
    
    # Convert ObjectId to string
    for notification in notifications:
        notification["id"] = str(notification["_id"])
        del notification["_id"]
        
        # Add proper time formatting
        if "created_at" in notification:
            notification["time"] = notification["created_at"].isoformat()
    
    # Sort by created_at (newest first)
    notifications.sort(key=lambda x: x.get("created_at", datetime.min), reverse=True)
    
    return notifications

@router.post("/notifications/{notification_id}/read", response_model=dict)
async def mark_notification_as_read(
    notification_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Mark a notification as read"""
    db = await get_database()
    
    # Update notification
    result = await db.notifications.update_one(
        {
            "_id": ObjectId(notification_id),
            "recipient_id": str(current_user.id)
        },
        {"$set": {"is_read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"message": "Notification marked as read"}

@router.post("/notifications/read-all", response_model=dict)
async def mark_all_notifications_as_read(current_user: UserInDB = Depends(get_current_user)):
    """Mark all notifications as read"""
    db = await get_database()
    
    # Update all notifications for current user
    result = await db.notifications.update_many(
        {"recipient_id": str(current_user.id)},
        {"$set": {"is_read": True}}
    )
    
    return {"message": f"Marked {result.modified_count} notifications as read"}