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
from app.models.card import CardModel, PyObjectId
from bson import ObjectId
from app.models.package import PackageCreate, PackageUpdate, PackageInDB
from typing import List

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

router = APIRouter()

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
    cursor = db.provider_cards.find({"user_id": str(current_user.id)})
    cards = await cursor.to_list(length=100)
    
    # Convert ObjectId to string for each card
    for card in cards:
        if "_id" in card:
            card["id"] = str(card["_id"])
            del card["_id"]
    
    return cards


@router.post("/providers/cards")
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
    
    # Get inserted card document
    inserted_card = await db.provider_cards.find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string for response
    response_card = {**inserted_card}
    response_card["id"] = str(inserted_card["_id"])
    del response_card["_id"]
    
    return response_card


@router.put("/providers/cards/{card_id}")
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
    
    # Convert ObjectId to string for response
    response_card = {**updated_card}
    response_card["id"] = str(updated_card["_id"])
    del response_card["_id"]
    
    return response_card


@router.delete("/providers/cards/{card_id}")
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
    
    # Get new card with ID - CONVERT ObjectId to string
    response_card = new_card.copy()
    response_card["id"] = str(result.inserted_id)
    
    return response_card

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

# Add these routes to the file
@router.get("/providers/packages", response_model=list)
async def get_provider_packages(current_user: UserInDB = Depends(get_current_user)):
    """Get all packages for the logged-in service provider"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can access their packages"
        )
    
    db = await get_database()
    
    # Get provider packages
    cursor = db.provider_packages.find({"provider_id": str(current_user.id)})
    packages = await cursor.to_list(length=100)
    
    # Convert ObjectId to string for each package
    for package in packages:
        if "_id" in package:
            package["id"] = str(package["_id"])
            del package["_id"]
    
    return packages

@router.post("/providers/packages", response_model=dict)
async def create_provider_package(
    package_data: PackageCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    """Create a new package for service provider"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can create packages"
        )
    
    db = await get_database()
    
    # Prepare package data
    new_package = package_data.dict()
    new_package["provider_id"] = str(current_user.id)
    new_package["bookings"] = 0
    new_package["created_at"] = datetime.utcnow()
    new_package["updated_at"] = datetime.utcnow()
    
    # Insert package
    result = await db.provider_packages.insert_one(new_package)
    
    # Get inserted package document
    inserted_package = await db.provider_packages.find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string for response
    inserted_package["id"] = str(inserted_package["_id"])
    del inserted_package["_id"]
    
    return inserted_package

@router.get("/providers/packages/{package_id}", response_model=dict)
async def get_provider_package(
    package_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Get a specific package by ID"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can access their packages"
        )
    
    db = await get_database()
    
    # Get package with validation
    package = await db.provider_packages.find_one({
        "_id": ObjectId(package_id),
        "provider_id": str(current_user.id)
    })
    
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    
    # Convert ObjectId to string
    package["id"] = str(package["_id"])
    del package["_id"]
    
    return package

