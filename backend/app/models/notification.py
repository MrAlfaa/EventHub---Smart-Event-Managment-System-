from pydantic import BaseModel, Field, field_serializer
from typing import Optional, List, Any
from datetime import datetime
from bson import ObjectId
from app.models.booking import PyObjectId

class NotificationBase(BaseModel):
    recipient_id: str
    type: str  # booking, payment, system, etc.
    title: str
    message: str
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None  # booking, payment, etc.
    is_read: bool = False
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class NotificationCreate(NotificationBase):
    pass

class NotificationInDB(NotificationBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }