from io import BytesIO

import pytest
from fastapi import UploadFile
from PIL import Image
from starlette.datastructures import Headers

from app.core.exceptions import BadRequestError
from app.services.storage_service import StorageService
from app.services.supabase_storage import SupabaseStorageClient


class _FakeSettings:
    upload_dir_resolved = None
    max_upload_mb = 8
    max_image_pixels_side = 8000
    supabase_project_url = ""
    supabase_service_role_key = ""
    supabase_storage_bucket = "properties"


class FakeSupabase(SupabaseStorageClient):
    def __init__(self):
        super().__init__("https://fake.supabase.co", "service-key")
        self.uploads = []
        self.deleted = []

    def upload(self, bucket, path, data, content_type):
        self.uploads.append((bucket, path, len(data), content_type))
        return self.public_url(bucket, path)

    def delete(self, bucket, path):
        self.deleted.append((bucket, path))


def _upload_file(content: bytes, content_type: str = "image/jpeg") -> UploadFile:
    return UploadFile(
        filename="foto.jpg",
        file=BytesIO(content),
        headers=Headers({"content-type": content_type}),
    )


def _jpeg_bytes(width: int = 80, height: int = 60) -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (width, height), (200, 40, 40)).save(buffer, format="JPEG")
    return buffer.getvalue()


def _enable_supabase(monkeypatch, tmp_path):
    settings = _FakeSettings()
    settings.upload_dir_resolved = tmp_path
    settings.supabase_project_url = "https://fake.supabase.co"
    settings.supabase_service_role_key = "service-key"
    monkeypatch.setattr("app.services.storage_service.get_settings", lambda: settings)
    return settings


def _enable_local(monkeypatch, tmp_path):
    settings = _FakeSettings()
    settings.upload_dir_resolved = tmp_path
    monkeypatch.setattr("app.services.storage_service.get_settings", lambda: settings)
    return settings


def test_save_local_mode_escribe_archivo(monkeypatch, tmp_path):
    _enable_local(monkeypatch, tmp_path)
    service = StorageService(base_dir=tmp_path)

    url = service.save(_upload_file(_jpeg_bytes()), property_id=7)

    assert url.startswith("/uploads/7/")
    assert tmp_path.joinpath(url.removeprefix("/uploads/")).exists()


def test_save_supabase_devuelve_url_publica_y_no_escribe_local(monkeypatch, tmp_path):
    _enable_supabase(monkeypatch, tmp_path)
    fake = FakeSupabase()
    service = StorageService(base_dir=tmp_path, supabase=fake)

    url = service.save(_upload_file(_jpeg_bytes()), property_id=7)

    assert url.startswith("https://fake.supabase.co/storage/v1/object/public/properties/7/")
    assert fake.uploads and fake.uploads[0][0] == "properties"
    assert fake.uploads[0][1].startswith("7/")
    assert fake.uploads[0][3] == "image/jpeg"
    assert not tmp_path.joinpath("7").exists()


def test_delete_supabase_elimina_objeto(monkeypatch, tmp_path):
    _enable_supabase(monkeypatch, tmp_path)
    fake = FakeSupabase()
    service = StorageService(base_dir=tmp_path, supabase=fake)

    url = service.save(_upload_file(_jpeg_bytes()), property_id=7)
    service.delete(url)

    assert fake.deleted == [("properties", "7/" + fake.uploads[0][1].split("/", 1)[1])]


def test_delete_url_de_otro_bucket_ignora(monkeypatch, tmp_path):
    _enable_supabase(monkeypatch, tmp_path)
    fake = FakeSupabase()
    service = StorageService(base_dir=tmp_path, supabase=fake)

    service.delete("https://fake.supabase.co/storage/v1/object/public/otro/7/x.jpg")

    assert fake.deleted == []


def test_delete_local_elimina_archivo(monkeypatch, tmp_path):
    _enable_local(monkeypatch, tmp_path)
    service = StorageService(base_dir=tmp_path)
    url = service.save(_upload_file(_jpeg_bytes()), property_id=7)
    assert tmp_path.joinpath("7").exists()

    service.delete(url)

    assert list(tmp_path.joinpath("7").iterdir()) == []


def test_archivo_invalido_rechazado(monkeypatch, tmp_path):
    _enable_supabase(monkeypatch, tmp_path)
    fake = FakeSupabase()
    service = StorageService(base_dir=tmp_path, supabase=fake)

    with pytest.raises(BadRequestError):
        service.save(_upload_file(b"esto no es una imagen"), property_id=7)
    assert fake.uploads == []


def test_mime_no_permitido_rechazado(monkeypatch, tmp_path):
    _enable_local(monkeypatch, tmp_path)
    service = StorageService(base_dir=tmp_path)

    with pytest.raises(BadRequestError):
        service.save(_upload_file(_jpeg_bytes(), content_type="image/gif"), property_id=7)