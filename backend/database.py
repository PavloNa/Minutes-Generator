import os
from os.path import dirname, join
import pymongo
from dotenv import load_dotenv

dotenv_path = join(dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

class Database:
    def __init__(self, db_collection: str) -> None:
        self.db_url = os.getenv("MONGODB_CONNECTION", "")
        self.mydb = os.getenv("MONGODB_DATABASE", "")
        if not self.db_url or not self.mydb:
            raise ValueError("Database connection string is not set in environment variables.")

        # MongoDB connection with TLS/SSL - using mongodb+srv:// automatically enables TLS
        # Add connection parameters for better error handling
        self.client = pymongo.MongoClient(
            self.db_url,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000
        )
        self.database = self.client[self.mydb]
        self.collection = self.database[db_collection]

    def get_collection(self):
        return self.collection
    def get_database(self):
        return self.database
    def get_client(self):
        return self.client
    def close_connection(self):
        self.client.close()
