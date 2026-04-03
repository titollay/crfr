import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AuthenticatedLayout({ children }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout');
        } catch (e) {
            console.error(e);
        }
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
                <Link to="/dashboard" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">لوحة التحكم</Link>
                <div className="flex items-center gap-4">
                    <button onClick={handleLogout} className="text-red-600 font-bold hover:underline transition-all">
                        تسجيل الخروج
                    </button>
                </div>
            </nav>
            <main className="p-8 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
}
