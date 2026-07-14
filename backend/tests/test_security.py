from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token


def test_password_hashing():
    password = "TestPass123!"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrong", hashed)


def test_access_token():
    token = create_access_token({"sub": "user-123", "email": "test@test.com"})
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == "user-123"
    assert payload["email"] == "test@test.com"
    assert payload["type"] == "access"


def test_refresh_token():
    token = create_refresh_token({"sub": "user-123"})
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == "user-123"
    assert payload["type"] == "refresh"


def test_invalid_token():
    payload = decode_token("invalid.token.here")
    assert payload is None
