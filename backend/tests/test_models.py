from decimal import Decimal

import pytest
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import (
    Inquiry,
    OperationType,
    Property,
    PropertyCurrency,
    PropertyImage,
    PropertyStatus,
    PropertyType,
    Report,
    ReportReason,
    ReportStatus,
    User,
    UserRole,
)


def make_owner() -> User:
    return User(
        email="dueno@example.com",
        password_hash="hashed",
        first_name="Juan",
        last_name="Perez",
        role=UserRole.OWNER,
        declaration_titular=True,
    )


def make_property(owner: User) -> Property:
    return Property(
        owner=owner,
        operation_type=OperationType.SALE,
        property_type=PropertyType.HOUSE,
        status=PropertyStatus.AVAILABLE,
        title="Casa centro",
        description="Casa amplia a metros de la plaza.",
        price=Decimal("125000.00"),
        currency=PropertyCurrency.USD,
        neighborhood="Centro",
        address="Av. Mitre 120",
        has_water=True,
        has_electricity=True,
        has_internet=True,
    )


def test_create_user_with_declaration(db_session: Session):
    user = make_owner()
    db_session.add(user)
    db_session.commit()

    db_session.refresh(user)
    assert user.id is not None
    assert user.declaration_titular is True
    assert user.role == UserRole.OWNER
    assert user.is_active is True


def test_email_unique_constraint(db_session: Session):
    db_session.add(make_owner())
    db_session.commit()

    duplicate = make_owner()
    db_session.add(duplicate)
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_enums_persist_human_readable_values(db_session: Session):
    uid = make_owner()
    db_session.add(uid)
    db_session.commit()

    raw = db_session.execute(
        text("SELECT role, declaration_titular FROM users WHERE id = :uid"), {"uid": uid.id}
    ).fetchone()
    assert raw[0] == "propietario"
    assert raw[1] in (1, True)  # portable SQLite (1) / PostgreSQL (True)
    assert uid.is_staff is False


def test_property_crud_and_relationships_cascade(db_session: Session):
    owner = make_owner()
    prop = make_property(owner)
    image1 = PropertyImage(url="/uploads/a.jpg", orden=0, is_primary=True)
    image2 = PropertyImage(url="/uploads/b.jpg", orden=1)
    inquiry = Inquiry(sender=owner, message="Sigue disponible? Sigo interesado")
    report = Report(reporter=owner, reason=ReportReason.FALSE_DATA, details="Precio distinto al publicado")

    prop.images.extend([image1, image2])
    prop.inquiries.append(inquiry)
    prop.reports.append(report)

    db_session.add(prop)
    db_session.commit()
    db_session.refresh(prop)

    assert len(prop.images) == 2
    assert prop.images[0].is_primary is True
    assert len(prop.inquiries) == 1
    assert prop.inquiries[0].is_read is False
    assert prop.reports[0].status == ReportStatus.PENDING
    assert prop.price == Decimal("125000.00")

    prop_id = prop.id
    db_session.delete(prop)
    db_session.commit()

    assert db_session.get(Property, prop_id) is None
    assert db_session.query(PropertyImage).filter_by(property_id=prop_id).count() == 0
    assert db_session.query(Inquiry).filter_by(property_id=prop_id).count() == 0
    assert db_session.query(Report).filter_by(property_id=prop_id).count() == 0


def test_default_currency_and_status(db_session: Session):
    owner = make_owner()
    prop = make_property(owner)
    prop.currency = PropertyCurrency.ARS
    db_session.add(prop)
    db_session.commit()
    db_session.refresh(prop)

    assert prop.currency == PropertyCurrency.ARS
    assert prop.currency.value == "ARS"
    assert prop.status == PropertyStatus.AVAILABLE


def test_property_price_non_negative_constraint(db_session: Session):
    owner = make_owner()
    prop = make_property(owner)
    prop.price = Decimal("-1.00")
    db_session.add(prop)
    with pytest.raises(IntegrityError):
        db_session.commit()