@router.put("/providers/packages/{package_id}", response_model=dict)
async def update_provider_package(
    package_id: str,
    package_data: PackageUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    """Update a package for service provider"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can update their packages"
        )
    
    db = await get_database()
    
    # Make sure the package exists and belongs to this user
    existing_package = await db.provider_packages.find_one({
        "_id": ObjectId(package_id),
        "provider_id": str(current_user.id)
    })
    
    if not existing_package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    
    # Prepare update data
    update_data = {k: v for k, v in package_data.dict(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    # Update package
    result = await db.provider_packages.update_one(
        {"_id": ObjectId(package_id), "provider_id": str(current_user.id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No changes made to package"
        )
    
    # Get updated package
    updated_package = await db.provider_packages.find_one({"_id": ObjectId(package_id)})
    updated_package["id"] = str(updated_package["_id"])
    del updated_package["_id"]
    
    return updated_package

@router.delete("/providers/packages/{package_id}", response_model=dict)
async def delete_provider_package(
    package_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Delete a package for service provider"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can delete their packages"
        )
    
    db = await get_database()
    
    # Make sure the package exists and belongs to this user
    existing_package = await db.provider_packages.find_one({
        "_id": ObjectId(package_id),
        "provider_id": str(current_user.id)
    })
    
    if not existing_package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    
    # Delete package
    await db.provider_packages.delete_one({"_id": ObjectId(package_id)})
    
    return {"message": "Package deleted successfully"}

@router.post("/providers/packages/{package_id}/images", response_model=dict)
@router.post("/providers/packages/{package_id}/images", response_model=dict)
async def upload_package_images(
    package_id: str,
    images: List[UploadFile] = File(...),
    current_user: UserInDB = Depends(get_current_user)
):
    """Upload images for a specific package"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can upload package images"
        )
    
    db = await get_database()
    
    # Validate package exists and belongs to this provider
    package = await db.provider_packages.find_one({
        "_id": ObjectId(package_id),
        "provider_id": str(current_user.id)
    })
    
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    
    # Upload images to Cloudinary
    image_urls = []
    
    try:
        for image in images:
            # Upload image
            result = cloudinary.uploader.upload(
                image.file,
                folder=f"eventhub/package_images/{current_user.id}/{package_id}",
                public_id=f"pkg_{datetime.now().timestamp()}"
            )
            image_urls.append(result["secure_url"])
        
        # Update package with new images
        await db.provider_packages.update_one(
            {"_id": ObjectId(package_id)},
            {"$push": {"images": {"$each": image_urls}}}
        )
        
        return {"imageUrls": image_urls}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading images: {str(e)}"
        )


@router.get("/providers/approved", response_model=list)
@router.get("/providers/approved", response_model=list)
async def get_approved_service_providers(
    eventType: Optional[str] = None,
    services: Optional[str] = None,
    location: Optional[str] = None
):
    """Get all approved service providers with optional filtering"""
    db = await get_database()
    
    # Base query - get all service providers that are approved
    query = {
        "role": "service_provider",
        "approval_status": "approved"
    }
    
    # Add filters if provided
    if eventType:
        query["covered_event_types"] = {"$in": [eventType]}
    
    if services:
        service_list = services.split(',')
        query["service_types"] = {"$in": service_list}
    
    if location:
        # Search for location in any of the service_locations or city/province fields
        location_terms = location.lower()
        query["$or"] = [
            {"service_locations": {"$regex": location_terms, "$options": "i"}},
            {"city": {"$regex": location_terms, "$options": "i"}},
            {"province": {"$regex": location_terms, "$options": "i"}}
        ]
    
    # Get providers with approval_status = approved
    cursor = db.users.find({"role": "service_provider", "approval_status": "approved"})
    providers = await cursor.to_list(length=100)
    
    # For each provider, get their profile data and merge
    result = []
    for provider in providers:
        provider_id = str(provider["_id"])
        profile = await db.service_provider_profiles.find_one({"user_id": provider_id})
        
        if profile:
            # Convert ObjectId to string
            if "_id" in provider:
                provider["id"] = str(provider["_id"])
                del provider["_id"]
            
            # Remove password
            if "password" in provider:
                del provider["password"]
            
            # Merge user data with profile data
            provider_data = {**provider}
            
            # Add profile data that we want to expose
            if profile.get("profile_picture_url"):
                provider_data["profileImage"] = profile["profile_picture_url"]
            
            if profile.get("cover_photo_url"):
                provider_data["coverImage"] = profile["cover_photo_url"]
            
            if profile.get("service_locations"):
                provider_data["serviceLocations"] = profile["service_locations"]
            
            if profile.get("service_types"):
                provider_data["serviceType"] = profile["service_types"].split(',')
            
            if profile.get("covered_event_types"):
                provider_data["eventTypes"] = profile["covered_event_types"]
            
            if profile.get("slogan"):
                provider_data["slogan"] = profile["slogan"]
            
            # Location information
            location_parts = []
            if profile.get("city"):
                location_parts.append(profile["city"])
            if profile.get("province"):
                location_parts.append(profile["province"])
            
            if location_parts:
                provider_data["location"] = ", ".join(location_parts)
            
            # Set as newcomer if created within last 30 days
            if "created_at" in provider:
                from datetime import datetime, timedelta
                created_date = provider["created_at"]
                if isinstance(created_date, datetime) and (datetime.utcnow() - created_date) < timedelta(days=30):
                    provider_data["isNewcomer"] = True
            
            # Add default values for UI
            provider_data["rating"] = 0  # Default to 0, would be calculated from reviews
            provider_data["reviewCount"] = 0  # Default to 0, would be calculated from reviews
            
            result.append(provider_data)
    
    return result;


