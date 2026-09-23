import logging
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger("libreinmuebles")


def send_email(to: str, subject: str, text: str, html: str | None = None) -> None:
    """Envía un correo. En dev sin SMTP lo escribe en consola.

    Best-effort: nunca lanza excepciones, el envío no debe romper el flujo de la API.
    """
    settings = get_settings()
    if not settings.smtp_host:
        logger.info(
            "[EMAIL DEV] Para: %s | Asunto: %s\n%s\n%s",
            to,
            subject,
            text,
            f"HTML: {html}" if html else "",
        )
        return

    message = EmailMessage()
    message["From"] = settings.smtp_from or settings.smtp_user or "no-reply@libreinmuebles.app"
    message["To"] = to
    message["Subject"] = subject
    message.set_content(text)
    if html:
        message.add_alternative(html, subtype="html")

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            if settings.smtp_tls:
                server.starttls()
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(message)
        logger.info("Email enviado a %s (%s)", to, subject)
    except Exception:  # noqa: BLE001 - best-effort, logueamos y seguimos
        logger.warning("No se pudo enviar el email a %s (%s)", to, subject, exc_info=True)