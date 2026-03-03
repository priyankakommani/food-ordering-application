'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  country: string;
}

export default function Navbar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const apolloClient = useApolloClient();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    await apolloClient.clearStore();
    router.replace('/login');
  };

  const roleColor = {
    ADMIN: 'bg-purple-100 text-purple-700',
    MANAGER: 'bg-blue-100 text-blue-700',
    MEMBER: 'bg-green-100 text-green-700',
  }[user?.role || 'MEMBER'] || 'bg-gray-100 text-gray-700';

  const countryFlag = user?.country === 'INDIA' ? '🇮🇳' : user?.country === 'AMERICA' ? '🇺🇸' : '🌍';

  const tabs = [
    { id: 'restaurants', label: '🍽️ Restaurants', roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
    { id: 'orders', label: '📦 My Orders', roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
    { id: 'all-orders', label: '📋 All Orders', roles: ['ADMIN', 'MANAGER'] },
    { id: 'payments', label: '💳 Payments', roles: ['ADMIN'] },
    { id: 'team', label: '👥 Team', roles: ['ADMIN', 'MANAGER'] },
  ].filter(t => !user || t.roles.includes(user.role));

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold text-orange-500">🍕 Slooze</div>
            <div className="hidden md:flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-lg">{countryFlag}</span>
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColor}`}>
                  {user.role}
                </span>
              </div>
            )}
            <button
              onClick={logout}
              className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
