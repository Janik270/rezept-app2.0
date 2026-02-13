'use client';

import { useState, useEffect } from 'react';

interface Category {
    id: number;
    name: string;
}

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            // Ensure data is an array
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                console.error('Categories response is not an array:', data);
                setCategories([]);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setCategories([]);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategory }),
            });

            const data = await response.json();

            if (response.ok) {
                setCategories([...categories, data]);
                setNewCategory('');
            } else {
                setError(data.error || 'Failed to add category');
            }
        } catch (err) {
            setError('Failed to add category');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const response = await fetch(`/api/categories?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCategories(categories.filter(cat => cat.id !== id));
            } else {
                alert('Failed to delete category');
            }
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mt-6 sm:mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="hidden sm:inline">Category Management</span>
                <span className="sm:hidden">Categories</span>
            </h2>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Category name..."
                        className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !newCategory.trim()}
                        className="w-full sm:w-auto px-3 sm:px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm sm:text-base font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? (
                            <span>Adding...</span>
                        ) : (
                            <>
                                <span className="hidden sm:inline">+ Add Category</span>
                                <span className="sm:hidden">+ Add</span>
                            </>
                        )}
                    </button>
                </div>
                {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
            </form>

            {/* Categories List */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Existing Categories ({Array.isArray(categories) ? categories.length : 0})
                </h3>
                {!Array.isArray(categories) || categories.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No categories yet. Add your first category above!</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-300 transition-colors"
                            >
                                <span className="font-medium text-gray-900">{category.name}</span>
                                <button
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="text-red-600 hover:text-red-800 transition-colors p-1"
                                    title="Delete category"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Categories help organize your recipes. Users can filter recipes by category on the home page.
                </p>
            </div>
        </div>
    );
}
