from fastapi import APIRouter, HTTPException, Depends, status, File, UploadFile, Form, Query
from app.models.user import UserInDB
from app.db.mongodb import get_database
from datetime import datetime
from bson.objectid import ObjectId
from typing import List, Optional
from app.api.deps import get_current_admin_user, get_current_user  # Add get_current_user import
import cloudinary
import cloudinary.uploader
from app.core.config import settings
router = APIRouter()

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

@router.get("/admin/promotions", response_model=List[dict])
async def get_all_promotions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Get all promotions and public events"""
    db = await get_database()
    
    cursor = db.promotions.find().skip(skip).limit(limit)
    promotions = await cursor.to_list(length=limit)
    
    # Convert ObjectIds to strings
    for promo in promotions:
        promo["id"] = str(promo["_id"])
        del promo["_id"]
    
    return promotions

@router.post("/admin/promotions", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_promotion(
    title: str = Form(...),
    description: str = Form(...),
    type: str = Form(...),
    status: str = Form(...),
    validUntil: Optional[str] = Form(None),
    eventDate: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    promoCode: Optional[str] = Form(None),
    terms: Optional[str] = Form(None),
    bannerImage: Optional[UploadFile] = File(None),
    current_admin: UserInDB = Depends(get_current_admin_user)
):
    """Create a new promotion or public event"""
    db = await get_database()
    
    # Prepare promotion data
    promotion_data = {
        "title": title,
        "description": description,
        "type": type,
        "status": status,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "created_by": str(current_admin.id),
        "publishedDate": datetime.utcnow().isoformat()
    }
    
    # Add type-specific fields
    if type == "promotion":
        if validUntil:
            promotion_data["validUntil"] = validUntil
        if promoCode:
            promotion_data["promoCode"] = promoCode
        if terms:
            promotion_data["terms"] = terms.split('\n')
    elif type == "event":
        if eventDate:
            promotion_data["eventDate"] = eventDate
        if location:
            promotion_data["location"] = location
    
    # Upload banner image if provided
    if bannerImage:
        try:
            folder = f"eventhub/{'promotions' if type == 'promotion' else 'events'}"
            result = cloudinary.uploader.upload(
                bannerImage.file,
                folder=folder,
                public_id=f"{type}_{datetime.now().timestamp()}"
            )
            promotion_data["bannerImage"] = result["secure_url"]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error uploading banner image: {str(e)}"
            )
    
    # Insert into database
    result = await db.promotions.insert_one(promotion_data)
    
    # Return created promotion with id
    created_promotion = {**promotion_data, "id": str(result.inserted_id)}
    
    return created_promotion

@router.put("/admin/promotions/{promotion_id}", response_model=dict)
async def update_promotion(
    promotion_id: str,
    title: str = Form(...),
    description: str = Form(...),
    type: str = Form(...),
    status: str = Form(...),
    validUntil: Optional[str] = Form(None),
    eventDate: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    promoCode: Optional[str] = Form(None),
    terms: Optional[str] = Form(None),
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
        "updated_at": datetime.utcnow(),
        "updated_by": str(current_admin.id)
    }
    
    # Add type-specific fields
    if type == "promotion":
        if validUntil:
            update_data["validUntil"] = validUntil
        if promoCode is not None:
            update_data["promoCode"] = promoCode
        if terms is not None:
            update_data["terms"] = terms.split('\n') if terms else []
    elif type == "event":
        if eventDate:
            update_data["eventDate"] = eventDate
        if location:
            update_data["location"] = location
    
    # Upload new banner image if provided
    if bannerImage:
        try:
            folder = f"eventhub/{'promotions' if type == 'promotion' else 'events'}"
            result = cloudinary.uploader.upload(
                bannerImage.file,
                folder=folder,
                public_id=f"{type}_{promotion_id}_{datetime.now().timestamp()}"
            )
            update_data["bannerImage"] = result["secure_url"]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error uploading banner image: {str(e)}"
            )
    
    # Update in database
    await db.promotions.update_one(
        {"_id": ObjectId(promotion_id)},
        {"$set": update_data}
    )
    
    # Get updated promotion
    updated_promotion = await db.promotions.find_one({"_id": ObjectId(promotion_id)})
    
    # Convert ObjectId to string
    updated_promotion["id"] = str(updated_promotion["_id"])
    del updated_promotion["_id"]
    
    return updated_promotion

@router.delete("/admin/promotions/{promotion_id}", status_code=status.HTTP_204_NO_CONTENT)
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
    
    return None

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
    
    # Update status to active
    await db.promotions.update_one(
        {"_id": ObjectId(promotion_id)},
        {"$set": {
            "status": "active",
            "published_at": datetime.utcnow(),
            "published_by": str(current_admin.id),
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Get updated promotion
    updated_promotion = await db.promotions.find_one({"_id": ObjectId(promotion_id)})
    
    # Convert ObjectId to string
    updated_promotion["id"] = str(updated_promotion["_id"])
    del updated_promotion["_id"]
    
    return updated_promotion


@router.get("/promotions/active", response_model=List[dict])
async def get_active_promotions(
    type: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_user)
):
    """Get all active promotions and public events for regular users"""
    db = await get_database()
    
    # Build query to find active promotions
    query = {"status": "active"}
    
    # Filter by type if provided
    if type:
        query["type"] = type
    
    cursor = db.promotions.find(query)
    promotions = await cursor.to_list(length=100)
    
    # Convert ObjectIds to strings and standardize field names
    for promo in promotions:
        promo["id"] = str(promo["_id"])
        del promo["_id"]
        
        # Handle the image field name inconsistency
        if "banner_image" in promo and not "bannerImage" in promo:
            promo["bannerImage"] = promo["banner_image"]
        
        # Other field name standardizations if needed
        if "valid_until" in promo and not "validUntil" in promo:
            promo["validUntil"] = promo["valid_until"]
        
        if "promo_code" in promo and not "promoCode" in promo:
            promo["promoCode"] = promo["promo_code"]
        
        if "event_date" in promo and not "eventDate" in promo:
            promo["eventDate"] = promo["event_date"]
    
    return promotions;