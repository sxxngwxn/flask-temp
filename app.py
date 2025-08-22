# app.py
from flask import Flask, render_template, request, redirect, url_for, flash, session
from dotenv import load_dotenv
import os
from auth.auth import AuthModule
from auth.firebase_set import FirebaseApp
from database.db_handle import DBModule
from datetime import datetime, timezone, timedelta
from flask_mail import Mail, Message
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import time
import logging

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY")

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get("MAIL_USERNAME")   # 관리자 메일
app.config['MAIL_PASSWORD'] = os.environ.get("MAIL_PASSWORD")       # 앱 비밀번호
app.config['MAIL_DEFAULT_SENDER'] = ('MyCompany Support', os.environ.get("MAIL_USERNAME"))

app.config['SESSION_COOKIE_SECURE'] = True  # HTTPS에서만 쿠키 전송
app.config['SESSION_COOKIE_HTTPONLY'] = True  # XSS 방지
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF 방지

# Limiter 설정
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]  # 원하는 기본 제한 설정
)

limiter.init_app(app)
mail = Mail(app)

# API_KEY="" #추후수정

# Firebase 및 인증 모듈 초기화
firebase_app = FirebaseApp()
auth_module = AuthModule(firebase_app)
db_module = DBModule(firebase_app)

# 메인
@app.route("/")
def index():
    return render_template("app/index.html")

# 회원가입
@app.route("/signup", methods=["GET", "POST"])
@limiter.limit("5 per minute")
def signup():
    if "email" in session:
        return redirect(url_for("index"))

    if request.method == "POST":
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "").strip()
        name = request.form.get("name", "").strip()

        # 입력값 검증
        if not email or not password or not name:
            flash("이메일, 비밀번호, 이름을 모두 입력해주세요.", "warning")
            return redirect(url_for("signup"))

        try:
            result = auth_module.signup(email, password)
        except Exception as e:
            flash("회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", "error")
            return redirect(url_for("signup"))

        if not result.get("success"):
            flash(f"이미 존재하는 이메일입니다.", "error")
            return redirect(url_for("signup"))

        user = result["user"]

        try:
            db_module.add_user(
                uid=user["localId"],
                token=user["idToken"],
                email=user["email"],
                name=name,
            )
        except ValueError as e:
            logging.error(f"Validation error in signup: {str(e)}")
            flash("입력값이 올바르지 않습니다.", "error")
        except Exception as e:
            logging.error(f"Firebase error in signup: {str(e)}")
            flash("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", "error")

        flash("회원가입 성공! 로그인 해주세요.", "success")
        return redirect(url_for("signin"))

    return render_template("app/signup.html")


@app.route("/signin", methods=["GET", "POST"])
@limiter.limit("5 per minute")
def signin():
    if "email" in session:
        return redirect(url_for("index"))
    
    if request.method == "POST":
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "").strip()
        license_key = request.form.get("license", "").strip()

        # 입력값 검증
        if not email or not password:
            flash("이메일과 비밀번호를 입력해주세요.", "warning")
            return redirect(url_for("signin"))

        result = auth_module.signin(email, password)
        if not result.get("success"):
            flash("로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.", "error")
            return redirect(url_for("signin"))

        user = result["user"]
        user_data = db_module.get_user(user["localId"], user["idToken"])

        # 라이선스 없는 신규 사용자
        if not user_data.get("license"):
            if not license_key:
                flash("라이선스 키를 입력해주세요.", "warning")
                return redirect(url_for("signin"))

            try:
                # 라이선스 키가 사용 가능한지 확인.. // 아 fuck fuckfuckfuckfuck
                is_valid = db_module.validation_license_key(license=license_key, token=user["idToken"])
            except Exception as e:
                flash("라이선스 확인 중 오류가 발생했습니다.", "error")
                return redirect(url_for("signin"))

            if not is_valid:
                flash("구매 후 로그인 부탁드립니다.", "error")
                return redirect(url_for("signin"))

            # 라이선스 등록
            try:
                success1 = db_module.update_user_license(user["localId"], user["idToken"], license=license_key)
                success2 = db_module.update_license_as_used(user["idToken"], license_key, user["localId"])
            except Exception as e:
                flash("인증 과정 중 문제가 생겼습니다. 관리자에게 문의해주세요.")
                return redirect(url_for("signin"))

            if not (success1 and success2):
                flash("인증 과정 중 문제가 생겼습니다. 관리자에게 문의해주세요.", "error")
                return redirect(url_for("signin"))
        else:
            # 기존 사용자 또는 라이선스 등록 후
            # 만료 체크
            try:
                my_license = db_module.check_that_is_my_license(license=license_key, hashed_license=user_data.get("license"))
                if not my_license:
                    flash("본인 라이선스 코드를 사용해 주세요.", "warning")
                    return redirect(url_for("signin"))
            except Exception as e:
                flash("라이선스 확인 중 오류가 발생했습니다.", "error")
                return redirect(url_for("signin"))

            try:
                # 사용자의 현재 라이선스 만료 체크
                user_license = user_data.get("license")
                over_expire_date = db_module.check_license_expire_date(license=user_license, token=user["idToken"])
                logging.error(over_expire_date)
                if user_license and over_expire_date:
                    flash("구독 기간이 만료되었습니다. 재결제 후 이용해주세요.", "warning")
                    return redirect(url_for("signin"))
            except Exception as e:
                logging.error(e)
                flash("라이선스 만료 확인 중 오류가 발생했습니다.", "error")
                return redirect(url_for("signin"))

        # 세션 설정
        session.clear()
        try:
            session["username"] = db_module.get_username(user["localId"], user["idToken"])
        except Exception:
            session["username"] = "사용자"
        session["email"] = email
        session["id_token"] = user["idToken"]
        session["refresh_token"] = user["refreshToken"]
        session["local_id"] = user["localId"]
        session["is_admin"] = db_module.is_admin(user["localId"], user["idToken"])
        session["token_expiry"] = time.time() + int(user.get("expiresIn", 3600))  # 기본 1시간 fallback

        flash("로그인 성공!", "success")
        return redirect(url_for("index"))

    return render_template("app/signin.html")

