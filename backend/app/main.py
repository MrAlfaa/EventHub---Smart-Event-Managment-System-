from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.mongodb import test_connection, create_indexes
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title=settings.PROJECT_NAME)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
# Will be added as you develop the routes: app.include_router(auth_router)

@app.on_event("startup")
async def startup_db_client():
    """Initialize database connection and indexes on startup"""
    logger.info("Connecting to MongoDB...")
    if await test_connection():
        await create_indexes()
    else:
        logger.warning("Failed to connect to MongoDB. Application may not function correctly.")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection on shutdown"""
    from app.db.mongodb import client
    client.close()
    logger.info("MongoDB connection closed")

@app.get("/")
async def root():
    """Root endpoint to verify API is running"""
    return {"message": "Welcome to Event Organizing Platform API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)