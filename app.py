from flask import Flask, render_template, request, jsonify, session
import sqlite3

app = Flask(__name__)
app.secret_key = "secret_key"

# ---------------- DB ----------------

def get_db():
    conn = sqlite3.connect("wordbook.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS wordbooks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL
        )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wordbook_id INTEGER NOT NULL,
        english TEXT NOT NULL,
        korean TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

# ---------------- 페이지 ----------------

@app.route("/")
def home():
    return render_template("index.html")

# ---------------- 회원가입 ----------------

@app.route("/register", methods=["POST"])
def register():
    data = request.json

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "success": False,
            "message": "입력값 부족"
        })

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, password)
        )

        conn.commit()

    except:
        conn.close()

        return jsonify({
            "success": False,
            "message": "이미 존재하는 아이디"
        })

    conn.close()

    return jsonify({
        "success": True
    })

# ---------------- 로그인 ----------------

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    username = data.get("username")
    password = data.get("password")

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM users WHERE username=? AND password=?",
        (username, password)
    )

    user = cur.fetchone()

    conn.close()

    if user:
        session["user_id"] = user["id"]

        return jsonify({
            "success": True
        })

    return jsonify({
        "success": False,
        "message": "아이디 또는 비밀번호 오류"
    })

# ---------------- 단어장 생성 ----------------

@app.route("/create_wordbook", methods=["POST"])
def create_wordbook():

    if "user_id" not in session:
        return jsonify({
            "success": False
        })

    data = request.json

    title = data.get("title")

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO wordbooks (user_id, title) VALUES (?, ?)",
        (session["user_id"], title)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True
    })

# ---------------- 단어장 목록 ----------------

@app.route("/get_wordbooks")
def get_wordbooks():

    if "user_id" not in session:
        return jsonify([])

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM wordbooks WHERE user_id=?",
        (session["user_id"],)
    )

    books = cur.fetchall()

    conn.close()

    result = []

    for book in books:
        result.append({
            "id": book["id"],
            "title": book["title"]
        })

    return jsonify(result)

@app.route("/add_word", methods=["POST"])
def add_word():
    if "user_id" not in session:
        return jsonify({"success": False})

    data = request.json

    wordbook_id = data.get("wordbook_id")
    english = data.get("english")
    korean = data.get("korean")

    if not wordbook_id or not english or not korean:
        return jsonify({"success": False})

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO words (wordbook_id, english, korean)
        VALUES (?, ?, ?)
    """, (wordbook_id, english, korean))

    conn.commit()
    conn.close()

    return jsonify({"success": True})


@app.route("/get_words/<int:wordbook_id>")
def get_words(wordbook_id):
    if "user_id" not in session:
        return jsonify([])

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT * FROM words
        WHERE wordbook_id=?
    """, (wordbook_id,))

    words = cur.fetchall()
    conn.close()

    result = []

    for word in words:
        result.append({
            "id": word["id"],
            "english": word["english"],
            "korean": word["korean"]
        })

    return jsonify(result)


@app.route("/delete_word/<int:word_id>", methods=["DELETE"])
def delete_word(word_id):
    if "user_id" not in session:
        return jsonify({"success": False})

    conn = get_db()
    cur = conn.cursor()

    cur.execute("DELETE FROM words WHERE id=?", (word_id,))

    conn.commit()
    conn.close()

    return jsonify({"success": True})


@app.route("/update_word/<int:word_id>", methods=["PUT"])
def update_word(word_id):
    if "user_id" not in session:
        return jsonify({"success": False})

    data = request.json

    english = data.get("english")
    korean = data.get("korean")

    if not english or not korean:
        return jsonify({"success": False})

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        UPDATE words
        SET english=?, korean=?
        WHERE id=?
    """, (english, korean, word_id))

    conn.commit()
    conn.close()

    return jsonify({"success": True})

@app.route("/check_login")
def check_login():
    if "user_id" in session:
        return jsonify({"login": True})
    return jsonify({"login": False})


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})

# ---------------- 실행 ----------------

if __name__ == "__main__":
    init_db()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )

