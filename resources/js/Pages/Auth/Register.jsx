import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import GuestLayout from '../../Layouts/GuestLayout';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [error, setError] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('/api/register', form);
            localStorage.setItem('token', response.data.access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
            navigate('/dashboard');
        } catch (err) {
            setError('حدث خطأ أثناء التسجيل، يرجى ملء الحقول بشكل صحيح.');
        }
    };

    return (
        <GuestLayout>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">إنشاء حساب جديد</h2>
            <form onSubmit={submit}>
                {error && <div className="mb-4 text-red-600 font-semibold p-3 bg-red-50 rounded-lg text-sm text-center">{error}</div>}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم</label>
                    <input type="text" onChange={e => setForm({...form, name: e.target.value})} required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 p-2 border" />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني</label>
                    <input type="email" onChange={e => setForm({...form, email: e.target.value})} required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 p-2 border" />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
                    <input type="password" onChange={e => setForm({...form, password: e.target.value})} required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 p-2 border" />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">تأكيد كلمة المرور</label>
                    <input type="password" onChange={e => setForm({...form, password_confirmation: e.target.value})} required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 p-2 border" />
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg font-bold shadow-lg transition-all transform hover:scale-105">
                    تأكيد التسجيل
                </button>
            </form>
            <div className="mt-6 text-center border-t pt-4">
                <Link to="/login" className="text-sm font-medium text-teal-600 hover:text-teal-800 hover:underline transition-colors">لديك حساب بالفعل؟ قم بالدخول</Link>
            </div>
        </GuestLayout>
    );
}
