'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RestaurantsTab from '@/components/RestaurantsTab';
import OrdersTab from '@/components/OrdersTab';
import PaymentsTab from '@/components/PaymentsTab';
import TeamTab from '@/components/TeamTab';

export default function DashboardTab() {
    const { tab } = useParams();
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    if (!user) return null;

    // Validation: if user is not ADMIN, they can't access payments
    if (tab === 'payments' && user.role !== 'ADMIN') {
        router.replace('/dashboard/restaurants');
        return null;
    }

    // Validation: if user is MEMBER, they can't access all-orders or team
    if (['all-orders', 'team'].includes(tab as string) && user.role === 'MEMBER') {
        router.replace('/dashboard/restaurants');
        return null;
    }

    switch (tab) {
        case 'restaurants':
            return <RestaurantsTab user={user} />;
        case 'orders':
            return <OrdersTab user={user} showAll={false} />;
        case 'all-orders':
            return <OrdersTab user={user} showAll={true} />;
        case 'payments':
            return <PaymentsTab user={user} />;
        case 'team':
            return <TeamTab user={user} />;
        default:
            return <RestaurantsTab user={user} />;
    }
}
