'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { t } = useTranslation();
    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
            } else {
                setError(data.error || 'Failed to fetch users');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (id: number, currentRole: string) => {
        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });
            if (res.ok) {
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update role');
            }
        } catch (err) {
            alert('An error occurred');
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete user');
            }
        } catch (err) {
            alert('An error occurred');
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <button
                        onClick={() => router.push('/admin/dashboard')}
                        className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                        &larr; Back to Dashboard
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <li key={user.id} className="px-6 py-4 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-lg font-medium text-gray-900">{user.username}</span>
                                    <span className="text-sm text-gray-500">{user.email}</span>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit mt-1 ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => handleRoleChange(user.id, user.role)}
                                        className="text-sm font-medium text-purple-600 hover:text-purple-900"
                                    >
                                        Toggle Role
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="text-sm font-medium text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
