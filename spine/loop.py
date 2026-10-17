"""The spine. Input → assemble → call → save → output."""
from . import db, model, context

def run(conn, session_id, user_input, model_name="stub"):
    db.create_session(conn, session_id)
    history = db.get_messages(conn, session_id)
    prompt = context.build(history, user_input)
    response = model.send(prompt, model_name)
    db.save_message(conn, session_id, "user", user_input)
    db.save_message(conn, session_id, "assistant", response["text"])
    db.log_audit(conn, session_id, user_input, response["text"])
    return response["text"]
