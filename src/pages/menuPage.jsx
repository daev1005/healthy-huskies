import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function MenuPage() {
  const LOCATION_IDS = {
    IV: "5f4f8a425e42ad17329be131",
    steast: "586d05e4ee596f6e6c04b527"  // This is your Stetson East ID
};
  const today = new Date().toLocaleDateString('en-CA');
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

  // Function to add item to plan table
const addItemToPlan = async (item, mealType) => {
  const itemKey = `${mealType}-${item.name}`;
  setAddingItems(prev => ({ ...prev, [itemKey]: true }));

  try {
    // First, try to find the item in the appropriate table (breakfast/lunch/dinner) to get its calories
    // Use limit(1) to handle cases where there might be duplicates
    let { data: mealItems, error: findError } = await supabase
      .from(mealType)
      .select("calories")
      .eq("name", item.name)
      .limit(1); // Get first match if duplicates exist

    if (findError) throw findError;

    let mealItem = mealItems && mealItems.length > 0 ? mealItems[0] : null;

    // If item not found, insert it into the meal table first
    if (!mealItem) {
      console.log(`Item "${item.name}" not found in ${mealType} table, inserting it first...`);
      
      const { data: insertedMealItems, error: insertMealError } = await supabase
        .from(mealType)
        .insert({
          name: item.name,
          calories: item.calories || null,
        })
        .select("calories");

      if (insertMealError) {
        throw new Error(`Failed to insert item into ${mealType} table: ${insertMealError.message}`);
      }

      if (!insertedMealItems || insertedMealItems.length === 0) {
        throw new Error(`Failed to get ID after inserting item into ${mealType} table`);
      }

      mealItem = insertedMealItems[0];
      console.log(`Inserted "${item.name}" into ${mealType} table`);
    }

    // Prepare the insert object with meal_name, calories, meal_type, created_at, and date
    const planData = {
      meal_name: item.name, // Add the meal name
      calories: mealItem.calories || item.calories || null,
      meal_type: mealType,
      date: today, // Keep the date field
      created_at: new Date().toISOString(), // Add created_at timestamp
    };

    // Insert into plan table
    const { error: insertError } = await supabase
      .from("plan")
      .insert(planData);

    if (insertError) throw insertError;

    console.log(`Added ${item.name} to plan with ${mealItem.calories || 0} calories`);
    // You could show a success message here if needed
  } catch (error) {
    console.error("Error adding item to plan:", error);
    alert(`Failed to add ${item.name} to plan: ${error.message}`);
  } finally {
    setAddingItems(prev => ({ ...prev, [itemKey]: false }));
  }
};

  useEffect(() => {
    // Fetch all periods for a given date to find the current meal period IDs
    const fetchPeriods = async (date, locationId) => {
      try {
        // Add cache-busting parameter to get fresh data
        const response = await fetch(
          `/.netlify/functions/periods?date=${date}&location=${locationId}&_=${Date.now()}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching periods:", error);
        return null;
      }
    };

    const fetchMeals = async (date, periodId, locationId, retries = 2) => {
      const url = `/.netlify/functions/menu?date=${date}&period=${periodId}&location=${locationId}`;
      
      for (let i = 0; i <= retries; i++) {
        try {
          console.log(`Fetching meals from: ${url} (attempt ${i + 1}/${retries + 1})`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000); // Changed to 12 seconds

          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          // If it's a 503 (service unavailable), wait and retry
          if (response.status === 503 && i < retries) {
            const waitTime = (i + 1) * 2000; // 2s, 4s
            console.log(`Service unavailable, retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Raw API data:', data);
          
          return data;
          
        } catch (error) {
          if (error.name === "AbortError") {
            console.error("Request timed out for period:", periodId);
          } else {
            console.error("Error fetching meals:", error);
          }
          
          if (i === retries) {
            return null;
          }
          
          // Wait before retrying on any error
          console.log(`Request failed, retrying in 2s...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      return null;
    };

    const extractMenuItems = (data) => {
      console.log("Extracting menu items from data:", data);

      if (!data) return { items: [], status: null };

      // Check if location is closed
      if (
        data.closedOnDate ||
        !data.period?.categories ||
        data.period.categories.length === 0
      ) {
        console.log("Location closed or no categories");
        return {
          items: [],
          status: data.status || { label: "closed", message: "Not available" },
        };
      }

      const menuItems = data.period.categories.flatMap(
        (category) =>
          category.items?.map((item) => ({
            name: item.name,
            calories: item.calories || null,
          })) || []
      );

      console.log("Extracted menu items:", menuItems);

      return {
        items: menuItems.filter((item) => item.name),
        status: data.status,
      };
    };

    const insertMealsToSupabase = async (tableName, data) => {
      try {
        const menuItems =
          data.period?.categories?.flatMap(
            (category) =>
              category.items?.map((item) => ({
                name: item.name,
                calories: item.calories || null,
              })) || []
          ) || [];

        const validItems = menuItems.filter((item) => item.name);

        if (validItems.length > 0) {
          // Delete all existing rows in the table
          // Using .gte("id", 0) to match all rows with id >= 0 (standard auto-increment IDs)
          const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .gte("id", 0);

          if (deleteError) {
            console.error(`Error deleting old ${tableName}:`, deleteError);
            console.error("Delete error details:", deleteError.message, deleteError.code);
            // If delete fails due to foreign key constraints from plan table, 
            // we'll continue with insert (might create duplicates, but items will still be accessible)
            console.warn(`Delete failed, but will attempt insert anyway. If you see duplicates, set ON DELETE CASCADE on plan table foreign keys.`);
          } else {
            console.log(`Deleted old ${tableName} data`);
          }

          // Insert new items (use upsert if delete failed to avoid duplicates)
          // First, try regular insert
          let { data: insertedData, error: insertError } = await supabase
            .from(tableName)
            .insert(validItems)
            .select();

          // If insert fails due to unique constraint (duplicates), try to handle it
          if (insertError && insertError.code === '23505') {
            console.log(`Insert failed due to duplicates, cleaning up duplicates first...`);
            // Try to delete duplicates and re-insert
            // For now, just log - you may need to clean up manually or use upsert
          }

          if (insertError && insertError.code !== '23505') {
            console.error(`Error inserting into ${tableName}:`, insertError);
            console.error("Insert error details:", insertError.message, insertError.code, insertError.details);
          } else if (insertError && insertError.code === '23505') {
            console.warn(`Duplicates detected in ${tableName}. Consider cleaning up or using upsert strategy.`);
          } else {
            console.log(
              `${tableName} inserted successfully:`,
              validItems.length,
              "items"
            );
            if (insertedData) {
              console.log(`Inserted ${insertedData.length} rows into ${tableName}`);
            }
          }
        } else {
          console.warn(`No valid items to insert into ${tableName}`);
        }
      } catch (error) {
        console.error(`Error processing ${tableName}:`, error);
        // Don't throw - just log so menu items can still display even if Supabase insert fails
        console.warn(`Menu items may still be displayed despite Supabase error`);
      }
    };

    const loadMeals = async () => {
      setIsLoading(true);
      const locationId = LOCATION_IDS[selectedHall];
      try {
        // First, fetch the periods for today to get the current period IDs
        const periodsData = await fetchPeriods(today, locationId);
        console.log("Periods data:", periodsData);

        if (!periodsData || !periodsData.periods) {
          console.error("No periods found for today");
          setIsLoading(false);
          return;
        }

        // ========== DEBUG: LOG ALL PERIOD NAMES ==========
        console.log("=== ALL AVAILABLE PERIODS ===");
        periodsData.periods.forEach((p, index) => {
          console.log(`${index + 1}. Name: "${p.name}" | ID: ${p.id}`);
        });
        console.log("=================================");
        // ========== END DEBUG ==========

        // Find breakfast, lunch, and dinner period IDs
        const breakfastPeriod = periodsData.periods.find((p) =>
          p.name.toLowerCase().includes("breakfast")
        );
        const lunchPeriod = periodsData.periods.find((p) =>
          p.name.toLowerCase().includes("lunch")
        );
        const dinnerPeriod = periodsData.periods.find((p) =>
          p.name.toLowerCase().includes("dinner")
        );

        console.log("=== MATCHED PERIODS ===");
        console.log("Breakfast:", breakfastPeriod);
        console.log("Lunch:", lunchPeriod);
        console.log("Dinner:", dinnerPeriod);
        console.log("=======================");

        // Load meals SEQUENTIALLY with delays to avoid rate limiting
        if (breakfastPeriod) {
          try {
            const breakfastData = await fetchMeals(today, breakfastPeriod.id, locationId);
            const breakfastResult = extractMenuItems(breakfastData);
            setBreakfast(breakfastResult.items);
            setMealStatus(prev => ({ ...prev, breakfast: breakfastResult.status }));
            
            if (breakfastResult.items.length > 0) {
              await insertMealsToSupabase("breakfast", breakfastData);
            }
            console.log("Loaded breakfast meals");
          } catch (error) {
            console.error("Failed to load breakfast:", error);
            setBreakfast([]);
            setMealStatus(prev => ({ 
              ...prev, 
              breakfast: { label: "Error", message: "Failed to load" } 
            }));
          }
          // Wait 500ms before next request to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (lunchPeriod) {
          try {
            const lunchData = await fetchMeals(today, lunchPeriod.id, locationId);
            const lunchResult = extractMenuItems(lunchData);
            setLunch(lunchResult.items);
            setMealStatus(prev => ({ ...prev, lunch: lunchResult.status }));
            
            if (lunchResult.items.length > 0) {
              await insertMealsToSupabase("lunch", lunchData);
            }
            console.log("Loaded lunch meals");
          } catch (error) {
            console.error("Failed to load lunch:", error);
            setLunch([]);
            setMealStatus(prev => ({ 
              ...prev, 
              lunch: { label: "Error", message: "Failed to load" } 
            }));
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (dinnerPeriod) {
          try {
            const dinnerData = await fetchMeals(today, dinnerPeriod.id, locationId);
            const dinnerResult = extractMenuItems(dinnerData);
            setDinner(dinnerResult.items);
            setMealStatus(prev => ({ ...prev, dinner: dinnerResult.status }));
            
            if (dinnerResult.items.length > 0) {
              await insertMealsToSupabase("dinner", dinnerData);
            }
            console.log("Loaded dinner meals");
          } catch (error) {
            console.error("Failed to load dinner:", error);
            setDinner([]);
            setMealStatus(prev => ({ 
              ...prev, 
              dinner: { label: "Error", message: "Failed to load" } 
            }));
          }
        }

      } catch (error) {
        console.error("Error in loadMeals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMeals();
  }, [today, selectedHall]);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Dropdown */}
        <div className="bg-gteal rounded-lg shadow-lg px-6 py-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold text-vgreen">
              Menu for{" "}
              {new Date(today).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h1>

            {/* Dropdown */}
            <div className="flex items-center gap-3">
              <label
                htmlFor="dining-hall"
                className="text-sm font-medium text-teal"
              >
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

        {/* Meal Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Breakfast */}
          <div className="bg-gteal rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="bg-orange-500 px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">🌅 Breakfast</h2>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[500px]">
              {isLoading ? (
                <p className="text-blue italic">Loading menu...</p>
              ) : breakfast.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-red-600 font-semibold">
                    {mealStatus.breakfast?.label || "Closed"}
                  </p>
                  <p className="text-blue text-sm mt-1">
                    {mealStatus.breakfast?.message || "No menu available"}
                  </p>
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
                          {item.calories && (
                            <span className="text-sm text-gray-500 ml-2">
                              {item.calories} cal
                            </span>
                          )}
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

          {/* Lunch */}
          <div className="bg-gteal rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="bg-green-500 px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">☀️ Lunch</h2>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[500px]">
              {isLoading ? (
                <p className="text-blue italic">Loading menu...</p>
              ) : lunch.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-red-600 font-semibold">
                    {mealStatus.lunch?.label || "Closed"}
                  </p>
                  <p className="text-blue text-sm mt-1">
                    {mealStatus.lunch?.message || "No menu available"}
                  </p>
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
                          {item.calories && (
                            <span className="text-sm text-gray-500 ml-2">
                              {item.calories} cal
                            </span>
                          )}
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

          {/* Dinner */}
          <div className="bg-gteal rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="bg-indigo-500 px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">🌙 Dinner</h2>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[500px]">
              {isLoading ? (
                <p className="text-blue italic">Loading menu...</p>
              ) : dinner.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-red-600 font-semibold">
                    {mealStatus.dinner?.label || "Closed"}
                  </p>
                  <p className="text-blue text-sm mt-1">
                    {mealStatus.dinner?.message || "No menu available"}
                  </p>
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
                          {item.calories && (
                            <span className="text-sm text-gray-500 ml-2">
                              {item.calories} cal
                            </span>
                          )}
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