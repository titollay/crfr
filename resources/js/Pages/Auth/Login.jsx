import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import GuestLayout from '../../Layouts/GuestLayout';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('/api/login', { email, password });
            localStorage.setItem('token', response.data.access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
            navigate('/dashboard');
        } catch (err) {
            setError('البيانات المدخلة غير صحيحة، يرجى المحاولة مرة أخرى.');
        }
    };

    return (
        <GuestLayout>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">تسجيل الدخول</h2>
            <form onSubmit={submit}>
                {error && <div className="mb-4 text-red-600 font-semibold p-3 bg-red-50 rounded-lg text-sm text-center">{error}</div>}
                <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 p-2 border" placeholder="user@example.com" />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 p-2 border" placeholder="••••••••" />
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-bold shadow-lg transition-all transform hover:scale-105">
                    دخول
                </button>
            </form>
            <div className="mt-6 text-center border-t pt-4">
                <Link to="/register" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors">ليس لديك حساب؟ تسجل الآن</Link>
            </div>
        </GuestLayout>
    );
}
