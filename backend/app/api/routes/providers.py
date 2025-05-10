from fastapi import APIRouter, HTTPException, Depends, status
from app.models.user import ServiceProviderCreate, ServiceProviderInDB
from app.core.security import get_password_hash
from app.db.mongodb import get_database
from datetime import datetime
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/providers/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_service_provider(provider: ServiceProviderCreate):
    db = await get_database()
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": provider.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    # Check if username already exists
    existing_username = await db.users.find_one({"username": provider.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new service provider
    hashed_password = get_password_hash(provider.password)
    new_provider = provider.dict()
    new_provider["password"] = hashed_password
    new_provider["created_at"] = datetime.utcnow()
    new_provider["updated_at"] = datetime.utcnow()
    
    # Insert service provider into database
    await db.users.insert_one(new_provider)
    
    return {"message": "Service provider registered successfully. Your account is pending admin approval."}