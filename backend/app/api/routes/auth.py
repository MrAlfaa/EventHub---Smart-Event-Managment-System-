from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import UserInDB
from app.schemas.auth import Token, LoginRequest, LoginResponse
from app.core.security import verify_password, create_access_token
from app.db.mongodb import get_database
from datetime import timedelta
from app.core.config import settings
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    db = await get_database()
    
    # Find user by email
    user = await db.users.find_one({"email": login_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user["_id"]),
        role=user["role"],
        expires_delta=access_token_expires
    )
    
    # Convert ObjectId to string for response
    user_dict = {k: v for k, v in user.items() if k != "password"}
    if "_id" in user_dict:
        user_dict["id"] = str(user_dict["_id"])
        del user_dict["_id"]
    
    # Make sure you're returning both user and token
    return {"user": user_dict, "token": access_token}

@router.post("/auth/refresh-token", response_model=dict)
async def refresh_token(current_user: UserInDB = Depends(get_current_user)):
    # Create a new access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(current_user.id),
        role=current_user.role,
        expires_delta=access_token_expires
    )
    
    return {"token": access_token}