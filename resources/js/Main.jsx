import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import Home from './Home';

export default function Main() {
    return (
        <div>
            {/* Simple Top Navigation */}
           

            <div className="min-h-screen">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </div>
        </div>
    );
}