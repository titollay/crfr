import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        axios.get('/api/user').then((res) => {
            setUser(res.data);
        }).catch((err) => {
            console.error(err);
            localStorage.removeItem('token');
            navigate('/login');
        });
    }, [navigate]);

    if (!user) return <div className="text-center mt-20 text-gray-500">جاري التحميل...</div>;

    return (
        <AuthenticatedLayout>
            <div className="bg-white overflow-hidden shadow-lg border border-gray-100 sm:rounded-xl p-8 transition-all hover:shadow-xl">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">أهلاً بك، <span className="text-blue-600">{user.name}</span>!</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                    أنت الآن تستخدم تطبيق <strong className="text-teal-600">React SPA</strong> مستقل بالكامل.<br/>
                    هذه الواجهة تم فصلها تماماً عن Inertia وهي تتواصل مع خوادم Laravel كـ API (JSON) فقط، مما يوفر أداء أقوى ومرونة عالية للتطوير مستقبلاً.
                </p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-blue-50 rounded-lg shadow-inner">
                        <h3 className="font-bold text-xl text-blue-800">الدورات (Courses)</h3>
                        <p className="mt-2 text-sm text-blue-600">يمكنك هنا عرض وتعديل بيانات الدورات عبر نظام API.</p>
                    </div>
                    <div className="p-6 bg-teal-50 rounded-lg shadow-inner">
                        <h3 className="font-bold text-xl text-teal-800">الحجوزات (Bookings)</h3>
                        <p className="mt-2 text-sm text-teal-600">إدارة حجوزات المستخدمين بكل سهولة عبر React.</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
