'use client';

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import CookingMode from "@/app/components/CookingMode";

interface Recipe {
    id: number;
    title: string;
    description: string;
    imageUrl: string | null;
    ingredients: string;
    instructions: string;
}

export default function RecipeDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const { t } = useTranslation();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCookingMode, setShowCookingMode] = useState(false);

    useEffect(() => {
        if (id) {
            fetch(`/api/recipes/${id}`)
                .then(res => {
                    if (!res.ok) throw new Error('Recipe not found');
                    return res.json();
                })
                .then(data => {
                    setRecipe(data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-xl text-gray-600">{t('common.loading')}</div>
            </div>
        );
    }

    if (!recipe) {
        notFound();
    }

    if (showCookingMode) {
        return (
            <CookingMode
                recipe={recipe}
                onExit={() => setShowCookingMode(false)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header/Nav */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="text-gray-900 font-bold hover:text-purple-600 transition-colors flex items-center">
                            &larr; {t('nav.allRecipes')}
                        </Link>
                        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 tracking-wider">
                            CookBook
                        </div>
                        {/* Spacer for centering */}
                        <div className="w-20"></div>
                    </div>
                </div>
            </nav>

            {/* Hero Image */}
            {recipe.imageUrl && (
                <div className="w-full h-96 relative">
                    <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2">{recipe.title}</h1>
                        <p className="text-lg text-gray-200 max-w-2xl">{recipe.description}</p>
                    </div>
                </div>
            )}

            {/* Content */}
            <main className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${!recipe.imageUrl ? 'pt-16' : ''}`}>
                {!recipe.imageUrl && (
                    <div className="mb-12 text-center border-b border-gray-100 pb-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{recipe.title}</h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">{recipe.description}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Sidebar: Ingredients */}
                    <div className="md:col-span-1">
                        <div className="bg-purple-50 rounded-2xl p-8 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <span className="bg-purple-200 text-purple-700 rounded-full p-2 mr-3 text-sm">🥗</span>
                                {t('recipe.ingredients')}
                            </h3>
                            <ul className="space-y-3">
                                {recipe.ingredients.split('\n').filter(line => line.trim() !== '').map((line: string, idx: number) => (
                                    <li key={idx} className="flex items-start text-gray-700">
                                        <span className="h-2 w-2 mt-2 rounded-full bg-purple-400 mr-3 flex-shrink-0" />
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Main: Instructions */}
                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="bg-pink-100 text-pink-600 rounded-full p-2 mr-3 text-sm">🍳</span>
                            {t('recipe.instructions')}
                        </h3>
                        <div className="space-y-6">
                            {recipe.instructions.split('\n').filter(line => line.trim() !== '').map((line: string, idx: number) => (
                                <div key={idx} className="flex">
                                    <div className="flex-shrink-0 mr-4">
                                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-pink-100 text-pink-600 font-bold text-sm">
                                            {idx + 1}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-lg leading-relaxed mt-0.5">{line}</p>
                                </div>
                            ))}
                        </div>

                        {/* Cooking Mode Button */}
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <button
                                onClick={() => setShowCookingMode(true)}
                                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
                            >
                                {t('recipe.startCooking')}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
