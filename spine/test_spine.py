#!/usr/bin/env python3
"""Test the spine. End to end."""
import unittest
import os
import tempfile
from spine.db import connect, get_messages
from spine.loop import run

class TestSpine(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
        self.tmp.close()
        self.conn = connect(self.tmp.name)

    def tearDown(self):
        self.conn.close()
        os.unlink(self.tmp.name)

    def test_run_saves_messages(self):
        output = run(self.conn, "test-session", "hello")
        self.assertIn("hello", output)
        messages = get_messages(self.conn, "test-session")
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0]["role"], "user")
        self.assertEqual(messages[1]["role"], "assistant")

    def test_run_logs_audit(self):
        run(self.conn, "test-session", "hello")
        audit = self.conn.execute("SELECT * FROM audit WHERE session_id = ?", ("test-session",)).fetchall()
        self.assertEqual(len(audit), 1)

if __name__ == "__main__":
    unittest.main()
