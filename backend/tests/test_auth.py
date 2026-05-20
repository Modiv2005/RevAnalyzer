import pytest

def test_user_registration(client):
    # Test valid registration
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "auditor_new@firm.com",
            "password": "validpassword555",
            "full_name": "Marcus Aurelius",
            "role": "analyst"
        }
    )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "auditor_new@firm.com"
    assert data["role"] == "analyst"

    # Test duplicate registration
    res2 = client.post(
        "/api/v1/auth/register",
        json={
            "email": "auditor_new@firm.com",
            "password": "anotherpassword",
            "full_name": "Duplicate User",
            "role": "user"
        }
    )
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"].lower()

def test_user_login(client, test_user):
    # Successful login
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "test_analyst@firm.com", "password": "securepass123"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "analyst"

    # Bad password
    res_bad = client.post(
        "/api/v1/auth/login",
        json={"email": "test_analyst@firm.com", "password": "incorrectpass"}
    )
    assert res_bad.status_code == 401
    assert "incorrect" in res_bad.json()["detail"].lower()

def test_fetch_profile(client, analyst_token):
    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "test_analyst@firm.com"
    assert data["full_name"] == "Sarah Analyst"
