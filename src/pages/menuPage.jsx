import React, { useState } from 'react';
import Menu from '../components/menu.jsx';

export default function MenuPage() {

    // 0 = breakfast, 1 = lunch, 2 = dinner
    const [mealPeriod, setMealPeriod] = useState(0);
    // these should match supabase names for meal periods
    const periods = ['breakfast', 'lunch', 'dinner'];

    // 0 = steast, 1 = IV. Names should match supabase names for locations
    const locations = ['steast', 'iv'];

    return (
        <div className="flex flex-row h-full">
            <div className="w-2/5 flex flex-col gap-6 py-6 m-4">
                <h1 className="w-full px-5 py-5 w-50 bg-tea rounded-lg">
                    Steast
                </h1>

                <div className={'px-5 py-5 bg-tea rounded-lg transition-all duration-500'}>
                    <Menu location={locations[0]} mealPeriod={periods[mealPeriod]}></Menu>
                </div>
            </div>

            <div className="w-2/5 flex flex-col gap-6 py-6 m-4">
                <h1 className="w-full px-5 py-5 w-50 bg-tea rounded-lg">
                    International Village
                </h1>

                <div className={'px-5 py-5 bg-tea rounded-lg transition-all duration-500'}>
                    <Menu location={locations[1]} mealPeriod={periods[mealPeriod]}></Menu>
                </div>
            </div>

            <div className="w-1/5 h-full flex flex-col gap-6 py-6">
                <div className="w-full h-full px-5 py-5 bg-tea">
                    <h2 className="text-center">
                        Meal Period
                    </h2>

                    <div onClick={() => setMealPeriod(0)}
                        className={`px-5 py-5 my-5 rounded-lg shadow-lg cursor-pointer transition-all ${
                            mealPeriod === 0 
                                ? 'bg-blue text-white brightness-100' 
                                : 'bg-egg brightness-90'
                        }`}
                    >
                        Breakfast
                    </div>

                    <div onClick={() => setMealPeriod(1)}
                        className={`px-5 py-5 my-5 rounded-lg shadow-lg cursor-pointer transition-all ${
                            mealPeriod === 1 
                                ? 'bg-blue text-white brightness-100' 
                                : 'bg-egg brightness-90'
                        }`}
                    >
                        Lunch
                    </div>

                    <div onClick={() => setMealPeriod(2)}
                        className={`px-5 py-5 my-5 rounded-lg shadow-lg cursor-pointer transition-all ${
                            mealPeriod === 2 
                                ? 'bg-blue text-white brightness-100' 
                                : 'bg-egg brightness-90'
                        }`}
                    >
                        Dinner
                    </div>
                </div>
            </div>
        </div>
    )
}