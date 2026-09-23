from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base, get_db
from app.core.security import create_password_reset_token
from app.main import app
from app.models import User

USER = {
    "email": "recupera@example.com",
    "password": "clave-segura-123",
    "first_name": "Ana",
    "last_name": "Lopez",
    "role": "buscador",
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


def register(client: TestClient) -> str:
    resp = client.post("/auth/register", json=USER)
    assert resp.status_code == 201, resp.text
    return resp.json()["access_token"]


def get_user_id(tmp_path) -> int:
    engine = create_engine(f"sqlite:///{tmp_path / 'test.db'}", connect_args={"check_same_thread": False})
    TestSession: sessionmaker = sessionmaker(bind=engine, autoflush=False)
    with TestSession() as session:
        user_id = session.query(User).filter(User.email == USER["email"]).one().id
    engine.dispose()
    return user_id


def test_forgot_password_does_not_leak_existence(client):
    register(client)
    existing = client.post("/auth/forgot-password", json={"email": USER["email"]})
    assert existing.status_code == 200
    missing = client.post("/auth/forgot-password", json={"email": "nadie@example.com"})
    assert missing.status_code == 200
    assert existing.json()["detail"] == missing.json()["detail"]


def test_reset_password_flow(client, tmp_path):
    old_token = register(client)
    user_id = get_user_id(tmp_path)
    reset_token = create_password_reset_token(user_id)

    resp = client.post(
        "/auth/reset-password",
        json={"token": reset_token, "new_password": "nueva-clave-456"},
    )
    assert resp.status_code == 200

    old_login = client.post("/auth/login", json={"email": USER["email"], "password": USER["password"]})
    assert old_login.status_code == 401

    new_login = client.post(
        "/auth/login",
        json={"email": USER["email"], "password": "nueva-clave-456"},
    )
    assert new_login.status_code == 200

    old_session = client.get("/auth/me", headers={"Authorization": f"Bearer {old_token}"})
    assert old_session.status_code == 401


def test_access_token_rejected_as_reset(client):
    register(client)
    token = client.post("/auth/login", json={"email": USER["email"], "password": USER["password"]}).json()[
        "access_token"
    ]
    resp = client.post(
        "/auth/reset-password",
        json={"token": token, "new_password": "clave-segura-123"},
    )
    assert resp.status_code == 400


def test_garbage_token_rejected(client):
    register(client)
    resp = client.post(
        "/auth/reset-password",
        json={"token": "basura.no.importa", "new_password": "nueva-clave-456"},
    )
    assert resp.status_code == 400


def test_reset_rejects_short_password(client):
    register(client)
    resp = client.post(
        "/auth/reset-password",
        json={"token": "cualquier-cosa", "new_password": "corta"},
    )
    assert resp.status_code == 422