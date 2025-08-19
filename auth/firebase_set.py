# firebase.py
import pyrebase
import os
from dotenv import load_dotenv

# .env 파일 불러오기
load_dotenv()

class FirebaseApp:
    def __init__(self):
        config = {
            "apiKey": os.environ.get("FIREBASE_API_KEY"),
            "authDomain": os.environ.get("FIREBASE_AUTH_DOMAIN"),
            "databaseURL": os.environ.get("FIREBASE_DB_URL"),
            "projectId": os.environ.get("FIREBASE_PROJECT_ID"),
            "storageBucket": os.environ.get("FIREBASE_STORAGE_BUCKET"),
            "messagingSenderId": os.environ.get("FIREBASE_MESSAGING_SENDER_ID"),
            "appId": os.environ.get("FIREBASE_APP_ID")
        }
        self.firebase = pyrebase.initialize_app(config)
        self.auth = self.firebase.auth()
        self.db = self.firebase.database()
