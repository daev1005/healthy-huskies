import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { supabase } from "../supabase";
ChartJS.register(ArcElement, Tooltip, Legend);

const today = new Date();

// gets the dates for the current week (Sunday to Saturday)
function getDatesForWeek() {
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek); // Go back to Sunday

  const week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    week.push(date);
  }
  return week;
}

// days
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Home() {
  const weekDates = getDatesForWeek();
  const [selectedDay, setSelectedDay] = useState(today.toDateString());
  const [weekMeals, setWeekMeals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Get the day of week index from the selected date
  const selectedDate = new Date(selectedDay);
  const selectedDayIndex = selectedDate.getDay(); // 0-6 (Sun-Sat)
  const shortDayName = daysOfWeek[selectedDayIndex];

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchMeals() {
      try {
        setLoading(true);
        console.log("Starting to fetch meals...");

        const { data, error } = await supabase.from("day_item").select(`
          date,
          menu_item:menu_items!menu_item (
            item_name,
            calories,
            meal_period
          )
        `);

        console.log("Supabase response:", { data, error });

        if (error) throw error;

        // Transform the data
        const transformedData = {};

        data.forEach((item) => {
          const day = item.date; // "Sun", "Mon", etc.
          const mealPeriod = item.menu_item.meal_period.toLowerCase(); // "breakfast", "lunch", "dinner"

          // Initialize day if it doesn't exist
          if (!transformedData[day]) {
            transformedData[day] = {
              breakfast: [],
              lunch: [],
              dinner: [],
            };
          }

          // Add the meal to the appropriate meal period
          transformedData[day][mealPeriod].push({
            name: item.menu_item.item_name,
            calories: item.menu_item.calories,
          });
        });

        console.log("Transformed data:", transformedData);
        setWeekMeals(transformedData);
      } catch (error) {
        console.error("Error fetching meals:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMeals();
  }, []);

  // Now use the short day name to get meals
  const dayMeals = weekMeals[shortDayName] || null;
  const breakfastData = dayMeals?.breakfast || [];
  const lunchData = dayMeals?.lunch || [];
  const dinnerData = dayMeals?.dinner || [];

  // Add this useEffect to track window resizing
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const totalCalories =
  breakfastData.reduce((sum, meal) => sum + meal.calories, 0) +
  lunchData.reduce((sum, meal) => sum + meal.calories, 0) +
  dinnerData.reduce((sum, meal) => sum + meal.calories, 0);
  
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
    <div className="flex flex-col gap-6 py-5">
      <div className="flex flex-col md:flex-row justify-center gap-6 px-8">
        <div className="w-full flex flex-col justify-start gap-6">
          <div className="w-full mx-auto px-4 py-4 sm:px-6 lg:px-8 bg-tea rounded-lg cursor-default shadow-lg">
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
          <div className=" w-full px-4 py-4 sm:px-6 lg:px-8 bg-tea rounded-lg cursor-default shadow-lg">
            <div className="flex flex-col">
              <h4>Week</h4>
              <div className="flex flex-col md:flex-row gap-4">
                {weekDates.map((date, index) => (
                  <div
                    key={date.toDateString()}
                    onClick={() => setSelectedDay(date.toDateString())}
                    className={`w-full px-4 py-6 sm:px-6 lg:px-8 rounded-lg cursor-pointer shadow-lg transition duration-300 ease-in-out
                                        ${
                                          selectedDay === date.toDateString()
                                            ? "bg-darktea text-white"
                                            : "bg-lightertea hover:bg-darktea hover:text-white"
                                        }`}
                  >
                    {daysOfWeek[index]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedDay ? (
          <div className="w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-tea rounded-lg cursor-default shadow-lg">
            <h1>Daily plan</h1>

            <div>
              <h4>Breakfast</h4>
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <th className="w-2/3 text-left">Name:</th>
                    <th className="w-1/3 text-right">Calories:</th>
                  </tr>
                </thead>
                <tbody>
                  {breakfastData.map((item, index) => (
                    <tr key={index}>
                      <td className="text-left">{item.name}</td>
                      <td className="text-right">{item.calories}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4>Lunch</h4>
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <th className="w-2/3 text-left">Name:</th>
                    <th className="w-1/3 text-right">Calories:</th>
                  </tr>
                </thead>
                <tbody>
                  {lunchData.map((item, index) => (
                    <tr key={index}>
                      <td className="text-left">{item.name}</td>
                      <td className="text-right">{item.calories}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4>Dinner</h4>
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <th className="w-2/3 text-left">Name:</th>
                    <th className="w-1/3 text-right">Calories:</th>
                  </tr>
                </thead>
                <tbody>
                  {dinnerData.map((item, index) => (
                    <tr key={index}>
                      <td className="text-left">{item.name}</td>
                      <td className="text-right">{item.calories}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4>Total</h4>
              <p className="text-lg font-semibold">{totalCalories} calories</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
