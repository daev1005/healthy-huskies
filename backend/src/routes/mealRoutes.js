const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { createMeal, getMyMeals, deleteMeal, updateMeal, getDailySummary, getWeeklySummary } = require("../controllers/mealController");

// @route   /api/meals
router.route("/").
    get(protect, getMyMeals).
    post(protect, createMeal);

router.route("/summary").
    get(protect, getDailySummary);
router.route("/summary/week").
    get(protect, getWeeklySummary);

// @route   /api/meals/:id
router.route("/:id").
    delete(protect, deleteMeal).
    put(protect, updateMeal);

module.exports = router;