# 관리자
@app.route("/admin", methods=["GET"])
def admin():
    if session["is_admin"]:
        localId = session["local_id"]
        token = session["id_token"]

        if db_module.is_admin(localId=localId, token=token):
            licenses = db_module.get_licenses(localId=localId, token=token)
            return render_template("app/admin.html", license_keys=licenses)
        else : 
            return redirect(url_for("index"))
    else :
        return redirect(url_for("index"))

# 라이선스 생성(관리자)
@app.route("/generate_license", methods=["POST"])
def generate_license():
    localId = session["local_id"]
    token = session["id_token"]

    if not db_module.is_admin(localId=localId, token=token):
        flash("권한이 없습니다.")
        return redirect(url_for("admin"))

    new_key = request.form.get("new_license").strip()
    if new_key:
        # 만료일 계산: 현재 시간 + 30일 (월정액 1개월)
        expire_date = datetime.now(timezone.utc) + timedelta(days=30)
        # ISO 8601 문자열 형태 예: "2025-07-29T15:00:00Z"
        expire_date_str = expire_date.isoformat() + "Z"
        result = db_module.add_license(localId=localId, token=token, new_license=new_key, expire_date=expire_date_str)
        if result["success"]:
            flash(f"라이선스 키 '{new_key}'가 등록되었습니다.")
        else:
            flash(f"라이선스 키 '{new_key}'를 등록하는 도중 오류가 발생했습니다.")
    else:
        flash("라이선스 키를 입력하세요.")
    return redirect(url_for("admin"))

# email 전송
@app.route("/send_user_email", methods=["POST"])
def send_user_email():
    user_email = request.form.get("email")
    message_body = request.form.get("message")

    msg = Message(
        subject="MyService 라이선스 코드 안내",
        recipients=[user_email],
        html=render_template("mail/license_email.html", username=user_email, license_code=message_body)
    )

    try:
        mail.send(msg)
        flash(f"{user_email}에게 메일이 발송되었습니다!", "success")
    except Exception as e:
        print(f"메일 전송 실패: {str(e)}")
        flash(f"메일 발송 실패", "error")

    return redirect(url_for("admin"))

# 로그아웃
@app.route("/logout")
def logout():
    session.clear()
    flash("로그아웃 되었습니다.", "success")
    return redirect(url_for("index"))

@app.route("/main")
def main():
    if "email" not in session:
        return redirect(url_for("signin"))
    return render_template("service/main.html")

@app.route("/login")
def login():
    if "email" not in session:
        return redirect(url_for("signin"))
    return render_template("service/login.html")

@app.route("/mypage")
def mypage():
    if "email" not in session:
        return redirect(url_for("signin"))
    return render_template("service/mypage.html")

@app.route("/order/order-list")
def orderlist():
    if "email" not in session:
        return redirect(url_for("signin"))
    return render_template("service/orderlist.html")

@app.route("/order/order-detail")
def orderdetail():
    if "email" not in session:
        return redirect(url_for("signin"))
    return render_template("service/orderdetail.html")

@app.route("/receipt")
def receipt():
    if "email" not in session:
        return redirect(url_for("signin"))
    return render_template("service/receipt.html")

@app.route("/payment")
def payment():
    if "email" not in session:
        return redirect(url_for("signin"))
    return render_template("service/payment.html")