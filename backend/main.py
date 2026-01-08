from typing import Dict, Any, Optional
import logging
import os
from datetime import datetime
from database import Database
from authentication import Authentication
from ai import AI
from pdf_generator import PDFGenerator
from encryption import Encryption
from fastapi import FastAPI, Body, File, UploadFile, Form, APIRouter
from fastapi.middleware.cors import CORSMiddleware

auth = Authentication()
encryption = Encryption()
app = FastAPI()
router = APIRouter()
# CORS configuration
# Allow local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x) for development
# and specific production origins from environment variable
import re
local_network_regex = r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$"

# Get production origins from environment (e.g., "https://yourdomain.com,https://app.yourdomain.com")
production_origins = os.getenv("CORS_ORIGINS", "")
allowed_origins = [origin.strip() for origin in production_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else [],
    allow_origin_regex=local_network_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@router.get("/")
def read_root():
    return {"status": "ok"}

# User authentication endpoints
@router.post("/login")
def login_user(username: str, password: str):
    success = auth.login(username, password)
    logging.info(f"User login attempt for {username}: {'successful' if success[0] else 'failed'}")
    if success[0]:
        return {"message": success[1]}
    else:
        return {"message": success[1]}

@router.post("/reset_password")
# TODO: implement email sending functionality
def reset_password(email: str):
    success = auth.reset_password(email)
    if success:
        return {"message": "Password reset email sent."}
    else:
        return {"message": "Failed to send password reset email."}

@router.post("/verify_token")
def verify_token(token: str):
    success = auth.verify_token(token)
    if success[0]:
        return {"username": success[1]}
    else:
        return {"message": "Invalid or expired token"}


# User management endpoints
@router.post("/create_user")
def register_user(username: str, password: str, email: str):
    success = auth.register(username, password, email)
    logging.info(f"User registration attempt for {username}: {'successful' if success[0] else 'failed'}")
    if success[0]:
        return {"message": f"User {username} registered successfully."}
    else:
        return {"message": success[1]}

@router.post("/get_user")
def get_user(token: str):
    verified = auth.verify_token(token)
    if not verified[0]:
        return {"message": "Invalid or expired token"}

    username = verified[1]
    db = Database("users").get_collection()
    user = db.find_one({"username": username})
    if user:
        ai_config = user.get("ai_config", {"ai_provider": "OpenAI", "api_key": ""})

        # Decrypt API key before sending to client
        encrypted_key = ai_config.get("api_key", "")
        if encrypted_key and encryption.is_encrypted(encrypted_key):
            ai_config["api_key"] = encryption.decrypt(encrypted_key)

        stats = user.get("stats", {
            "characters_processed": 0,
            "audio_seconds_processed": 0,
            "transcripts_generated": 0
        })
        return {
            "username": user["username"],
            "email": user["email"],
            "ai_config": ai_config,
            "stats": stats
        }
    else:
        return {"message": "User not found"}

@router.post("/update_user")
def update_user(token: str, data: Dict[str, Any] = Body(...)):
    verified = auth.verify_token(token)
    if not verified[0]:
        return {"message": "Invalid or expired token"}

    username = verified[1]
    db = Database("users").get_collection()

    user = db.find_one({"username": username})
    if not user:
        return {"message": "User not found"}

    # Don't allow updating sensitive fields
    protected_fields = ["username", "username_lower", "password", "_id"]
    update_data = {k: v for k, v in data.items() if k not in protected_fields}

    if not update_data:
        return {"message": "No valid data to update"}

    # Encrypt API key if present in ai_config
    if "ai_config" in update_data and "api_key" in update_data["ai_config"]:
        api_key = update_data["ai_config"]["api_key"]
        if api_key:  # Only encrypt non-empty keys
            update_data["ai_config"]["api_key"] = encryption.encrypt(api_key)

    result = db.update_one({"username": username}, {"$set": update_data})
    if result.modified_count > 0 or result.matched_count > 0:
        return {"message": "User updated successfully"}
    else:
        return {"message": "Failed to update user"}

@router.post("/process_transcript")
async def process_transcript(
    token: str = Form(...),
    transcript_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    # Verify token
    verified = auth.verify_token(token)
    if not verified[0]:
        return {"success": False, "message": "Invalid or expired token"}

    username = verified[1]

    # Get user's API config
    db = Database("users").get_collection()
    user = db.find_one({"username": username})
    if not user:
        return {"success": False, "message": "User not found"}

    ai_config = user.get("ai_config", {})
    encrypted_key = ai_config.get("api_key", "")
    ai_provider = ai_config.get("ai_provider", "OpenAI")

    if not encrypted_key:
        return {"success": False, "message": "No API key configured. Please set up your API key in Profile."}

    # Decrypt API key before using
    api_key = encrypted_key
    if encryption.is_encrypted(encrypted_key):
        api_key = encryption.decrypt(encrypted_key)

    # Initialize AI handler
    ai = AI(api_key=api_key, provider=ai_provider)

    # Handle file upload
    if file:
        file_content = await file.read()
        filename = file.filename.lower()

        # Handle text files
        if filename.endswith('.txt'):
            result = ai.handle_txt_file(file_content)

        # Handle audio files
        elif filename.endswith(('.mp3', '.wav', '.m4a', '.ogg', '.webm')):
            result = ai.handle_audio_file(file_content, filename)
        else:
            return {"success": False, "message": "Unsupported file type"}

    # Handle text input
    elif transcript_text:
        result = ai.handle_text(transcript_text)
    else:
        return {"success": False, "message": "No transcript or file provided"}

    # Return result
    if result.get("success"):
        # Update user statistics
        transcript_length = result.get("transcript_length", 0)
        audio_duration = result.get("audio_duration", 0)  # in seconds
        
        db.update_one(
            {"username": username},
            {
                "$inc": {
                    "stats.characters_processed": transcript_length,
                    "stats.audio_seconds_processed": audio_duration,
                    "stats.transcripts_generated": 1
                }
            }
        )
        
        return {
            "success": True,
            "minutes": result["minutes"],
            "transcript": result.get("transcript", ""),
            "transcript_length": transcript_length
        }
    else:
        return {"success": False, "message": result.get("error", "Processing failed")}


@router.get("/pdf_templates")
def get_pdf_templates():
    """Get available PDF templates."""
    templates = PDFGenerator.get_templates()
    return {"success": True, "templates": templates}


@router.post("/create_pdf")
def create_pdf(
    token: str = Form(...),
    template: str = Form(...),
    minutes: str = Form(...),
    filename: str = Form(...)
):
    """Create PDF from minutes and store in user's files."""
    import json
    
    # Verify token
    verified = auth.verify_token(token)
    if not verified[0]:
        return {"success": False, "message": "Invalid or expired token"}

    username = verified[1]

    # Parse minutes JSON
    try:
        minutes_data = json.loads(minutes)
    except json.JSONDecodeError:
        return {"success": False, "message": "Invalid minutes data"}

    # Generate PDF
    try:
        generator = PDFGenerator(template=template)
        pdf_base64 = generator.generate(minutes_data)
    except Exception as e:
        logging.error(f"PDF generation error: {e}")
        return {"success": False, "message": "Failed to generate PDF"}

    # Store in user's files
    db = Database("users").get_collection()
    user = db.find_one({"username": username})
    if not user:
        return {"success": False, "message": "User not found"}

    # Create file entry
    file_entry = {
        "filename": filename,
        "template": template,
        "created_at": datetime.utcnow().isoformat(),
        "data": pdf_base64,
        "title": minutes_data.get("title", "Meeting Minutes")
    }

    # Add to user's files array
    result = db.update_one(
        {"username": username},
        {"$push": {"files": file_entry}}
    )

    if result.modified_count > 0 or result.matched_count > 0:
        return {
            "success": True, 
            "message": "PDF created and saved successfully",
            "pdf_data": pdf_base64,
            "filename": filename
        }
    else:
        return {"success": False, "message": "Failed to save PDF"}


@router.post("/get_user_files")
def get_user_files(token: str):
    """Get list of user's saved files (without the base64 data)."""
    verified = auth.verify_token(token)
    if not verified[0]:
        return {"success": False, "message": "Invalid or expired token"}

    username = verified[1]
    db = Database("users").get_collection()
    user = db.find_one({"username": username})

    if not user:
        return {"success": False, "message": "User not found"}

    files = user.get("files", [])
    # Return file info without the base64 data
    file_list = [
        {
            "filename": f.get("filename"),
            "template": f.get("template"),
            "created_at": f.get("created_at"),
            "title": f.get("title")
        }
        for f in files
    ]

    return {"success": True, "files": file_list}


@router.post("/get_file")
def get_file(token: str, filename: str):
    """Get a specific file's base64 data."""
    verified = auth.verify_token(token)
    if not verified[0]:
        return {"success": False, "message": "Invalid or expired token"}

    username = verified[1]
    db = Database("users").get_collection()
    user = db.find_one({"username": username})

    if not user:
        return {"success": False, "message": "User not found"}

    files = user.get("files", [])
    for f in files:
        if f.get("filename") == filename:
            return {"success": True, "data": f.get("data"), "filename": filename}

    return {"success": False, "message": "File not found"}


app.include_router(router, prefix="/api")