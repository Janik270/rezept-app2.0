'use client';

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import UserButton from "@/components/UserButton";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import { useState, useMemo, useEffect } from "react";

interface Recipe {
    id: number;
    title: string;
    description: string;
    imageUrl?: string | null;
    category?: string;
    ingredients?: string;
}

interface HomeContentProps {
    recipes: Recipe[];
    session?: {
        isLoggedIn: boolean;
        user?: {
            id: number;
            username: string;
            email: string;
            role: string;
            profileImageUrl?: string;
        };
        role?: string;
    } | null;
    showRegisterButton?: boolean;
}

export default function HomeContent({ recipes, session, showRegisterButton }: HomeContentProps) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
    const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
    const [favoriteStatus, setFavoriteStatus] = useState<Record<number, boolean>>({});
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

    // Extract unique categories from recipes
    const categories = useMemo(() => {
        const cats = new Set(recipes.map(r => r.category || 'Other'));
        return Array.from(cats).sort();
    }, [recipes]);

    // Fetch favorite status for all recipes
    useEffect(() => {
        if (session?.isLoggedIn) {
            const recipeIds = recipes.map(r => r.id);
            fetch('/api/favorites/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipeIds }),
            })
                .then(res => res.json())
                .then(data => setFavoriteStatus(data))
                .catch(err => console.error('Failed to check favorites:', err));
        }
    }, [recipes, session]);

    // Fetch user's favorite recipes
    useEffect(() => {
        if (session?.isLoggedIn && activeTab === 'favorites') {
            setIsLoadingFavorites(true);
            fetch('/api/favorites')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setFavoriteRecipes(data);
                    }
                })
                .catch(err => console.error('Failed to fetch favorites:', err))
                .finally(() => setIsLoadingFavorites(false));
        }
    }, [session, activeTab]);

    // Toggle favorite
    const toggleFavorite = async (recipeId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session?.isLoggedIn) {
            alert(t('favorites.loginRequired'));
            return;
        }

        try {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipeId }),
            });

            const data = await res.json();

            if (res.ok) {
                setFavoriteStatus(prev => ({
                    ...prev,
                    [recipeId]: data.isFavorite,
                }));

                // Refresh favorites if on favorites tab
                if (activeTab === 'favorites') {
                    const favRes = await fetch('/api/favorites');
                    const favData = await favRes.json();
                    if (Array.isArray(favData)) {
                        setFavoriteRecipes(favData);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
        }
    };

    // Determine which recipes to show
    const displayRecipes = activeTab === 'favorites' ? favoriteRecipes : recipes;

    // Filter recipes based on search and category
    const filteredRecipes = useMemo(() => {
        return displayRecipes.filter(recipe => {
            const matchesSearch = searchQuery === '' ||
                recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (recipe.ingredients && recipe.ingredients.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [displayRecipes, searchQuery, selectedCategory]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 pb-20 sm:pb-32">
                <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 py-3 sm:py-4">
                        {/* Top Row: Title and Language */}
                        <div className="flex items-center justify-between">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-widest uppercase drop-shadow-md">
                                {t('app.title')}
                            </h1>
                            <LanguageSwitcher />
                        </div>

                        {/* Search Bar - Full Width on Mobile */}
                        <div className="w-full">
                            <SearchBar onSearch={setSearchQuery} />
                        </div>

                        {/* Bottom Row: Dashboard/Login and User Button */}
                        {session?.isLoggedIn && session.user ? (
                            <div className="flex items-center justify-between gap-2">
                                {/* Only show Dashboard button for admins */}
                                {session.user.role === 'ADMIN' && (
                                    <Link
                                        href="/admin/dashboard"
                                        className="flex-1 text-center sm:flex-none text-white/90 hover:text-white font-medium text-sm transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/20"
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                <UserButton user={session.user} />
                            </div>
                        ) : (
                            <div className="flex gap-4 justify-center">
                                {showRegisterButton && (
                                    <Link
                                        href="/register"
                                        className="inline-block w-full sm:w-auto sm:min-w-[150px] text-center text-purple-700 font-bold text-sm sm:text-base transition-all bg-white hover:bg-purple-50 px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl active:scale-95"
                                    >
                                        🚀 Register
                                    </Link>
                                )}
                                <Link
                                    href="/login"
                                    className="inline-block w-full sm:w-auto sm:min-w-[150px] text-center text-white font-semibold text-sm sm:text-base transition-all border-2 border-white/40 bg-white/15 hover:bg-white/25 hover:border-white/60 px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl active:scale-95"
                                >
                                    {t('nav.login')}
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
                <div className="max-w-7xl mx-auto py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 sm:mb-4 drop-shadow-lg">
                        {t('hero.title')}
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-purple-100 max-w-2xl mx-auto opacity-90">
                        {t('hero.subtitle')}
                    </p>
                </div>
            </div >

            <main className="-mt-16 sm:-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
                {/* Tabs */}
                {session?.isLoggedIn && (
                    <div className="mb-4 sm:mb-6 flex gap-2 bg-white rounded-xl p-1 shadow-md w-fit">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition-all ${activeTab === 'all'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {t('tabs.all')}
                        </button>
                        <button
                            onClick={() => setActiveTab('favorites')}
                            className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition-all ${activeTab === 'favorites'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {t('tabs.favorites')}
                        </button>
                        <Link
                            href="/generator"
                            className="px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition-all text-gray-600 hover:bg-gray-100"
                        >
                            {t('tabs.generator')}
                        </Link>
                    </div>
                )}


                {/* Category Filter */}
                <div className="mb-4 sm:mb-6">
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredRecipes.map((recipe) => (
                        <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="group cursor-pointer">
                            <div className="bg-white overflow-hidden shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col relative">
                                {/* Favorite Button */}
                                {session?.isLoggedIn && (
                                    <button
                                        onClick={(e) => toggleFavorite(recipe.id, e)}
                                        className="absolute top-3 left-3 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95"
                                        title={favoriteStatus[recipe.id] ? t('favorites.remove') : t('favorites.add')}
                                    >
                                        {favoriteStatus[recipe.id] ? (
                                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        )}
                                    </button>
                                )}
                                {recipe.imageUrl ? (
                                    <div className="h-56 w-full overflow-hidden relative">
                                        <img
                                            src={recipe.imageUrl}
                                            alt={recipe.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                        {recipe.category && (
                                            <div className="absolute top-3 right-3">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-purple-700 shadow-sm">
                                                    {recipe.category}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-56 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                                        <span className="text-gray-400 text-6xl">🥘</span>
                                        {recipe.category && (
                                            <div className="absolute top-3 right-3">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-purple-700 shadow-sm">
                                                    {recipe.category}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="px-6 py-6 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                                        {recipe.title}
                                    </h3>
                                    <p className="text-gray-500 line-clamp-3 text-base flex-1">
                                        {recipe.description}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-purple-600 font-semibold group-hover:translate-x-1 transition-transform">
                                        {t('recipes.view')}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {filteredRecipes.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-lg">
                            <div className="text-gray-400 text-6xl mb-4">
                                {activeTab === 'favorites' ? '❤️' : '🔍'}
                            </div>
                            <p className="text-xl text-gray-600 font-medium">
                                {activeTab === 'favorites'
                                    ? (isLoadingFavorites ? t('favorites.loading') : t('favorites.empty'))
                                    : (searchQuery || selectedCategory !== 'All'
                                        ? t('recipes.noResults')
                                        : t('recipes.empty'))}
                            </p>
                            <p className="text-gray-500 mt-2">
                                {activeTab === 'favorites'
                                    ? t('favorites.empty.subtitle')
                                    : (searchQuery || selectedCategory !== 'All'
                                        ? t('recipes.noResults.subtitle')
                                        : t('recipes.empty.subtitle'))}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div >
    );
}
