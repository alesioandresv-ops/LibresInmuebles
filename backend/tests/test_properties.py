from collections.abc import Generator
import io
from decimal import Decimal
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.core.database import Base, get_db
from app.main import app
from app.models import OperationType, Property, PropertyCurrency, PropertyStatus, PropertyType, User, UserRole
from app.repositories.property_repository import PropertyRepository, PropertySearchParams

OWNER = {
    "email": "dueno_prop@example.com",
    "password": "clave-segura-123",
    "first_name": "Juan",
    "last_name": "Perez",
    "role": "propietario",
    "declaration_titular": True,
}
SEEKER = {
    "email": "buscador@example.com",
    "password": "clave-segura-123",
    "first_name": "Ana",
    "last_name": "Lopez",
    "role": "buscador",
    "declaration_titular": True,
}

PROP = {
    "operation_type": "venta",
    "property_type": "casa",
    "title": "Casa en el centro",
    "description": "Casa amplia a metros de la plaza, lista para habitar.",
    "price": 125000.00,
    "currency": "USD",
    "bedrooms": 3,
    "bathrooms": 2,
    "surface_m2": 120.5,
    "neighborhood": "Centro",
    "address": "Av. Mitre 120",
    "has_water": True,
    "has_electricity": True,
    "has_internet": True,
}


@pytest.fixture()
def client(tmp_path) -> Generator[tuple[TestClient, Path], None, None]:
    settings = get_settings()
    old_upload = settings.upload_dir
    upload_dir = tmp_path / "uploads"
    settings.upload_dir = str(upload_dir)

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
        yield test_client, upload_dir
    app.dependency_overrides.clear()
    engine.dispose()
    settings.upload_dir = old_upload


def register(client: TestClient, payload: dict) -> str:
    resp = client.post("/auth/register", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()["access_token"]


@pytest.fixture()
def owner_token(client):
    return register(client[0], OWNER)


@pytest.fixture()
def seeker_token(client):
    return register(client[0], SEEKER)


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def create_prop(client: TestClient, token: str, **overrides) -> dict:
    payload = dict(PROP, **overrides)
    resp = client.post("/properties", json=payload, headers=auth(token))
    assert resp.status_code == 201, resp.text
    return resp.json()


def real_png() -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (8, 8), (220, 30, 30)).save(buf, format="PNG")
    return buf.getvalue()


def test_list_requires_no_auth_and_returns_empty(client):
    resp = client[0].get("/properties")
    assert resp.status_code == 200
    assert resp.json() == {"items": [], "total": 0, "page": 1, "limit": 20, "total_pages": 0}


def test_create_requires_auth(client):
    resp = client[0].post("/properties", json=PROP)
    assert resp.status_code == 401


def test_create_requires_owner_role(client, seeker_token):
    resp = client[0].post("/properties", json=PROP, headers=auth(seeker_token))
    assert resp.status_code == 403


def test_create_and_list(client, owner_token):
    prop = create_prop(client[0], owner_token)
    assert prop["title"] == "Casa en el centro"
    assert prop["currency"] == "USD"
    assert prop["contact"]["email"] == OWNER["email"]

    resp = client[0].get("/properties")
    body = resp.json()
    assert body["total"] == 1
    card = body["items"][0]
    assert card["id"] == prop["id"]
    assert card["primary_image_url"] is None
    assert "contact" not in card


