# auth.py
from auth.firebase_set import FirebaseApp

class AuthModule:
    def __init__(self, firebase_app: FirebaseApp):
        self.auth = firebase_app.auth

    def signup(self, email: str, password: str):
        print(email, password)
        try:
            user = self.auth.create_user_with_email_and_password(email, password)
            return {"success": True, "user": user}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def signin(self, email: str, password: str):
        try:
            user = self.auth.sign_in_with_email_and_password(email, password)
            return {"success": True, "user": user}
        except Exception as e:
            return {"success": False, "error": str(e)}
