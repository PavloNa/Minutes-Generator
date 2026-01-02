from typing import Union
import logging
from database import Database
from authentication import Authentication
from fastapi import FastAPI

auth = Authentication()
app = FastAPI()

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
def get_user(username: str):
    db = Database("users").get_collection()
    user = db.find_one({"username": username})
    if user:
        return {"username": user["username"], "email": user["email"]}
    else:
        return {"message": "User not found"}