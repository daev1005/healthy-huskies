import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import AddItemModal from './addItemModal';

export default function Menu({ location, mealPeriod }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState('');

    const [menuItems, setMenuItems] = useState([]);
    
    useEffect(() => {
        getMenuItems()
    }, [location, mealPeriod]);

    async function getMenuItems() {
        try {
            const { data, error } = await supabase // Destructure the Supabase call
                .from("menu_items") // From the "Groceries" table
                .select("*"); // Select (fetch) everything
            if (error) throw error; // If there is an error, throw it
            if (data != null) { // If there is data fetched
                
                const filteredData = [];

                for (let i = 0; i < data.length; i++) {
                    if ((!location || data[i].location === location) &&
                        (!mealPeriod || data[i].meal_period.includes(mealPeriod))) {
                        filteredData.push(data[i]);
                    }
                }
                setMenuItems(filteredData); // Set our groceries state variable to the data
            }
        } catch (error) {
            alert(error.message); // If an error is caught, alert it on the client
        }
    }

    return (
        <div>
            {menuItems.length > 0 ? menuItems.map((item) => (
                <div 
                    key={item.id} 
                    className="bg-egg rounded-lg p-4 mb-3 shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-green">{item.item_name}</h3>
                        <span className="text-sm px-2 py-1 bg-tea rounded-full text-green">
                            {item.meal_period}
                        </span>
                    </div>
        
                    <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                    
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex gap-4">
                            <span className="font-semibold">
                                {item.calories} <span className="text-gray-500 font-normal">cal</span>
                            </span>
                            <span className="font-semibold">
                                {item.protein}g <span className="text-gray-500 font-normal">protein</span>
                            </span>
                            <span className="font-semibold">
                                {item.carbs}g <span className="text-gray-500 font-normal">carbs</span>
                            </span>
                        </div>

                        <button onClick={() => {
                                setSelectedItem(item.item_name);
                                setModalOpen(true);
                            }}
                            className="ml-auto text-sm px-2 py-1 rounded-md shadow-md cursor-pointer hover:bg-blue hover:text-white bg-egg brightness-90 transition-all"
                        >
                            Add to plan
                        </button>

                        <AddItemModal 
                            name={selectedItem}
                            isOpen={modalOpen}
                            onClose={() => setModalOpen(false)}
                        />
                    </div>
                </div>
            )) : (
                <div className="bg-egg rounded-lg p-4 text-center text-gray-500">
                    No items found
                </div>
            )}
	    </div>
    );
}