const TOKEN_KEY = "libreinmuebles_token";
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function apiBase() {
  return API_BASE;
}

export function assetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE}${path}`;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path, { method = "GET", body, headers = {} } = {}) {
  const options = {
    method,
    headers: { ...authHeaders(), ...headers },
  };
  if (body !== undefined) {
    if (body instanceof FormData) {
      options.body = body;
    } else {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }
  const res = await fetch(`${API_BASE}${path}`, options);
  if (res.status === 204) return null;

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  }
  if (!res.ok) {
    const detail = data?.detail;
    let message;
    if (Array.isArray(detail)) {
      message = detail
        .map((d) => `${d.loc?.slice(1).join(".") || "campo"}: ${d.msg}`)
        .join(" · ");
    } else {
      message = detail ?? `Error ${res.status}`;
    }
    if (res.status === 401) {
      setToken(null);
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    throw new ApiError(message, res.status);
  }
  return data;
}