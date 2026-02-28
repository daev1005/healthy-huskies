const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: [true, "Meal name is required"],
      trim: true,
    },

    calories: {
      type: Number,
      required: [true, "Calories is required"],
      min: [0, "Calories cannot be negative"],
    },

    protein: {
      type: Number,
      default: 0,
      min: [0, "Protein cannot be negative"],
    },

    carbs: {
      type: Number,
      default: 0,
      min: [0, "Carbs cannot be negative"],
    },

    fat: {
      type: Number,
      default: 0,
      min: [0, "Fat cannot be negative"],
    },

    mealTime: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },

    mealDate: {
      type: Date,
      required: [true, "mealDate is required"],
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meal", mealSchema);