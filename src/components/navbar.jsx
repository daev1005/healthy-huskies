import React, {useState} from "react";
import {Menu, X} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    function toggleMenu() {
        setIsOpen(!isOpen);
    }

    return (
        <nav className="bg-tea text-green relative z-50" style={{boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'}}>
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14">
                    {/*Logo*/}
                    <div className="flex-shrink-0 pt-3" >
                        <h1 className="text-2xl font-display font-bold cursor-default">Healthy Huskies</h1>
                    </div>
                    <div className="hidden lg:flex space-x-8 items-center ml-auto">
                        <Link to='/' className="text-1xl font-display font-bold hover:text-blue border-b-2 border-transparent hover:border-blue transition-all duration-300 ease-in-out pb-1">
                            Home
                        </Link>
                        <Link to='/menu' className="text-1xl font-display font-bold hover:text-blue border-b-2 border-transparent hover:border-blue transition-all duration-300 ease-in-out pb-1">
                            Menu
                        </Link>
                        <Link to='/community' className="text-1xl font-display font-bold hover:text-blue border-b-2 border-transparent hover:border-blue transition-all duration-300 ease-in-out pb-1">
                            Community
                        </Link>
                        <Link to='/settings' className="text-1xl font-display font-bold hover:text-blue border-b-2 border-transparent hover:border-blue transition-all duration-300 ease-in-out pb-1">
                            Settings
                        </Link>
                    </div>
                    <div className={"lg:hidden"}>
                        <button onClick={toggleMenu} className="inline-flex items-center ml-auto p-2 rounded-md transition-all duration-300">
                            <div className="relative w-7 h-7">
                                {/* Menu icon */}
                                <Menu
                                    size={28}
                                    className={`absolute transition-all duration-300 ease-in-out ${
                                        isOpen
                                            ? 'opacity-0 rotate-90 scale-0'
                                            : 'opacity-100 rotate-0 scale-100'
                                    }`}
                                />
                                {/* X icon */}
                                <X
                                    size={28}
                                    className={`absolute transition-all duration-300 ease-in-out ${
                                        isOpen
                                            ? 'opacity-100 rotate-0 scale-100'
                                            : 'opacity-0 -rotate-90 scale-0'
                                    }`}
                                />
                            </div>
                        </button>
                    </div>
                </div>
                <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-2 py-2 bg-tea">
                        <Link to='/' onClick={toggleMenu} className="block text-xl font-display font-bold hover:text-blue border-b-2 border-transparent hover:border-blue transition-all duration-300 ease-in-out pb-1">
                            Home
                        </Link>
                        <Link to='/menu' onClick={toggleMenu} className="block text-xl font-display font-bold hover:text-blue border-b-2 border-transparent hover:border-blue transition-all duration-300 ease-in-out pb-1">
                            Menu
                        </Link>
                        <Link to='/community' onClick={toggleMenu}  className="block text-xl font-display font-bold hover:text-blue border-b-2 border-transparent hover:border-blue transition-all duration-300 ease-in-out pb-1">
                            Community
                        </Link>
                        <Link to='/settings' onClick={toggleMenu} className="block text-xl font-display font-bold hover:text-blue border-b-2 border-transparent hover:border-blue transition-all duration-300 ease-in-out pb-1">
                            Settings
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}