from bson.errors import InvalidId
from bson import ObjectId

@router.get("/providers/{provider_id}", response_model=dict)
async def get_provider_by_id(provider_id: str):
    """Get service provider details by ID"""
    db = await get_database()
    
    try:
        # Find the provider by ID
        provider = await db.users.find_one({"_id": ObjectId(provider_id), "role": "service_provider"})
        
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service provider not found"
            )
        
        # Check if provider is approved
        if provider.get("approval_status") != "approved":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Service provider is not approved"
            )
        
        # Get provider profile
        profile = await db.service_provider_profiles.find_one({"user_id": str(provider["_id"])})
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service provider profile not found"
            )
        
        # Convert ObjectId to string
        if "_id" in provider:
            provider["id"] = str(provider["_id"])
            del provider["_id"]
        
        # Remove password
        if "password" in provider:
            del provider["password"]
        
        # Merge user data with profile data
        provider_data = {**provider}
        
        # Add profile data
        if profile.get("profile_picture_url"):
            provider_data["profileImage"] = profile["profile_picture_url"]
        
        if profile.get("cover_photo_url"):
            provider_data["coverImage"] = profile["cover_photo_url"]
        
        if profile.get("service_locations"):
            provider_data["serviceLocations"] = profile["service_locations"]
        
        if profile.get("service_types"):
            provider_data["serviceType"] = profile["service_types"].split(',')
        
        if profile.get("covered_event_types"):
            provider_data["eventTypes"] = profile["covered_event_types"]
        
        if profile.get("slogan"):
            provider_data["slogan"] = profile["slogan"]
        
        if profile.get("business_description"):
            provider_data["description"] = profile["business_description"]
        
        if profile.get("business_name"):
            provider_data["businessName"] = profile["business_name"]
        
        # Contact information
        provider_data["contact"] = {
            "email": profile.get("contact_email", provider.get("email", "")),
            "phone": profile.get("contact_phone", provider.get("phone", ""))
        }
        
        # Location information
        location_parts = []
        if profile.get("city"):
            location_parts.append(profile["city"])
        if profile.get("province"):
            location_parts.append(profile["province"])
        
        if location_parts:
            provider_data["location"] = {
                "city": profile.get("city", ""),
                "province": profile.get("province", ""),
                "full": ", ".join(location_parts)
            }
        
        # Add other details
        provider_data["rating"] = 0  # Default to 0, would be calculated from reviews
        provider_data["reviewCount"] = 0  # Default to 0, would be calculated from reviews
        
        return provider_data
    
    except (ValueError, InvalidId):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid provider ID format"
        )


@router.get("/providers/{provider_id}/gallery", response_model=dict)
async def get_provider_gallery(provider_id: str):
    """Get service provider gallery images"""
    db = await get_database()
    
    try:
        # Find the provider by ID
        provider = await db.users.find_one({"_id": ObjectId(provider_id), "role": "service_provider"})
        
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service provider not found"
            )
        
        # Get provider gallery
        gallery = await db.provider_galleries.find_one({"provider_id": str(provider["_id"])})
        
        if gallery:
            return {"images": gallery.get("images", [])}
        
        return {"images": []}
    
    except (ValueError, InvalidId):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid provider ID format"
        )


