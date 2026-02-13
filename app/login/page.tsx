'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
            router.push('/admin/dashboard');
        } else {
            const data = await res.json();
            setError(data.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 w-full max-w-md">
                <h1 className="text-3xl font-bold text-white mb-6 text-center drop-shadow-md">Welcome Back</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                            placeholder="Enter your password"
                        />
                    </div>

                    {error && (
                        <div className="text-red-300 text-sm text-center bg-red-500/20 py-2 rounded-lg border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl bg-white text-purple-600 font-bold text-lg shadow-lg hover:bg-opacity-90 active:scale-95 transition-all transform duration-200"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
