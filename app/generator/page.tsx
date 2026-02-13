'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

const COUNTRIES = [
    'Italien', 'Frankreich', 'Japan', 'China', 'Indien', 'Mexiko', 'Thailand',
    'Griechenland', 'Spanien', 'Türkei', 'Marokko', 'Libanon', 'Vietnam',
    'Korea', 'Brasilien', 'Peru', 'Deutschland', 'USA', 'Großbritannien', 'Portugal'
].sort();

interface GeneratedRecipe {
    title: string;
    description: string;
    ingredients: string;
    instructions: string;
    imageUrl?: string;
    category: string;
    country: string;
    dishType?: string;
}

export default function RecipeGeneratorPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [country, setCountry] = useState('');
    const [dishType, setDishType] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleGenerate = async () => {
        if (!country) {
            setError(t('generator.errorCountry'));
            return;
        }

        setIsGenerating(true);
        setError('');
        setGeneratedRecipe(null);
        setSuccessMessage('');

        try {
            const res = await fetch('/api/generate-recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country, dishType: dishType || undefined }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to generate recipe');
            }

            const recipe = await res.json();
            setGeneratedRecipe(recipe);
        } catch (err: any) {
            setError(err.message || t('generator.errorGenerate'));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddToRecipes = async () => {
        if (!generatedRecipe) return;

        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            const res = await fetch('/api/admin/pending-recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(generatedRecipe),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit recipe');
            }

            setSuccessMessage(t('generator.success'));
            setGeneratedRecipe(null);
            setCountry('');
            setDishType('');
        } catch (err: any) {
            setError(err.message || t('generator.errorSubmit'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 pb-12">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="text-white/90 hover:text-white font-medium text-sm transition-colors"
                        >
                            ← {t('nav.back')}
                        </Link>
                    </div>
                </nav>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
                        {t('generator.title')}
                    </h1>
                    <p className="text-lg text-purple-100 opacity-90">
                        {t('generator.subtitle')}
                    </p>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
                {/* Generator Form */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('generator.generate')}</h2>

                    <div className="space-y-4">
                        {/* Country Selection */}
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('generator.country')} <span className="text-red-500">{t('generator.required')}</span>
                            </label>
                            <select
                                id="country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                disabled={isGenerating}
                            >
                                <option value="">{t('generator.countryPlaceholder')}</option>
                                {COUNTRIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dish Type (Optional) */}
                        <div>
                            <label htmlFor="dishType" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('generator.dishType')} <span className="text-gray-400">{t('generator.optional')}</span>
                            </label>
                            <input
                                id="dishType"
                                type="text"
                                value={dishType}
                                onChange={(e) => setDishType(e.target.value)}
                                placeholder={t('generator.dishTypePlaceholder')}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                disabled={isGenerating}
                            />
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !country}
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('generator.generating')}
                                </span>
                            ) : (
                                t('generator.generateButton')
                            )}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700 text-sm font-medium">{successMessage}</p>
                        </div>
                    )}
                </div>

                {/* Generated Recipe Preview */}
                {generatedRecipe && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {generatedRecipe.imageUrl && (
                            <div className="h-64 w-full overflow-hidden">
                                <img
                                    src={generatedRecipe.imageUrl}
                                    alt={generatedRecipe.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                    {generatedRecipe.category}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                                    {generatedRecipe.country}
                                </span>
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                {generatedRecipe.title}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {generatedRecipe.description}
                            </p>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('recipe.ingredients')}</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <ul className="space-y-2">
                                        {generatedRecipe.ingredients.split('\n').map((ingredient, idx) => (
                                            <li key={idx} className="text-gray-700 flex items-start">
                                                <span className="text-purple-600 mr-2">•</span>
                                                {ingredient}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('recipe.instructions')}</h3>
                                <div className="space-y-3">
                                    {generatedRecipe.instructions.split('\n').map((instruction, idx) => (
                                        <div key={idx} className="flex items-start">
                                            <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                                                {idx + 1}
                                            </span>
                                            <p className="text-gray-700 pt-1">{instruction}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Add to Recipes Button */}
                            <button
                                onClick={handleAddToRecipes}
                                disabled={isSubmitting}
                                className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('generator.submitting')}
                                    </span>
                                ) : (
                                    t('generator.addToRecipes')
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
