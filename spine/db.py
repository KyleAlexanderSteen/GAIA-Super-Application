"""SQLite store. Sessions, messages, audit."""
import sqlite3
from datetime import datetime, timezone

def connect(path):
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            state TEXT DEFAULT 'LATENT',
            created_at TEXT
        );
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            role TEXT,
            content TEXT,
            created_at TEXT
        );
        CREATE TABLE IF NOT EXISTS audit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            input TEXT,
            output TEXT,
            created_at TEXT
        );
    """)
    return conn

def create_session(conn, session_id):
    now = datetime.now(timezone.utc).isoformat()
    conn.execute("INSERT OR IGNORE INTO sessions (id, created_at) VALUES (?, ?)", (session_id, now))
    conn.commit()

def save_message(conn, session_id, role, content):
    now = datetime.now(timezone.utc).isoformat()
    conn.execute("INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)",
                 (session_id, role, content, now))
    conn.commit()

def get_messages(conn, session_id):
    return conn.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY id",
                        (session_id,)).fetchall()

def log_audit(conn, session_id, input_text, output_text):
    now = datetime.now(timezone.utc).isoformat()
    conn.execute("INSERT INTO audit (session_id, input, output, created_at) VALUES (?, ?, ?, ?)",
                 (session_id, input_text, output_text, now))
    conn.commit()
