from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.responses import FileResponse as FastAPIFileResponse
from typing import List
import os
import shutil
import uuid
from datetime import datetime
from app.models.user import UserInDB
from app.models.file import FileInDB, FileResponse
from app.api.deps import get_current_user
from app.db.mongodb import get_database
from bson.objectid import ObjectId

router = APIRouter()
# Use an absolute path that works on both Windows and Unix
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)
print(f"Upload directory set to: {UPLOAD_DIR}")  # Debug print
def get_file_type(filename: str) -> str:
    """Determine file type from extension"""
    ext = filename.split('.')[-1].lower()
    if ext in ['pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx', 'xls']:
        return 'document'
    elif ext in ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']:
        return 'image'
    elif ext in ['mp4', 'mov', 'avi', 'mkv', 'webm']:
        return 'video'
    else:
        return 'other'

@router.post("/files/upload", response_model=FileResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user)
):
    # Create user directory if it doesn't exist
    user_dir = os.path.join(UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_dir, exist_ok=True)
    
    # Generate unique filename to avoid conflicts
    file_ext = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(user_dir, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}"
        )
    
    # Determine file type and size
    file_type = get_file_type(file.filename)
    file_size = os.path.getsize(file_path)
    
    # Create file record in database
    db = await get_database()
    file_data = {
        "filename": unique_filename,
        "original_filename": file.filename,
        "file_type": file_type,
        "file_size": file_size,
        "file_path": file_path,
        "user_id": str(current_user.id),
        "created_at": datetime.utcnow()
    }
    
    result = await db.files.insert_one(file_data)
    
    # Return file data with ID
    file_data["id"] = str(result.inserted_id)
    
    return file_data

@router.get("/files", response_model=List[FileResponse])
async def get_user_files(
    file_type: str = None,
    current_user: UserInDB = Depends(get_current_user)
):
    db = await get_database()
    
    # Base query - get files for current user
    query = {"user_id": str(current_user.id)}
    
    # Add file type filter if specified
    if file_type and file_type != "all":
        query["file_type"] = file_type
    
    # Get files and sort by latest first
    cursor = db.files.find(query).sort("created_at", -1)
    files = await cursor.to_list(length=100)  # Limit to 100 files
    
    # Convert _id to string ID
    for file in files:
        file["id"] = str(file["_id"])
        del file["_id"]
    
    return files

@router.get("/files/{file_id}/download")
async def download_file(
    file_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    db = await get_database()
    
    # Get file record
    file = await db.files.find_one({"_id": ObjectId(file_id), "user_id": str(current_user.id)})
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or you don't have permission to access it"
        )
    
    # Check if file exists
    if not os.path.exists(file["file_path"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server"
        )
    
    return FastAPIFileResponse(
        file["file_path"],
        filename=file["original_filename"],
        media_type="application/octet-stream"
    )

@router.delete("/files/{file_id}", response_model=dict)
async def delete_file(
    file_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    db = await get_database()
    
    # Get file record
    file = await db.files.find_one({"_id": ObjectId(file_id), "user_id": str(current_user.id)})
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or you don't have permission to delete it"
        )
    
    # Delete file from filesystem
    try:
        if os.path.exists(file["file_path"]):
            os.remove(file["file_path"])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting file: {str(e)}"
        )
    
    # Delete file record from database
    await db.files.delete_one({"_id": ObjectId(file_id)})
    
    return {"message": "File deleted successfully"}