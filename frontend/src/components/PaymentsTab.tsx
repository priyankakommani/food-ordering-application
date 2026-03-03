'use client';

import { useQuery, useMutation } from '@apollo/client';
import {
  GET_PAYMENT_METHODS,
  GET_ALL_PAYMENT_METHODS,
  ADD_PAYMENT_METHOD,
  DELETE_PAYMENT_METHOD,
  UPDATE_PAYMENT_METHOD,
  GET_USERS,
} from '@/graphql/queries';
import { useState } from 'react';

export default function PaymentsTab({ user }: { user: any }) {
  const { data } = useQuery(GET_ALL_PAYMENT_METHODS);
  const { data: usersData } = useQuery(GET_USERS);
  const [addPayment] = useMutation(ADD_PAYMENT_METHOD, { refetchQueries: [GET_ALL_PAYMENT_METHODS, GET_PAYMENT_METHODS] });
  const [updatePayment] = useMutation(UPDATE_PAYMENT_METHOD, { refetchQueries: [GET_ALL_PAYMENT_METHODS, GET_PAYMENT_METHODS] });
  const [deletePayment] = useMutation(DELETE_PAYMENT_METHOD, { refetchQueries: [GET_ALL_PAYMENT_METHODS] });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: 'credit_card', last4: '', upiId: '', isDefault: false, userId: '' });
  const [msg, setMsg] = useState('');

  const users = usersData?.users || [];
  const paymentMethods = data?.allPaymentMethods || [];

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ type: 'credit_card', last4: '', upiId: '', isDefault: false, userId: '' });
  };

  const openCreateForm = () => {
    closeForm();
    setShowForm(true);
  };

  const openEditForm = (paymentMethod: any) => {
    setEditingId(paymentMethod.id);
    setForm({
      type: paymentMethod.type,
      last4: paymentMethod.last4 || '',
      upiId: paymentMethod.upiId || '',
      isDefault: paymentMethod.isDefault,
      userId: paymentMethod.userId,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!editingId && !form.userId) {
      setMsg('Select a user');
      return;
    }

    const input = {
      type: form.type,
      isDefault: form.isDefault,
      last4: form.type === 'upi' ? undefined : (form.last4 || undefined),
      upiId: form.type === 'upi' ? (form.upiId || undefined) : undefined,
    };

    try {
      if (editingId) {
        await updatePayment({ variables: { id: editingId, input } });
        setMsg('✅ Payment method updated!');
      } else {
        await addPayment({
          variables: {
            input,
            userId: form.userId,
          },
        });
        setMsg('✅ Payment method added!');
      }
      closeForm();
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    }

    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePayment({ variables: { id } });
      setMsg('✅ Deleted');
    } catch (e: any) { setMsg(`❌ ${e.message}`); }
    setTimeout(() => setMsg(''), 3000);
  };

  const getUserName = (userId: string) => users.find((u: any) => u.id === userId)?.name || userId.slice(0, 8);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
          <p className="text-gray-500 mt-1">Manage all payment methods (Admin only)</p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          + Add Payment
        </button>
      </div>

      {msg && <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm">{msg}</div>}

      {showForm && (
        <div className="mb-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold mb-4">
            {editingId ? 'Edit Payment Method' : 'Add New Payment Method'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">User</label>
              <select
                value={form.userId}
                onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}
                disabled={Boolean(editingId)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">Select user</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            {form.type !== 'upi' ? (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Last 4 digits</label>
                <input
                  type="text"
                  maxLength={4}
                  value={form.last4}
                  onChange={e => setForm(f => ({ ...f, last4: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="1234"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">UPI ID</label>
                <input
                  type="text"
                  value={form.upiId}
                  onChange={e => setForm(f => ({ ...f, upiId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="name@upi"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={form.isDefault}
                onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                className="accent-orange-500"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">
              {editingId ? 'Update' : 'Save'}
            </button>
            <button onClick={closeForm} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethods.map((pm: any) => (
          <div key={pm.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-2xl">{pm.type === 'upi' ? '📱' : '💳'}</div>
              {pm.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>}
            </div>
            <p className="font-semibold text-gray-900 capitalize">{pm.type.replace('_', ' ')}</p>
            <p className="text-sm text-gray-500">
              {pm.type === 'upi' ? pm.upiId : `•••• •••• •••• ${pm.last4}`}
            </p>
            <p className="text-xs text-gray-400 mt-1">User: {getUserName(pm.userId)}</p>
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => openEditForm(pm)}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(pm.id)}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
