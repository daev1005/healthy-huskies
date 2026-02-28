import React, { useEffect, useState } from "react";
import { createMeal } from "../api/meals";

const LOCATION_IDS = {
  IV: "5f4f8a425e42ad17329be131",
  steast: "586d05e4ee596f6e6c04b527",
};

const toNumberOrZero = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const findNutrient = (item, keys) => {
  for (const key of keys) {
    if (item[key] !== undefined) return toNumberOrZero(item[key]);
  }

  if (Array.isArray(item.nutrients)) {
    for (const nutrient of item.nutrients) {
      const name = String(nutrient?.name || nutrient?.label || "").toLowerCase();
      if (keys.some((k) => name.includes(k.toLowerCase()))) {
        return toNumberOrZero(nutrient?.value);
      }
    }
  }

  if (item.macros && typeof item.macros === "object") {
    for (const key of keys) {
      if (item.macros[key] !== undefined) return toNumberOrZero(item.macros[key]);
    }
  }

  return 0;
};

export default function MenuPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const today = new Date().toLocaleDateString("en-CA");
  const [breakfast, setBreakfast] = useState([]);
  const [lunch, setLunch] = useState([]);
  const [dinner, setDinner] = useState([]);
  const [selectedHall, setSelectedHall] = useState("IV");
  const [isLoading, setIsLoading] = useState(true);
  const [mealStatus, setMealStatus] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
  });
  const [addingItems, setAddingItems] = useState({});

  const addItemToPlan = async (item, mealType) => {
    const itemKey = `${mealType}-${item.name}`;
    setAddingItems((prev) => ({ ...prev, [itemKey]: true }));

    try {
      await createMeal({
        name: item.name,
        calories: toNumberOrZero(item.calories),
        protein: toNumberOrZero(item.protein),
        carbs: toNumberOrZero(item.carbs),
        fat: toNumberOrZero(item.fat),
        mealTime: mealType,
        notes: "Added from dining menu",
      });
    } catch (error) {
      alert(`Failed to add ${item.name} to plan: ${error.message}`);
    } finally {
      setAddingItems((prev) => ({ ...prev, [itemKey]: false }));
    }
  };

  useEffect(() => {
    const fetchPeriods = async (date, locationId) => {
      try {
        const response = await fetch(
          `${API_URL}/api/dining/periods?date=${date}&location=${locationId}&_=${Date.now()}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error fetching periods:", error);
        return null;
      }
    };

    const fetchMeals = async (date, periodId, locationId, retries = 2) => {
      const url = `${API_URL}/api/dining/menu?date=${date}&period=${periodId}&location=${locationId}`;

      for (let i = 0; i <= retries; i++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (response.status === 503 && i < retries) {
            await new Promise((resolve) => setTimeout(resolve, (i + 1) * 2000));
            continue;
          }

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          return await response.json();
        } catch (error) {
          if (i === retries) {
            console.error("Error fetching meals:", error);
            return null;
          }

          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      return null;
    };

    const extractMenuItems = (data) => {
      if (!data) return { items: [], status: null };

      if (data.closedOnDate || !data.period?.categories || data.period.categories.length === 0) {
        return {
          items: [],
          status: data.status || { label: "closed", message: "Not available" },
        };
      }

      const menuItems = data.period.categories.flatMap(
        (category) =>
          category.items?.map((item) => ({
            name: item.name,
            calories: toNumberOrZero(item.calories),
            protein: findNutrient(item, ["protein"]),
            carbs: findNutrient(item, ["carbs", "carbohydrates"]),
            fat: findNutrient(item, ["fat", "total fat"]),
          })) || []
      );

      return {
        items: menuItems.filter((item) => item.name),
        status: data.status,
      };
    };

    const loadMeals = async () => {
      setIsLoading(true);
      const locationId = LOCATION_IDS[selectedHall];

      try {
        const periodsData = await fetchPeriods(today, locationId);
        if (!periodsData?.periods) {
          setIsLoading(false);
          return;
        }

        const breakfastPeriod = periodsData.periods.find((p) => p.name.toLowerCase().includes("breakfast"));
        const lunchPeriod = periodsData.periods.find((p) => p.name.toLowerCase().includes("lunch"));
        const dinnerPeriod = periodsData.periods.find((p) => p.name.toLowerCase().includes("dinner"));

        if (breakfastPeriod) {
          const breakfastData = await fetchMeals(today, breakfastPeriod.id, locationId);
          const breakfastResult = extractMenuItems(breakfastData);
          setBreakfast(breakfastResult.items);
          setMealStatus((prev) => ({ ...prev, breakfast: breakfastResult.status }));
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        if (lunchPeriod) {
          const lunchData = await fetchMeals(today, lunchPeriod.id, locationId);
          const lunchResult = extractMenuItems(lunchData);
          setLunch(lunchResult.items);
          setMealStatus((prev) => ({ ...prev, lunch: lunchResult.status }));
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        if (dinnerPeriod) {
          const dinnerData = await fetchMeals(today, dinnerPeriod.id, locationId);
          const dinnerResult = extractMenuItems(dinnerData);
          setDinner(dinnerResult.items);
          setMealStatus((prev) => ({ ...prev, dinner: dinnerResult.status }));
        }
      } catch (error) {
        console.error("Error in loadMeals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMeals();
  }, [today, selectedHall, API_URL]);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gteal rounded-lg shadow-lg px-6 py-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold text-vgreen">
              Menu for {" "}
              {new Date(today).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h1>

            <div className="flex items-center gap-3">
              <label htmlFor="dining-hall" className="text-sm font-medium text-teal">
                Dining Hall:
              </label>
              <select
                id="dining-hall"
                value={selectedHall}
                onChange={(e) => setSelectedHall(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
              >
                <option value="IV">IV</option>
                <option value="steast">Steast</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gteal rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="bg-orange-500 px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Breakfast</h2>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[500px]">
              {isLoading ? (
                <p className="text-blue italic">Loading menu...</p>
              ) : breakfast.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-red-600 font-semibold">{mealStatus.breakfast?.label || "Closed"}</p>
                  <p className="text-blue text-sm mt-1">{mealStatus.breakfast?.message || "No menu available"}</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {breakfast.map((item, index) => {
                    const itemKey = `breakfast-${item.name}`;
                    const isAdding = addingItems[itemKey];
                    return (
                      <li
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-blue">{item.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {item.calories} cal | P {item.protein}g | C {item.carbs}g | F {item.fat}g
                          </span>
                        </div>
                        <button
                          onClick={() => addItemToPlan(item, "breakfast")}
                          disabled={isAdding}
                          className="px-3 py-1 text-sm bg-teal text-white rounded-md hover:bg-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
                          title="Add to plan"
                        >
                          {isAdding ? "..." : "+"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-gteal rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="bg-green-500 px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Lunch</h2>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[500px]">
              {isLoading ? (
                <p className="text-blue italic">Loading menu...</p>
              ) : lunch.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-red-600 font-semibold">{mealStatus.lunch?.label || "Closed"}</p>
                  <p className="text-blue text-sm mt-1">{mealStatus.lunch?.message || "No menu available"}</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {lunch.map((item, index) => {
                    const itemKey = `lunch-${item.name}`;
                    const isAdding = addingItems[itemKey];
                    return (
                      <li
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-blue">{item.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {item.calories} cal | P {item.protein}g | C {item.carbs}g | F {item.fat}g
                          </span>
                        </div>
                        <button
                          onClick={() => addItemToPlan(item, "lunch")}
                          disabled={isAdding}
                          className="px-3 py-1 text-sm bg-teal text-white rounded-md hover:bg-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
                          title="Add to plan"
                        >
                          {isAdding ? "..." : "+"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-gteal rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="bg-indigo-500 px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Dinner</h2>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[500px]">
              {isLoading ? (
                <p className="text-blue italic">Loading menu...</p>
              ) : dinner.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-red-600 font-semibold">{mealStatus.dinner?.label || "Closed"}</p>
                  <p className="text-blue text-sm mt-1">{mealStatus.dinner?.message || "No menu available"}</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {dinner.map((item, index) => {
                    const itemKey = `dinner-${item.name}`;
                    const isAdding = addingItems[itemKey];
                    return (
                      <li
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-blue">{item.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {item.calories} cal | P {item.protein}g | C {item.carbs}g | F {item.fat}g
                          </span>
                        </div>
                        <button
                          onClick={() => addItemToPlan(item, "dinner")}
                          disabled={isAdding}
                          className="px-3 py-1 text-sm bg-teal text-white rounded-md hover:bg-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
                          title="Add to plan"
                        >
                          {isAdding ? "..." : "+"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
