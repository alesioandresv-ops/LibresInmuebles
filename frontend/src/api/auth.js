import { apiFetch } from "./client.js";

export function login(email, password) {
  return apiFetch("/auth/login", { method: "POST", body: { email, password } });
}

export function register(payload) {
  return apiFetch("/auth/register", { method: "POST", body: payload });
}

export function fetchMe() {
  return apiFetch("/auth/me");
}

export function forgotPassword(email) {
  return apiFetch("/auth/forgot-password", { method: "POST", body: { email } });
}

export function resetPassword(token, newPassword) {
  return apiFetch("/auth/reset-password", { method: "POST", body: { token, new_password: newPassword } });
}