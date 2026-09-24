import { apiFetch } from "./client.js";

export function createInquiry(payload) {
  return apiFetch("/inquiries", { method: "POST", body: payload });
}

export function getInbox(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  const query = qs.toString();
  return apiFetch(`/inquiries/inbox${query ? `?${query}` : ""}`);
}

export function getSent(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  const query = qs.toString();
  return apiFetch(`/inquiries/sent${query ? `?${query}` : ""}`);
}

export function getUnreadCount() {
  return apiFetch("/inquiries/unread-count");
}

export function markInquiryRead(id) {
  return apiFetch(`/inquiries/${id}/read`, { method: "PATCH" });
}

export function getInquiryThread(id) {
  return apiFetch(`/inquiries/${id}`);
}

export function createInquiryReply(id, payload) {
  return apiFetch(`/inquiries/${id}/replies`, { method: "POST", body: payload });
}

export function createReport(payload) {
  return apiFetch("/reports", { method: "POST", body: payload });
}