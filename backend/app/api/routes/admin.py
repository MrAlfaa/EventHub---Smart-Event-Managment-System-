from fastapi import APIRouter, HTTPException, Depends, status, Query, Body, UploadFile, File, Form
from app.models.user import UserCreate, UserInDB
from app.schemas.admin import SuperAdminCheck, SuperAdminCreate, ServiceProviderApprovalAction
from app.schemas.promotions import PromotionCreate, PublicEventCreate, PromotionUpdate, PublicEventUpdate, PromotionResponse
from app.core.security import get_password_hash
from app.db.mongodb import get_database
from datetime import datetime
from app.api.deps import get_current_user, get_current_admin_user
from typing import List, Optional
from bson.objectid import ObjectId
import cloudinary
import cloudinary.uploader
from app.core.config import settings

router = APIRouter()

# Configure Cloudinary for image uploads
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

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

@router.get("/admin/users", response_model=List[dict])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Get all regular users"""
    db = await get_database()
    
    # Find all users with role="user"
    cursor = db.users.find({"role": "user"}).skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    
    # Convert ObjectIds to strings for JSON serialization
    for user in users:
        user["id"] = str(user["_id"])
        del user["_id"]
        
        # Remove password hash for security
        if "password" in user:
            del user["password"]
    
    return users

@router.get("/admin/stats", response_model=dict)
async def get_admin_stats(
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Get dashboard statistics for admin"""
    db = await get_database()
    
    # Count total regular users
    users_count = await db.users.count_documents({"role": "user"})
    
    # Count total service providers
    service_providers_count = await db.users.count_documents({"role": "service_provider"})
    
    # Count pending service provider applications
    pending_providers_count = await db.service_provider_profiles.count_documents({"approval_status": "pending"})
    
    # Get stats for recent activities (you can expand this as needed)
    return {
        "users_count": users_count,
        "service_providers_count": service_providers_count,
        "pending_providers_count": pending_providers_count,
    }

