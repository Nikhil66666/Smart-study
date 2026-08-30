import bcrypt

def hash_password(password: str) -> str:
    """Hash a password using bcrypt 4.0.1 (stable)."""
    if not isinstance(password, str):
        password = str(password)
    pwd_bytes = password.encode("utf-8")[:72]
    hashed = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt(rounds=12))
    result = hashed.decode("utf-8")
    print(f"[Security] hash_password produced: {result[:20]}... (len={len(result)})")
    return result

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its bcrypt hash."""
    if not plain_password or not hashed_password:
        print(f"[Security] verify_password FAIL - empty input. plain={bool(plain_password)}, hash={bool(hashed_password)}")
        return False
    try:
        plain_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes  = hashed_password.encode("utf-8")
        result = bcrypt.checkpw(plain_bytes, hash_bytes)
        print(f"[Security] verify_password → {result} (hash prefix: {hashed_password[:10]})")
        return result
    except Exception as e:
        print(f"[Security] verify_password exception: {type(e).__name__}: {e}")
        return False