'use client';

import { useState, useEffect } from 'react';

interface PendingRecipe {
    id: number;
    title: string;
    description: string;
    ingredients: string;
    instructions: string;
    imageUrl?: string;
    category: string;
    country: string;
    dishType?: string;
    createdAt: string;
}

export default function PendingRecipes() {
    const [pendingRecipes, setPendingRecipes] = useState<PendingRecipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPendingRecipes();
    }, []);

    const fetchPendingRecipes = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/pending-recipes');
            if (!res.ok) throw new Error('Failed to fetch pending recipes');
            const data = await res.json();
            setPendingRecipes(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load pending recipes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        setProcessingId(id);
        setError('');
        try {
            const res = await fetch(`/api/admin/pending-recipes/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (!res.ok) throw new Error(`Failed to ${action} recipe`);

            // Refresh the list
            await fetchPendingRecipes();
        } catch (err: any) {
            setError(err.message || `Failed to ${action} recipe`);
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="mt-6 sm:mt-8 md:mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                    🔔 Pending Recipe Approvals
                </h3>
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (pendingRecipes.length === 0) {
        return null; // Don't show section if no pending recipes
    }

    return (
        <div className="mt-6 sm:mt-8 md:mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                    <span className="mr-2">🔔</span>
                    Pending Recipe Approvals
                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {pendingRecipes.length}
                    </span>
                </h3>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingRecipes.map((recipe) => (
                    <div key={recipe.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                        {recipe.imageUrl && (
                            <div className="h-40 w-full overflow-hidden">
                                <img
                                    src={recipe.imageUrl}
                                    alt={recipe.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                    {recipe.category}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                                    {recipe.country}
                                </span>
                            </div>

                            <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                {recipe.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {recipe.description}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAction(recipe.id, 'approve')}
                                    disabled={processingId === recipe.id}
                                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processingId === recipe.id ? '...' : '✓ Approve'}
                                </button>
                                <button
                                    onClick={() => handleAction(recipe.id, 'reject')}
                                    disabled={processingId === recipe.id}
                                    className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processingId === recipe.id ? '...' : '✗ Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
