import { apiFetch } from "./client";

export function getMeals(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/meals${query ? `?${query}` : ""}`);
}

export function createMeal(payload) {
  return apiFetch("/api/meals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMeal(id, payload) {
  return apiFetch(`/api/meals/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteMeal(id) {
  return apiFetch(`/api/meals/${id}`, { method: "DELETE" });
}

export function getDailySummary(date) {
  return apiFetch(`/api/meals/summary?date=${date}`);
}

export function getWeeklySummary(start) {
  return apiFetch(`/api/meals/summary/week?start=${start}`);
}
