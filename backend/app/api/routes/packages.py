from fastapi import APIRouter, HTTPException, status
from app.db.mongodb import get_database
from bson import ObjectId
from typing import List, Optional
from datetime import datetime

router = APIRouter()

@router.get("/packages/available", response_model=list)
async def get_all_available_packages(
    eventType: Optional[str] = None,
    minPrice: Optional[int] = None,
    maxPrice: Optional[int] = None,
    crowdSize: Optional[int] = None,
    serviceType: Optional[str] = None,
    location: Optional[str] = None,
    displayMode: Optional[str] = "individual"
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
    service_provider_ids = None
    if serviceType:
        provider_profiles_cursor = db.service_provider_profiles.find(
            {"service_types": {"$regex": serviceType, "$options": "i"}},
            {"user_id": 1}
        )
        service_provider_ids = [p["user_id"] for p in await provider_profiles_cursor.to_list(length=None)]
        
        # Update query to only include packages from these providers
        query["provider_id"] = {"$in": service_provider_ids}
    
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
            
            # Get service type for this provider
            service_type = ""
            if provider_profile and provider_profile.get("service_types"):
                service_type = provider_profile.get("service_types").split(',')[0] if ',' in provider_profile.get("service_types") else provider_profile.get("service_types")
            
            provider_info = {
                "id": str(provider["_id"]),
                "name": provider.get("name", ""),
                "role": provider.get("role", ""),
                "businessName": provider_profile.get("business_name") if provider_profile else "",
                "profileImage": provider_profile.get("profile_picture_url") if provider_profile else None,
                "serviceType": service_type
            }
            
            package["providerInfo"] = provider_info
            package["serviceType"] = service_type
        
        result.append(package)
    
    # If displayMode is grouped, create combined packages
    if displayMode == "grouped" and maxPrice is not None:
        combined_packages = await generate_package_combinations(result, maxPrice, serviceType)
        if combined_packages:
            # Return both individual and combined packages
            return combined_packages
    
    return result
    
async def generate_package_combinations(packages, max_budget, service_filter=None):
    """Generate combinations of packages that fit within the budget"""
    # Group packages by service type
    service_packages = {}
    for package in packages:
        service_type = package.get("serviceType", "")
        if service_type:
            if service_type not in service_packages:
                service_packages[service_type] = []
            service_packages[service_type].append(package)
    
    # Get unique service types
    service_types = list(service_packages.keys())
    
    # Generate combinations
    combinations = []
    
    # If service filter is specified as a comma-separated list, split it
    requested_services = []
    if service_filter:
        requested_services = service_filter.split(',')
    
    # Generate all possible combinations of 2 or more services
    for i in range(2, len(service_types) + 1):
        from itertools import combinations as combo_iter
        # Get all combinations of i service types
        for service_combo in combo_iter(service_types, i):
            # Skip if requested services are specified and not all are in this combo
            if requested_services and not all(s in service_combo for s in requested_services):
                continue
            
            # Get all package combinations for these service types
            packages_by_service = [service_packages[s] for s in service_combo]
            
            # Generate all combinations of packages, one from each service type
            from itertools import product
            for package_combo in product(*packages_by_service):
                total_price = sum(pkg["price"] for pkg in package_combo)
                
                # Check if the combination fits the budget
                if total_price <= max_budget:
                    # Create a combined package
                    service_names = [pkg.get("serviceType", "Service") for pkg in package_combo]
                    combined_pkg = {
                        "id": "_".join([pkg["id"] for pkg in package_combo]),
                        "name": f"{' & '.join(service_names)} Package",
                        "description": f"Combined package including {', '.join([pkg['name'] for pkg in package_combo])}",
                        "price": total_price,
                        "currency": package_combo[0]["currency"],
                        "eventTypes": package_combo[0].get("eventTypes", []),
                        "crowdSizeMin": max([pkg.get("crowdSizeMin", 0) for pkg in package_combo]),
                        "crowdSizeMax": min([pkg.get("crowdSizeMax", 1000) for pkg in package_combo]),
                        "images": [pkg.get("images", [])[0] if pkg.get("images") else None for pkg in package_combo if pkg.get("images")],
                        "combined": True,
                        "packages": list(package_combo),
                        "serviceTypes": service_names
                    }
                    combinations.append(combined_pkg)
    
    # Sort combinations by price
    combinations.sort(key=lambda x: x["price"])
    
    return combinations
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