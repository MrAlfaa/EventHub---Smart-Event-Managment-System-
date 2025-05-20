from pydantic import BaseModel, Field, field_serializer
from typing import List, Optional, Any
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

class PaymentInfo(BaseModel):
    amount: float
    method: str
    date: datetime
    status: str
    type: str
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class BookingBase(BaseModel):
    providerId: str
    packageId: str
    fullName: str
    email: str
    phone: str
    eventLocation: str
    eventCoordinatorName: Optional[str] = None
    eventCoordinatorContact: Optional[str] = None
    eventDate: datetime
    crowdSize: int
    eventType: str
    paymentMethod: str
    paymentAmount: float
    totalAmount: float
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    status: Optional[str] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class BookingInDB(BookingBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    userId: str
    status: str = "pending"
    remainingAmount: float
    payments: List[PaymentInfo] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None
    cancelledAt: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }