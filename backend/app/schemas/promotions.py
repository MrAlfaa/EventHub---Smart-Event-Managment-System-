from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PromotionBase(BaseModel):
    title: str
    description: str
    type: str  # "promotion" or "event"
    bannerImage: Optional[str] = None
    status: str = "draft"  # "active", "draft", "archived"

class PromotionCreate(PromotionBase):
    validUntil: Optional[str] = None
    promoCode: Optional[str] = None
    terms: Optional[List[str]] = None

class PublicEventCreate(PromotionBase):
    location: str
    eventDate: str

class PromotionUpdate(PromotionBase):
    id: str
    validUntil: Optional[str] = None
    promoCode: Optional[str] = None
    terms: Optional[List[str]] = None

class PublicEventUpdate(PromotionBase):
    id: str
    location: str
    eventDate: str

class PromotionResponse(BaseModel):
    id: str
    title: str
    description: str
    type: str
    bannerImage: Optional[str] = None
    status: str
    publishedDate: str
    validUntil: Optional[str] = None
    promoCode: Optional[str] = None
    terms: Optional[List[str]] = None
    location: Optional[str] = None
    eventDate: Optional[str] = None