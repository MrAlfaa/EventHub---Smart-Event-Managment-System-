from pydantic import BaseModel, Field, field_serializer
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.models.user import PyObjectId

class FileBase(BaseModel):
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    file_path: str
    user_id: str
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class FileInDB(FileBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class FileResponse(FileBase):
    id: str
    created_at: datetime
    
    model_config = {
        "populate_by_name": True
    }