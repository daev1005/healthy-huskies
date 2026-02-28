const request = require("supertest");
const app = require("../app");
const Meal = require("../models/Meal");

const toYYYYMMDDLocal = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const startOfLocalDay = (d) => {
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  return day;
};

const addDays = (d, amount) => {
  const next = new Date(d);
  next.setDate(next.getDate() + amount);
  return startOfLocalDay(next);
};

const registerUser = async (name, email) => {
  const res = await request(app).post("/api/auth/register").send({
    name,
    email,
    password: "Pass123!",
  });

  expect(res.status).toBe(201);
  return { token: res.body.token, userId: res.body._id };
};

describe("Meals API integration", () => {
  test("rejects protected meals route without token", async () => {
    const res = await request(app).get("/api/meals");

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Not authorized/i);
  });

  test("enforces ownership on update and delete", async () => {
    const userA = await registerUser("User A", "usera@example.com");
    const userB = await registerUser("User B", "userb@example.com");

    const created = await request(app)
      .post("/api/meals")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        name: "Owner Meal",
        calories: 450,
        protein: 30,
        carbs: 40,
        fat: 15,
        mealTime: "lunch",
        notes: "owned by A",
      });

    expect(created.status).toBe(201);
    const mealId = created.body._id;

    const updateByOtherUser = await request(app)
      .put(`/api/meals/${mealId}`)
      .set("Authorization", `Bearer ${userB.token}`)
      .send({ calories: 999 });

    expect(updateByOtherUser.status).toBe(404);
    expect(updateByOtherUser.body.message).toBe("Meal not found");

    const deleteByOtherUser = await request(app)
      .delete(`/api/meals/${mealId}`)
      .set("Authorization", `Bearer ${userB.token}`);

    expect(deleteByOtherUser.status).toBe(404);
    expect(deleteByOtherUser.body.message).toBe("Meal not found");
  });

  test("validates date filter and blocks future date on GET /api/meals", async () => {
    const user = await registerUser("Date User", "dateuser@example.com");

    const invalid = await request(app)
      .get("/api/meals?date=2026-99-99")
      .set("Authorization", `Bearer ${user.token}`);

    expect(invalid.status).toBe(400);
    expect(invalid.body.message).toBe("Invalid date. Use YYYY-MM-DD.");

    const tomorrow = addDays(new Date(), 1);
    const futureDate = toYYYYMMDDLocal(tomorrow);

    const future = await request(app)
      .get(`/api/meals?date=${futureDate}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(future.status).toBe(400);
    expect(future.body.message).toBe("Cannot request meals for a future date.");
  });

  test("paginates meal list with metadata", async () => {
    const user = await registerUser("Paging User", "paging@example.com");
    const today = startOfLocalDay(new Date());

    const meals = Array.from({ length: 25 }).map((_, i) => ({
      user: user.userId,
      name: `Meal ${i + 1}`,
      calories: 100 + i,
      protein: 10,
      carbs: 10,
      fat: 5,
      mealTime: "snack",
      mealDate: today,
      notes: "",
    }));

    await Meal.insertMany(meals);

    const res = await request(app)
      .get("/api/meals?page=2&limit=10")
      .set("Authorization", `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(10);
    expect(res.body.total).toBe(25);
    expect(res.body.totalPages).toBe(3);
    expect(res.body.count).toBe(10);
    expect(Array.isArray(res.body.meals)).toBe(true);
    expect(res.body.meals).toHaveLength(10);
  });

  test("validates pagination query params", async () => {
    const user = await registerUser("Paging Rules", "pagingrules@example.com");

    const badPage = await request(app)
      .get("/api/meals?page=0&limit=10")
      .set("Authorization", `Bearer ${user.token}`);

    expect(badPage.status).toBe(400);
    expect(badPage.body.message).toBe("page must be a positive integer.");

    const badLimit = await request(app)
      .get("/api/meals?page=1&limit=200")
      .set("Authorization", `Bearer ${user.token}`);

    expect(badLimit.status).toBe(400);
    expect(badLimit.body.message).toBe("limit must be an integer between 1 and 100.");
  });

  test("returns daily summary totals grouped by mealTime", async () => {
    const user = await registerUser("Summary User", "summary@example.com");
    const day = startOfLocalDay(new Date());
    const date = toYYYYMMDDLocal(day);

    await Meal.insertMany([
      {
        user: user.userId,
        name: "Eggs",
        calories: 200,
        protein: 18,
        carbs: 2,
        fat: 12,
        mealTime: "breakfast",
        mealDate: day,
      },
      {
        user: user.userId,
        name: "Salad",
        calories: 300,
        protein: 12,
        carbs: 20,
        fat: 18,
        mealTime: "lunch",
        mealDate: day,
      },
    ]);

    const res = await request(app)
      .get(`/api/meals/summary?date=${date}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.date).toBe(date);
    expect(res.body.overallTotals).toEqual({
      calories: 500,
      protein: 30,
      carbs: 22,
      fat: 30,
    });
    expect(res.body.byMealTime.breakfast.totals.calories).toBe(200);
    expect(res.body.byMealTime.lunch.totals.calories).toBe(300);
    expect(res.body.byMealTime.breakfast.meals).toHaveLength(1);
  });

  test("blocks future daily summary requests", async () => {
    const user = await registerUser("Future Daily", "futuredaily@example.com");
    const tomorrow = toYYYYMMDDLocal(addDays(new Date(), 1));

    const res = await request(app)
      .get(`/api/meals/summary?date=${tomorrow}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Cannot request summary for a future date.");
  });

  test("returns 7-day weekly summary and excludes future meals when week extends into future", async () => {
    const user = await registerUser("Weekly User", "weekly@example.com");

    const today = startOfLocalDay(new Date());
    const startDay = addDays(today, -3);
    const start = toYYYYMMDDLocal(startDay);

    const futureDay = addDays(today, 1);

    await Meal.insertMany([
      {
        user: user.userId,
        name: "Start Day Meal",
        calories: 120,
        protein: 10,
        carbs: 8,
        fat: 4,
        mealTime: "breakfast",
        mealDate: startDay,
      },
      {
        user: user.userId,
        name: "Today Meal",
        calories: 220,
        protein: 20,
        carbs: 18,
        fat: 9,
        mealTime: "dinner",
        mealDate: today,
      },
      {
        user: user.userId,
        name: "Future Meal",
        calories: 999,
        protein: 99,
        carbs: 99,
        fat: 99,
        mealTime: "snack",
        mealDate: futureDay,
      },
    ]);

    const res = await request(app)
      .get(`/api/meals/summary/week?start=${start}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.start).toBe(start);
    expect(Array.isArray(res.body.days)).toBe(true);
    expect(res.body.days).toHaveLength(7);

    expect(res.body.weeklyTotals.calories).toBe(340);
    expect(res.body.weeklyTotals.protein).toBe(30);
    expect(res.body.weeklyTotals.carbs).toBe(26);
    expect(res.body.weeklyTotals.fat).toBe(13);

    const futureKey = toYYYYMMDDLocal(futureDay);
    const futureBucket = res.body.days.find((d) => d.date === futureKey);
    expect(futureBucket).toBeDefined();
    expect(futureBucket.overallTotals).toEqual({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  });

  test("blocks weekly summary when start is in the future", async () => {
    const user = await registerUser("Future Week", "futureweek@example.com");
    const tomorrow = toYYYYMMDDLocal(addDays(new Date(), 1));

    const res = await request(app)
      .get(`/api/meals/summary/week?start=${tomorrow}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Cannot request a week starting in the future.");
  });
});
