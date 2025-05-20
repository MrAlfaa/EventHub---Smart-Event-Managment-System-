from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import users, auth, providers, admin, promotions, reviews, chat, bookings, provider_bookings, packages
from app.api.routes import files, cloud_storage, notifications  # Add notifications import
from app.db.mongodb import connect_to_mongo, close_mongo_connection

app = FastAPI(title="EventHub API")
# Configure CORS - make it more permissive for development
app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],  # Allow all origins during development
      allow_credentials=True,
      allow_methods=["*"],  # Allow all methods
      allow_headers=["*"],  # Allow all headers
      expose_headers=["*"]
  )
# Database connection events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    print("Connected to MongoDB!")  # Add debug print

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include routers with prefix
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(providers.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(promotions.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(bookings.router, prefix=settings.API_V1_STR)
app.include_router(provider_bookings.router, prefix=settings.API_V1_STR)
app.include_router(packages.router, prefix=settings.API_V1_STR)
app.include_router(files.router, prefix=settings.API_V1_STR)
app.include_router(cloud_storage.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)  # Add notifications router

# Add debug route at root level
@app.get("/debug-routes")
async def debug_routes():
    """List all registered routes for debugging"""
    routes = []
    for route in app.routes:
        routes.append({"path": route.path, "name": route.name, "methods": route.methods})
    return {"routes": routes}

@app.get("/")
async def root():
    return {"message": "Welcome to EventHub API"}
