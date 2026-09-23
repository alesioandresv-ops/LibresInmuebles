import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import select  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.core.database import engine  # noqa: E402
from app.models import User  # noqa: E402


def main() -> None:
    if len(sys.argv) < 2:
        print("Uso: python -m app.scripts.make_staff EMAIL")
        sys.exit(1)
    email = sys.argv[1].strip().lower()
    with Session(engine) as session:
        user = session.scalars(select(User).where(User.email == email)).first()
        if user is None:
            print(f"No se encontró ningún usuario con email '{email}'.")
            sys.exit(1)
        if user.is_staff:
            print(f"{user.email} ya es staff.")
            return
        user.is_staff = True
        session.commit()
        print(f"{user.email} ahora es staff.")


if __name__ == "__main__":
    main()