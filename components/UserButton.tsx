'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    profileImageUrl?: string | null;
}

interface UserButtonProps {
    user: User;
}

export default function UserButton({ user }: UserButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full border border-white/20 transition-all"
            >
                {user.profileImageUrl ? (
                    <img
                        src={user.profileImageUrl}
                        alt={user.username}
                        className="w-6 h-6 rounded-full"
                    />
                ) : (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <span className="text-white font-medium text-sm hidden sm:inline">
                    {user.username}
                </span>
                <svg
                    className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {user.role === 'ADMIN' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                Admin
                            </span>
                        )}
                    </div>
                    <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        Profile
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
