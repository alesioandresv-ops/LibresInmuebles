from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def create(self, email: str, password_hash: str, first_name: str, last_name: str,
               role, declaration_titular: bool, is_staff: bool, phone: str | None, whatsapp: str | None) -> User:
        user = User(
            email=email,
            password_hash=password_hash,
            first_name=first_name,
            last_name=last_name,
            role=role,
            declaration_titular=declaration_titular,
            is_staff=is_staff,
            phone=phone,
            whatsapp=whatsapp,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user