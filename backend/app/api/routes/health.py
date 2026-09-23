from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health", summary="Health check para el proveedor de hosting")
def health() -> dict:
    return {"status": "ok"}