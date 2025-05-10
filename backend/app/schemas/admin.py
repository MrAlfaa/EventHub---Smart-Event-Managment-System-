from pydantic import BaseModel, EmailStr
from typing import Optional

class SuperAdminCreate(BaseModel):
    name: str
    email: EmailStr
    username: str
    password: str
    
class SuperAdminCheck(BaseModel):
    exists: bool