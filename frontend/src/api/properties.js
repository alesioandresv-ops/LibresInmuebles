import { apiFetch } from "./client.js";

export function searchProperties(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  const query = qs.toString();
  return apiFetch(`/properties${query ? `?${query}` : ""}`);
}

export function getProperty(id) {
  return apiFetch(`/properties/${id}`);
}

export function getMine() {
  return apiFetch("/properties/mine");
}

export function createProperty(payload) {
  return apiFetch("/properties", { method: "POST", body: payload });
}

export function updateProperty(id, payload) {
  return apiFetch(`/properties/${id}`, { method: "PUT", body: payload });
}

export function updateStatus(id, status) {
  return apiFetch(`/properties/${id}/status`, { method: "PATCH", body: { status } });
}

export function deleteProperty(id) {
  return apiFetch(`/properties/${id}`, { method: "DELETE" });
}

export function uploadImage(id, file) {
  const form = new FormData();
  form.append("file", file);
  return apiFetch(`/properties/${id}/images`, { method: "POST", body: form });
}

export function setPrimaryImage(id, imageId) {
  return apiFetch(`/properties/${id}/images/${imageId}/primary`, { method: "PUT" });
}

export function deleteImage(id, imageId) {
  return apiFetch(`/properties/${id}/images/${imageId}`, { method: "DELETE" });
}