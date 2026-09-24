"""Smoke test rápido contra el backend publicado.

Uso:
    SMOKE_API_URL=https://libreinmuebles-api.onrender.com python -m app.scripts.smoke_prod

Chequea: /health, feed público anónimo y un detalle si hay publicaciones.
"""
import json
import os
import sys
import urllib.request
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


def _get(base: str, path: str):
    with urllib.request.urlopen(f"{base}{path}", timeout=60) as response:
        return response.status, response.read().decode("utf-8")


def main() -> int:
    base = (os.environ.get("SMOKE_API_URL") or "https://libreinmuebles-api.onrender.com").rstrip("/")
    print(f"⏱  Probando {base} (el free plan puede arrancar en frío y tardar ~1 min)…")

    checks = []

    status, body = _get(base, "/health")
    ok = status == 200 and json.loads(body).get("status") == "ok"
    checks.append((ok, f"/health → {status} {body[:80]}"))

    status, body = _get(base, "/properties")
    feed = json.loads(body)
    ok = status == 200 and isinstance(feed.get("items"), list)
    checks.append((ok, f"/properties → {status} · {len(feed.get('items', []))} publicaciones"))

    if feed.get("items"):
        property_id = feed["items"][0]["id"]
        status, body = _get(base, f"/properties/{property_id}")
        ok = status == 200
        checks.append((ok, f"/properties/{property_id} → {status}"))

    failed = 0
    for ok, line in checks:
        print(("✅" if ok else "❌") + " " + line)
        failed += 0 if ok else 1
    print("Smoke:", "OK" if failed == 0 else f"FALLÓ ({failed} checks)")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())