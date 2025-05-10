from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.models.user import UserCreate, UserInDB, UserUpdate
from app.core.security import get_password_hash
from app.db.mongodb import get_database
from bson.objectid import ObjectId
from app.api.deps import get_current_user
from app.schemas.auth import Token, TokenPayload

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