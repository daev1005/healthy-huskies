import { apiFetch } from "./client";
import { isGuestMode } from "./auth";

function toYYYYMMDDLocal(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildEmptyWeekDays(startDate) {
  const start = new Date(startDate);
  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    d.setHours(0, 0, 0, 0);
    days.push({
      date: toYYYYMMDDLocal(d),
      overallTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    });
  }

  return days;
}

export function getMeals(params = {}) {
  if (isGuestMode()) {
    const limit = Number(params.limit) || 20;
    return Promise.resolve({
      page: 1,
      limit,
      total: 0,
      totalPages: 1,
      count: 0,
      meals: [],
    });
  }

  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/meals${query ? `?${query}` : ""}`);
}

export function createMeal(payload) {
  if (isGuestMode()) {
    return Promise.resolve({ message: "Guest mode: meal not saved" });
  }

  return apiFetch("/api/meals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMeal(id, payload) {
  if (isGuestMode()) {
    return Promise.resolve({ message: "Guest mode: meal not updated" });
  }

  return apiFetch(`/api/meals/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteMeal(id) {
  if (isGuestMode()) {
    return Promise.resolve({ message: "Guest mode: meal not deleted" });
  }

  return apiFetch(`/api/meals/${id}`, { method: "DELETE" });
}

export function getDailySummary(date) {
  if (isGuestMode()) {
    return Promise.resolve({
      date,
      byMealTime: {
        breakfast: { meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
        lunch: { meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
        dinner: { meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
        snack: { meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
      },
      overallTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    });
  }

  return apiFetch(`/api/meals/summary?date=${date}`);
}

export function getWeeklySummary(start) {
  if (isGuestMode()) {
    const days = buildEmptyWeekDays(start || new Date());
    return Promise.resolve({
      start: days[0].date,
      end: days[6].date,
      days,
      weeklyTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    });
  }

  return apiFetch(`/api/meals/summary/week?start=${start}`);
}
