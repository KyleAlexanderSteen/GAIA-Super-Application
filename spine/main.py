#!/usr/bin/env python3
"""CLI entry. The spine runs."""
import sys
from .config import load
from .db import connect
from .loop import run

def main():
    cfg = load()
    conn = connect(cfg["db_path"])
    session_id = "cli-session"
    print("GAIA spine. Type 'quit' to exit.")
    while True:
        try:
            user_input = input("> ")
        except EOFError:
            break
        if user_input.strip().lower() == "quit":
            break
        output = run(conn, session_id, user_input, cfg["model"])
        print(output)
    conn.close()

if __name__ == "__main__":
    main()