# Promotions Management Routes
@router.post("/admin/promotions", response_model=PromotionResponse)
async def create_promotion(
    title: str = Form(...),
    description: str = Form(...),
    type: str = Form(...),
    status: str = Form("draft"),
    validUntil: Optional[str] = Form(None),
    promoCode: Optional[str] = Form(None),
    terms: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    eventDate: Optional[str] = Form(None),
    bannerImage: Optional[UploadFile] = File(None),
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Create a new promotion or public event"""
    db = await get_database()
    
    promotion_data = {
        "title": title,
        "description": description,
        "type": type,
        "status": status,
        "published_date": datetime.utcnow().isoformat(),
        "created_by": str(current_admin.id),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    # Add type-specific fields
    if type == "promotion":
        promotion_data["valid_until"] = validUntil
        promotion_data["promo_code"] = promoCode
        promotion_data["terms"] = terms.split('\n') if terms else []
    elif type == "event":
        promotion_data["location"] = location
        promotion_data["event_date"] = eventDate
    
    # Handle banner image upload
    if bannerImage:
        try:
            upload_result = cloudinary.uploader.upload(
                bannerImage.file,
                folder="eventhub/promotions",
                public_id=f"promo_{datetime.now().timestamp()}"
            )
            promotion_data["banner_image"] = upload_result["secure_url"]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error uploading image: {str(e)}"
            )
    
    # Insert into database
    result = await db.promotions.insert_one(promotion_data)
    
    # Get the created document
    created_promotion = await db.promotions.find_one({"_id": result.inserted_id})
    
    # Transform to response format
    response = {
        "id": str(created_promotion["_id"]),
        "title": created_promotion["title"],
        "description": created_promotion["description"],
        "type": created_promotion["type"],
        "bannerImage": created_promotion.get("banner_image"),
        "status": created_promotion["status"],
        "publishedDate": created_promotion["published_date"],
    }
    
    # Add type-specific fields to response
    if type == "promotion":
        response["validUntil"] = created_promotion.get("valid_until")
        response["promoCode"] = created_promotion.get("promo_code")
        response["terms"] = created_promotion.get("terms", [])
    elif type == "event":
        response["location"] = created_promotion.get("location")
        response["eventDate"] = created_promotion.get("event_date")
    
    return response

@router.get("/admin/promotions", response_model=List[PromotionResponse])
async def get_promotions(
    type: Optional[str] = None,
    status: Optional[str] = None,
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Get all promotions with optional filters"""
    db = await get_database()
    
    # Build query based on filters
    query = {}
    if type:
        query["type"] = type
    if status:
        query["status"] = status
    
    # Get promotions from database
    cursor = db.promotions.find(query)
    promotions = await cursor.to_list(length=100)
    
    # Transform for response
    result = []
    for promo in promotions:
        response_item = {
            "id": str(promo["_id"]),
            "title": promo["title"],
            "description": promo["description"],
            "type": promo["type"],
            "bannerImage": promo.get("banner_image"),
            "status": promo["status"],
            "publishedDate": promo["published_date"],
        }
        
        # Add type-specific fields
        if promo["type"] == "promotion":
            response_item["validUntil"] = promo.get("valid_until")
            response_item["promoCode"] = promo.get("promo_code")
            response_item["terms"] = promo.get("terms", [])
        elif promo["type"] == "event":
            response_item["location"] = promo.get("location")
            response_item["eventDate"] = promo.get("event_date")
        
        result.append(response_item)
    
    return result

@router.put("/admin/promotions/{promotion_id}", response_model=PromotionResponse)
async def update_promotion(
    promotion_id: str,
    title: str = Form(...),
    description: str = Form(...),
    type: str = Form(...),
    status: str = Form(...),
    validUntil: Optional[str] = Form(None),
    promoCode: Optional[str] = Form(None),
    terms: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    eventDate: Optional[str] = Form(None),
    bannerImage: Optional[UploadFile] = File(None),
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Update an existing promotion or public event"""
    db = await get_database()
    
    # Check if promotion exists
    existing_promotion = await db.promotions.find_one({"_id": ObjectId(promotion_id)})
    if not existing_promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promotion not found"
        )
    
    # Prepare update data
    update_data = {
        "title": title,
        "description": description,
        "type": type,
        "status": status,
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    # Add type-specific fields
    if type == "promotion":
        update_data["valid_until"] = validUntil
        update_data["promo_code"] = promoCode
        update_data["terms"] = terms.split('\n') if terms else []
    elif type == "event":
        update_data["location"] = location
        update_data["event_date"] = eventDate
    
    # Handle banner image upload
    if bannerImage:
        try:
            upload_result = cloudinary.uploader.upload(
                bannerImage.file,
                folder="eventhub/promotions",
                public_id=f"promo_{datetime.now().timestamp()}"
            )
            update_data["banner_image"] = upload_result["secure_url"]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error uploading image: {str(e)}"
            )
    
    # Update in database
    await db.promotions.update_one(
        {"_id": ObjectId(promotion_id)},
        {"$set": update_data}
    )
    
    # Get the updated document
    updated_promotion = await db.promotions.find_one({"_id": ObjectId(promotion_id)})
    
    # Transform to response format
    response = {
        "id": str(updated_promotion["_id"]),
        "title": updated_promotion["title"],
        "description": updated_promotion["description"],
        "type": updated_promotion["type"],
        "bannerImage": updated_promotion.get("banner_image"),
        "status": updated_promotion["status"],
        "publishedDate": updated_promotion["published_date"],
    }
    
    # Add type-specific fields to response
    if type == "promotion":
        response["validUntil"] = updated_promotion.get("valid_until")
        response["promoCode"] = updated_promotion.get("promo_code")
        response["terms"] = updated_promotion.get("terms", [])
    elif type == "event":
        response["location"] = updated_promotion.get("location")
        response["eventDate"] = updated_promotion.get("event_date")
    
    return response

@router.delete("/admin/promotions/{promotion_id}", response_model=dict)
async def delete_promotion(
    promotion_id: str,
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Delete a promotion or public event"""
    db = await get_database()
    
    # Check if promotion exists
    existing_promotion = await db.promotions.find_one({"_id": ObjectId(promotion_id)})
    if not existing_promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promotion not found"
        )
    
    # Delete from database
    await db.promotions.delete_one({"_id": ObjectId(promotion_id)})
    
    return {"message": "Promotion deleted successfully"}

@router.post("/admin/promotions/{promotion_id}/publish", response_model=dict)
async def publish_promotion(
    promotion_id: str,
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Publish a promotion or public event"""
    db = await get_database()
    
    # Check if promotion exists
    existing_promotion = await db.promotions.find_one({"_id": ObjectId(promotion_id)})
    if not existing_promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promotion not found"
        )
    
    # Update status
    await db.promotions.update_one(
        {"_id": ObjectId(promotion_id)},
        {
            "$set": {
                "status": "active",
                "published_date": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )
    
    return {"message": "Promotion published successfully"}