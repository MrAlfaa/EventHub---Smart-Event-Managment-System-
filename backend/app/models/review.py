from pydantic import BaseModel, Field, field_serializer
from typing import Optional
from datetime import datetime
from bson import ObjectId

# MongoDB ObjectId handling for Pydantic
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, info=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, _schema_generator, _field_schema):
        return {"type": "string"}
    
    @field_serializer
    def serialize_to_str(self):
        return str(self)

# Review models
class ReviewBase(BaseModel):
    userId: str
    userName: str
    serviceProviderId: str
    rating: int
    comment: str
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ReviewCreate(ReviewBase):
    pass

class ReviewInDB(ReviewBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    userImage: Optional[str] = None
    response: Optional[str] = None
    date: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ReviewUpdate(BaseModel):
    response: str
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }
    