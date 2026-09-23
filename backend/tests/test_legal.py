from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base, get_db
from app.main import app


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


def test_list_templates(client):
    resp = client.get("/legal/templates")
    assert resp.status_code == 200
    body = resp.json()
    slugs = [t["slug"] for t in body["templates"]]
    assert "alquiler-vivienda" in slugs
    assert "alquiler-temporal" in slugs
    assert "compraventa" in slugs
    first = body["templates"][0]
    assert first["title"]
    assert first["description"]


def test_templates_are_public(client):
    resp = client.get("/legal/templates")
    assert resp.status_code == 200


def test_download_vivienda(client):
    resp = client.get("/legal/templates/alquiler-vivienda/download")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("application/msword")
    assert 'filename="libreinmuebles-alquiler-vivienda.doc"' in resp.headers["content-disposition"]
    assert "Ley 27.551" in resp.text
    assert "LOCADOR" in resp.text
    assert "MODELO ORIENTATIVO" in resp.text


def test_download_temporal(client):
    resp = client.get("/legal/templates/alquiler-temporal/download")
    assert resp.status_code == 200
    assert "turístico" in resp.text


def test_download_compraventa(client):
    resp = client.get("/legal/templates/compraventa/download")
    assert resp.status_code == 200
    assert "BOLETO" in resp.text


def test_download_unknown_template_404(client):
    resp = client.get("/legal/templates/no-existe/download")
    assert resp.status_code == 404