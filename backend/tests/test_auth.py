from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base, get_db
from app.main import app

VALID_OWNER = {
    "email": "dueno@example.com",
    "password": "clave-segura-123",
    "first_name": "Juan",
    "last_name": "Perez",
    "role": "propietario",
    "declaration_titular": True,
}


@pytest.fixture()
def client(tmp_path) -> Generator[TestClient, None, None]:
    engine = create_engine(
        f"sqlite:///{tmp_path / 'test.db'}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    TestSession: sessionmaker = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    def override_get_db() -> Generator[Session, None, None]:
        db = TestSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    engine.dispose()


def register(client: TestClient, payload: dict):
    return client.post("/auth/register", json=payload)


def test_register_propietario_returns_token(client):
    resp = register(client, VALID_OWNER)
    assert resp.status_code == 201
    body = resp.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["email"] == "dueno@example.com"
    assert body["user"]["role"] == "propietario"
    assert body["user"]["declaration_titular"] is True


def test_register_requires_declaration_titular(client):
    payload = dict(VALID_OWNER, declaration_titular=False)
    resp = register(client, payload)
    assert resp.status_code == 400
    assert "titular" in resp.json()["detail"]


def test_register_duplicate_email_conflict(client):
    register(client, VALID_OWNER)
    resp = register(client, VALID_OWNER)
    assert resp.status_code == 409


def test_register_password_too_short(client):
    payload = dict(VALID_OWNER, password="corta")
    resp = register(client, payload)
    assert resp.status_code == 422


def test_password_is_stored_hashed(client):
    register(client, VALID_OWNER)
    db = next(app.dependency_overrides[get_db]())
    try:
        from app.models import User
        from app.repositories.user_repository import UserRepository

        user = UserRepository(db).get_by_email(VALID_OWNER["email"])
        assert user.password_hash != VALID_OWNER["password"]
        assert user.password_hash.startswith("$2b$")
    finally:
        db.close()


def test_login_ok(client):
    register(client, VALID_OWNER)
    resp = client.post(
        "/auth/login",
        json={"email": VALID_OWNER["email"], "password": VALID_OWNER["password"]},
    )
    assert resp.status_code == 200
    assert resp.json()["access_token"]


def test_login_invalid_credentials(client):
    resp = client.post(
        "/auth/login",
        json={"email": "nadie@example.com", "password": "incorrecta"},
    )
    assert resp.status_code == 401


def test_me_requires_token(client):
    resp = client.get("/auth/me")
    assert resp.status_code == 401


def test_me_with_valid_token(client):
    token = register(client, VALID_OWNER).json()["access_token"]
    resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "dueno@example.com"


def test_me_with_invalid_token(client):
    resp = client.get("/auth/me", headers={"Authorization": "Bearer token-invalido"})
    assert resp.status_code == 401


def test_seeker_may_register_without_declaration(client):
    payload = dict(VALID_OWNER, email="buscador@example.com", role="buscador")
    payload.pop("declaration_titular")
    resp = register(client, payload)
    assert resp.status_code == 201
    assert resp.json()["user"]["declaration_titular"] is False


def test_email_is_case_insensitive(client):
    mixed = dict(VALID_OWNER, email="Dueno@Example.COM")
    resp = register(client, mixed)
    assert resp.status_code == 201
    assert resp.json()["user"]["email"] == "dueno@example.com"

    login_ok = client.post(
        "/auth/login",
        json={"email": "DUENO@example.com", "password": VALID_OWNER["password"]},
    )
    assert login_ok.status_code == 200

    duplicate = client.post("/auth/register", json=dict(mixed, email="dueno@example.com"))
    assert duplicate.status_code == 409


def test_password_over_72_bytes_rejected(client):
    payload = dict(VALID_OWNER, password="a" * 90)
    resp = register(client, payload)
    assert resp.status_code == 422


def test_whitespace_only_name_rejected(client):
    payload = dict(VALID_OWNER, first_name="   ")
    resp = register(client, payload)
    assert resp.status_code == 422