@router.get("/providers/{provider_id}/packages", response_model=list)
@router.get("/providers/{provider_id}/packages", response_model=list)
async def get_provider_packages_by_id(provider_id: str):
    """Get all packages for a specific service provider by ID"""
    db = await get_database()
    
    try:
        # Check if provider exists and is approved
        provider = await db.users.find_one({
            "_id": ObjectId(provider_id), 
            "role": "service_provider",
            "approval_status": "approved"
        })
        
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service provider not found or not approved"
            )
        
        # Get provider packages
        cursor = db.provider_packages.find({"provider_id": provider_id})
        packages = await cursor.to_list(length=100)
        
        # Convert ObjectId to string for each package and rename fields to match frontend
        formatted_packages = []
        for package in packages:
            formatted_package = dict(package)
            
            # Convert _id to id
            if "_id" in formatted_package:
                formatted_package["id"] = str(formatted_package["_id"])
                del formatted_package["_id"]
            
            # Map crowdSizeMin and crowdSizeMax to capacity
            if "crowdSizeMin" in formatted_package and "crowdSizeMax" in formatted_package:
                formatted_package["capacity"] = {
                    "min": formatted_package["crowdSizeMin"],
                    "max": formatted_package["crowdSizeMax"]
                }
                # Keep the original fields for compatibility
            
            # Ensure eventType is a string (if eventTypes is a list, use the first one)
            if "eventTypes" in formatted_package and isinstance(formatted_package["eventTypes"], list):
                formatted_package["eventType"] = formatted_package["eventTypes"][0] if formatted_package["eventTypes"] else ""
            
            formatted_packages.append(formatted_package)
        
        return formatted_packages
    
    except (ValueError, InvalidId):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid provider ID format"
        )


@router.get("/providers/{provider_id}/booked-dates", response_model=dict)
async def get_provider_booked_dates(provider_id: str):
    """Get the dates when a provider is booked/unavailable (public endpoint)"""
    try:
        db = await get_database()
        
        # Check if provider exists and is approved
        provider = await db.users.find_one({
            "_id": ObjectId(provider_id),
            "role": "service_provider",
            "approval_status": "approved"
        })
        
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service provider not found or not approved"
            )
        
        # Get all pending and confirmed bookings for this provider
        cursor = db.bookings.find({
            "providerId": provider_id,
            "status": {"$in": ["pending", "confirmed"]}
        })
        bookings = await cursor.to_list(length=100)
        
        # Extract event dates
        booked_dates = []
        for booking in bookings:
            if "eventDate" in booking:
                booked_dates.append({
                    "date": booking["eventDate"].isoformat(),
                    "type": "booked"
                })
        
        return {"bookedDates": booked_dates}
        
    except (ValueError, InvalidId):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid provider ID format"
        )


