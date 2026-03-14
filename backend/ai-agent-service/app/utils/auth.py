from typing import Optional

import jwt
from fastapi import Header, HTTPException

from app.config import settings


def _get_key_bytes() -> bytes:
    """
    Replicate Spring Boot's key derivation:
        byte[] keyBytes = Decoders.BASE64.decode(
            Base64.getEncoder().encodeToString(secretKey.getBytes()));

    Base64-encoding the raw bytes and then Base64-decoding is a no-op,
    so the effective signing key is just the UTF-8 bytes of the secret string.
    """
    return settings.jwt_secret.encode("utf-8")


def validate_token(authorization: Optional[str] = Header(None)) -> dict:
    """Validate JWT and return the decoded payload."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401, detail="Missing or invalid Authorization header"
        )
    token = authorization[len("Bearer "):]
    try:
        payload = jwt.decode(
            token,
            _get_key_bytes(),
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")


def require_teacher(authorization: Optional[str] = Header(None)) -> dict:
    """Validate token and assert the caller has ROLE_TEACHER."""
    payload = validate_token(authorization)
    if payload.get("role") != "ROLE_TEACHER":
        raise HTTPException(status_code=403, detail="Teacher role required")
    return payload
