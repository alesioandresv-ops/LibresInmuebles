from app.core.config import Settings


def test_postgres_url_traduccion_psycopg():
    settings = Settings(
        _env_file=None,
        app_env="dev",
        database_url="postgresql://usuario:clave@host:5432/libreinmuebles",
        secret_key="clave-suficientemente-larga-para-pasar-prod",
    )
    assert settings.database_url_resolved == (
        "postgresql+psycopg://usuario:clave@host:5432/libreinmuebles"
    )


def test_sqlite_relativo_se_resuelve_absoluto():
    settings = Settings(_env_file=None, app_env="dev", database_url="sqlite:///./libreinmuebles.db")
    resolved = settings.database_url_resolved
    assert resolved.startswith("sqlite:///")
    assert resolved.endswith("backend/libreinmuebles.db")


def test_prod_rechaza_secret_debil():
    import pytest

    with pytest.raises(ValueError):
        Settings(_env_file=None, app_env="prod", secret_key="change-me")


def test_listas_se_parsean():
    settings = Settings(
        _env_file=None,
        app_env="dev",
        cors_origins="https://a.com, https://b.com",
        staff_emails="uno@example.com, DOS@example.com",
    )
    assert settings.cors_origins_list == ["https://a.com", "https://b.com"]
    assert settings.staff_emails_list == ["uno@example.com", "dos@example.com"]