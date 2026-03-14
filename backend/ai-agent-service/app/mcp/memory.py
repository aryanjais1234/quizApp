# ---------------------------------------------------------------------------
# MCP Memory — in-memory session history (same pattern as the MCP POC example)
# Replace _sessions with Redis or a database for production use.
# ---------------------------------------------------------------------------

from typing import Dict, List

_sessions: Dict[str, List[Dict[str, str]]] = {}


def get_history(session_id: str, limit: int = 8) -> List[Dict[str, str]]:
    """Return the last `limit` messages for a session."""
    msgs = _sessions.get(session_id, [])
    return msgs[-limit:]


def append_user(session_id: str, content: str) -> None:
    """Append a user message to the session history."""
    _sessions.setdefault(session_id, []).append(
        {"role": "user", "content": content}
    )


def append_assistant(session_id: str, content: str) -> None:
    """Append an assistant message to the session history."""
    _sessions.setdefault(session_id, []).append(
        {"role": "assistant", "content": content}
    )


def clear_session(session_id: str) -> None:
    """Remove all history for a session."""
    _sessions.pop(session_id, None)


def list_sessions() -> List[str]:
    """Return all active session IDs."""
    return list(_sessions.keys())
