'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

interface Recipe {
    id: number;
    title: string;
    description: string;
    imageUrl: string | null;
    ingredients: string;
    instructions: string;
}

interface CookingModeProps {
    recipe: Recipe;
    onExit: () => void;
}

// Simple emoji mapping for common cooking actions
const getStepEmoji = (stepText: string): string => {
    const lowerStep = stepText.toLowerCase();

    // Rühren / Mixing
    if (lowerStep.includes('rühr') || lowerStep.includes('mix') || lowerStep.includes('verquirl')) {
        return '🥄';
    }
    // Schneiden / Cutting
    if (lowerStep.includes('schneid') || lowerStep.includes('hack') || lowerStep.includes('würfel')) {
        return '🔪';
    }
    // Kochen / Boiling
    if (lowerStep.includes('koch') || lowerStep.includes('siede') || lowerStep.includes('aufkochen')) {
        return '🍲';
    }
    // Braten / Frying
    if (lowerStep.includes('brat') || lowerStep.includes('anbrat') || lowerStep.includes('anröst')) {
        return '🍳';
    }
    // Backen / Baking
    if (lowerStep.includes('back') || lowerStep.includes('ofen')) {
        return '🔥';
    }
    // Gießen / Pouring
    if (lowerStep.includes('gieß') || lowerStep.includes('hinzufüg') || lowerStep.includes('dazugeb')) {
        return '🥛';
    }
    // Kneten / Kneading
    if (lowerStep.includes('knet') || lowerStep.includes('form')) {
        return '👐';
    }
    // Würzen / Seasoning
    if (lowerStep.includes('würz') || lowerStep.includes('salz') || lowerStep.includes('pfeffer')) {
        return '🧂';
    }
    // Servieren / Serving
    if (lowerStep.includes('servier') || lowerStep.includes('anricht') || lowerStep.includes('garnieren')) {
        return '🍽️';
    }
    // Abkühlen / Cooling
    if (lowerStep.includes('abkühl') || lowerStep.includes('kalt') || lowerStep.includes('kühl')) {
        return '❄️';
    }
    // Mischen / Combining
    if (lowerStep.includes('misch') || lowerStep.includes('vermeng') || lowerStep.includes('verbin')) {
        return '🥣';
    }
    // Schälen / Peeling
    if (lowerStep.includes('schäl') || lowerStep.includes('pell')) {
        return '🥔';
    }
    // Waschen / Washing
    if (lowerStep.includes('wasch') || lowerStep.includes('spül') || lowerStep.includes('abspül')) {
        return '💧';
    }
    // Default
    return '👨‍🍳';
};

