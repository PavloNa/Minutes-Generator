import os
from os.path import dirname, join
import pymongo
import ssl
from dotenv import load_dotenv

dotenv_path = join(dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

class Database:
    def __init__(self, db_collection: str) -> None:
        self.db_url = os.getenv("MONGODB_CONNECTION", "")
        self.mydb = os.getenv("MONGODB_DATABASE", "")
        if not self.db_url or not self.mydb:
            raise ValueError("Database connection string is not set in environment variables.")

        # Create SSL context with OpenSSL 3.x compatibility
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = True
        ssl_context.verify_mode = ssl.CERT_REQUIRED

        # OpenSSL 3.x compatibility: allow legacy renegotiation
        ssl_context.options |= 0x4  # OP_LEGACY_SERVER_CONNECT

        self.client = pymongo.MongoClient(
            self.db_url,
            tls=True,
            tlsAllowInvalidCertificates=False,
            ssl_context=ssl_context
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