def test_detail_hides_contact_anonymous(client, owner_token):
    prop = create_prop(client[0], owner_token)
    resp = client[0].get(f"/properties/{prop['id']}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["contact"] is None
    assert body["owner"]["first_name"] == "Juan"


def test_detail_shows_contact_to_authed_non_owner(client, owner_token, seeker_token):
    prop = create_prop(client[0], owner_token)
    resp = client[0].get(f"/properties/{prop['id']}", headers=auth(seeker_token))
    body = resp.json()
    assert body["contact"]["email"] == OWNER["email"]
    assert body["contact"]["allow_whatsapp"] is False


def test_detail_404(client):
    resp = client[0].get("/properties/999")
    assert resp.status_code == 404


def test_update_only_owner(client, owner_token, seeker_token):
    prop = create_prop(client[0], owner_token)

    resp = client[0].put(
        f"/properties/{prop['id']}",
        json={"title": "Nuevo titulo"},
        headers=auth(seeker_token),
    )
    assert resp.status_code == 403

    resp = client[0].put(
        f"/properties/{prop['id']}",
        json={"title": "Renovada"},
        headers=auth(owner_token),
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "Renovada"


def test_change_status_and_feed_excludes_finalizada(client, owner_token):
    prop = create_prop(client[0], owner_token)
    resp = client[0].patch(
        f"/properties/{prop['id']}/status",
        json={"status": "en_negociacion"},
        headers=auth(owner_token),
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "en_negociacion"

    resp = client[0].get("/properties")
    assert resp.json()["total"] == 1

    client[0].patch(
        f"/properties/{prop['id']}/status",
        json={"status": "finalizada"},
        headers=auth(owner_token),
    )
    resp = client[0].get("/properties")
    assert resp.json()["total"] == 0
    assert resp.json()["total_pages"] == 0


def test_filters_combined_and_pagination(client, owner_token):
    create_prop(client[0], owner_token, title="Casa centro", neighborhood="Centro", operation_type="venta",
                price=100000, has_gas=True)
    create_prop(client[0], owner_token, title="Dpto rio", neighborhood="Río Uruguay", operation_type="alquiler_permanente",
                price=250, currency="ARS", has_water=True, property_type="departamento")
    create_prop(client[0], owner_token, title="Terreno isondu", neighborhood="Isondu", operation_type="venta",
                price=50000, has_water=False)

    resp = client[0].get("/properties", params={"operation_type": "venta"})
    assert resp.json()["total"] == 2

    resp = client[0].get("/properties", params={"neighborhood": "Centro"})
    body = resp.json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "Casa centro"

    resp = client[0].get("/properties", params={"price_min": "100000", "price_max": "130000"})
    assert resp.json()["total"] == 1

    resp = client[0].get("/properties", params={"currency": "ARS"})
    assert resp.json()["total"] == 1

    resp = client[0].get("/properties", params={"has_water": "true"})
    assert resp.json()["total"] == 2

    resp = client[0].get("/properties", params={"has_gas": "true"})
    assert resp.json()["total"] == 1

    resp = client[0].get("/properties", params={"sort": "price_asc", "limit": "2", "page": "1"})
    body = resp.json()
    assert body["total"] == 3
    assert body["total_pages"] == 2
    assert [i["price"] for i in body["items"]] == ["250.00", "50000.00"]


def test_invalid_price_range(client, owner_token):
    create_prop(client[0], owner_token)
    resp = client[0].get("/properties", params={"price_min": "200000", "price_max": "100000"})
    assert resp.status_code == 400


def test_upload_image_lifecycle(client, owner_token):
    test_client, upload_dir = client
    prop = create_prop(test_client, owner_token)

    txt = test_client.post(
        f"/properties/{prop['id']}/images",
        files={"file": ("foto.txt", b"not-an-image", "text/plain")},
        headers=auth(owner_token),
    )
    assert txt.status_code == 400

    png = real_png()
    ok = test_client.post(
        f"/properties/{prop['id']}/images",
        files={"file": ("foto.png", png, "image/png")},
        headers=auth(owner_token),
    )
    assert ok.status_code == 201, ok.text
    image = ok.json()
    assert image["is_primary"] is True
    stored = Path(upload_dir) / image["url"].removeprefix("/uploads/")
    assert stored.exists()

    ok2 = test_client.post(
        f"/properties/{prop['id']}/images",
        files={"file": ("foto2.png", png, "image/png")},
        headers=auth(owner_token),
    )
    assert ok2.status_code == 201
    assert ok2.json()["is_primary"] is False

    primary = test_client.put(
        f"/properties/{prop['id']}/images/{ok2.json()['id']}/primary",
        headers=auth(owner_token),
    )
    assert primary.status_code == 200
    assert primary.json()["is_primary"] is True

    detail = test_client.get(f"/properties/{prop['id']}").json()
    assert len(detail["images"]) == 2
    primary_url = next(i["url"] for i in detail["images"] if i["is_primary"])
    assert primary_url == ok2.json()["url"]

    second_path = Path(upload_dir) / ok2.json()["url"].removeprefix("/uploads/")
    resp = test_client.delete(
        f"/properties/{prop['id']}/images/{ok2.json()['id']}",
        headers=auth(owner_token),
    )
    assert resp.status_code == 204
    assert not second_path.exists()

    detail = test_client.get(f"/properties/{prop['id']}").json()
    assert len(detail["images"]) == 1
    assert detail["images"][0]["is_primary"] is True


def test_image_upload_forbidden_for_non_owner(client, owner_token, seeker_token):
    test_client, upload_dir = client
    prop = create_prop(test_client, owner_token)
    resp = test_client.post(
        f"/properties/{prop['id']}/images",
        files={"file": ("foto.png", b"x", "image/png")},
        headers=auth(seeker_token),
    )
    assert resp.status_code == 403


def test_delete_property_removes_image_files(client, owner_token):
    test_client, upload_dir = client
    prop = create_prop(test_client, owner_token)
    png = real_png()
    up = test_client.post(
        f"/properties/{prop['id']}/images",
        files={"file": ("foto.png", png, "image/png")},
        headers=auth(owner_token),
    ).json()

    prop_dir = Path(upload_dir) / str(prop["id"])
    assert prop_dir.exists()

    resp = test_client.delete(f"/properties/{prop['id']}", headers=auth(owner_token))
    assert resp.status_code == 204
    assert not (Path(upload_dir) / up["url"].removeprefix("/uploads/")).exists()
    assert not prop_dir.exists()


def test_delete_property_forbidden(client, owner_token, seeker_token):
    prop = create_prop(client[0], owner_token)
    resp = client[0].delete(f"/properties/{prop['id']}", headers=auth(seeker_token))
    assert resp.status_code == 403


def test_update_rejects_explicit_null(client, owner_token):
    prop = create_prop(client[0], owner_token)
    resp = client[0].put(
        f"/properties/{prop['id']}",
        json={"title": None},
        headers=auth(owner_token),
    )
    assert resp.status_code == 422


def test_update_rejects_whitespace_title(client, owner_token):
    prop = create_prop(client[0], owner_token)
    resp = client[0].put(
        f"/properties/{prop['id']}",
        json={"title": "    "},
        headers=auth(owner_token),
    )
    assert resp.status_code == 422


def test_upload_rejects_spoofed_content(client, owner_token):
    prop = create_prop(client[0], owner_token)
    resp = client[0].post(
        f"/properties/{prop['id']}/images",
        files={"file": ("foto.png", b"esto-no-es-una-imagen", "image/png")},
        headers=auth(owner_token),
    )
    assert resp.status_code == 400


def test_upload_rejects_corrupt_png_with_header_checksum(client, owner_token):
    """Pillow lanza SyntaxError ante un PNG con checksum inválido: debe ser 400, no 500."""
    import base64

    corrupt = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z0m8AAAAASUVORK5CYII="
    )
    prop = create_prop(client[0], owner_token)
    resp = client[0].post(
        f"/properties/{prop['id']}/images",
        files={"file": ("foto.png", corrupt, "image/png")},
        headers=auth(owner_token),
    )
    assert resp.status_code == 400


def test_uploads_served_over_http(monkeypatch, tmp_path):
    import os

    import app.core.config as cfg
    from app.main import create_app

    up = tmp_path / "static_uploads"
    up.mkdir()
    (up / "hola.png").write_bytes(real_png())
    old = os.environ.get("UPLOAD_DIR")
    os.environ["UPLOAD_DIR"] = str(up)
    cfg.get_settings.cache_clear()
    try:
        app2 = create_app()
        with TestClient(app2) as c2:
            resp = c2.get("/uploads/hola.png")
        assert resp.status_code == 200
    finally:
        cfg.get_settings.cache_clear()
        if old is None:
            os.environ.pop("UPLOAD_DIR", None)
        else:
            os.environ["UPLOAD_DIR"] = old


def test_bathrooms_and_bedrooms_zero_include_null(db_session):
    owner = User(
        email="filtro0@example.com", password_hash="h", first_name="A", last_name="B",
        role=UserRole.OWNER, declaration_titular=True,
    )
    prop = Property(
        owner=owner,
        operation_type=OperationType.SALE,
        property_type=PropertyType.HOUSE,
        status=PropertyStatus.AVAILABLE,
        title="Terreno",
        description="Terreno en venta en zona tranquila.",
        price=Decimal("50000.00"),
        currency=PropertyCurrency.ARS,
        neighborhood="Centro",
        address="Calle 1",
        bedrooms=None,
        bathrooms=None,
    )
    db_session.add(prop)
    db_session.commit()

    repo = PropertyRepository(db_session)
    by_bedrooms, _ = repo.search(PropertySearchParams(bedrooms=0))
    by_bathrooms, _ = repo.search(PropertySearchParams(bathrooms=0))
    assert [p.id for p in by_bedrooms] == [prop.id]
    assert [p.id for p in by_bathrooms] == [prop.id]