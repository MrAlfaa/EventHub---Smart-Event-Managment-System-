from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import users, auth, providers, admin, promotions, reviews
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from fastapi import APIRouter, HTTPException, Depends, status, Body


app = FastAPI(title="EventHub API")

# Configure CORS with explicit origin specification
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporarily allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()
# Include routers with prefix
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(providers.router, prefix=settings.API_V1_STR)  # Make sure this line exists
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(promotions.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)  # Add this line
@app.get("/")
async def root():
    return {"message": "Welcome to EventHub API"}
    return {"message": "Welcome to EventHub API"}