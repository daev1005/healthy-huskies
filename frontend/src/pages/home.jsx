import React, { useMemo, useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { deleteMeal, getMeals, getWeeklySummary } from "../api/meals";

ChartJS.register(ArcElement, Tooltip, Legend);

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toYYYYMMDDLocal(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getStartOfCurrentWeek() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

function buildWeekDates(startDate) {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    d.setHours(0, 0, 0, 0);
    dates.push(d);
  }
  return dates;
}

function groupMealsByMealTime(meals) {
  return meals.reduce(
    (acc, meal) => {
      const key = meal.mealTime;
      if (!acc[key]) return acc;
      acc[key].push({
        id: meal._id,
        name: meal.name,
        calories: Number(meal.calories) || 0,
        protein: Number(meal.protein) || 0,
        carbs: Number(meal.carbs) || 0,
        fat: Number(meal.fat) || 0,
      });
      return acc;
    },
    { breakfast: [], lunch: [], dinner: [] }
  );
}

export default function Home() {
  const startOfWeek = useMemo(() => getStartOfCurrentWeek(), []);
  const weekDates = useMemo(() => buildWeekDates(startOfWeek), [startOfWeek]);

  const [selectedDay, setSelectedDay] = useState(toYYYYMMDDLocal(new Date()));
  const [dayMeals, setDayMeals] = useState({ breakfast: [], lunch: [], dinner: [] });
  const [weeklyTotalsByDate, setWeeklyTotalsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    async function fetchWeekSummary() {
      try {
        const start = toYYYYMMDDLocal(startOfWeek);
        const summary = await getWeeklySummary(start);

        const totalsMap = {};
        for (const day of summary.days) {
          totalsMap[day.date] = day.overallTotals;
        }

        setWeeklyTotalsByDate(totalsMap);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchWeekSummary();
  }, [startOfWeek]);

  useEffect(() => {
    async function fetchSelectedDayMeals() {
      try {
        setLoading(true);
        setError(null);

        const response = await getMeals({ date: selectedDay, page: 1, limit: 100 });
        setDayMeals(groupMealsByMealTime(response.meals || []));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSelectedDayMeals();
  }, [selectedDay]);

  const handleRemoveItem = async (itemId, mealType) => {
    try {
      await deleteMeal(itemId);
      setDayMeals((prev) => ({
        ...prev,
        [mealType]: prev[mealType].filter((item) => item.id !== itemId),
      }));
    } catch (err) {
      alert(err.message || "Failed to remove item");
    }
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const breakfastData = dayMeals.breakfast || [];
  const lunchData = dayMeals.lunch || [];
  const dinnerData = dayMeals.dinner || [];

  const totalCalories =
    breakfastData.reduce((sum, meal) => sum + meal.calories, 0) +
    lunchData.reduce((sum, meal) => sum + meal.calories, 0) +
    dinnerData.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein =
    breakfastData.reduce((sum, meal) => sum + meal.protein, 0) +
    lunchData.reduce((sum, meal) => sum + meal.protein, 0) +
    dinnerData.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs =
    breakfastData.reduce((sum, meal) => sum + meal.carbs, 0) +
    lunchData.reduce((sum, meal) => sum + meal.carbs, 0) +
    dinnerData.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat =
    breakfastData.reduce((sum, meal) => sum + meal.fat, 0) +
    lunchData.reduce((sum, meal) => sum + meal.fat, 0) +
    dinnerData.reduce((sum, meal) => sum + meal.fat, 0);

  const chartData = {
    labels: ["Breakfast", "Lunch", "Dinner"],
    datasets: [
      {
        data: [
          breakfastData.reduce((sum, meal) => sum + meal.calories, 0),
          lunchData.reduce((sum, meal) => sum + meal.calories, 0),
          dinnerData.reduce((sum, meal) => sum + meal.calories, 0),
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading meals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full p-6 lg:p-8">
      <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="min-h-0 flex flex-col gap-6">
          <div className="flex-1 min-h-0 w-full mx-auto px-4 py-4 sm:px-6 lg:px-8 bg-gteal rounded-lg cursor-default shadow-lg animate-pop-fade-in">
            <h4 className="pb-4">Total calories</h4>
            <div className="w-full max-w-md mx-auto">
              <Pie
                key={`${selectedDay}-${windowWidth}`}
                data={chartData}
                redraw={true}
                options={{ maintainAspectRatio: true, responsive: true }}
              />
            </div>
          </div>
          <div
            className="w-full px-4 py-4 sm:px-6 lg:px-8 bg-gteal rounded-lg cursor-default shadow-lg animate-pop-fade-in"
            style={{ animationDelay: "0.08s" }}
          >
            <div className="flex flex-col">
              <h4>Week</h4>
              <div className="flex flex-col md:flex-row gap-4">
                {weekDates.map((date, index) => {
                  const dateKey = toYYYYMMDDLocal(date);
                  const dayTotal = weeklyTotalsByDate[dateKey]?.calories ?? 0;
                  const isSelected = selectedDay === dateKey;

                  return (
                    <div
                      key={dateKey}
                      onClick={() => setSelectedDay(dateKey)}
                      className={`w-full px-4 py-6 sm:px-6 lg:px-8 rounded-lg cursor-pointer shadow-lg transition duration-300 ease-in-out ${
                        isSelected
                          ? "bg-vgreen text-white"
                          : "bg-lgteal hover:bg-vgreen hover:text-white"
                      }`}
                    >
                      <div>{daysOfWeek[index]}</div>
                      <div className="text-sm">{dayTotal} cal</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {selectedDay ? (
          <div
            className="min-h-0 w-full h-full mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-gteal rounded-lg cursor-default shadow-lg overflow-y-auto animate-pop-fade-in"
            style={{ animationDelay: "0.16s" }}
          >
            <h1>Daily plan</h1>

            <div>
              <h4>Breakfast</h4>
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <th className="w-2/5 text-left">Name:</th>
                    <th className="w-1/6 text-right">Calories:</th>
                    <th className="w-1/6 text-right">Protein:</th>
                    <th className="w-1/6 text-right">Carbs:</th>
                    <th className="w-1/6 text-right">Fat:</th>
                    <th className="w-1/12 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {breakfastData.map((item, index) => (
                    <tr key={index}>
                      <td className="text-left py-1">{item.name}</td>
                      <td className="text-right py-1">{item.calories}</td>
                      <td className="text-right py-1">{item.protein}g</td>
                      <td className="text-right py-1">{item.carbs}g</td>
                      <td className="text-right py-1">{item.fat}g</td>
                      <td className="text-right py-1">
                        <button
                          onClick={() => handleRemoveItem(item.id, "breakfast")}
                          className="px-3 py-1 text-sm bg-teal text-white rounded-md hover:bg-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
                          title="Removed from plan"
                        >
                          -
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4>Lunch</h4>
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <th className="w-2/5 text-left">Name:</th>
                    <th className="w-1/6 text-right">Calories:</th>
                    <th className="w-1/6 text-right">Protein:</th>
                    <th className="w-1/6 text-right">Carbs:</th>
                    <th className="w-1/6 text-right">Fat:</th>
                    <th className="w-1/12 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {lunchData.map((item, index) => (
                    <tr key={index}>
                      <td className="text-left py-1">{item.name}</td>
                      <td className="text-right py-1">{item.calories}</td>
                      <td className="text-right py-1">{item.protein}g</td>
                      <td className="text-right py-1">{item.carbs}g</td>
                      <td className="text-right py-1">{item.fat}g</td>
                      <td className="text-right py-1">
                        <button
                          onClick={() => handleRemoveItem(item.id, "lunch")}
                          className="px-3 py-1 text-sm bg-teal text-white rounded-md hover:bg-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
                          title="Removed from plan"
                        >
                          -
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4>Dinner</h4>
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <th className="w-2/5 text-left">Name:</th>
                    <th className="w-1/6 text-right">Calories:</th>
                    <th className="w-1/6 text-right">Protein:</th>
                    <th className="w-1/6 text-right">Carbs:</th>
                    <th className="w-1/6 text-right">Fat:</th>
                    <th className="w-1/12 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {dinnerData.map((item, index) => (
                    <tr key={index}>
                      <td className="text-left py-1">{item.name}</td>
                      <td className="text-right py-1">{item.calories}</td>
                      <td className="text-right py-1">{item.protein}g</td>
                      <td className="text-right py-1">{item.carbs}g</td>
                      <td className="text-right py-1">{item.fat}g</td>
                      <td className="text-right py-1">
                        <button
                          onClick={() => handleRemoveItem(item.id, "dinner")}
                          className="px-3 py-1 text-sm bg-teal text-white rounded-md hover:bg-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
                          title="Removed from plan"
                        >
                          -
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4>Total</h4>
              <p className="text-lg font-semibold">{totalCalories} calories</p>
              <p className="text-md">Protein: {totalProtein}g</p>
              <p className="text-md">Carbs: {totalCarbs}g</p>
              <p className="text-md">Fat: {totalFat}g</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
