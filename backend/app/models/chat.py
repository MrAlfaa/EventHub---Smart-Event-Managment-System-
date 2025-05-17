from pydantic import BaseModel, Field, field_serializer
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

# Updated MongoDB ObjectId handling for newer Pydantic versions
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, info=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    # Replace the __modify_schema__ method with __get_pydantic_json_schema__
    @classmethod
    def __get_pydantic_json_schema__(cls, _schema_generator, _field_schema):
        return {"type": "string"}
    
    # Add serializer for converting to string in JSON responses
    @field_serializer
    def serialize_to_str(self):
        return str(self)

# Chat message model
class ChatMessage(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    sender_id: str
    receiver_id: str
    content: str
    sent_at: datetime = Field(default_factory=datetime.utcnow)
    read: bool = False
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

# Chat conversation model
class ChatConversation(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    provider_id: str
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }
    