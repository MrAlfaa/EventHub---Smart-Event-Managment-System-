from app.db.mongodb import connect_to_mongo, close_mongo_connection
from fastapi import FastAPI

def startup_db_client(app: FastAPI):
    app.add_event_handler("startup", connect_to_mongo)
    app.add_event_handler("shutdown", close_mongo_connection)

def create_start_app_handler(app: FastAPI):
    """
    FastAPI startup event handler
    """
    async def start_app() -> None:
        await connect_to_mongo()
    
    return start_app

def create_stop_app_handler(app: FastAPI):
    """
    FastAPI shutdown event handler
    """
    async def stop_app() -> None:
        await close_mongo_connection()
    
    return stop_app