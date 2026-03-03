'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import RestaurantsTab from '@/components/RestaurantsTab';
import OrdersTab from '@/components/OrdersTab';
import PaymentsTab from '@/components/PaymentsTab';
import TeamTab from '@/components/TeamTab';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('restaurants');
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Role Banner */}
      <div className={`py-2 text-center text-sm font-medium ${
        user.role === 'ADMIN' ? 'bg-purple-600 text-white' :
        user.role === 'MANAGER' ? 'bg-blue-600 text-white' :
        'bg-green-600 text-white'
      }`}>
        Logged in as <strong>{user.name}</strong> · {user.role} · 
        {user.role === 'ADMIN' ? ' 🌍 Global Access' : user.country === 'INDIA' ? ' 🇮🇳 India Region' : ' 🇺🇸 America Region'}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'restaurants' && <RestaurantsTab user={user} />}
        {activeTab === 'orders' && <OrdersTab user={user} showAll={false} />}
        {activeTab === 'all-orders' && ['ADMIN', 'MANAGER'].includes(user.role) && <OrdersTab user={user} showAll={true} />}
        {activeTab === 'payments' && user.role === 'ADMIN' && <PaymentsTab user={user} />}
        {activeTab === 'team' && ['ADMIN', 'MANAGER'].includes(user.role) && <TeamTab user={user} />}
      </main>
    </div>
  );
}
