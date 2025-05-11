from fastapi import APIRouter, HTTPException, Depends, status, Query
from app.models.user import UserCreate, UserInDB
from app.schemas.admin import SuperAdminCheck, SuperAdminCreate, ServiceProviderApprovalAction
from app.core.security import get_password_hash
from app.db.mongodb import get_database
from datetime import datetime
from app.api.deps import get_current_user, get_current_admin_user
from typing import List
from bson.objectid import ObjectId

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

@router.get("/admin/service-providers/pending", response_model=List[dict])
async def get_pending_service_providers(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Get all pending service provider approvals"""
    db = await get_database()
    
    # Get all service provider profiles with status pending
    cursor = db.service_provider_profiles.find({"approval_status": "pending"}).skip(skip).limit(limit)
    pending_providers = await cursor.to_list(length=limit)
    
    # Convert ObjectIds to strings for JSON serialization
    for provider in pending_providers:
        provider["id"] = str(provider["_id"])
        del provider["_id"]
    
    return pending_providers

@router.get("/admin/service-providers/approved", response_model=List[dict])
async def get_approved_service_providers(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Get all approved service providers"""
    db = await get_database()
    
    cursor = db.service_provider_profiles.find({"approval_status": "approved"}).skip(skip).limit(limit)
    approved_providers = await cursor.to_list(length=limit)
    
    for provider in approved_providers:
        provider["id"] = str(provider["_id"])
        del provider["_id"]
    
    return approved_providers

@router.get("/admin/service-providers/rejected", response_model=List[dict])
async def get_rejected_service_providers(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Get all rejected service providers"""
    db = await get_database()
    
    cursor = db.service_provider_profiles.find({"approval_status": "rejected"}).skip(skip).limit(limit)
    rejected_providers = await cursor.to_list(length=limit)
    
    for provider in rejected_providers:
        provider["id"] = str(provider["_id"])
        del provider["_id"]
    
    return rejected_providers

@router.post("/admin/service-providers/{provider_id}/approve", response_model=dict)
async def approve_service_provider(
    provider_id: str,
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Approve a service provider application"""
    db = await get_database()
    
    # Find the service provider profile
    provider_profile = await db.service_provider_profiles.find_one({"_id": ObjectId(provider_id)})
    if not provider_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider profile not found"
        )
    
    # Update the profile status
    result = await db.service_provider_profiles.update_one(
        {"_id": ObjectId(provider_id)},
        {"$set": {
            "approval_status": "approved",
            "approved_at": datetime.utcnow(),
            "approved_by": str(current_admin.id),
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update service provider profile"
        )
    
    # Update the user status
    user_result = await db.users.update_one(
        {"_id": ObjectId(provider_profile["user_id"])},
        {"$set": {
            "approval_status": "approved",
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": "Service provider approved successfully"}

@router.post("/admin/service-providers/{provider_id}/reject", response_model=dict)
async def reject_service_provider(
    provider_id: str,
    action: ServiceProviderApprovalAction,
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Reject a service provider application"""
    db = await get_database()
    
    # Find the service provider profile
    provider_profile = await db.service_provider_profiles.find_one({"_id": ObjectId(provider_id)})
    if not provider_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider profile not found"
        )
    
    # Update the profile status
    result = await db.service_provider_profiles.update_one(
        {"_id": ObjectId(provider_id)},
        {"$set": {
            "approval_status": "rejected",
            "rejected_at": datetime.utcnow(),
            "rejected_by": str(current_admin.id),
            "rejection_reason": action.reason,
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update service provider profile"
        )
    
    # Update the user status
    user_result = await db.users.update_one(
        {"_id": ObjectId(provider_profile["user_id"])},
        {"$set": {
            "approval_status": "rejected",
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": "Service provider rejected successfully"}