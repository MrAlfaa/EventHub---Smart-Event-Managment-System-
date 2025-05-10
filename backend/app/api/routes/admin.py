from fastapi import APIRouter, HTTPException, Depends, status
from app.models.user import UserCreate, UserInDB
from app.schemas.admin import SuperAdminCheck, SuperAdminCreate
from app.core.security import get_password_hash
from app.db.mongodb import get_database
from datetime import datetime
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/admin/check-superadmin", response_model=SuperAdminCheck)
async def check_superadmin_exists():
    """Check if a super_admin user exists in the system"""
    db = await get_database()
    
    # Check if any super_admin exists
    super_admin = await db.users.find_one({"role": "super_admin"})
    
    return {"exists": super_admin is not None}

@router.post("/admin/create-superadmin", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_superadmin(admin_data: SuperAdminCreate):
    """Create the first super admin. Only works if no super_admin exists"""
    db = await get_database()
    
    # Check if any super_admin already exists
    existing_admin = await db.users.find_one({"role": "super_admin"})
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A super admin already exists in the system"
        )
    
    # Check if email or username already exists
    existing_user = await db.users.find_one({
        "$or": [
            {"email": admin_data.email},
            {"username": admin_data.username}
        ]
    })
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already in use"
        )
    
    # Create the super admin user
    hashed_password = get_password_hash(admin_data.password)
    
    super_admin = {
        "username": admin_data.username,
        "email": admin_data.email,
        "name": admin_data.name,
        "password": hashed_password,
        "role": "super_admin",
        "phone": "",  # Default empty value
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "profile_image": None
    }
    
    # Insert super admin into database
    await db.users.insert_one(super_admin)
    
    return {"message": "Super admin created successfully"}