@router.get("/packages/available", response_model=list)
async def get_all_available_packages(
    eventType: Optional[str] = None,
    minPrice: Optional[int] = None,
    maxPrice: Optional[int] = None,
    crowdSize: Optional[int] = None,
    serviceType: Optional[str] = None,
):
    """Get all available packages with optional filtering"""
    db = await get_database()
    
    # Base query
    query = {"status": "active"}
    
    # Apply filters
    if eventType:
        query["eventTypes"] = {"$in": [eventType]}
    
    if minPrice is not None:
        query["price"] = query.get("price", {})
        query["price"]["$gte"] = minPrice
    
    if maxPrice is not None:
        query["price"] = query.get("price", {})
        query["price"]["$lte"] = maxPrice
    
    if crowdSize is not None:
        query["$and"] = [
            {"crowdSizeMin": {"$lte": crowdSize}},
            {"crowdSizeMax": {"$gte": crowdSize}}
        ]
    
    # Get approved service provider IDs for packages filtering
    approved_providers_cursor = db.users.find(
        {"role": "service_provider", "approval_status": "approved"},
        {"_id": 1}
    )
    approved_provider_ids = [str(p["_id"]) for p in await approved_providers_cursor.to_list(length=None)]
    
    # Only include packages from approved providers
    query["provider_id"] = {"$in": approved_provider_ids}
    
    # If service type is provided, find matching providers first
    if serviceType:
        provider_profiles_cursor = db.service_provider_profiles.find(
            {"service_types": {"$regex": serviceType, "$options": "i"}},
            {"user_id": 1}
        )
        matching_provider_ids = [p["user_id"] for p in await provider_profiles_cursor.to_list(length=None)]
        
        # Update query to only include packages from these providers
        query["provider_id"] = {"$in": matching_provider_ids}
    
    # Get packages with the query
    packages_cursor = db.provider_packages.find(query)
    packages = await packages_cursor.to_list(length=None)
    
    # For each package, get provider info and format response
    result = []
    
    for package in packages:
        # Convert ObjectId to string
        package["id"] = str(package.pop("_id"))
        
        # Get provider info
        provider = await db.users.find_one({"_id": ObjectId(package["provider_id"])})
        if provider:
            provider_profile = await db.service_provider_profiles.find_one({"user_id": str(provider["_id"])})
            
            provider_info = {
                "id": str(provider["_id"]),
                "name": provider.get("name", ""),
                "role": provider.get("role", ""),
                "businessName": provider_profile.get("business_name") if provider_profile else "",
                "profileImage": provider_profile.get("profile_picture_url") if provider_profile else None,
            }
            
            package["providerInfo"] = provider_info
        
        result.append(package)
    
    return result

@router.get("/providers/dashboard-stats", response_model=dict)
async def get_provider_dashboard_stats(current_user: UserInDB = Depends(get_current_user)):
    """Get provider dashboard statistics"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can access their dashboard stats"
        )
    
    db = await get_database()
    
    # Get total packages count
    total_packages = await db.provider_packages.count_documents({"provider_id": str(current_user.id)})
    
    # Get active bookings count
    active_bookings = await db.bookings.count_documents({
        "providerId": str(current_user.id),
        "status": {"$in": ["pending", "confirmed"]}
    })
    
    # Get unique customers count
    customers_pipeline = [
        {"$match": {"providerId": str(current_user.id)}},
        {"$group": {"_id": "$userId"}},
        {"$count": "total"}
    ]
    customers_agg = await db.bookings.aggregate(customers_pipeline).to_list(length=1)
    total_customers = customers_agg[0]["total"] if customers_agg else 0
    
    # Get total revenue
    revenue_pipeline = [
        {"$match": {"providerId": str(current_user.id), "status": {"$in": ["confirmed", "completed"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$totalAmount"}}}
    ]
    revenue_agg = await db.bookings.aggregate(revenue_pipeline).to_list(length=1)
    total_revenue = revenue_agg[0]["total"] if revenue_agg else 0
    # Get recent bookings
    recent_bookings_cursor = db.bookings.find(
        {"providerId": str(current_user.id)}
    ).sort("createdAt", -1).limit(5)
    
    recent_bookings = []
    async for booking in recent_bookings_cursor:
        # Get customer info
        customer = None
        if "userId" in booking:
            customer = await db.users.find_one({"_id": ObjectId(booking["userId"])})
        
        # Get package info
        package_name = "Custom Package"
        if "packageId" in booking:
            package = await db.provider_packages.find_one({"_id": ObjectId(booking["packageId"])})
            if package:
                package_name = package.get("name", "Custom Package")
        
        # Format booking data
        booking_data = {
            "id": str(booking["_id"]),
            "customerName": customer.get("name", "Unknown Customer") if customer else "Unknown Customer",
            "packageName": package_name,
            "date": booking.get("eventDate", booking.get("createdAt", datetime.utcnow())),
            "status": booking.get("status", "pending")
        }
        recent_bookings.append(booking_data)
    
    return {
        "total_packages": total_packages,
        "active_bookings": active_bookings,
        "total_customers": total_customers,
        "total_revenue": total_revenue,
        "recent_bookings": recent_bookings
    }