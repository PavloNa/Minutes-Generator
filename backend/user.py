from backend.database import Database

class User:
    def __init__(self, username: str) -> None:
        self.username = username
        self.database = Database("users")