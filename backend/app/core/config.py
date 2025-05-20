from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # MongoDB settings
    MONGODB_URL: str
    
    # Authentication settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    
    # CORS - Fix by ensuring these include your frontend URL
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # API settings
    API_V1_STR: str = "/api"
    
    # Cloudinary settings
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    
    # Email settings (new)
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "your-email@gmail.com"
    SMTP_PASSWORD: str = "your-app-password"
    SMTP_TLS: bool = True
    EMAIL_SENDER: str = "noreply@eventhub.com"
    
    # Frontend URL for links in emails
    FRONTEND_URL: str = "http://localhost:5173"
    
    # App name
    APP_NAME: str = "EventHub"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()