export default function CookingMode({ recipe, onExit }: CookingModeProps) {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedData, setOptimizedData] = useState<{
        instructions: string;
        tips: string[];
        estimatedTime: string;
    } | null>(null);
    const [showOptimized, setShowOptimized] = useState(false);
    const [optimizationError, setOptimizationError] = useState('');

    const steps = (showOptimized && optimizedData
        ? optimizedData.instructions
        : recipe.instructions
    ).split('\n').filter(line => line.trim() !== '');
    const ingredients = recipe.ingredients.split('\n').filter(line => line.trim() !== '');
    const isLastStep = currentStep === steps.length - 1;
    const isCompleted = currentStep >= steps.length;

    const handleOptimize = async () => {
        setIsOptimizing(true);
        setOptimizationError('');

        try {
            const res = await fetch('/api/optimize-recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: recipe.title,
                    ingredients: recipe.ingredients,
                    instructions: recipe.instructions,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to optimize recipe');
            }

            const data = await res.json();
            setOptimizedData({
                instructions: data.optimizedInstructions,
                tips: data.tips,
                estimatedTime: data.estimatedTime,
            });
            setShowOptimized(true);
            setCurrentStep(0);
        } catch (err: any) {
            setOptimizationError(t('cooking.optimizationError'));
            console.error('Optimization error:', err);
        } finally {
            setIsOptimizing(false);
        }
    };

    const toggleVersion = () => {
        setShowOptimized(!showOptimized);
        setCurrentStep(0);
    };

    const toggleIngredient = (index: number) => {
        setCheckedIngredients(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
                    <div className="text-6xl mb-6">🎉</div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        {t('cooking.completed')}
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        {t('cooking.completedMessage')}
                    </p>
                    <button
                        onClick={onExit}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        {t('cooking.backToRecipe')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                                {recipe.title}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {t('cooking.step')} {currentStep + 1} {t('cooking.of')} {steps.length}
                            </p>
                        </div>
                        <button
                            onClick={onExit}
                            className="ml-4 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            {t('cooking.exit')}
                        </button>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Ingredients Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <span className="bg-purple-100 text-purple-700 rounded-full p-2 mr-2 text-sm">🥗</span>
                                        {t('cooking.ingredients')}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">{t('cooking.checkOff')}</p>
                                    <ul className="space-y-2">
                                        {ingredients.map((ingredient, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <input
                                                    type="checkbox"
                                                    id={`ingredient-${idx}`}
                                                    checked={checkedIngredients.has(idx)}
                                                    onChange={() => toggleIngredient(idx)}
                                                    className="mt-1 h-5 w-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                                                />
                                                <label
                                                    htmlFor={`ingredient-${idx}`}
                                                    className={`ml-3 text-sm cursor-pointer ${checkedIngredients.has(idx)
                                                        ? 'line-through text-gray-400'
                                                        : 'text-gray-700'
                                                        }`}
                                                >
                                                    {ingredient}
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* AI Optimization Section */}
                                {!optimizedData && (
                                    <div className="pt-6 border-t border-gray-200">
                                        <button
                                            onClick={handleOptimize}
                                            disabled={isOptimizing}
                                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isOptimizing ? (
                                                <span className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    {t('cooking.optimizing')}
                                                </span>
                                            ) : (
                                                t('cooking.optimize')
                                            )}
                                        </button>
                                        {optimizationError && (
                                            <p className="mt-2 text-xs text-red-600">{optimizationError}</p>
                                        )}
                                    </div>
                                )}

                                {/* Optimized Data Display */}
                                {optimizedData && (
                                    <>
                                        <div className="pt-6 border-t border-gray-200">
                                            <button
                                                onClick={toggleVersion}
                                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
                                            >
                                                {showOptimized ? t('cooking.showOriginal') : t('cooking.showOptimized')}
                                            </button>
                                        </div>

                                        {showOptimized && (
                                            <>
                                                <div className="pt-6 border-t border-gray-200">
                                                    <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                                                        <span className="bg-blue-100 text-blue-700 rounded-full p-1.5 mr-2 text-xs">⏱️</span>
                                                        {t('cooking.estimatedTime')}
                                                    </h4>
                                                    <p className="text-sm text-gray-700">{optimizedData.estimatedTime}</p>
                                                </div>

                                                <div className="pt-6 border-t border-gray-200">
                                                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                        <span className="bg-green-100 text-green-700 rounded-full p-1.5 mr-2 text-xs">💡</span>
                                                        {t('cooking.tips')}
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {optimizedData.tips.map((tip, idx) => (
                                                            <li key={idx} className="text-xs text-gray-700 flex items-start">
                                                                <span className="text-green-600 mr-2 flex-shrink-0">•</span>
                                                                <span>{tip}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Current Step */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                                {/* Step Number and Version Badge */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <span className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl">
                                            {currentStep + 1}
                                        </span>
                                        <span className="ml-4 text-sm text-gray-500">
                                            {t('cooking.step')} {currentStep + 1} {t('cooking.of')} {steps.length}
                                        </span>
                                    </div>
                                    {showOptimized && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                            {t('cooking.optimized')}
                                        </span>
                                    )}
                                </div>

                                {/* Illustration */}
                                <div className="mb-8 rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 aspect-video flex items-center justify-center border-4 border-purple-200">
                                    <div className="text-9xl animate-pulse">
                                        {getStepEmoji(steps[currentStep])}
                                    </div>
                                </div>

                                {/* Step Instruction */}
                                <p className="text-2xl md:text-3xl text-gray-900 leading-relaxed font-medium">
                                    {steps[currentStep]}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="bg-white border-t border-gray-200 sticky bottom-0 z-20 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ← {t('cooking.previous')}
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            {isLastStep ? t('cooking.finish') : t('cooking.next')} →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
