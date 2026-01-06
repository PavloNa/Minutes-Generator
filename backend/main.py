from typing import Union, Dict, Any
import logging
from database import Database
from authentication import Authentication
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware

auth = Authentication()
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok"}

# User authentication endpoints
@app.post("/login")
def login_user(username: str, password: str):
    success = auth.login(username, password)
    logging.info(f"User login attempt for {username}: {'successful' if success[0] else 'failed'}")
    if success[0]:
        return {"message": success[1]}
    else:
        return {"message": success[1]}

@app.post("/reset_password")
# TODO: implement email sending functionality
def reset_password(email: str):
    success = auth.reset_password(email)
    if success:
        return {"message": "Password reset email sent."}
    else:
        return {"message": "Failed to send password reset email."}

@app.post("/verify_token")
def verify_token(token: str):
    success = auth.verify_token(token)
    if success[0]:
        return {"username": success[1]}
    else:
        return {"message": "Invalid or expired token"}


# User management endpoints
@app.post("/create_user")
def register_user(username: str, password: str, email: str):
    success = auth.register(username, password, email)
    logging.info(f"User registration attempt for {username}: {'successful' if success[0] else 'failed'}")
    if success[0]:
        return {"message": f"User {username} registered successfully."}
    else:
        return {"message": success[1]}

@app.post("/get_user")
def get_user(token: str):
    verified = auth.verify_token(token)
    if not verified[0]:
        return {"message": "Invalid or expired token"}

    username = verified[1]
    db = Database("users").get_collection()
    user = db.find_one({"username": username})
    if user:
        ai_config = user.get("ai_config", {"ai_provider": "OpenAI", "api_key": ""})
        return {
            "username": user["username"],
            "email": user["email"],
            "ai_config": ai_config
        }
    else:
        return {"message": "User not found"}

@app.post("/update_user")
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

    result = db.update_one({"username": username}, {"$set": update_data})
    if result.modified_count > 0 or result.matched_count > 0:
        return {"message": "User updated successfully"}
    else:
        return {"message": "Failed to update user"}