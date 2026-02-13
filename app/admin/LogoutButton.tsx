'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        router.refresh();
        router.push('/');
    };

    return (
        <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
            Sign Out
        </button>
    );
}
