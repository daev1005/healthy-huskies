import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function AddItemModal({ name, isOpen, onClose }) {
    const [selectedDay, setSelectedDay] = useState('');

    const handleSubmit = async () => {
        if (!selectedDay) {
            alert('Please select a day');
            return;
        }
        await addItemToPlanner(name, selectedDay);
        onClose(); // Close modal after adding
    };

    if (!isOpen) return null; // Don't render if not open

    return (
        <div className="fixed inset-0 bg-grey bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                <h2 className="text-xl font-bold mb-4">Add to Meal Plan</h2>
                
                <p className="text-gray-600 mb-4">
                    Adding: <span className="font-semibold text-green">{name}</span>
                </p>
                
                <label className="block mb-2 text-sm font-medium">
                    Select Day:
                </label>
                <select 
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                >
                    <option value="">Choose a day...</option>
                    <option value="mon">Monday</option>
                    <option value="tue">Tuesday</option>
                    <option value="wed">Wednesday</option>
                    <option value="thu">Thursday</option>
                    <option value="fri">Friday</option>
                    <option value="sat">Saturday</option>
                    <option value="sun">Sunday</option>
                </select>
                
                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue text-white rounded-md hover:bg-opacity-80 transition-all"
                    >
                        Add to Plan
                    </button>
                </div>
            </div>
        </div>
    );
}

async function addItemToPlanner(name, day) {
    try {
        const { data, error } = await supabase // Destructuring our Supabase call
            .from("day_item")
            .insert({ menu_item: name, date: day })
            .single(); // Only insert it once
        if (error) throw error; // If there is an error, throw it
        window.location.reload(); // Load the window once complete
    } catch (error) {
        alert(error.message); // If an error is caught, alert it on screen
    }
}