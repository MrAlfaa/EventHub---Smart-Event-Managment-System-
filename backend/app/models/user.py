from pydantic import BaseModel, EmailStr, Field, field_serializer
from typing import Optional, List, Any, ClassVar
from datetime import datetime
from bson import ObjectId
from uuid import uuid4

# MongoDB ObjectId handling
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
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

# User Base Model
class UserBase(BaseModel):
    username: str
    email: EmailStr
    name: str
    phone: str
    role: str = "user"
    
    model_config = {
        "populate_by_name": True,  # Renamed from allow_population_by_field_name
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

# User Create Model
class UserCreate(UserBase):
    password: str

# User Update Model
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

# User DB Model (returned to frontend)
class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    profile_image: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Replace class Config with model_config
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

# Service Provider Create Model
class ServiceProviderCreate(UserCreate):
    business_name: str
    business_description: str
    service_types: List[str] = []
    role: str = "service_provider"

# Service Provider in DB
class ServiceProviderInDB(UserInDB):
    business_name: str
    business_description: str
    service_types: List[str] = []
    is_approved: bool = False
    approval_status: str = "pending"  # pending, approved, rejected
    service_locations: List[str] = []
    slogan: Optional[str] = None
    
    # Replace class Config with model_config
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

# Service Provider Profile model
class ServiceProviderProfile(BaseModel):
    user_id: str
    provider_name: str
    nic_number: str
    nic_front_image_url: str
    nic_back_image_url: str
    business_name: str
    business_registration_number: Optional[str] = None
    business_description: Optional[str] = None
    contact_email: str
    contact_phone: str
    address: str
    city: str
    province: str
    service_locations: List[str]
    service_types: str
    covered_event_types: List[str]
    profile_picture_url: str
    cover_photo_url: Optional[str] = None
    slogan: Optional[str] = None
    bank_name: str
    branch_name: str
    account_number: str
    account_owner_name: str
    approval_status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Replace class Config with model_config
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }