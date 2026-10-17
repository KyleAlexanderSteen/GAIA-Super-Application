"""Config. Loads from environment."""
import os

def load():
    return {
        "db_path": os.environ.get("GAIA_DB", "spine.db"),
        "model": os.environ.get("GAIA_MODEL", "stub"),
    }
