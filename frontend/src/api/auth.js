import { apiFetch } from "./client";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const GUEST_MODE_KEY = "guest_mode";

export function login(payload) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function requestPasswordReset(payload) {
  return apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resetPassword(payload) {
  return apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveAuthSession(authResponse) {
  if (!authResponse?.token) return;
  disableGuestMode();
  localStorage.setItem(TOKEN_KEY, authResponse.token);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      _id: authResponse._id,
      name: authResponse.name,
      email: authResponse.email,
    })
  );
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function enableGuestMode() {
  clearAuthSession();
  localStorage.setItem(GUEST_MODE_KEY, "true");
}

export function disableGuestMode() {
  localStorage.removeItem(GUEST_MODE_KEY);
}

export function isGuestMode() {
  return localStorage.getItem(GUEST_MODE_KEY) === "true";
}