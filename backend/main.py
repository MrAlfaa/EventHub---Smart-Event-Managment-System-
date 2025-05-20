from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import users, auth, providers, admin, promotions, reviews, chat, bookings, provider_bookings, packages
from app.api.routes import files, cloud_storage, notifications  # Add notifications import
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.db.mongodb import get_database
import asyncio
from datetime import datetime, timedelta
from bson.objectid import ObjectId

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

# Background task to check for upcoming events and create notifications
async def check_upcoming_events():
    while True:
        try:
            db = await get_database()
            
            # Get date 2 days from now
            two_days_from_now = datetime.utcnow() + timedelta(days=2)
            # Set to start of day
            two_days_from_now = two_days_from_now.replace(hour=0, minute=0, second=0, microsecond=0)
            # Set to end of day
            end_of_day = two_days_from_now.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            # Find bookings with event dates 2 days from now
            upcoming_bookings = await db.bookings.find({
                "eventDate": {"$gte": two_days_from_now, "$lte": end_of_day},
                "status": {"$in": ["confirmed", "pending"]}
            }).to_list(length=100)
            
            for booking in upcoming_bookings:
                # Check if we already sent a notification for this booking
                existing_notification = await db.notifications.find_one({
                    "reference_id": str(booking["_id"]),
                    "type": "event_reminder",
                    "created_at": {"$gte": datetime.utcnow() - timedelta(days=1)}  # Check last 24 hours
                })
                
                if not existing_notification:
                    # Get provider information
                    provider_id = booking.get("providerId")
                    event_date = booking.get("eventDate")
                    
                    # Get user information
                    user_id = booking.get("userId")
                    user = await db.users.find_one({"_id": ObjectId(user_id)}) if user_id else None
                    customer_name = user.get("name", "Customer") if user else "Customer"
                    
                    # Get package name
                    package_id = booking.get("packageId")
                    package_name = "the service"
                    if package_id:
                        package = await db.provider_packages.find_one({"_id": ObjectId(package_id)})
                        if package:
                            package_name = package.get("name", "the service")
                    
                    # Create reminder notification
                    notification = {
                        "recipient_id": provider_id,
                        "type": "event_reminder",
                        "title": "Upcoming Event Reminder",
                        "message": f"You have {package_name} for {customer_name} in 2 days on {event_date.strftime('%B %d, %Y')}. Please prepare accordingly.",
                        "reference_id": str(booking["_id"]),
                        "reference_type": "booking",
                        "is_read": False,
                        "created_at": datetime.utcnow()
                    }
                    
                    # Insert notification
                    await db.notifications.insert_one(notification)
                    print(f"Created reminder notification for booking {booking['_id']}")
            
            # Check again in 12 hours
            await asyncio.sleep(12 * 60 * 60)  # 12 hours in seconds
        except Exception as e:
            print(f"Error in upcoming events check: {str(e)}")
            # Retry after 1 hour on error
            await asyncio.sleep(60 * 60)  # 1 hour in seconds

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    print("Connected to MongoDB!")
    
    # Validate email configuration
    if settings.SMTP_USER and settings.SMTP_PASSWORD:
        print("Email configuration found.")
    else:
        print("Warning: Email configuration incomplete. Email notifications may not work.")
    
    # Start background task for event reminders
    asyncio.create_task(check_upcoming_events())

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
