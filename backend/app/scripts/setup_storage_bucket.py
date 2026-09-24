"""Crea el bucket público de Supabase Storage para las fotos de propiedades.

Uso (desde backend/, con .env configurado o variables de entorno seteadas):

    python -m app.scripts.setup_storage_bucket

Idempotente: si el bucket ya existe, avisa y termina sin error.
"""
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import get_settings
from app.services.supabase_storage import StorageApiError, SupabaseStorageClient


def main() -> int:
    settings = get_settings()
    if not settings.supabase_project_url or not settings.supabase_service_role_key:
        print(
            "Faltan SUPABASE_PROJECT_URL y/o SUPABASE_SERVICE_ROLE_KEY. "
            "Configuralos en backend/.env y volvé a intentar."
        )
        return 1

    client = SupabaseStorageClient(settings.supabase_project_url, settings.supabase_service_role_key)
    bucket = settings.supabase_storage_bucket
    try:
        client.create_bucket(
            bucket,
            public=True,
            file_size_limit=settings.max_upload_mb * 1024 * 1024,
            allowed_mime_types=["image/jpeg", "image/png", "image/webp"],
        )
    except StorageApiError as exc:
        if "already" in str(exc).lower() or exc.status == 400 and "Dup" in str(exc):
            print(f"El bucket '{bucket}' ya existe.")
            return 0
        print(f"Error al crear el bucket '{bucket}': {exc}")
        return 1

    print(
        f"Bucket '{bucket}' creado (público). Las fotos quedan en:\n"
        f"{client.public_url(bucket, '<property_id>/<archivo>')}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())