import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from "./components/navbar.jsx";
import Settings from "./pages/settings.jsx";
import Home from "./pages/home.jsx";
import Community from './pages/community.jsx';
import MenuPage from './pages/menuPage.jsx';

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/"  element={<Home/>} />
                 <Route path="/community" element={<Community />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/menu" element={<MenuPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App