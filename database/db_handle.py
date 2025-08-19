from auth.firebase_set import FirebaseApp
import hashlib
from datetime import datetime, timezone, timedelta

class DBModule:
    def __init__(self, firebase_app: FirebaseApp):
        self.db = firebase_app.db

    def add_user(self, uid: str, token: str, email: str, name: str):
        try:
            user_data = {
                "email": email,
                "name": name,
                "license": "",
                "admin": False,
            }
            self.db.child("users").child(uid).set(user_data, token)
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def update_user_license(self, uid, token, license):
        try:
            hashed = hashlib.sha256(license.encode()).hexdigest()
            self.db.child("users").child(uid).update({"license": hashed}, token)
            return True
        except Exception as e:
            return False

    def get_user(self, uid: str, token: str):
        try:
            data = self.db.child("users").child(uid).get(token)
            return data.val()
        except Exception as e:
            return False
        
    def add_license(self, localId, token, new_license, expire_date):
        user_data = self.db.child("users").child(localId).get(token).val()
        try:
            if user_data["admin"]:
                license_data = {
                    "valid": True,
                    "used_by":None,
                    "expire_date": expire_date
                }
                hashed = hashlib.sha256(new_license.encode()).hexdigest()
                self.db.child("licenses").child(hashed).set(license_data, token)
                return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}

        
    def get_licenses(self, localId, token):
        user_data = self.db.child("users").child(localId).get(token).val()
        if user_data and "admin" in user_data:
            licenses = self.db.child("licenses").get(token).val()
            return licenses or {}  # ← 리스트([])가 아니라 딕셔너리({})로 대체
        return {}
    
    def validation_license_key(self, license, token):
            hashed = hashlib.sha256(license.encode()).hexdigest()
            license_data = self.db.child("licenses").child(hashed).get(token).val()
            print(license_data)
            if license_data and "valid" in license_data:
                return license_data["valid"] == True
            return False
    
    def update_license_as_used(self, token, license, uid):
        try:
            update_data = {
                "valid": False,
                "used_by": uid
            }
            hashed = hashlib.sha256(license.encode()).hexdigest()
            self.db.child("licenses").child(hashed).update(update_data, token=token)
            return True
        except Exception as e:
            return False

    def is_admin(self, localId, token):
        # localId에 해당하는 사용자 정보 가져오기
        user_data = self.db.child("users").child(localId).get(token).val()
        if user_data and "admin" in user_data:
            return user_data["admin"] == True
        return False
    
    def get_username(self, localId, token):
        username = self.db.child("users").child(localId).get(token).val()['name']
        # print("hello", username)
        return username
    
    def check_license_expire_date(self, license, token):
        hashed = hashlib.sha256(license.encode()).hexdigest()
        license_data = self.db.child("licenses").child(hashed).get(token).val()
        if license_data and "expire_date" in license_data:
            expire_date = datetime.fromisoformat(license_data["expire_date"].rstrip("Z"))
            print(expire_date)

            now = datetime.now(timezone.utc)
            if now > expire_date:
                return True
            return False