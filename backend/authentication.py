from database import Database
import logging
import bcrypt
import jwt
import os
from datetime import datetime, timedelta, timezone

db = Database("users").get_collection()

# Secret key for signing JWTs - should be in .env in production
JWT_SECRET = os.getenv("200_JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


class Authentication:
    def __init__(self) -> None:
        pass

    def create_token(self, username: str) -> str:
        """Create a JWT token for the user."""
        payload = {
            "sub": username,
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    def verify_token(self, token: str) -> tuple[bool, str | None]:
        """Verify a JWT token and return the username if valid."""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return (True, payload.get("sub"))
        except jwt.ExpiredSignatureError:
            return (False, None)
        except jwt.InvalidTokenError:
            return (False, None)

    def login(self, username_or_email: str, password: str) -> tuple[bool, str]:
        # Try to find user by username or email (case-insensitive)
        search_lower = username_or_email.lower()
        user = db.find_one({"$or": [{"username_lower": search_lower}, {"email": search_lower}]})
        dummy_hash = bcrypt.hashpw(b"dummy", bcrypt.gensalt())
        stored_hash = user.get("password") if user else None

        if stored_hash and bcrypt.checkpw(password.encode('utf-8'), stored_hash):
            token = self.create_token(user["username"])
            return (True, token)
        else:
            bcrypt.checkpw(password.encode('utf-8'), dummy_hash)
            return (False, "Invalid username/email or password.")

    def register(self, username: str, password: str, email: str) -> tuple[bool, str]:
        # Check format of email and password strength
        if "@" not in email or "." not in email:
            return (False, "Invalid email format.")
        if len(password) < 8:
            return (False, "Password too weak. It must be at least 8 characters long.")

        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Store original username but also store lowercase version for case-insensitive uniqueness
        user_data = {
            "username": username,
            "username_lower": username.lower(),
            "password": password_hash,
            "email": email.lower()
        }
        # Check for existing username (case-insensitive)
        if db.find_one({"username_lower": username.lower()}):
            return (False, "Username already exists.")
        # Check for existing email (case-insensitive)
        if db.find_one({"email": email.lower()}):
            return (False, "Email already exists.")
        try:
            db.insert_one(user_data)
            return (True, "User registered successfully.")
        except Exception as e:
            logging.exception("Error registering user:")
            return (False, "Registration failed due to an internal error.")

    def reset_password(self, email: str) -> bool:
        # TODO to implement
        return True