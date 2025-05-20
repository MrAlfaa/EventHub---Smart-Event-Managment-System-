from fastapi import APIRouter, HTTPException, Depends, status, File, UploadFile, Form
from datetime import datetime
import cloudinary
import cloudinary.uploader
from app.core.config import settings
from typing import List
from app.models.user import UserCreate, UserInDB, UserUpdate
from app.core.security import get_password_hash
from app.db.mongodb import get_database
from bson.objectid import ObjectId
from app.api.deps import get_current_user
from app.schemas.auth import Token, TokenPayload
from pydantic import EmailStr

router = APIRouter()

@router.post("/users/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    db = await get_database()
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    # Check if username already exists
    existing_username = await db.users.find_one({"username": user.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = user.dict()
    new_user["password"] = hashed_password
    
    # Insert user into database
    await db.users.insert_one(new_user)
    
    return {"message": "User registered successfully"}

@router.get("/users/me", response_model=UserInDB)
async def get_current_user_info(current_user: UserInDB = Depends(get_current_user)):
    return current_user

@router.put("/users/me", response_model=UserInDB)
async def update_user_info(
    user_update: UserUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    db = await get_database()
    
    # Prepare update data
    update_data = {k: v for k, v in user_update.dict(exclude_unset=True).items() if v is not None}
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_data["updated_at"] = datetime.utcnow()
    
    # Update user in database
    result = await db.users.update_one(
        {"_id": current_user.id}, {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or no changes made"
        )
    
    # Get updated user
    updated_user = await db.users.find_one({"_id": current_user.id})
    
    return UserInDB(**updated_user)

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

@router.post("/users/update-profile-with-documents", response_model=UserInDB)
async def update_user_profile_with_documents(
    username: str = Form(None),
    name: str = Form(None),
    phone: str = Form(None),
    email: EmailStr = Form(None),
    address: str = Form(None),
    nic_number: str = Form(None),
    profile_image: UploadFile = File(None),
    nic_front_image: UploadFile = File(None),
    nic_back_image: UploadFile = File(None),
    current_user: UserInDB = Depends(get_current_user)
):
    db = await get_database()
    
    # Prepare update data
    update_data = {}
    
    # Add form fields if provided
    if username:
        # Check if username already exists for another user
        existing_user = await db.users.find_one({"username": username, "_id": {"$ne": current_user.id}})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        update_data["username"] = username
        
    if name:
        update_data["name"] = name
    if phone:
        update_data["phone"] = phone
    if email:
        # Check if email already exists for another user
        existing_user = await db.users.find_one({"email": email, "_id": {"$ne": current_user.id}})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        update_data["email"] = email
    if address:
        update_data["address"] = address
    if nic_number:
        update_data["nic_number"] = nic_number
    
    # Handle file uploads
    try:
        # Upload profile image if provided
        if profile_image:
            profile_result = cloudinary.uploader.upload(
                profile_image.file,
                folder="eventhub/profile_images",
                public_id=f"profile_{current_user.id}_{datetime.now().timestamp()}"
            )
            update_data["profile_image"] = profile_result["secure_url"]
        
        # Upload NIC front image if provided
        if nic_front_image:
            nic_front_result = cloudinary.uploader.upload(
                nic_front_image.file,
                folder="eventhub/nic_images",
                public_id=f"nic_front_{current_user.id}_{datetime.now().timestamp()}"
            )
            update_data["nic_front_image"] = nic_front_result["secure_url"]
        
        # Upload NIC back image if provided
        if nic_back_image:
            nic_back_result = cloudinary.uploader.upload(
                nic_back_image.file,
                folder="eventhub/nic_images",
                public_id=f"nic_back_{current_user.id}_{datetime.now().timestamp()}"
            )
            update_data["nic_back_image"] = nic_back_result["secure_url"]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading images: {str(e)}"
        )
    
    # Add updated timestamp
    update_data["updated_at"] = datetime.utcnow()
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Update user in database
    result = await db.users.update_one(
        {"_id": current_user.id}, {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or no changes made"
        )
    
    # Get updated user
    updated_user = await db.users.find_one({"_id": current_user.id})
    
    # Convert _id to string
    updated_user["id"] = str(updated_user["_id"])
    del updated_user["_id"]
    
    # Remove password hash
    if "password" in updated_user:
        del updated_user["password"]
    
    return updated_user