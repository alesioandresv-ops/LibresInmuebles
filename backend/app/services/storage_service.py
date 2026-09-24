import logging
import uuid
from io import BytesIO
from pathlib import Path

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError

from app.core.config import get_settings
from app.core.exceptions import BadRequestError
from app.services.supabase_storage import SupabaseStorageClient

logger = logging.getLogger("libreinmuebles")

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
FORMAT_TO_EXT = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}
FORMAT_TO_MIME = {"JPEG": "image/jpeg", "PNG": "image/png", "WEBP": "image/webp"}


class StorageService:
    """Guarda imágenes de propiedades.

    En producción con `SUPABASE_PROJECT_URL` + `SUPABASE_SERVICE_ROLE_KEY` configurados
    persiste en Supabase Storage (durable). Sin ellos cae al filesystem local efímero
    (modo dev), manteniendo el formato `/uploads/<id>/...`.
    """

    def __init__(self, base_dir: Path | None = None, supabase: SupabaseStorageClient | None = None):
        self.base_dir = base_dir or get_settings().upload_dir_resolved
        self.supabase = supabase

    def _is_supabase_enabled(self) -> bool:
        settings = get_settings()
        return bool(settings.supabase_project_url and settings.supabase_service_role_key)

    def _supabase_client(self) -> SupabaseStorageClient:
        if self.supabase is None:
            settings = get_settings()
            self.supabase = SupabaseStorageClient(
                settings.supabase_project_url, settings.supabase_service_role_key
            )
        return self.supabase

    def _property_dir(self, property_id: int) -> Path:
        directory = self.base_dir / str(property_id)
        directory.mkdir(parents=True, exist_ok=True)
        return directory

    def save(self, file: UploadFile, property_id: int) -> str:
        settings = get_settings()
        content_type = file.content_type or ""
        if content_type not in ALLOWED_CONTENT_TYPES:
            raise BadRequestError("Formato de imagen no permitido. Usá JPG, PNG o WebP.")

        max_bytes = settings.max_upload_mb * 1024 * 1024
        content = file.file.read(max_bytes + 1)
        if len(content) > max_bytes:
            raise BadRequestError(f"La imagen supera el tamaño máximo de {settings.max_upload_mb} MB.")
        if not content:
            raise BadRequestError("El archivo está vacío.")

        image_format, width, height = self._inspect(content)

        max_side = settings.max_image_pixels_side
        if width > max_side or height > max_side:
            raise BadRequestError(
                f"La imagen supera {max_side}px en algún lado. Redimensionala antes de subirla."
            )

        ext = FORMAT_TO_EXT.get(image_format)
        if ext is None:
            raise BadRequestError("Formato de imagen no permitido. Usá JPG, PNG o WebP.")

        stored_name = f"{uuid.uuid4().hex}{ext}"
        if self._is_supabase_enabled():
            path = f"{property_id}/{stored_name}"
            bucket = settings.supabase_storage_bucket
            self._supabase_client().upload(
                bucket,
                path,
                content,
                FORMAT_TO_MIME.get(image_format, "application/octet-stream"),
            )
            return self._supabase_client().public_url(bucket, path)

        path = self._property_dir(property_id) / stored_name
        path.write_bytes(content)
        return f"/uploads/{property_id}/{stored_name}"

    @staticmethod
    def _inspect(content: bytes) -> tuple[str, int, int]:
        """Valida el contenido real (magic bytes + decodificación) y devuelve formato/dimensiones."""
        try:
            with Image.open(BytesIO(content)) as image:
                image.verify()
            with Image.open(BytesIO(content)) as image:
                return image.format or "", image.width, image.height
        except (UnidentifiedImageError, OSError, ValueError, SyntaxError):
            raise BadRequestError("El archivo no es una imagen válida (JPG, PNG o WebP).")

    def delete(self, url: str) -> None:
        if not url:
            return
        if url.startswith("/uploads/"):
            candidates = self.base_dir / url.removeprefix("/uploads/")
            Path(candidates).unlink(missing_ok=True)
            return
        if self._is_supabase_enabled():
            settings = get_settings()
            bucket = settings.supabase_storage_bucket
            path = self._supabase_client().parse_object_path(url, bucket)
            if path:
                try:
                    self._supabase_client().delete(bucket, path)
                except Exception as exc:  # noqa: BLE001 - limpieza best-effort
                    logger.warning("No se pudo eliminar el objeto %s en Supabase: %s", path, exc)
            return
        logger.warning(
            "No se pudo eliminar la imagen remota %s (Supabase no configurado)", url)

    def delete_property_dir(self, property_id: int) -> None:
        directory = self.base_dir / str(property_id)
        if directory.is_dir():
            for child in directory.iterdir():
                child.unlink(missing_ok=True)
            directory.rmdir()