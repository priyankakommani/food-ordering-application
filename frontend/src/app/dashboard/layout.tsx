'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const stored = localStorage.getItem('user');
        if (!token || !stored) {
            router.replace('/login');
            return;
        }
        setUser(JSON.parse(stored));
    }, []);

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    // Determine active tab from pathname
    const activeTab = pathname.split('/').pop() || 'restaurants';

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar activeTab={activeTab} setActiveTab={(tab) => router.push(`/dashboard/${tab}`)} />

            {/* Role Banner */}
            <div className={`py-2 text-center text-sm font-medium ${user.role === 'ADMIN' ? 'bg-purple-600 text-white' :
                    user.role === 'MANAGER' ? 'bg-blue-600 text-white' :
                        'bg-green-600 text-white'
                }`}>
                Logged in as <strong>{user.name}</strong> · {user.role} ·
                {user.role === 'ADMIN' ? ' 🌍 Global Access' : user.country === 'INDIA' ? ' 🇮🇳 India Region' : ' 🇺🇸 America Region'}
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
