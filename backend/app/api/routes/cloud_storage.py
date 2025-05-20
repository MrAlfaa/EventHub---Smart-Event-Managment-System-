from fastapi import APIRouter, HTTPException, Depends, status, File, UploadFile, Form, Query
from typing import List, Optional
from app.models.user import UserInDB
from app.db.mongodb import get_database
from datetime import datetime
from app.core.security import get_password_hash
import cloudinary
import cloudinary.uploader
from app.core.config import settings
from app.api.deps import get_current_user
from bson import ObjectId

router = APIRouter()

@router.post("/cloud/upload", response_model=dict)
async def upload_cloud_files(
    files: List[UploadFile] = File(...),
    folder: str = Form("default"),
    current_user: UserInDB = Depends(get_current_user)
):
    """Upload files to cloud storage"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can upload to cloud storage"
        )
    
    db = await get_database()
    
    # Upload files to Cloudinary
    uploaded_files = []
    
    try:
        for file in files:
            content_type = file.content_type
            if not content_type.startswith('image/'):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Only images are supported. Got {content_type}"
                )
                
            # Upload file
            result = cloudinary.uploader.upload(
                file.file,
                folder=f"eventhub/cloud_storage/{current_user.id}/{folder}",
                public_id=f"cloud_{datetime.now().timestamp()}",
                resource_type="auto"
            )
            
            # Store file information
            file_info = {
                "url": result["secure_url"],
                "public_id": result["public_id"],
                "resource_type": result["resource_type"],
                "format": result["format"],
                "folder": folder,
                "filename": file.filename,
                "size": result.get("bytes", 0),
                "created_at": datetime.utcnow(),
                "width": result.get("width", 0),
                "height": result.get("height", 0)
            }
            
            # Insert file info into database
            await db.cloud_storage.insert_one({
                "user_id": str(current_user.id),
                "file_info": file_info,
                "created_at": datetime.utcnow()
            })
            
            uploaded_files.append(file_info)
        
        return {"files": uploaded_files, "count": len(uploaded_files)}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading files: {str(e)}"
        )

@router.get("/cloud/files", response_model=dict)
async def get_cloud_files(
    folder: Optional[str] = None,
    limit: int = Query(50, gt=0, le=100),
    skip: int = Query(0, ge=0),
    current_user: UserInDB = Depends(get_current_user)
):
    """Get user's cloud storage files with optional folder filtering"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can access their cloud storage"
        )
    
    db = await get_database()
    
    # Base query
    query = {"user_id": str(current_user.id)}
    
    # Add folder filter if provided
    if folder:
        query["file_info.folder"] = folder
    
    # Get total count for pagination
    total_files = await db.cloud_storage.count_documents(query)
    
    # Get files with pagination
    cursor = db.cloud_storage.find(query).sort("created_at", -1).skip(skip).limit(limit)
    files = await cursor.to_list(length=limit)
    
    # Format response
    file_list = []
    for file in files:
        file_info = file.get("file_info", {})
        file_info["id"] = str(file["_id"])
        file_list.append(file_info)
    
    return {
        "files": file_list,
        "total": total_files,
        "limit": limit,
        "skip": skip
    }

@router.get("/cloud/folders", response_model=list)
async def get_cloud_folders(current_user: UserInDB = Depends(get_current_user)):
    """Get list of folders in user's cloud storage"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can access their cloud storage"
        )
    
    db = await get_database()
    
    # Aggregate to get unique folders
    pipeline = [
        {"$match": {"user_id": str(current_user.id)}},
        {"$group": {"_id": "$file_info.folder"}},
        {"$project": {"folder": "$_id", "_id": 0}},
        {"$sort": {"folder": 1}}
    ]
    
    cursor = db.cloud_storage.aggregate(pipeline)
    result = await cursor.to_list(length=100)
    
    # Extract folder names
    folders = [doc.get("folder", "default") for doc in result]
    if not folders or "default" not in folders:
        folders.append("default")
    
    return folders

@router.delete("/cloud/files/{file_id}", response_model=dict)
async def delete_cloud_file(
    file_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Delete a file from cloud storage"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can delete from their cloud storage"
        )
    
    db = await get_database()
    
    # Find the file
    file = await db.cloud_storage.find_one({
        "_id": ObjectId(file_id),
        "user_id": str(current_user.id)
    })
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Delete from Cloudinary if public_id exists
    try:
        if "file_info" in file and "public_id" in file["file_info"]:
            public_id = file["file_info"]["public_id"]
            cloudinary.uploader.destroy(public_id)
    except Exception as e:
        # Log error but continue with database deletion
        print(f"Error deleting from Cloudinary: {str(e)}")
    
    # Delete from database
    await db.cloud_storage.delete_one({"_id": ObjectId(file_id)})
    
    return {"message": "File deleted successfully"}

@router.post("/cloud/create-folder", response_model=dict)
async def create_cloud_folder(
    folder_name: str = Form(...),
    current_user: UserInDB = Depends(get_current_user)
):
    """Create a new folder in cloud storage"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can create folders in their cloud storage"
        )
    
    if not folder_name or folder_name.strip() == "":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Folder name cannot be empty"
        )
    
    folder_name = folder_name.strip()
    
    # Folder name validation
    if len(folder_name) > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Folder name too long (max 50 characters)"
        )
    
    # Replace special characters that might cause issues
    folder_name = folder_name.replace("/", "_").replace("\\", "_")
    
    # Insert dummy document to ensure folder is created
    db = await get_database()
    
    # Check if folder already exists
    existing_folder = await db.cloud_storage.find_one({
        "user_id": str(current_user.id),
        "file_info.folder": folder_name
    })
    
    if existing_folder:
        return {"message": "Folder already exists", "folder": folder_name}
    
    # Create folder entry (without an actual file)
    folder_entry = {
        "user_id": str(current_user.id),
        "file_info": {
            "url": None,
            "public_id": None,
            "resource_type": "folder",
            "format": None,
            "folder": folder_name,
            "filename": ".folder",
            "size": 0,
            "created_at": datetime.utcnow()
        },
        "created_at": datetime.utcnow(),
        "is_folder_marker": True
    }
    
    await db.cloud_storage.insert_one(folder_entry)
    
    return {"message": "Folder created successfully", "folder": folder_name}

