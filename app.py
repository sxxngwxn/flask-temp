from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('test/test.html')

@app.route("/main")
def main():
    return render_template('service/login.html')