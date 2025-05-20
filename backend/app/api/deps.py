from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError
from app.schemas.auth import TokenPayload
from app.db.mongodb import get_database
from app.core.config import settings
from app.models.user import UserInDB
from bson.objectid import ObjectId
from bson.errors import InvalidId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    db = await get_database()
    
    # Handle the user_id properly, whether it's a valid ObjectId or not
    user_id = token_data.sub
    
    # Check if user_id starts with 'manual_', and if so, remove the prefix
    if isinstance(user_id, str) and user_id.startswith('manual_'):
        # For manual IDs, remove the prefix and try to get a valid ObjectId
        clean_id = user_id.replace('manual_', '')
        try:
            object_id = ObjectId(clean_id)
            user = await db.users.find_one({"_id": object_id})
        except InvalidId:
            # If still invalid after cleanup, try finding by string ID
            user = await db.users.find_one({"id": user_id})  # Some systems might store string IDs
    else:
        # For regular IDs, try direct ObjectId conversion
        try:
            object_id = ObjectId(user_id)
            user = await db.users.find_one({"_id": object_id})
        except InvalidId:
            # If invalid, try finding by string ID
            user = await db.users.find_one({"id": user_id})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Convert _id to string before passing to model
    if '_id' in user:
        user['id'] = str(user['_id'])
        # Don't delete '_id' here as it might be needed elsewhere
    
    try:
        return UserInDB(**user)
    except Exception as e:
        print(f"Error creating UserInDB: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Add this new function to check for admin privileges
async def get_current_admin_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough permission"
        )
    return current_user