const Meal = require("../models/Meal");
const { parseYYYYMMDDToLocalDate, isFutureDay } = require("../utils/dateValidation");

// Helper to initialize totals object and to parse/summarize meals for summaries
const initTotals = () => ({ calories: 0, protein: 0, carbs: 0, fat: 0 });
const toYYYYMMDDLocal = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
const summarizeMeals = (meals) => {
  const byMealTime = {
    breakfast: { meals: [], totals: initTotals() },
    lunch: { meals: [], totals: initTotals() },
    dinner: { meals: [], totals: initTotals() },
    snack: { meals: [], totals: initTotals() },
  };

  const overallTotals = initTotals();

  for (const meal of meals) {
    const bucket = byMealTime[meal.mealTime];
    if (!bucket) continue;

    bucket.meals.push(meal);

    const cals = Number(meal.calories) || 0;
    const p = Number(meal.protein) || 0;
    const cb = Number(meal.carbs) || 0;
    const f = Number(meal.fat) || 0;

    bucket.totals.calories += cals;
    bucket.totals.protein += p;
    bucket.totals.carbs += cb;
    bucket.totals.fat += f;

    overallTotals.calories += cals;
    overallTotals.protein += p;
    overallTotals.carbs += cb;
    overallTotals.fat += f;
  }

  return { byMealTime, overallTotals };
};

// @desc    Create a meal
// @route   POST /api/meals
// @access  Private
const createMeal = async (req, res, next) => {
  try {
    const { name, calories, protein, carbs, fat, mealTime, notes } = req.body;

    // Basic validation
    if (!name || calories === undefined || !mealTime) {
      return res.status(400).json({ message: "name, calories, and mealTime are required" });
    }

    // Server decides the day (today), normalized to start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const meal = await Meal.create({
      user: req.user._id,     // <-- owner comes from JWT
      name,
      calories,
      protein,
      carbs,
      fat,
      mealTime,
      mealDate: today,
      notes,
    });

    return res.status(201).json(meal);
  } catch (err) {
    next(err);
  }
};

// @desc    Get meals for logged-in user
// @route   GET /api/meals
// @access  Private
const getMyMeals = async (req, res, next) => {
  try {
    const { date, page = "1", limit = "20" } = req.query;

    const query = { user: req.user._id };

    if (date !== undefined) {
      const day = parseYYYYMMDDToLocalDate(date);
      if (!day) {
        return res.status(400).json({ message: "Invalid date. Use YYYY-MM-DD." });
      }

      if (isFutureDay(day)) {
        return res.status(400).json({ message: "Cannot request meals for a future date." });
      }

      query.mealDate = day;
    }

    const pageNum = Number.parseInt(page, 10);
    const limitNum = Number.parseInt(limit, 10);

    if (!Number.isInteger(pageNum) || pageNum < 1) {
      return res.status(400).json({ message: "page must be a positive integer." });
    }

    if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ message: "limit must be an integer between 1 and 100." });
    }

    const skip = (pageNum - 1) * limitNum;

    const [meals, total] = await Promise.all([
      Meal.find(query).sort({ mealDate: -1, mealTime: 1, createdAt: -1 }).skip(skip).limit(limitNum),
      Meal.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      count: meals.length,
      meals,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a meal (owner only)
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    return res.json({ message: "Meal deleted" });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a meal (partial update)
// @route   PUT /api/meals/:id
// @access  Private
const updateMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    // If not found OR not owned by this user, both look the same
    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    // Whitelist fields so nobody can update "user", "_id", etc.
    const allowedFields = ["name", "calories", "protein", "carbs", "fat", "mealTime", "notes"];

    for (const field of allowedFields) {
      // Partial update: only change fields that were actually sent
      if (req.body[field] !== undefined) {
        meal[field] = req.body[field];
      }
    }

    await meal.save();
    return res.status(200).json(meal);
  } catch (err) {
    next(err);
  }
};

// @desc    Daily meal summary for a specific date
// @route   GET /api/meals/summary?date=YYYY-MM-DD
// @access  Private
const getDailySummary = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date query param is required (YYYY-MM-DD)" });
    }

    const day = parseYYYYMMDDToLocalDate(date);
    if (!day) {
      return res.status(400).json({ message: "Invalid date. Use YYYY-MM-DD." });
    }

    if (isFutureDay(day)) {
      return res.status(400).json({ message: "Cannot request summary for a future date." });
    }

    const meals = await Meal.find({ user: req.user._id, mealDate: day })
      .sort({ mealTime: 1, createdAt: 1 });

    const { byMealTime, overallTotals } = summarizeMeals(meals);
    return res.json({ date, byMealTime, overallTotals });
  } catch (err) {
    next(err);
  }
};

// @desc    Weekly summary (7-day) for boxes: totals per day + weekly totals
// @route   GET /api/meals/summary/week?start=YYYY-MM-DD
// @access  Private
const getWeeklySummary = async (req, res, next) => {
  try {
    const { start } = req.query;

    if (!start) {
      return res.status(400).json({ message: "start query param is required (YYYY-MM-DD)" });
    }

    const startDay = parseYYYYMMDDToLocalDate(start);
    if (!startDay) {
      return res.status(400).json({ message: "Invalid start date. Use YYYY-MM-DD." });
    }

    if (isFutureDay(startDay)) {
      return res.status(400).json({ message: "Cannot request a week starting in the future." });
    }

    // end day = start + 6 days (normalized)
    const endDay = new Date(startDay);
    endDay.setDate(endDay.getDate() + 6);
    endDay.setHours(0, 0, 0, 0);

    // If the requested week extends into the future, clamp endDay to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (endDay > today) {
      endDay.setTime(today.getTime());
    }

    // One DB query for the whole week
    const weekMeals = await Meal.find({
      user: req.user._id,
      mealDate: { $gte: startDay, $lte: endDay },
    }).sort({ mealDate: 1, mealTime: 1, createdAt: 1 });

    // Build 7 empty day buckets so frontend always gets 7 boxes
    const days = [];
    const mealsByDayKey = new Map(); // key -> meals array

    for (let i = 0; i < 7; i++) {
      const d = new Date(startDay);
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);

      const key = toYYYYMMDDLocal(d);
      mealsByDayKey.set(key, []);
      days.push({ date: key, overallTotals: initTotals() });
    }

    // Distribute meals into buckets (assumes DB mealDate is already normalized)
    for (const meal of weekMeals) {
      const key = toYYYYMMDDLocal(meal.mealDate);
      const arr = mealsByDayKey.get(key);
      if (arr) arr.push(meal);
    }

    // Compute totals per day using the same summarize logic as daily
    const weeklyTotals = initTotals();

    for (const dayObj of days) {
      const mealsForDay = mealsByDayKey.get(dayObj.date) || [];
      const { overallTotals } = summarizeMeals(mealsForDay);

      dayObj.overallTotals = overallTotals;

      weeklyTotals.calories += overallTotals.calories;
      weeklyTotals.protein += overallTotals.protein;
      weeklyTotals.carbs += overallTotals.carbs;
      weeklyTotals.fat += overallTotals.fat;
    }

    return res.json({
      start,
      end: days[6].date,
      days,
      weeklyTotals,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createMeal, getMyMeals, deleteMeal, updateMeal, getDailySummary, getWeeklySummary };
