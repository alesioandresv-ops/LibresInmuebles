import { apiFetch } from "./client.js";

export function getModerationReports(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  const query = qs.toString();
  return apiFetch(`/moderation/reports${query ? `?${query}` : ""}`);
}

export function updateReportStatus(id, status) {
  return apiFetch(`/moderation/reports/${id}/status`, { method: "PATCH", body: { status } });
}