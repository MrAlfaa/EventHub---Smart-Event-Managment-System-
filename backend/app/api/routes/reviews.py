from fastapi import APIRouter, HTTPException, Depends, status, Body
from typing import List, Optional
from app.models.user import UserInDB
from app.db.mongodb import get_database
from app.api.deps import get_current_user
from datetime import datetime
from bson import ObjectId
from app.models.review import ReviewCreate

router = APIRouter()

@router.post("/reviews", status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: dict = Body(...),
    current_user: UserInDB = Depends(get_current_user)
):
    """Create a new review for a service provider"""
    # Extract data from the request body
    serviceProviderId = review_data.get("serviceProviderId")
    rating = review_data.get("rating")
    comment = review_data.get("comment")
    
    # Validate required fields
    if not serviceProviderId or not rating or not comment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="serviceProviderId, rating and comment are required"
        )
    
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be an integer between 1 and 5"
        )
    
    db = await get_database()
    
    # Check if provider exists
    try:
        provider = await db.users.find_one({"_id": ObjectId(serviceProviderId), "role": "service_provider"})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid serviceProviderId format"
        )
        
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider not found"
        )
    
    # Check if user has already reviewed this provider
    existing_review = await db.reviews.find_one({
        "userId": str(current_user.id),
        "serviceProviderId": serviceProviderId
    })
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this service provider"
        )
    
    # Create new review
    new_review = {
        "userId": str(current_user.id),
        "userName": current_user.name,
        "userImage": getattr(current_user, "profile_image", None),
        "serviceProviderId": serviceProviderId,
        "rating": rating,
        "comment": comment,
        "response": None,
        "date": datetime.utcnow()
    }
    
    result = await db.reviews.insert_one(new_review)
    
    # Update the review with its ID
    new_review["id"] = str(result.inserted_id)
    if "_id" in new_review:
        del new_review["_id"]
    
    return new_review

@router.get("/reviews/provider/{provider_id}", response_model=List[dict])
async def get_provider_reviews(provider_id: str):
    """Get all reviews for a specific service provider"""
    db = await get_database()
    
    cursor = db.reviews.find({"serviceProviderId": provider_id})
    reviews = await cursor.to_list(length=100)
    
    # Format reviews for response
    for review in reviews:
        review["id"] = str(review["_id"])
        del review["_id"]
    
    return reviews

@router.put("/reviews/{review_id}", status_code=status.HTTP_200_OK)
async def update_review(
    review_id: str,
    review_data: dict = Body(...),
    current_user: UserInDB = Depends(get_current_user)
):
    """Update an existing review"""
    # Extract data from the request body
    rating = review_data.get("rating")
    comment = review_data.get("comment")
    serviceProviderId = review_data.get("serviceProviderId")
    
    # Validate required fields
    if not rating or not comment or not serviceProviderId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="rating, comment, and serviceProviderId are required"
        )
    
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be an integer between 1 and 5"
        )
    
    db = await get_database()
    
    # Find the review
    try:
        review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid review ID format"
        )
        
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Check if the review belongs to the current user
    if review["userId"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own reviews"
        )
    
    # Make sure the service provider ID hasn't changed
    if review["serviceProviderId"] != serviceProviderId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change the service provider for an existing review"
        )
    
    # Update the review
    update_result = await db.reviews.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": {
            "rating": rating,
            "comment": comment,
            "updated_at": datetime.utcnow()
        }}
    )
    
    if update_result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update review or no changes made"
        )
    
    # Get the updated review
    updated_review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    updated_review["id"] = str(updated_review["_id"])
    del updated_review["_id"]
    
    # Get provider name
    provider = await db.users.find_one({"_id": ObjectId(updated_review["serviceProviderId"])})
    if provider:
        updated_review["providerName"] = provider.get("name", "Unknown Provider")
    
    return updated_review

@router.post("/reviews/{review_id}/reply", status_code=status.HTTP_200_OK)
async def reply_to_review(
    review_id: str,
    reply_data: dict = Body(...),
    current_user: UserInDB = Depends(get_current_user)
):
    """Reply to a review as a service provider"""
    response = reply_data.get("response")
    
    if not response:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Response text is required"
        )
    
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can reply to reviews"
        )
    
    db = await get_database()
    
    # Find the review
    try:
        review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid review ID format"
        )
        
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Check if this review belongs to the current service provider
    if review["serviceProviderId"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only reply to reviews for your service"
        )
    
    # Update the review with the response
    result = await db.reviews.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": {"response": response}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update review with response"
        )
    
    # Get the updated review
    updated_review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    updated_review["id"] = str(updated_review["_id"])
    del updated_review["_id"]
    
    return updated_review

@router.get("/reviews/user", response_model=List[dict])
async def get_user_reviews(current_user: UserInDB = Depends(get_current_user)):
    """Get all reviews made by the current user"""
    db = await get_database()
    
    cursor = db.reviews.find({"userId": str(current_user.id)})
    reviews = await cursor.to_list(length=100)
    
    # Format reviews for response
    for review in reviews:
        review["id"] = str(review["_id"])
        del review["_id"]
        
        # Get provider name
        provider = await db.users.find_one({"_id": ObjectId(review["serviceProviderId"])})
        if provider:
            review["providerName"] = provider.get("name", "Unknown Provider")
    
    return reviews
