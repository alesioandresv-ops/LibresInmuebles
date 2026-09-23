import logging

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestError, ForbiddenError, ResourceNotFoundError
from app.models import Property, PropertyImage, User
from app.models.enums import UserRole
from app.repositories.property_repository import PropertyRepository, PropertySearchParams
from app.schemas.property import PropertyCreate, PropertyUpdate
from app.services.storage_service import StorageService

logger = logging.getLogger("libreinmuebles")


class PropertyService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PropertyRepository(db)
        self.storage = StorageService()

    @staticmethod
    def _ensure_owner_role(user: User) -> None:
        if user.role != UserRole.OWNER:
            raise ForbiddenError(
                "Solo propietarios pueden publicar. Registrate como Dueño Directo para publicar tu inmueble."
            )

    @staticmethod
    def _ensure_owner(user: User, prop: Property) -> None:
        if prop.owner_id != user.id:
            raise ForbiddenError("No tenés permisos sobre esta propiedad.")

    def _get_or_404(self, property_id: int) -> Property:
        prop = self.repo.get_by_id(property_id)
        if prop is None:
            raise ResourceNotFoundError("Propiedad no encontrada.")
        return prop

    def search(self, p: PropertySearchParams) -> tuple[list[Property], int]:
        if p.price_min is not None and p.price_max is not None and p.price_min > p.price_max:
            raise BadRequestError("El precio mínimo no puede superar el máximo.")
        return self.repo.search(p)

    def create(self, user: User, data: PropertyCreate) -> Property:
        self._ensure_owner_role(user)
        payload = data.model_dump()
        return self.repo.create(owner_id=user.id, payload=payload)

    def update(self, user: User, property_id: int, data: PropertyUpdate) -> Property:
        prop = self._get_or_404(property_id)
        self._ensure_owner(user, prop)
        payload = data.model_dump(exclude_unset=True)
        if not payload:
            raise BadRequestError("No se enviaron campos para actualizar.")
        return self.repo.update(prop, payload=payload)

    def delete(self, user: User, property_id: int) -> None:
        prop = self._get_or_404(property_id)
        self._ensure_owner(user, prop)
        self.repo.delete(prop)
        self._cleanup_dir(property_id)

    def mine(self, user: User) -> list[Property]:
        return self.repo.by_owner(user.id)

    @staticmethod
    def _cleanup_dir(property_id: int) -> None:
        try:
            StorageService().delete_property_dir(property_id)
        except OSError:  # pragma: no cover - limpieza best-effort
            logger.warning("No se pudo limpiar el directorio de la propiedad %s", property_id)

    def change_status(self, user: User, property_id: int, status) -> Property:
        prop = self._get_or_404(property_id)
        if not user.is_staff and prop.owner_id != user.id:
            raise ForbiddenError("No tenés permisos sobre esta propiedad.")
        return self.repo.update(prop, payload={"status": status})

    def add_image(self, user: User, property_id: int, file: UploadFile) -> PropertyImage:
        prop = self._get_or_404(property_id)
        self._ensure_owner(user, prop)
        url = self.storage.save(file, property_id)
        is_primary = len(prop.images) == 0
        image = PropertyImage(property_id=prop.id, url=url, orden=len(prop.images), is_primary=is_primary)
        self.db.add(image)
        self.db.commit()
        self.db.refresh(image)
        return image

    def set_primary(self, user: User, property_id: int, image_id: int) -> PropertyImage:
        prop = self._get_or_404(property_id)
        self._ensure_owner(user, prop)
        image = self.repo.get_image(property_id, image_id)
        if image is None:
            raise ResourceNotFoundError("Imagen no encontrada.")
        self.db.query(PropertyImage).filter(PropertyImage.property_id == property_id).update(
            {"is_primary": False}
        )
        image.is_primary = True
        self.db.commit()
        self.db.refresh(image)
        return image

    def remove_image(self, user: User, property_id: int, image_id: int) -> None:
        prop = self._get_or_404(property_id)
        self._ensure_owner(user, prop)
        image = self.repo.get_image(property_id, image_id)
        if image is None:
            raise ResourceNotFoundError("Imagen no encontrada.")
        was_primary = image.is_primary
        url = image.url
        self.db.delete(image)
        self.db.flush()
        if was_primary:
            next_image = (
                self.db.query(PropertyImage)
                .filter(PropertyImage.property_id == property_id)
                .order_by(PropertyImage.orden)
                .first()
            )
            if next_image is not None:
                next_image.is_primary = True
        self.db.commit()
        try:
            self.storage.delete(url)
        except OSError:  # pragma: no cover - limpieza best-effort
            logger.warning("No se pudo eliminar el archivo de imagen %s", url)