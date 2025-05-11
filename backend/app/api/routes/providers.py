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


@router.get("/providers/me", response_model=dict)
async def get_provider_profile(current_user: UserInDB = Depends(get_current_user)):
    """Get current service provider profile"""
    # Verify user is a service provider
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can access their profile"
        )
    
    db = await get_database()
    
    # Get provider data
    provider_profile = await db.service_provider_profiles.find_one({"user_id": str(current_user.id)})
    if not provider_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider profile not found"
        )
    
    # Convert ObjectId to string
    if "_id" in provider_profile:
        provider_profile["id"] = str(provider_profile["_id"])
        del provider_profile["_id"]
    
    return provider_profile

@router.put("/providers/me", response_model=dict)
@router.put("/providers/me", response_model=dict)
async def update_provider_profile(
    profile_data: dict,
    current_user: UserInDB = Depends(get_current_user)
):
    """Update service provider profile"""
    # Verify user is a service provider
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can update their profile"
        )
    
    db = await get_database()
    
    # Make sure the profile exists
    existing_profile = await db.service_provider_profiles.find_one({"user_id": str(current_user.id)})
    if not existing_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider profile not found"
        )
    
    # Prepare update data
    update_data = {k: v for k, v in profile_data.items() if k not in ["user_id", "created_at", "approval_status", "nic_number"]}
    update_data["updated_at"] = datetime.utcnow()
    
    # Update profile
    result = await db.service_provider_profiles.update_one(
        {"user_id": str(current_user.id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No changes made to profile"
        )
    
    # Get updated profile
    updated_profile = await db.service_provider_profiles.find_one({"user_id": str(current_user.id)})
    
    # Convert ObjectId to string
    if "_id" in updated_profile:
        updated_profile["id"] = str(updated_profile["_id"])
        del updated_profile["_id"]
    
    return updated_profile


@router.get("/providers/cards", response_model=list)
async def get_provider_cards(current_user: UserInDB = Depends(get_current_user)):
    """Get service provider payment cards"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can access their cards"
        )
    
    db = await get_database()
    
    # Get provider cards
    cards = await db.provider_cards.find({"user_id": str(current_user.id)}).to_list(length=100)
    
    # Convert ObjectId to string for each card
    for card in cards:
        if "_id" in card:
            card["id"] = str(card["_id"])
            del card["_id"]
    
    return cards


@router.post("/providers/cards", response_model=dict)
async def add_provider_card(
    card_data: dict,
    current_user: UserInDB = Depends(get_current_user)
):
    """Add a new payment card for service provider"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can add cards"
        )
    
    db = await get_database()
    
    # Check if card limit reached (max 3 cards)
    card_count = await db.provider_cards.count_documents({"user_id": str(current_user.id)})
    if card_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum card limit reached (3)"
        )
    
    # Prepare card data
    new_card = {
        "user_id": str(current_user.id),
        "cardholderName": card_data["cardholderName"],
        "cardNumber": card_data["cardNumber"],
        "expiryMonth": card_data["expiryMonth"],
        "expiryYear": card_data["expiryYear"],
        "cvv": card_data["cvv"],
        "cardType": card_data["cardType"],
        "isDefault": card_data.get("isDefault", False),
        "created_at": datetime.utcnow()
    }
    
    # If this is the first card or set as default, update all other cards to non-default
    if new_card["isDefault"] or card_count == 0:
        await db.provider_cards.update_many(
            {"user_id": str(current_user.id)},
            {"$set": {"isDefault": False}}
        )
        new_card["isDefault"] = True
    
    # Insert card
    result = await db.provider_cards.insert_one(new_card)
    
    # Get new card with ID
    new_card["id"] = str(result.inserted_id)
    
    return new_card


@router.put("/providers/cards/{card_id}", response_model=dict)
async def update_provider_card(
    card_id: str,
    card_data: dict,
    current_user: UserInDB = Depends(get_current_user)
):
    """Update a payment card for service provider"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can update their cards"
        )
    
    db = await get_database()
    
    # Make sure the card exists and belongs to this user
    existing_card = await db.provider_cards.find_one({
        "_id": ObjectId(card_id),
        "user_id": str(current_user.id)
    })
    
    if not existing_card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )
    
    # Prepare update data
    update_data = {
        "cardholderName": card_data["cardholderName"],
        "cardNumber": card_data["cardNumber"],
        "expiryMonth": card_data["expiryMonth"],
        "expiryYear": card_data["expiryYear"],
        "cvv": card_data["cvv"],
        "cardType": card_data["cardType"],
        "isDefault": card_data.get("isDefault", False)
    }
    
    # If setting as default, update all other cards to non-default
    if update_data["isDefault"] and not existing_card.get("isDefault", False):
        await db.provider_cards.update_many(
            {"user_id": str(current_user.id), "_id": {"$ne": ObjectId(card_id)}},
            {"$set": {"isDefault": False}}
        )
    
    # Update card
    result = await db.provider_cards.update_one(
        {"_id": ObjectId(card_id), "user_id": str(current_user.id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No changes made to card"
        )
    
    # Get updated card
    updated_card = await db.provider_cards.find_one({"_id": ObjectId(card_id)})
    updated_card["id"] = str(updated_card["_id"])
    del updated_card["_id"]
    
    return updated_card


@router.delete("/providers/cards/{card_id}", response_model=dict)
async def delete_provider_card(
    card_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Delete a payment card for service provider"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can delete their cards"
        )
    
    db = await get_database()
    
    # Make sure the card exists and belongs to this user
    existing_card = await db.provider_cards.find_one({
        "_id": ObjectId(card_id),
        "user_id": str(current_user.id)
    })
    
    if not existing_card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )
    
    # Check if it's the only card
    card_count = await db.provider_cards.count_documents({"user_id": str(current_user.id)})
    if card_count <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete the only card"
        )
    
    # Delete card
    await db.provider_cards.delete_one({"_id": ObjectId(card_id)})
    
    # If deleted card was default, set another card as default
    if existing_card.get("isDefault", False):
        another_card = await db.provider_cards.find_one({"user_id": str(current_user.id)})
        if another_card:
            await db.provider_cards.update_one(
                {"_id": another_card["_id"]},
                {"$set": {"isDefault": True}}
            )
    
    return {"message": "Card deleted successfully"}