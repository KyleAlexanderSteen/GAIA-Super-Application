"""Context assembly. History + input → prompt."""

def build(history, user_input):
    parts = []
    for msg in history:
        parts.append(f"{msg['role']}: {msg['content']}")
    parts.append(f"user: {user_input}")
    return "\n".join(parts)
