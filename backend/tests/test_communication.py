from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base, get_db
from app.main import app

OWNER = {
    "email": "dueno_com@example.com",
    "password": "clave-segura-123",
    "first_name": "Juan",
    "last_name": "Perez",
    "role": "propietario",
    "declaration_titular": True,
    "phone": "3782456789",
}
SEEKER = {
    "email": "buscador_com@example.com",
    "password": "clave-segura-123",
    "first_name": "Ana",
    "last_name": "Lopez",
    "role": "buscador",
    "declaration_titular": True,
}

PROP = {
    "operation_type": "alquiler_permanente",
    "property_type": "departamento",
    "title": "Depto cerca de la plaza",
    "description": "Departamento luminoso y céntrico en alquiler permanente.",
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


def test_seeker_can_inquire(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)

    resp = client.post(
        "/inquiries",
        json={"property_id": prop_id, "message": "Hola, ¿sigue disponible el departamento?"},
        headers={"Authorization": f"Bearer {seeker_token}"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["property_title"] == PROP["title"]
    assert body["is_read"] is False
    assert body["sender"]["first_name"] == "Ana"


def test_inquiry_requires_auth(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    resp = client.post(
        "/inquiries",
        json={"property_id": prop_id, "message": "Hola"},
    )
    assert resp.status_code == 401


def test_inquiry_on_missing_property_404(client):
    seeker_token = register(client, SEEKER)
    resp = client.post(
        "/inquiries",
        json={"property_id": 9999, "message": "Hola"},
        headers={"Authorization": f"Bearer {seeker_token}"},
    )
    assert resp.status_code == 404


def test_owner_cannot_inquire_own_property(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    resp = client.post(
        "/inquiries",
        json={"property_id": prop_id, "message": "Autoconsulta"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert resp.status_code == 400


def test_owner_inbox_shows_sender_contact(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)
    client.post(
        "/inquiries",
        json={"property_id": prop_id, "message": "¿Se puede visitar el sábado?"},
        headers={"Authorization": f"Bearer {seeker_token}"},
    )

    resp = client.get(
        "/inquiries/inbox",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 1
    inquiry = body["items"][0]
    assert inquiry["sender_email"] == SEEKER["email"]
    assert inquiry["sender_phone"] is None
    assert inquiry["is_read"] is False


def test_seeker_inbox_is_invisible_to_others(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)
    other = register(client, dict(SEEKER, email="otro@example.com"))
    client.post(
        "/inquiries",
        json={"property_id": prop_id, "message": "Consulta privada"},
        headers={"Authorization": f"Bearer {seeker_token}"},
    )

    resp = client.get("/inquiries/inbox", headers={"Authorization": f"Bearer {other}"})
    assert resp.status_code == 200
    assert resp.json()["total"] == 0
    assert resp.json()["items"] == []


def test_sent_list(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)
    client.post(
        "/inquiries",
        json={"property_id": prop_id, "message": "Primera consulta"},
        headers={"Authorization": f"Bearer {seeker_token}"},
    )

    resp = client.get("/inquiries/sent", headers={"Authorization": f"Bearer {seeker_token}"})
    assert resp.status_code == 200
    assert resp.json()["total"] == 1
    assert resp.json()["items"][0]["message"] == "Primera consulta"


def test_unread_count(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)
    client.post(
        "/inquiries",
        json={"property_id": prop_id, "message": "Consulta 1"},
        headers={"Authorization": f"Bearer {seeker_token}"},
    )
    client.post(
        "/inquiries",
        json={"property_id": prop_id, "message": "Consulta 2"},
        headers={"Authorization": f"Bearer {seeker_token}"},
    )

    resp = client.get("/inquiries/unread-count", headers={"Authorization": f"Bearer {owner_token}"})
    assert resp.json()["count"] == 2


def test_mark_read_only_for_owner(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)
    client.post(
        "/inquiries",
        json={"property_id": prop_id, "message": "Consulta"},
        headers={"Authorization": f"Bearer {seeker_token}"},
    )

    id_lookup = client.get("/inquiries/inbox", headers={"Authorization": f"Bearer {owner_token}"}).json()
    inquiry_id = id_lookup["items"][0]["id"]

    forbidden = client.patch(
        f"/inquiries/{inquiry_id}/read",
        headers={"Authorization": f"Bearer {seeker_token}"},
    )
    assert forbidden.status_code == 403

    ok = client.patch(
        f"/inquiries/{inquiry_id}/read",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert ok.status_code == 200
    assert ok.json()["is_read"] is True

    unread = client.get("/inquiries/unread-count", headers={"Authorization": f"Bearer {owner_token}"})
    assert unread.json()["count"] == 0


def test_report_publication(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)

    resp = client.post(
        "/reports",
        json={"property_id": prop_id, "reason": "intermediario_real", "details": "Pide comisión de agencia."},
        headers={"Authorization": f"Bearer {seeker_token}"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["reason"] == "intermediario_real"
    assert body["status"] == "pendiente"


def test_cannot_report_own_property(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    resp = client.post(
        "/reports",
        json={"property_id": prop_id, "reason": "spam"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert resp.status_code == 403


def test_duplicate_report_conflict(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)
    headers = {"Authorization": f"Bearer {seeker_token}"}

    first = client.post("/reports", json={"property_id": prop_id, "reason": "duplicada"}, headers=headers)
    assert first.status_code == 201
    second = client.post("/reports", json={"property_id": prop_id, "reason": "spam"}, headers=headers)
    assert second.status_code == 409


def test_inquiry_blocked_on_finalizada(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)
    client.patch(
        f"/properties/{prop_id}/status",
        json={"status": "finalizada"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )

    resp = client.post(
        "/inquiries",
        json={"property_id": prop_id, "message": "¿Todavía disponible?"},
        headers={"Authorization": f"Bearer {seeker_token}"},
    )
    assert resp.status_code == 400


def test_sent_list_includes_recipient_email(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)
    client.post(
        "/inquiries",
        json={"property_id": prop_id, "message": "Consulta recibida por el dueño"},
        headers={"Authorization": f"Bearer {seeker_token}"},
    )

    resp = client.get("/inquiries/sent", headers={"Authorization": f"Bearer {seeker_token}"})
    assert resp.status_code == 200
    item = resp.json()["items"][0]
    assert item["recipient_email"] == OWNER["email"]
    assert item["recipient_phone"] == OWNER["phone"]


def test_whitespace_only_message_rejected(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)
    resp = client.post(
        "/inquiries",
        json={"property_id": prop_id, "message": "   "},
        headers={"Authorization": f"Bearer {seeker_token}"},
    )
    assert resp.status_code == 422


def _make_inquiry(client, owner_token, prop_id, seeker_token):
    created = client.post(
        "/inquiries",
        json={"property_id": prop_id, "message": "¿Está disponible?"},
        headers={"Authorization": f"Bearer {seeker_token}"},
    )
    assert created.status_code == 201
    return created.json()["id"]


def test_owner_reply_appears_in_thread_and_sent(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)
    inquiry_id = _make_inquiry(client, owner_token, prop_id, seeker_token)

    resp = client.post(
        f"/inquiries/{inquiry_id}/replies",
        json={"message": "Sí, sigue disponible. ¿Cuándo querés visitarlo?"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert len(body["replies"]) == 1
    assert body["replies"][0]["sender"]["first_name"] == OWNER["first_name"]
    assert body["replies"][0]["message"].startswith("Sí, sigue disponible")

    thread = client.get(f"/inquiries/{inquiry_id}", headers={"Authorization": f"Bearer {seeker_token}"})
    assert thread.status_code == 200
    assert len(thread.json()["replies"]) == 1


def test_reply_visible_in_inbox_payload(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)
    inquiry_id = _make_inquiry(client, owner_token, prop_id, seeker_token)
    client.post(
        f"/inquiries/{inquiry_id}/replies",
        json={"message": "Respuesta del dueño"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )

    inbox = client.get("/inquiries/inbox", headers={"Authorization": f"Bearer {owner_token}"})
    assert inbox.status_code == 200
    item = inbox.json()["items"][0]
    assert len(item["replies"]) == 1


def test_reply_requires_auth(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)
    inquiry_id = _make_inquiry(client, owner_token, prop_id, seeker_token)

    resp = client.post(f"/inquiries/{inquiry_id}/replies", json={"message": "Hola"})
    assert resp.status_code == 401


def test_reply_third_party_forbidden(client):
    owner_token = register(client, OWNER)
    prop_id = create_property(client, owner_token)
    seeker_token = register(client, SEEKER)
    other_token = register(client, dict(SEEKER, email="otro3@example.com"))
    inquiry_id = _make_inquiry(client, owner_token, prop_id, seeker_token)

    resp = client.post(
        f"/inquiries/{inquiry_id}/replies",
        json={"message": "intruso"},
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert resp.status_code == 403

    thread = client.get(f"/inquiries/{inquiry_id}", headers={"Authorization": f"Bearer {other_token}"})
    assert thread.status_code == 403


def test_reply_on_missing_inquiry_404(client):
    seeker_token = register(client, SEEKER)
    resp = client.post(
        "/inquiries/9999/replies",
        json={"message": "Hola"},
        headers={"Authorization": f"Bearer {seeker_token}"},
    )
    assert resp.status_code == 404
    assert client.get("/inquiries/9999", headers={"Authorization": f"Bearer {seeker_token}"}).status_code == 404