#!/usr/bin/env python3
"""Tests for the spine. End to end."""
import unittest
import os
import tempfile
from spine.db import connect, get_messages, create_session
from spine.loop import run
from spine.context import build
from spine.model import send

class TestDB(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
        self.tmp.close()
        self.conn = connect(self.tmp.name)

    def tearDown(self):
        self.conn.close()
        os.unlink(self.tmp.name)

    def test_create_session(self):
        create_session(self.conn, "s1")
        row = self.conn.execute("SELECT * FROM sessions WHERE id = ?", ("s1",)).fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row["state"], "LATENT")

    def test_save_and_get_messages(self):
        create_session(self.conn, "s1")
        from spine.db import save_message
        save_message(self.conn, "s1", "user", "hello")
        save_message(self.conn, "s1", "assistant", "hi")
        messages = get_messages(self.conn, "s1")
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0]["role"], "user")
        self.assertEqual(messages[1]["content"], "hi")

    def test_audit_log(self):
        from spine.db import log_audit
        log_audit(self.conn, "s1", "in", "out")
        row = self.conn.execute("SELECT * FROM audit WHERE session_id = ?", ("s1",)).fetchone()
        self.assertEqual(row["input"], "in")
        self.assertEqual(row["output"], "out")

class TestContext(unittest.TestCase):
    def test_build_empty_history(self):
        result = build([], "hello")
        self.assertEqual(result, "user: hello")

    def test_build_with_history(self):
        history = [{"role": "user", "content": "hi"}, {"role": "assistant", "content": "hello"}]
        result = build(history, "how are you")
        self.assertIn("user: hi", result)
        self.assertIn("assistant: hello", result)
        self.assertIn("user: how are you", result)

class TestModel(unittest.TestCase):
    def test_stub_returns_text(self):
        result = send("hello", "stub")
        self.assertIn("text", result)
        self.assertIn("hello", result["text"])

    def test_unknown_model_raises(self):
        with self.assertRaises(NotImplementedError):
            send("hello", "unknown")

class TestLoop(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
        self.tmp.close()
        self.conn = connect(self.tmp.name)

    def tearDown(self):
        self.conn.close()
        os.unlink(self.tmp.name)

    def test_run_saves_messages(self):
        output = run(self.conn, "s1", "hello")
        self.assertIn("hello", output)
        messages = get_messages(self.conn, "s1")
        self.assertEqual(len(messages), 2)

    def test_run_logs_audit(self):
        run(self.conn, "s1", "hello")
        audit = self.conn.execute("SELECT * FROM audit WHERE session_id = ?", ("s1",)).fetchall()
        self.assertEqual(len(audit), 1)

    def test_run_creates_session(self):
        run(self.conn, "s1", "hello")
        row = self.conn.execute("SELECT * FROM sessions WHERE id = ?", ("s1",)).fetchone()
        self.assertIsNotNone(row)

    def test_multiple_turns(self):
        run(self.conn, "s1", "hello")
        run(self.conn, "s1", "world")
        messages = get_messages(self.conn, "s1")
        self.assertEqual(len(messages), 4)

if __name__ == "__main__":
    unittest.main()
