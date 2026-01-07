"""
Encryption utility for sensitive data like API keys.
Uses Fernet symmetric encryption (AES 128 in CBC mode).
"""

import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

class Encryption:
    def __init__(self):
        """
        Initialize encryption with a key derived from environment variable.
        Falls back to JWT secret if ENCRYPTION_KEY is not set.
        """
        # Get encryption key from environment or use JWT secret as fallback
        secret = os.getenv("ENCRYPTION_KEY") or os.getenv("JWT_SECRET")

        if not secret:
            raise ValueError("No encryption key found. Set ENCRYPTION_KEY or JWT_SECRET in environment.")

        # Derive a proper Fernet key from the secret
        # Use a salt from environment for per-installation uniqueness
        salt = bytes(os.getenv("SALT", "minutes-generator-salt-v1"), "utf-8")

        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(secret.encode()))
        self.fernet = Fernet(key)

    def encrypt(self, plaintext: str) -> str:
        """
        Encrypt a plaintext string.

        Args:
            plaintext: The string to encrypt

        Returns:
            Base64-encoded encrypted string
        """
        if not plaintext:
            return ""

        encrypted_bytes = self.fernet.encrypt(plaintext.encode())
        return encrypted_bytes.decode()

    def decrypt(self, encrypted: str) -> str:
        """
        Decrypt an encrypted string.

        Args:
            encrypted: Base64-encoded encrypted string

        Returns:
            Decrypted plaintext string
        """
        if not encrypted:
            return ""

        try:
            decrypted_bytes = self.fernet.decrypt(encrypted.encode())
            return decrypted_bytes.decode()
        except Exception as e:
            # If decryption fails, it might be a legacy unencrypted key
            # Log the error and return empty string
            print(f"Decryption failed: {e}")
            return ""

    def is_encrypted(self, value: str) -> bool:
        """
        Check if a string appears to be encrypted (basic heuristic).
        Fernet tokens start with 'gAAAAA' when base64 encoded.

        Args:
            value: String to check

        Returns:
            True if value appears to be encrypted
        """
        if not value or len(value) < 10:
            return False

        # Fernet tokens have a specific format
        try:
            # Try to decode as base64 and check for Fernet signature
            return value.startswith("gAAAAA")
        except:
            return False
