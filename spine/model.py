"""Model client. Stub by default. Replace with real API."""

def send(prompt, model="stub"):
    if model == "stub":
        return {"text": f"[stub] received: {prompt[:50]}...", "tokens": 10}
    raise NotImplementedError(f"model {model} not configured")
