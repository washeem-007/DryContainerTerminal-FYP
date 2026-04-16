import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * TopNavbar — Shared navigation bar for all pages.
 *
 * Props:
 *   children — Optional nav link buttons to render in the left section.
 *
 * Usage:
 *   <TopNavbar>
 *     <button onClick={() => navigate('/dashboard')}>Dashboard</button>
 *   </TopNavbar>
 */
const TopNavbar = ({ children }) => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const role = user?.role;

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
            {/* Left: Logo + Nav Links */}
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <img
                        src="https://i.ibb.co/8L2fs8MT/worldwide-shipping.png"
                        alt="PortZen"
                        className="w-8 h-8 object-contain"
                    />
                    <span className="text-xl font-bold text-gray-900">PortZen</span>
                </div>
                {children && (
                    <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500">
                        {children}
                    </div>
                )}
            </div>

            {/* Right: User Profile + Logout */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user?.username?.slice(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">{user?.username}</span>
                    <span className="text-[10px] text-gray-400">{role}</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="ml-2 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default TopNavbar;
