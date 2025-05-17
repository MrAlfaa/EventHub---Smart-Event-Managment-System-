from pydantic import BaseModel, Field, field_serializer
from typing import List, Optional
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

# Package model
class PackageBase(BaseModel):
    name: str
    description: str
    price: int
    currency: str = "LKR"
    features: List[str] = []
    crowdSizeMin: int
    crowdSizeMax: int
    eventTypes: List[str]
    images: List[str] = []
    status: str = "active"  # active, inactive
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class PackageCreate(PackageBase):
    pass

class PackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    currency: Optional[str] = None
    features: Optional[List[str]] = None
    crowdSizeMin: Optional[int] = None
    crowdSizeMax: Optional[int] = None
    eventTypes: Optional[List[str]] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class PackageInDB(PackageBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    provider_id: str
    bookings: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }