from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.services.security import SESSION_COOKIE_NAME, verify_password


def signup(
    client: TestClient,
    *,
    email: str = "jina@example.com",
    password: str = "password123",
    nickname: str = "jina_01",
):
    return client.post(
        "/api/auth/signup",
        json={"email": email, "password": password, "nickname": nickname},
    )


def test_signup_creates_user_and_logs_in(client: TestClient, db_session: Session) -> None:
    response = signup(client)

    assert response.status_code == 201
    assert response.json()["email"] == "jina@example.com"
    assert response.json()["nickname"] == "jina_01"
    assert SESSION_COOKIE_NAME in response.cookies
    assert "HttpOnly" in response.headers["set-cookie"]
    assert "SameSite=lax" in response.headers["set-cookie"]

    stored_user = db_session.scalar(select(User).where(User.email == "jina@example.com"))
    assert stored_user is not None
    assert stored_user.password_hash != "password123"
    assert verify_password("password123", stored_user.password_hash)

    me_response = client.get("/api/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["id"] == stored_user.id


def test_signup_normalizes_email_and_nickname(client: TestClient) -> None:
    response = signup(client, email="  JINA@Example.COM ", nickname="  jina_02  ")

    assert response.status_code == 201
    assert response.json()["email"] == "jina@example.com"
    assert response.json()["nickname"] == "jina_02"


def test_signup_rejects_duplicate_email(client: TestClient) -> None:
    assert signup(client).status_code == 201
    response = signup(client, nickname="another_user")

    assert response.status_code == 409
    assert response.json()["detail"] == "이미 가입된 이메일입니다."


def test_signup_rejects_duplicate_nickname(client: TestClient) -> None:
    assert signup(client).status_code == 201
    response = signup(client, email="other@example.com")

    assert response.status_code == 409
    assert response.json()["detail"] == "이미 사용 중인 닉네임입니다."


def test_signup_rejects_invalid_fields(client: TestClient) -> None:
    invalid_email = signup(client, email="not-an-email")
    short_password = signup(client, email="short@example.com", password="1234567")
    invalid_nickname = signup(client, email="nickname@example.com", nickname="안 돼")

    assert invalid_email.status_code == 422
    assert short_password.status_code == 422
    assert invalid_nickname.status_code == 422


def test_login_succeeds_and_sets_cookie(client: TestClient) -> None:
    assert signup(client).status_code == 201
    client.cookies.clear()

    response = client.post(
        "/api/auth/login",
        json={"email": "JINA@example.com", "password": "password123"},
    )

    assert response.status_code == 200
    assert response.json()["nickname"] == "jina_01"
    assert SESSION_COOKIE_NAME in response.cookies


def test_login_rejects_wrong_credentials(client: TestClient) -> None:
    assert signup(client).status_code == 201
    client.cookies.clear()

    response = client.post(
        "/api/auth/login",
        json={"email": "jina@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert SESSION_COOKIE_NAME not in response.cookies


def test_me_requires_authentication(client: TestClient) -> None:
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_user_can_update_own_nickname(client: TestClient) -> None:
    assert signup(client).status_code == 201

    response = client.patch("/api/users/me/nickname", json={"nickname": "새닉네임_1"})

    assert response.status_code == 200
    assert response.json()["nickname"] == "새닉네임_1"


def test_nickname_update_rejects_invalid_value(client: TestClient) -> None:
    assert signup(client).status_code == 201

    response = client.patch("/api/users/me/nickname", json={"nickname": "안 돼"})

    assert response.status_code == 422


def test_user_cannot_take_another_users_nickname(client: TestClient) -> None:
    assert signup(client).status_code == 201
    first_user_cookie = client.cookies.get(SESSION_COOKIE_NAME)

    client.cookies.clear()
    assert signup(client, email="other@example.com", nickname="other_user").status_code == 201
    client.cookies.clear()
    client.cookies.set(SESSION_COOKIE_NAME, first_user_cookie)

    response = client.patch("/api/users/me/nickname", json={"nickname": "other_user"})

    assert response.status_code == 409
