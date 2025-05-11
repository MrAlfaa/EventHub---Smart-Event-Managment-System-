from fastapi import APIRouter, HTTPException, Depends, status, File, UploadFile, Form
from typing import List, Optional
from app.models.user import ServiceProviderProfile, ServiceProviderCreate, UserInDB
from app.db.mongodb import get_database
from datetime import datetime
from app.core.security import get_password_hash
import cloudinary
import cloudinary.uploader
from app.core.config import settings
from app.api.deps import get_current_user

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

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

@router.post("/providers/complete-profile", response_model=dict, status_code=status.HTTP_201_CREATED)
async def complete_service_provider_profile(
    providerName: str = Form(...),
    nicNumber: str = Form(...),
    nicFrontImage: UploadFile = File(...),
    nicBackImage: UploadFile = File(...),
    businessName: str = Form(...),
    businessRegistrationNumber: str = Form(None),
    businessDescription: str = Form(None),
    username: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    contactEmail: str = Form(...),
    contactPhone: str = Form(...),
    cardName: str = Form(...),
    cardNumber: str = Form(...),
    cardExpiry: str = Form(...),
    cardCvv: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    province: str = Form(...),
    serviceLocations: List[str] = Form(...),
    serviceTypes: str = Form(...),
    coveredEventTypes: List[str] = Form(...),
    profilePicture: UploadFile = File(...),
    coverPhoto: UploadFile = File(None),
    slogan: str = Form(None),
    bankName: str = Form(...),
    branchName: str = Form(...),
    accountNumber: str = Form(...),
    accountOwnerName: str = Form(...)
):
    db = await get_database()
    
    # Check if email exists and get user
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Upload images to Cloudinary
    nic_front_image_url = None
    nic_back_image_url = None
    profile_picture_url = None
    cover_photo_url = None
    
    try:
        # Upload NIC front image
        nic_front_result = cloudinary.uploader.upload(
            nicFrontImage.file,
            folder="eventhub/nic_images",
            public_id=f"nic_front_{username}_{datetime.now().timestamp()}"
        )
        nic_front_image_url = nic_front_result["secure_url"]
        
        # Upload NIC back image
        nic_back_result = cloudinary.uploader.upload(
            nicBackImage.file,
            folder="eventhub/nic_images",
            public_id=f"nic_back_{username}_{datetime.now().timestamp()}"
        )
        nic_back_image_url = nic_back_result["secure_url"]
        
        # Upload profile picture
        profile_picture_result = cloudinary.uploader.upload(
            profilePicture.file,
            folder="eventhub/profile_pictures",
            public_id=f"profile_{username}_{datetime.now().timestamp()}"
        )
        profile_picture_url = profile_picture_result["secure_url"]
        
        # Upload cover photo if provided
        if coverPhoto:
            cover_photo_result = cloudinary.uploader.upload(
                coverPhoto.file,
                folder="eventhub/cover_photos",
                public_id=f"cover_{username}_{datetime.now().timestamp()}"
            )
            cover_photo_url = cover_photo_result["secure_url"]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading images: {str(e)}"
        )
    
    # Create profile data
    profile_data = {
        "user_id": str(user["_id"]),
        "provider_name": providerName,
        "nic_number": nicNumber,
        "nic_front_image_url": nic_front_image_url,
        "nic_back_image_url": nic_back_image_url,
        "business_name": businessName,
        "business_registration_number": businessRegistrationNumber,
        "business_description": businessDescription,
        "contact_email": contactEmail,
        "contact_phone": contactPhone,
        "address": address,
        "city": city,
        "province": province,
        "service_locations": serviceLocations,
        "service_types": serviceTypes,
        "covered_event_types": coveredEventTypes,
        "profile_picture_url": profile_picture_url,
        "cover_photo_url": cover_photo_url,
        "slogan": slogan,
        "bank_name": bankName,
        "branch_name": branchName,
        "account_number": accountNumber,
        "account_owner_name": accountOwnerName,
        "approval_status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert profile data into a service_provider_profiles collection
    await db.service_provider_profiles.insert_one(profile_data)
    
    # Update user with approval_status
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"approval_status": "pending"}}
    )
    
    return {"message": "Service provider profile submitted for approval"}

@router.post("/providers/gallery/upload", response_model=dict)
async def upload_gallery_images(
    images: List[UploadFile] = File(...),
    current_user: UserInDB = Depends(get_current_user)
):
    # Check if user is a service provider
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can upload gallery images"
        )
    
    db = await get_database()
    
    # Upload images to Cloudinary
    image_urls = []
    
    try:
        for image in images:
            # Upload image
            result = cloudinary.uploader.upload(
                image.file,
                folder=f"eventhub/provider_gallery/{current_user.id}",
                public_id=f"gallery_{datetime.now().timestamp()}"
            )
            image_urls.append(result["secure_url"])
        
        # Store image URLs in database
        provider_gallery = await db.provider_galleries.find_one({"provider_id": str(current_user.id)})
        
        if provider_gallery:
            # Add new images to existing gallery
            await db.provider_galleries.update_one(
                {"provider_id": str(current_user.id)},
                {"$push": {"images": {"$each": image_urls}}}
            )
        else:
            # Create new gallery for provider
            await db.provider_galleries.insert_one({
                "provider_id": str(current_user.id),
                "images": image_urls,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
        
        return {"imageUrls": image_urls}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading images: {str(e)}"
        )

@router.get("/providers/gallery", response_model=dict)
async def get_gallery_images(current_user: UserInDB = Depends(get_current_user)):
    # Check if user is a service provider
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can access their gallery"
        )
    
    db = await get_database()
    
    # Get provider gallery
    provider_gallery = await db.provider_galleries.find_one({"provider_id": str(current_user.id)})
    
    if provider_gallery:
        return {"images": provider_gallery.get("images", [])}
    
    return {"images": []}

@router.delete("/providers/gallery/image", response_model=dict)
async def delete_gallery_image(
    imageUrl: str,
    current_user: UserInDB = Depends(get_current_user)
):
    # Check if user is a service provider
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can delete gallery images"
        )
    
    if not imageUrl:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image URL is required"
        )
    
    db = await get_database()
    
    # Remove image from gallery
    result = await db.provider_galleries.update_one(
        {"provider_id": str(current_user.id)},
        {"$pull": {"images": imageUrl}}
    )
    
    if result.matched_count == 0:
        # If no document was found, the gallery doesn't exist
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gallery not found"
        )
    
    # Try to delete from Cloudinary (extract public_id from URL)
    try:
        # Extract public ID from URL
        url_parts = imageUrl.split('/')
        if "upload" in url_parts:
            upload_index = url_parts.index("upload")
            if upload_index + 2 < len(url_parts):
                # The format is typically: .../upload/v1234567890/folder/filename.ext
                # We need to get the part after the version (folder/filename)
                folder_and_file = '/'.join(url_parts[upload_index+2:])
                # Remove extension
                public_id = '.'.join(folder_and_file.split('.')[:-1])
                # Try to delete from Cloudinary
                cloudinary.uploader.destroy(public_id)
    except Exception as e:
        # Log error but don't fail the request if Cloudinary delete fails
        print(f"Error deleting image from Cloudinary: {str(e)}")
    
    return {"message": "Image deleted successfully"}