@router.delete("/cloud/folders/{folder_name}", response_model=dict)
async def delete_cloud_folder(
    folder_name: str,
    force: bool = Query(False),
    current_user: UserInDB = Depends(get_current_user)
):
    """Delete a folder and optionally all its contents from cloud storage"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can delete folders from their cloud storage"
        )
    
    db = await get_database()
    
    # Check if folder has files
    files_count = await db.cloud_storage.count_documents({
        "user_id": str(current_user.id),
        "file_info.folder": folder_name,
        "is_folder_marker": {"$ne": True}
    })
    
    if files_count > 0 and not force:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Folder has {files_count} files. Use force=true to delete anyway."
        )
    
    # If force=true, delete all files in folder from Cloudinary
    if force:
        # Find all files in the folder
        cursor = db.cloud_storage.find({
            "user_id": str(current_user.id),
            "file_info.folder": folder_name,
            "is_folder_marker": {"$ne": True}
        })
        
        files = await cursor.to_list(length=None)
        
        # Delete each file from Cloudinary
        for file in files:
            try:
                if "file_info" in file and "public_id" in file["file_info"]:
                    public_id = file["file_info"]["public_id"]
                    cloudinary.uploader.destroy(public_id)
            except Exception as e:
                # Log error but continue with database deletion
                print(f"Error deleting from Cloudinary: {str(e)}")
    
    # Delete folder and all its contents from database
    result = await db.cloud_storage.delete_many({
        "user_id": str(current_user.id),
        "file_info.folder": folder_name
    })
    
    return {
        "message": "Folder deleted successfully", 
        "deleted_files_count": result.deleted_count
    }

@router.get("/cloud/stats", response_model=dict)
async def get_cloud_storage_stats(current_user: UserInDB = Depends(get_current_user)):
    """Get statistics about the user's cloud storage usage"""
    if current_user.role != "service_provider" and current_user.role != "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can access their cloud storage stats"
        )
    
    db = await get_database()
    
    # Get total file count
    total_files = await db.cloud_storage.count_documents({
        "user_id": str(current_user.id),
        "is_folder_marker": {"$ne": True}
    })
    
    # Get total storage used
    pipeline = [
        {"$match": {
            "user_id": str(current_user.id),
            "is_folder_marker": {"$ne": True}
        }},
        {"$group": {
            "_id": None,
            "total_size": {"$sum": "$file_info.size"}
        }}
    ]
    
    result = await db.cloud_storage.aggregate(pipeline).to_list(length=1)
    total_size = result[0].get("total_size", 0) if result else 0
    
    # Get folder count
    pipeline = [
        {"$match": {"user_id": str(current_user.id)}},
        {"$group": {"_id": "$file_info.folder"}},
        {"$count": "total_folders"}
    ]
    
    result = await db.cloud_storage.aggregate(pipeline).to_list(length=1)
    total_folders = result[0].get("total_folders", 0) if result else 0
    
    # Get file type distribution
    pipeline = [
        {"$match": {
            "user_id": str(current_user.id),
            "is_folder_marker": {"$ne": True}
        }},
        {"$group": {
            "_id": "$file_info.format",
            "count": {"$sum": 1}
        }}
    ]
    
    format_distribution = await db.cloud_storage.aggregate(pipeline).to_list(length=None)
    formats = {doc["_id"]: doc["count"] for doc in format_distribution if doc["_id"]}
    
    return {
        "total_files": total_files,
        "total_size": total_size,
        "total_size_readable": format_size(total_size),
        "total_folders": total_folders,
        "format_distribution": formats
    }

def format_size(size_bytes):
    """Format bytes to human readable format"""
    if size_bytes == 0:
        return "0B"
    
    size_names = ("B", "KB", "MB", "GB", "TB")
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024
        i += 1
    
    return f"{size_bytes:.2f} {size_names[i]}"