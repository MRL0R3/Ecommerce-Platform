import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { User } from '@/types';
import { Users, Shield, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const UsersPage = () => {
  const [search, setSearch] = useState('');

  const { data: users = [], refetch: fetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const response = await authApi.getUsers();
        return response.data || [];
      } catch {
        return [];
      }
    },
    refetchInterval: 30000,
  });

  const handleRoleToggle = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await authApi.updateRole(user.id, newRole);
      toast.success(`Role updated to ${newRole} for ${user.username}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${username}?`)) return;
    try {
      await authApi.deleteUser(id);
      toast.success(`User ${username} deleted`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1D1F]">User Management</h1>
          <p className="text-[#1D1D1F]/60 mt-1">Manage platform users, credentials, and access roles.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#5856D6]/10 text-[#5856D6] flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{users.length} Registered Users</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D1D1F]/40" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm text-[#1D1D1F] outline-none placeholder:text-[#1D1D1F]/40"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-[#1D1D1F]/60">
              <tr>
                <th className="py-3 px-4 font-medium">User</th>
                <th className="py-3 px-4 font-medium">Email</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium">Registered</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#1D1D1F]/50">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#1D1D1F] flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0071E3] flex items-center justify-center font-bold text-xs uppercase">
                        {u.username.slice(0, 2)}
                      </div>
                      <span>{u.username}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#1D1D1F]/70">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#1D1D1F]/50">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRoleToggle(u)}
                      >
                        <Shield className="w-4 h-4 text-[#0071E3]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(u.id, u.username)}
                      >
                        <Trash2 className="w-4 h-4 text-[#FF3B30]" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
