import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from "./components/navbar.jsx";
import Settings from "./pages/settings.jsx";
import Home from "./pages/home.jsx";
import Community from './pages/community.jsx';
import MenuPage from './pages/menuPage.jsx';
import Welcome from "./pages/welcome.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";


function AppLayout() {
    const location = useLocation();
    const hideNavbarPaths = [
        "/",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
    ];
    const showNavbar = !hideNavbarPaths.includes(location.pathname);

    return (
        <div className="min-h-screen flex flex-col">
            {showNavbar ? <Navbar /> : null}
            <main className="flex-1 w-full">
                <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/home" element={<Home/>} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
            </main>
        </div>
    )
}

function App() {
    return (
        <BrowserRouter>
            <AppLayout />
        </BrowserRouter>
    )
}

export default App