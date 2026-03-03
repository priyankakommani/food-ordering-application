'use client';

import { useQuery } from '@apollo/client';
import { GET_USERS } from '@/graphql/queries';

const roleColor: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  MEMBER: 'bg-green-100 text-green-700',
};

export default function TeamTab({ user }: { user: any }) {
  const { data, loading } = useQuery(GET_USERS);
  const users = data?.users || [];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Team</h2>
        <p className="text-gray-500 mt-1">
          {user?.role === 'ADMIN' ? 'All team members (global)' : `${user?.country} team members`}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u: any) => (
          <div key={u.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                {u.name[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColor[u.role]}`}>
                {u.role}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                u.country === 'INDIA' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {u.country === 'INDIA' ? '🇮🇳 India' : '🇺🇸 America'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
