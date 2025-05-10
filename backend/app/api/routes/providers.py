from fastapi import APIRouter, HTTPException, Depends, status, File, UploadFile, Form
from typing import List
from app.models.user import ServiceProviderProfile, ServiceProviderCreate
from app.db.mongodb import get_database
from datetime import datetime
from app.core.security import get_password_hash  # Add this import

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
    
    # In a real implementation, you would:
    # 1. Upload files to a storage service (like AWS S3, Cloudinary, etc.)
    # 2. Get the URLs for the uploaded files
    # 3. Save the profile data to the database

    # For now, let's create a mock implementation
    profile_data = {
        "user_id": str(user["_id"]),
        "provider_name": providerName,
        "nic_number": nicNumber,
        "nic_front_image_url": "mock_url_for_front_image",  # In real app, this would be the upload URL
        "nic_back_image_url": "mock_url_for_back_image",    # In real app, this would be the upload URL
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
        "profile_picture_url": "mock_url_for_profile_picture",  # In real app, this would be the upload URL
        "cover_photo_url": "mock_url_for_cover_photo" if coverPhoto else None,  # In real app, this would be the upload URL
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