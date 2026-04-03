import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';

export default function Main() {
    return (
        <div>
            {/* Simple Top Navigation */}
            <nav className="p-4 bg-gray-800 text-white flex gap-4">
                <Link to="/">الرئيسية</Link>
                <Link to="/login">تسجيل الدخول</Link>
                <Link to="/register">إنشاء حساب</Link>
                <Link to="/dashboard">لوحة التحكم</Link>
            </nav>

            <div className="min-h-screen bg-gray-100">
                <Routes>
                    <Route path="/" element={<div className="p-8 text-center"><h1 className="text-3xl font-bold">الرئيسية (React SPA)</h1></div>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </div>
        </div>
    );
}