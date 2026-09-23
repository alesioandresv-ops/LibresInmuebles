"""Rate limiter en memoria (fixed-window) para endpoints sensibles de /auth.

Sin dependencias externas: suficiente para mitigar fuerza bruta en un MVP
y determinista en tests (se activa solo con `rate_limit_enabled=true`).
"""

import threading
import time
from collections import defaultdict

_store: dict[str, list[float]] = defaultdict(list)
_locks: defaultdict[str, threading.Lock] = defaultdict(threading.Lock)


def rate_allow(identity: str, limit: int, window_seconds: float = 60.0) -> bool:
    """Devuelve True si la identidad aún no superó `limit` en la ventana."""
    with _locks[identity]:
        now = time.monotonic()
        hits = [ts for ts in _store[identity] if now - ts < window_seconds]
        if len(hits) >= limit:
            _store[identity] = hits
            return False
        hits.append(now)
        _store[identity] = hits
        return True