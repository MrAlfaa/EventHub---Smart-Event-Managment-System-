from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import List, Optional
from app.models.package import PackageInDB
from app.db.mongodb import get_database
from app.api.deps import get_current_user
from app.models.user import UserInDB
from bson import ObjectId

router = APIRouter()

@router.get("/packages/available", response_model=list)
async def get_all_available_packages(
    eventType: Optional[str] = None,
    minPrice: Optional[int] = None,
    maxPrice: Optional[int] = None,
    crowdSize: Optional[int] = None,
    serviceType: Optional[str] = None,
    location: Optional[str] = None,
    displayMode: Optional[str] = "individual",
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
    matching_provider_ids = approved_provider_ids
    
    if serviceType or location:
        provider_query = {}
        
        if serviceType:
            provider_query["service_types"] = {"$regex": serviceType, "$options": "i"}
        
        if location:
            provider_query["$or"] = [
                {"service_locations": {"$regex": location, "$options": "i"}},
                {"city": {"$regex": location, "$options": "i"}},
                {"province": {"$regex": location, "$options": "i"}},
                {"address": {"$regex": location, "$options": "i"}}
            ]
        
        provider_profiles_cursor = db.service_provider_profiles.find(
            provider_query,
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
    
    # For grouped display mode, we can implement package grouping logic here
    # This is a placeholder for future implementation
    if displayMode == "grouped":
        # For now, just return the same results
        # In the future, this would group packages by provider or other criteria
        pass
    
    return result

@router.get("/packages/{package_id}", response_model=dict)
async def get_package_by_id(package_id: str):
    """Get a specific package by ID"""
    db = await get_database()
    
    try:
        # Find the package
        package = await db.provider_packages.find_one({"_id": ObjectId(package_id)})
        
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Package not found"
            )
        
        # Get provider details
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
            
            # Convert ObjectId to string
            package["id"] = str(package["_id"])
            del package["_id"]
            
            # Add provider info
            package["providerInfo"] = provider_info
            
            return package
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider not found for this package"
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving package: {str(e)}"
        )