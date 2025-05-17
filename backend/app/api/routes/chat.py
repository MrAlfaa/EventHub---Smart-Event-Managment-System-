from fastapi import APIRouter, HTTPException, Depends, status, Body
from app.models.user import UserInDB
from app.models.chat import ChatMessage, ChatConversation
from app.db.mongodb import get_database
from app.api.deps import get_current_user
from bson import ObjectId
from datetime import datetime
from typing import List, Optional

router = APIRouter()

@router.post("/chat/messages", response_model=dict)
async def send_message(
    receiver_id: str = Body(...),
    content: str = Body(...),
    current_user: UserInDB = Depends(get_current_user)
):
    """Send a message to another user"""
    if not content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty"
        )
    
    db = await get_database()
    
    # Verify receiver exists
    try:
        receiver = await db.users.find_one({"_id": ObjectId(receiver_id)})
        if not receiver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Receiver not found"
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid receiver ID"
        )
    
    # Create new message
    message = {
        "sender_id": str(current_user.id),
        "receiver_id": receiver_id,
        "content": content,
        "sent_at": datetime.utcnow(),
        "read": False
    }
    
    result = await db.chat_messages.insert_one(message)
    message_id = result.inserted_id
    
    # Update or create conversation
    sender_id = str(current_user.id)
    
    # Determine user_id and provider_id based on roles
    user_role = current_user.role
    receiver_role = receiver.get("role", "user")
    
    if user_role == "service_provider" and receiver_role == "user":
        provider_id = sender_id
        user_id = receiver_id
    elif user_role == "user" and receiver_role == "service_provider":
        user_id = sender_id
        provider_id = receiver_id
    else:
        # For admin or other roles, just use IDs directly
        user_id = sender_id
        provider_id = receiver_id
    
    # Check if conversation exists
    conversation = await db.chat_conversations.find_one({
        "$or": [
            {"user_id": user_id, "provider_id": provider_id},
            {"user_id": provider_id, "provider_id": user_id}
        ]
    })
    
    now = datetime.utcnow()
    
    if conversation:
        # Update existing conversation
        update_data = {
            "last_message": content,
            "last_message_time": now,
            "updated_at": now
        }
        
        # Increment unread count for receiver
        if receiver_id == user_id:
            await db.chat_conversations.update_one(
                {"_id": conversation["_id"]},
                {"$inc": {"unread_count": 1}, "$set": update_data}
            )
        else:
            await db.chat_conversations.update_one(
                {"_id": conversation["_id"]},
                {"$set": update_data}
            )
    else:
        # Create new conversation
        new_conversation = {
            "user_id": user_id,
            "provider_id": provider_id,
            "last_message": content,
            "last_message_time": now,
            "unread_count": 1 if receiver_id == user_id else 0,
            "updated_at": now
        }
        await db.chat_conversations.insert_one(new_conversation)
    
    return {
        "id": str(message_id),
        "content": content,
        "sent_at": now.isoformat(),
        "sender_id": sender_id,
        "receiver_id": receiver_id
    }

@router.get("/chat/messages/{user_id}", response_model=list)
async def get_messages(
    user_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Get all messages between current user and another user"""
    db = await get_database()
    
    # Get messages between the two users
    messages = await db.chat_messages.find({
        "$or": [
            {"sender_id": str(current_user.id), "receiver_id": user_id},
            {"sender_id": user_id, "receiver_id": str(current_user.id)}
        ]
    }).sort("sent_at", 1).to_list(length=100)
    
    # Mark messages as read if current user is the receiver
    message_ids = []
    for message in messages:
        if message["receiver_id"] == str(current_user.id) and not message.get("read", False):
            message_ids.append(message["_id"])
    
    if message_ids:
        await db.chat_messages.update_many(
            {"_id": {"$in": message_ids}},
            {"$set": {"read": True}}
        )
        
        # Also reset unread count in conversation
        conversation_query = {
            "$or": [
                {"user_id": str(current_user.id), "provider_id": user_id},
                {"user_id": user_id, "provider_id": str(current_user.id)}
            ]
        }
        
        await db.chat_conversations.update_one(
            conversation_query,
            {"$set": {"unread_count": 0}}
        )
    
    # Format messages for response
    formatted_messages = []
    for message in messages:
        formatted_messages.append({
            "id": str(message["_id"]),
            "sender_id": message["sender_id"],
            "receiver_id": message["receiver_id"],
            "content": message["content"],
            "sent_at": message["sent_at"].isoformat(),
            "read": message.get("read", False)
        })
    
    return formatted_messages

@router.get("/chat/conversations", response_model=list)
async def get_conversations(current_user: UserInDB = Depends(get_current_user)):
    """Get all conversations for the current user"""
    db = await get_database()
    
    # Get all conversations where current user is involved
    user_id = str(current_user.id)
    user_role = current_user.role
    
    if user_role == "service_provider":
        # If service provider, look for conversations where they're the provider
        conversations = await db.chat_conversations.find({
            "provider_id": user_id
        }).sort("updated_at", -1).to_list(length=50)
    else:
        # If user, look for conversations where they're the user
        conversations = await db.chat_conversations.find({
            "user_id": user_id
        }).sort("updated_at", -1).to_list(length=50)
    
    # Enrich conversations with user details
    result = []
    for conv in conversations:
        # Get the other participant's details
        other_id = conv["user_id"] if conv["provider_id"] == user_id else conv["provider_id"]
        
        try:
            other_user = await db.users.find_one({"_id": ObjectId(other_id)})
        except:
            # Skip if user not found
            continue
        
        if other_user:
            # Get service provider profile for more details if needed
            profile = None
            if other_user.get("role") == "service_provider":
                profile = await db.service_provider_profiles.find_one({"user_id": other_id})
            
            # Format conversation
            formatted_conv = {
                "id": str(conv["_id"]),
                "contact_id": other_id,
                "contact_name": other_user.get("name", "Unknown"),
                "contact_username": other_user.get("username", ""),
                "contact_role": other_user.get("role", "user"),
                "contact_profile_image": other_user.get("profile_image", ""),
                "last_message": conv.get("last_message", ""),
                "last_message_time": conv.get("last_message_time", "").isoformat() if conv.get("last_message_time") else None,
                "unread_count": conv.get("unread_count", 0),
                "updated_at": conv.get("updated_at", "").isoformat() if conv.get("updated_at") else None
            }
            
            # Add business name if it's a service provider
            if profile and profile.get("business_name"):
                formatted_conv["contact_business_name"] = profile.get("business_name")
            
            if profile and profile.get("profile_picture_url"):
                formatted_conv["contact_profile_image"] = profile.get("profile_picture_url")
            
            result.append(formatted_conv)
    
    return result    