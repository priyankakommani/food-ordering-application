'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { GET_RESTAURANTS, GET_MY_ORDERS, GET_ORDERS, GET_PAYMENT_METHODS, CREATE_ORDER, PLACE_ORDER } from '@/graphql/queries';

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function RestaurantsTab({ user }: { user: any }) {
  const { data, loading } = useQuery(GET_RESTAURANTS);
  const { data: pmData } = useQuery(GET_PAYMENT_METHODS);
  const [createOrder] = useMutation(CREATE_ORDER, {
    refetchQueries: [GET_MY_ORDERS, GET_ORDERS],
    awaitRefetchQueries: true,
  });
  const [placeOrder] = useMutation(PLACE_ORDER, {
    refetchQueries: [GET_MY_ORDERS, GET_ORDERS],
    awaitRefetchQueries: true,
  });

  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [message, setMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const canPlace = ['ADMIN', 'MANAGER'].includes(user?.role);

  const addToCart = (item: any) => {
    setCart(prev => {
      const exists = prev.find(c => c.menuItemId === item.id);
      if (exists) return prev.map(c => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.menuItemId !== id));
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = async () => {
    if (!selectedRestaurant || cart.length === 0) return;
    try {
      const { data: orderData } = await createOrder({
        variables: {
          restaurantId: selectedRestaurant.id,
          items: cart.map(c => ({ menuItemId: c.menuItemId, quantity: c.quantity })),
        },
      });
      
      if (canPlace && selectedPayment) {
        await placeOrder({
          variables: { orderId: orderData.createOrder.id, paymentMethodId: selectedPayment },
        });
        setMessage('✅ Order placed successfully!');
      } else if (!canPlace) {
        setMessage('✅ Order created! A manager will approve and place it.');
      } else {
        setMessage('✅ Order created! Select a payment method to place it.');
      }
      setCart([]);
      setShowCart(false);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    }
    setTimeout(() => setMessage(''), 4000);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const restaurants = data?.restaurants || [];
  const categories: string[] = selectedRestaurant
    ? ['All', ...Array.from(new Set<string>(selectedRestaurant.menuItems.map((m: any) => m.category)))]
    : [];
  const filteredItems = selectedRestaurant?.menuItems.filter(
    (m: any) => activeCategory === 'All' || m.category === activeCategory
  );

  return (
    <div className="relative">
      {message && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-white border border-gray-200 rounded-xl shadow-lg text-sm font-medium">
          {message}
        </div>
      )}

      {!selectedRestaurant ? (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Restaurants</h2>
            <p className="text-gray-500 mt-1">
              {user?.role === 'ADMIN' ? 'All restaurants (global access)' : `${user?.country} restaurants`}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((r: any) => (
              <div
                key={r.id}
                onClick={() => { setSelectedRestaurant(r); setActiveCategory('All'); }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 cursor-pointer transition-all hover:-translate-y-1"
              >
                <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 relative overflow-hidden">
                  {r.imageUrl ? (
                    <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-5xl">🍽️</div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      r.country === 'INDIA' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {r.country === 'INDIA' ? '🇮🇳 India' : '🇺🇸 America'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900">{r.name}</h3>
                  <p className="text-sm text-gray-500">{r.cuisine}</p>
                  <p className="text-xs text-gray-400 mt-2">{r.menuItems.length} items on menu</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => { setSelectedRestaurant(null); setCart([]); }} className="text-orange-500 hover:text-orange-700 font-medium flex items-center gap-1">
              ← Back
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedRestaurant.name}</h2>
              <p className="text-gray-500 text-sm">{selectedRestaurant.cuisine}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems?.map((item: any) => (
              <div key={item.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <span className="text-orange-600 font-bold">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full inline-block mt-1">{item.category}</span>
                </div>
                <button
                  onClick={() => addToCart(item)}
                  className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="fixed bottom-6 right-6">
              <button
                onClick={() => setShowCart(true)}
                className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition-colors"
              >
                🛒 View Cart ({cartCount}) · ${cartTotal.toFixed(2)}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Your Cart</h3>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.menuItemId} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} · ${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.menuItemId)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 mb-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-600">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              {canPlace && pmData?.myPaymentMethods?.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={selectedPayment}
                    onChange={e => setSelectedPayment(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select payment method</option>
                    {pmData.myPaymentMethods.map((pm: any) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.type === 'upi' ? `UPI: ${pm.upiId}` : `Card ending in ${pm.last4}`}
                        {pm.isDefault ? ' (Default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!canPlace && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                  ⚠️ As a Member, you can add items to cart but a Manager or Admin must place the order.
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={!cart.length}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white font-semibold rounded-xl transition-colors"
              >
                {canPlace && selectedPayment ? 'Place Order & Pay' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
