'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, gql, useApolloClient } from '@apollo/client';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user { id name email role country }
    }
  }
`;

const DEMO_USERS = [
  { name: 'Nick Fury', email: 'nick@shield.com', role: 'ADMIN', country: 'Global', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { name: 'Captain Marvel', email: 'marvel@shield.com', role: 'MANAGER', country: 'India', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { name: 'Captain America', email: 'america@shield.com', role: 'MANAGER', country: 'America', color: 'bg-red-100 text-red-800 border-red-200' },
  { name: 'Thanos', email: 'thanos@shield.com', role: 'MEMBER', country: 'India', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { name: 'Thor', email: 'thor@shield.com', role: 'MEMBER', country: 'India', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { name: 'Travis', email: 'travis@shield.com', role: 'MEMBER', country: 'America', color: 'bg-green-100 text-green-800 border-green-200' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const apolloClient = useApolloClient();
  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await login({ variables: { email, password } });
      localStorage.setItem('token', data.login.accessToken);
      localStorage.setItem('user', JSON.stringify(data.login.user));
      await apolloClient.clearStore();
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-orange-700 flex-col justify-center p-12">
        <div className="text-white">
          <div className="text-5xl mb-4">🍕</div>
          <h1 className="text-4xl font-bold mb-4">Slooze Food</h1>
          <p className="text-xl text-orange-100 mb-8">Role-based food ordering platform with country-scoped access control</p>
          <div className="space-y-3">
            {['RBAC - Admin, Manager, Member roles', 'Re-BAC - Country-scoped data access', 'GraphQL API with NestJS', 'Next.js 14 + TypeScript'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-orange-100">
                <span className="text-orange-300">✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-12">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
          <p className="text-gray-500 mb-8">Access your food ordering dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-sm font-medium text-gray-500 mb-3">Quick Access (Demo Users — all passwords: <code className="bg-gray-100 px-1 rounded">password123</code>)</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  onClick={() => quickLogin(u.email)}
                  className={`p-2 rounded-lg border text-left text-xs transition-all hover:shadow-sm ${u.color}`}
                >
                  <div className="font-semibold">{u.name}</div>
                  <div className="opacity-70">{u.role} · {u.country}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
