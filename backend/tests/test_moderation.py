from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base, get_db
from app.main import app
from app.models import User

OWNER = {
    "email": "dueno_mod@example.com",
    "password": "clave-segura-123",
    "first_name": "Juan",
    "last_name": "Perez",
    "role": "propietario",
    "declaration_titular": True,
    "phone": "3782456789",
}
SEEKER = {
    "email": "buscador_mod@example.com",
    "password": "clave-segura-123",
    "first_name": "Ana",
    "last_name": "Lopez",
    "role": "buscador",
    "declaration_titular": True,
}
STAFF = {
    "email": "staff_mod@example.com",
    "password": "clave-segura-123",
    "first_name": "Moda",
    "last_name": "Radora",
    "role": "buscador",
    "declaration_titular": True,
}

PROP = {
    "operation_type": "alquiler_permanente",
    "property_type": "departamento",
    "title": "Depto de prueba para moderación",
    "description": "Departamento luminoso para reportar en el panel.",
    "price": 180000.00,
    "currency": "ARS",
    "bedrooms": 2,
    "bathrooms": 1,
    "neighborhood": "Centro",
    "address": "San Martin 1450",
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


def register(client: TestClient, payload: dict) -> str:
    resp = client.post("/auth/register", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()["access_token"]


def create_property(client: TestClient, token: str) -> int:
    resp = client.post("/properties", json=PROP, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


def promote_staff(tmp_path, email: str) -> None:
    engine = create_engine(
        f"sqlite:///{tmp_path / 'test.db'}",
        connect_args={"check_same_thread": False},
    )
    TestSession: sessionmaker = sessionmaker(bind=engine, autoflush=False)
    with TestSession() as session:
        user = session.query(User).filter(User.email == email).one()
        user.is_staff = True
        session.commit()
    engine.dispose()


def create_report(client: TestClient, token: str, prop_id: int) -> int:
    resp = client.post(
        "/reports",
        json={"property_id": prop_id, "reason": "intermediario_real", "details": "Pide comisión."},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


def seed_report(client: TestClient, tmp_path):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)
    report_id = create_report(client, seeker_token, prop_id)
    staff_token = register(client, STAFF)
    promote_staff(tmp_path, STAFF["email"])
    return owner_token, seeker_token, staff_token, prop_id, report_id


def test_moderation_requires_staff(client, tmp_path):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)
    create_report(client, seeker_token, prop_id)

    resp = client.get("/moderation/reports", headers={"Authorization": f"Bearer {seeker_token}"})
    assert resp.status_code == 403
    resp_anon = client.get("/moderation/reports")
    assert resp_anon.status_code == 401


def test_staff_lists_report_queue(client, tmp_path):
    owner_token, seeker_token, staff_token, prop_id, report_id = seed_report(client, tmp_path)
    prop_id2 = create_property(client, owner_token)
    create_report(client, seeker_token, prop_id2)

    resp = client.get("/moderation/reports?status=pendiente", headers={"Authorization": f"Bearer {staff_token}"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 2
    first = body["items"][0]
    assert first["property_title"] == PROP["title"]
    assert first["property_owner_name"] == "Juan Perez"
    assert first["reporter_email"] == SEEKER["email"]
    assert first["status"] == "pendiente"


def test_staff_changes_report_status(client, tmp_path):
    *_, staff_token, prop_id, report_id = seed_report(client, tmp_path)

    resp = client.patch(
        f"/moderation/reports/{report_id}/status",
        json={"status": "revisado"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "revisado"

    pending = client.get("/moderation/reports?status=pendiente", headers={"Authorization": f"Bearer {staff_token}"})
    assert pending.json()["total"] == 0
    reviewed = client.get("/moderation/reports?status=revisado", headers={"Authorization": f"Bearer {staff_token}"})
    assert reviewed.json()["total"] == 1


def test_staff_rejects_report(client, tmp_path):
    *_, staff_token, prop_id, report_id = seed_report(client, tmp_path)

    resp = client.patch(
        f"/moderation/reports/{report_id}/status",
        json={"status": "rechazado"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "rechazado"


def test_staff_can_set_property_status(client, tmp_path):
    *_, staff_token, prop_id, _ = seed_report(client, tmp_path)

    resp = client.patch(
        f"/properties/{prop_id}/status",
        json={"status": "finalizada"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "finalizada"


def test_non_staff_cannot_change_property_status(client, tmp_path):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)

    resp = client.patch(
        f"/properties/{prop_id}/status",
        json={"status": "finalizada"},
        headers={"Authorization": f"Bearer {seeker_token}"},
    )
    assert resp.status_code == 403


def test_mine_lists_only_own_properties(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)

    mine = client.get("/properties/mine", headers={"Authorization": f"Bearer {owner_token}"})
    assert mine.status_code == 200
    body = mine.json()
    assert len(body) == 1
    assert body[0]["id"] == prop_id

    empty = client.get("/properties/mine", headers={"Authorization": f"Bearer {seeker_token}"})
    assert empty.status_code == 200
    assert empty.json() == []