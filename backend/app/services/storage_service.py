import uuid
from io import BytesIO
from pathlib import Path

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError

from app.core.config import get_settings
from app.core.exceptions import BadRequestError

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
FORMAT_TO_EXT = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}


class StorageService:
    def __init__(self, base_dir: Path | None = None):
        self.base_dir = base_dir or get_settings().upload_dir_resolved

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
        if not url or not url.startswith("/uploads/"):
            return
        candidates = self.base_dir / url.removeprefix("/uploads/")
        Path(candidates).unlink(missing_ok=True)

    def delete_property_dir(self, property_id: int) -> None:
        directory = self.base_dir / str(property_id)
        if directory.is_dir():
            for child in directory.iterdir():
                child.unlink(missing_ok=True)
            directory.rmdir()