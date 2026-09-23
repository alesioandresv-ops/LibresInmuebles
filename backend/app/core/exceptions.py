import logging

from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger("libreinmuebles")


class AppError(Exception):
    status_code = 500
    default_message = "Error interno del servidor."

    def __init__(self, message: str | None = None):
        self.message = message or self.default_message
        super().__init__(self.message)


class ResourceNotFoundError(AppError):
    status_code = 404
    default_message = "Recurso no encontrado."


class ConflictError(AppError):
    status_code = 409
    default_message = "Conflicto con el estado actual del recurso."


class BadRequestError(AppError):
    status_code = 400
    default_message = "Solicitud inválida."


class PermissionDeniedError(AppError):
    status_code = 401
    default_message = "No autenticado."


class ForbiddenError(AppError):
    status_code = 403
    default_message = "No tenés permisos para realizar esta acción."


class RateLimitError(AppError):
    status_code = 429
    default_message = "Demasiados intentos. Esperá un minuto y volvé a intentar."


def register_exception_handlers(app) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})

    @app.exception_handler(Exception)
    async def handle_unexpected(request: Request, exc: Exception):
        logger.exception("Excepción no controlada en %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=500,
            content={"detail": "Error interno del servidor."},
        )