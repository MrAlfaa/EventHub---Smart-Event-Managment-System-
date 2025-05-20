# EventHub - Smart Event Management System

This guide provides step-by-step instructions for setting up and running the EventHub project in a Windows environment.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Clone the Repository](#clone-the-repository)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Project Configuration](#project-configuration)
- [Running the Application](#running-the-application)

## Prerequisites

Make sure you have the following installed:
- [Git](https://git-scm.com/downloads)
- [Python](https://www.python.org/downloads/) (v3.8 or later)
- [Node.js](https://nodejs.org/) (v16 or later)
- [Visual Studio Code](https://code.visualstudio.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) (local installation or MongoDB Atlas account)

## Clone the Repository

1. Open Command Prompt or PowerShell and navigate to your preferred directory:

```bash
cd C:\path\to\your\projects
```

2. Clone the repository:

```bash
git clone https://github.com/MrAlfaa/EventHub---Smart-Event-Managment-System-.git
```

3. Navigate into the project directory:

```bash
cd EventHub---Smart-Event-Managment-System-
```

## Backend Setup

### Create and Activate Virtual Environment

1. Open the project in VS Code:

```bash
code .
```

2. Open a new terminal in VS Code (Terminal > New Terminal)

3. Create a virtual environment:

```bash
python -m venv venv
```

4. Activate the virtual environment:

```bash
.\venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt, indicating the virtual environment is active.

### Update Requirements File

1. Open the `backend/requirements.txt` file and replace its contents with the following:

```
fastapi==0.104.1
uvicorn==0.24.0
motor==3.3.1
pydantic==2.4.2
python-jose==3.3.0
passlib==1.7.4
bcrypt==4.0.1
python-multipart==0.0.6
email-validator==2.0.0
python-dotenv==1.0.0
pymongo==4.5.0
fastapi-pagination==0.12.12
typing-extensions==4.8.0
aiofiles==23.2.1
pytz==2023.3
pytest==7.4.3
httpx==0.25.1
```

2. Install the updated dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### Create Necessary Directories

Create an upload directory for file storage:

```bash
mkdir uploads
mkdir uploads\profile_pictures
mkdir uploads\event_images
mkdir uploads\provider_documents
```

### Create Backend Environment File

Create a `.env` file in the `backend` directory:

```bash
cd backend
type nul > .env
```

Open the `.env` file in VS Code and add the following content:

```
# MongoDB Connection
MONGODB_URL=mongodb://localhost:27017
DB_NAME=eventhub

# JWT Settings
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# General settings
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
API_PREFIX=/api/v1

# File upload settings
UPLOAD_DIRECTORY=../uploads
```

Replace `your_secret_key_here` with a strong secret key (you can generate one using Python: `openssl rand -hex 32`).

## Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install frontend dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory:

```bash
type nul > .env.local
```

4. Open the `.env.local` file in VS Code and add:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_UPLOAD_URL=http://localhost:8000/uploads
```

## Project Configuration

### Configure MongoDB

If you're using a local MongoDB instance:
1. Make sure MongoDB service is running
2. The database will be created automatically when the application first runs

If you're using MongoDB Atlas:
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Update the `MONGODB_URL` in your backend `.env` file with your connection string

## Running the Application

### Start the Backend Server

1. Ensure your virtual environment is activated:

```bash
cd backend
.\venv\Scripts\activate
```

2. Start the FastAPI server:

```bash
cd app
python -m uvicorn main:app --reload
```

The backend server should now be running at http://localhost:8000. The API documentation will be available at http://localhost:8000/docs.

### Start the Frontend Development Server

1. Open a new terminal in VS Code

2. Navigate to the frontend directory:

```bash
cd frontend
```

3. Start the development server:

```bash
npm run dev
```

The frontend should now be running at http://localhost:3000.

## Project Structure Explanation

- `backend/` - Contains all the FastAPI backend code
  - `app/` - Main application folder
    - `api/` - API endpoints
    - `core/` - Core functionality and configuration
    - `models/` - Data models
    - `services/` - Business logic
  - `requirements.txt` - Python dependencies

- `frontend/` - Contains all the Next.js frontend code
  - `src/` - Source code
    - `components/` - React components
    - `pages/` - Next.js pages
    - `services/` - API service functions

- `uploads/` - Directory for storing uploaded files
  - `profile_pictures/` - User profile images
  - `event_images/` - Images for events
  - `provider_documents/` - Service provider documents

## Troubleshooting

- **Port Conflicts**: If ports 3000 or 8000 are already in use, you can change them:
  - Backend: `uvicorn main:app --reload --port 8001`
  - Frontend: Edit `package.json` scripts or use `npm run dev -- -p 3001`

- **MongoDB Connection Issues**: Ensure MongoDB is running or your Atlas connection string is correct

- **Module Not Found Errors**: Make sure you've installed all dependencies and your virtual environment is activated

Happy coding with EventHub!
```

To create this file in your project, use:

```bash
cd EventHub---Smart-Event-Managment-System-
```

```bash
type nul > run.md