import json
import urllib.error
import urllib.request


class StorageApiError(RuntimeError):
    def __init__(self, message: str, status: int = 0):
        super().__init__(message)
        self.status = status


class SupabaseStorageClient:
    """Cliente mínimo de Supabase Storage vía REST (stdlib, sin dependencias).

    Autenticación con service_role key (solo backend; nunca exponer en el frontend).
    """

    def __init__(self, project_url: str, service_role_key: str):
        self.project_url = project_url.rstrip("/")
        self.service_role_key = service_role_key

    @property
    def _base(self) -> str:
        return f"{self.project_url}/storage/v1"

    def _headers(self, with_auth: bool = True, content_type: str | None = None) -> dict[str, str]:
        headers = {}
        if with_auth:
            headers["apikey"] = self.service_role_key
            headers["Authorization"] = f"Bearer {self.service_role_key}"
        if content_type:
            headers["Content-Type"] = content_type
        return headers

    def _request(self, method: str, path: str, body: bytes | None = None, headers: dict | None = None) -> tuple[bytes, dict]:
        request = urllib.request.Request(
            f"{self._base}{path}",
            data=body,
            headers=headers or {},
            method=method,
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return response.read(), dict(response.headers)
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace").strip() or exc.reason
            raise StorageApiError(detail, exc.code) from exc
        except urllib.error.URLError as exc:
            raise StorageApiError(f"No se pudo conectar con Supabase Storage: {exc.reason}") from exc

    def create_bucket(
        self,
        bucket_id: str,
        public: bool = True,
        file_size_limit: int | None = None,
        allowed_mime_types: list[str] | None = None,
    ) -> dict:
        payload: dict = {
            "id": bucket_id,
            "name": bucket_id,
            "public": public,
        }
        if file_size_limit is not None:
            payload["file_size_limit"] = file_size_limit
        if allowed_mime_types:
            payload["allowed_mime_types"] = allowed_mime_types
        body = json.dumps(payload).encode("utf-8")
        self._request("POST", "/bucket", body=body, headers=self._headers(content_type="application/json"))
        return {"id": bucket_id}

    def upload(self, bucket_id: str, path: str, data: bytes, content_type: str) -> str:
        self._request(
            "POST",
            f"/object/{bucket_id}/{path}",
            body=data,
            headers=self._headers(content_type=content_type),
        )
        return self.public_url(bucket_id, path)

    def public_url(self, bucket_id: str, path: str) -> str:
        return f"{self.project_url}/storage/v1/object/public/{bucket_id}/{path}"

    def delete(self, bucket_id: str, path: str) -> None:
        self._request("DELETE", f"/object/{bucket_id}/{path}")

    @staticmethod
    def parse_object_path(public_url: str, bucket_id: str) -> str | None:
        """Extrae la ruta del objeto a partir de una URL pública del bucket.

        Devuelve None si la URL no pertenece al bucket indicado.
        """
        marker = f"/storage/v1/object/public/{bucket_id}/"
        if marker not in public_url:
            return None
        return public_url.split(marker, 1)[1].split("?", 1)[0]