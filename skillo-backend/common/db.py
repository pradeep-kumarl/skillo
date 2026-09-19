import sqlite3
import os

DB_PATH = "/tmp/skillo.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_lat REAL,
            user_lng REAL,
            status TEXT DEFAULT 'pending',
            mechanic_id INTEGER,
            mechanic_name TEXT,
            mechanic_phone TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()