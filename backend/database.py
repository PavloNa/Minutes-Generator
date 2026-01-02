import os
import pymongo

def Database():
    def __init__(self, db_collection: str) -> None:
        self.db_url = os.getenv("100_MONGODB_CONNECTION", "")
        self.mydb = os.getenv("101_MONGODB_DATABASE", "")
        if not self.db_url or not self.mydb:
            raise ValueError("Database connection string is not set in environment variables.")
        self.client = pymongo.MongoClient(self.db_url)
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
    def __del__(self):
        self.close_connection()
