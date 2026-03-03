'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_ORDERS, GET_ORDERS, CANCEL_ORDER, PLACE_ORDER, GET_PAYMENT_METHODS } from '@/graphql/queries';
import { useState } from 'react';

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PLACED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function OrderCard({ order, user, paymentMethods, onAction }: any) {
  const [cancelOrder] = useMutation(CANCEL_ORDER, { refetchQueries: [GET_MY_ORDERS, GET_ORDERS] });
  const [placeOrder] = useMutation(PLACE_ORDER, { refetchQueries: [GET_MY_ORDERS, GET_ORDERS] });
  const [selectedPM, setSelectedPM] = useState('');
  const [msg, setMsg] = useState('');

  const canAct = ['ADMIN', 'MANAGER'].includes(user?.role);

  const handleCancel = async () => {
    try {
      await cancelOrder({ variables: { orderId: order.id } });
      setMsg('Order cancelled');
    } catch (e: any) { setMsg(e.message); }
    setTimeout(() => setMsg(''), 3000);
  };

  const handlePlace = async () => {
    if (!selectedPM) { setMsg('Select a payment method'); return; }
    try {
      await placeOrder({ variables: { orderId: order.id, paymentMethodId: selectedPM } });
      setMsg('Order placed!');
    } catch (e: any) { setMsg(e.message); }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-gray-400 font-mono">{order.id.slice(0, 8)}...</p>
          <p className="text-sm text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[order.status]}`}>
            {order.status}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            order.country === 'INDIA' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {order.country === 'INDIA' ? '🇮🇳' : '🇺🇸'} {order.country}
          </span>
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
        <p className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</p>
      </div>

      <div className="mb-3 space-y-2 max-h-36 overflow-y-auto pr-1">
        {order.items.map((item: any) => (
          <div key={item.id} className="rounded-lg bg-gray-50 p-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.menuItem?.name || 'Menu Item'}</p>
                <p className="text-xs text-gray-500">
                  {item.menuItem?.category || 'Food'} · Qty: {item.quantity} · ${item.price.toFixed(2)} each
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {msg && <p className="text-xs text-orange-600 mb-2">{msg}</p>}

      {canAct && order.status === 'PENDING' && (
        <div className="space-y-2">
          {paymentMethods?.length > 0 && (
            <select
              value={selectedPM}
              onChange={e => setSelectedPM(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">Select payment to place order</option>
              {paymentMethods.map((pm: any) => (
                <option key={pm.id} value={pm.id}>
                  {pm.type === 'upi' ? `UPI: ${pm.upiId}` : `Card •••• ${pm.last4}`}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            <button onClick={handlePlace} className="flex-1 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors">
              ✓ Place Order
            </button>
            <button onClick={handleCancel} className="flex-1 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors">
              ✕ Cancel
            </button>
          </div>
        </div>
      )}
      {canAct && order.status === 'PLACED' && (
        <button onClick={handleCancel} className="w-full py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors">
          Cancel Order
        </button>
      )}
    </div>
  );
}

export default function OrdersTab({ user, showAll = false }: { user: any; showAll?: boolean }) {
  const myQuery = useQuery(GET_MY_ORDERS, {
    skip: showAll,
    fetchPolicy: 'network-only',
  });
  const allQuery = useQuery(GET_ORDERS, {
    skip: !showAll,
    fetchPolicy: 'network-only',
  });
  const { data: pmData } = useQuery(GET_PAYMENT_METHODS);

  const loading = showAll ? allQuery.loading : myQuery.loading;
  const orders = showAll ? (allQuery.data?.orders || []) : (myQuery.data?.myOrders || []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{showAll ? 'All Orders' : 'My Orders'}</h2>
        {showAll && (
          <p className="text-gray-500 mt-1">
            {user?.role === 'ADMIN' ? 'Global order management' : `${user?.country} orders only`}
          </p>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm">Go to Restaurants to place your first order!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order: any) => (
            <OrderCard
              key={order.id}
              order={order}
              user={user}
              paymentMethods={pmData?.myPaymentMethods}
            />
          ))}
        </div>
      )}
    </div>
  );
}
