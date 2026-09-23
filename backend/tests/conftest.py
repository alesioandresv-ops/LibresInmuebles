import pytest
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base
from app.core.database import build_engine


@pytest.fixture()
def db_session():
    engine = build_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestSession: sessionmaker = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session: Session = TestSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()