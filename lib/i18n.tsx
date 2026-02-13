'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Translation definitions
const translations = {
    en: {
        // App & Navigation
        'app.title': 'Recipe Collection',
        'hero.title': 'Discover Amazing Recipes',
        'hero.subtitle': 'Your personal collection of delicious recipes',
        'nav.login': 'Login',
        'nav.register': 'Register',
        'nav.dashboard': 'Dashboard',
        'nav.back': 'Back to Home',
        'nav.allRecipes': 'All Recipes',

        // Recipes
        'recipes.view': 'View Recipe →',
        'recipes.empty': 'No recipes yet',
        'recipes.empty.subtitle': 'Start by adding your first recipe',
        'recipes.noResults': 'No recipes found matching your criteria',
        'recipes.noResults.subtitle': 'Try adjusting your search or filter',

        // Tabs
        'tabs.all': '🍽️ All Recipes',
        'tabs.favorites': '❤️ My Favorites',
        'tabs.generator': '🤖 Recipe Generator',

        // Favorites
        'favorites.empty': 'No favorite recipes yet',
        'favorites.empty.subtitle': 'Start adding recipes to your favorites by clicking the ❤️ icon',
        'favorites.loading': 'Loading favorites...',
        'favorites.add': 'Add to favorites',
        'favorites.remove': 'Remove from favorites',
        'favorites.loginRequired': 'Please login to add favorites',

        // Recipe Detail
        'recipe.ingredients': 'Ingredients',
        'recipe.instructions': 'Instructions',
        'recipe.startCooking': '👨‍🍳 Start Cooking',

        // Cooking Mode
        'cooking.title': 'Cooking Mode',
        'cooking.step': 'Step',
        'cooking.of': 'of',
        'cooking.previous': 'Previous',
        'cooking.next': 'Next',
        'cooking.finish': 'Finish',
        'cooking.exit': 'Exit Cooking Mode',
        'cooking.ingredients': 'Ingredients',
        'cooking.checkOff': 'Check off ingredients as you use them',
        'cooking.completed': '🎉 Recipe Completed!',
        'cooking.completedMessage': 'Great job! Enjoy your meal!',
        'cooking.backToRecipe': 'Back to Recipe',
        'cooking.optimize': '🤖 Optimize with AI',
        'cooking.optimizing': 'Optimizing Recipe...',
        'cooking.optimized': 'AI-Optimized',
        'cooking.original': 'Original',
        'cooking.tips': 'Cooking Tips',
        'cooking.estimatedTime': 'Estimated Time',
        'cooking.showOptimized': 'Show Optimized Version',
        'cooking.showOriginal': 'Show Original',
        'cooking.optimizationError': 'Failed to optimize. Please try again.',

        // Generator
        'generator.title': 'AI Recipe Generator',
        'generator.subtitle': 'Generate delicious recipes from around the world using AI',
        'generator.generate': 'Generate a Recipe',
        'generator.country': 'Country',
        'generator.countryPlaceholder': 'Select a country...',
        'generator.dishType': 'Dish Type',
        'generator.dishTypePlaceholder': 'e.g., pasta, soup, dessert...',
        'generator.optional': '(Optional)',
        'generator.required': '*',
        'generator.generateButton': '✨ Generate Recipe',
        'generator.generating': 'Generating Recipe...',
        'generator.addToRecipes': '➕ Add to Recipes (Requires Admin Approval)',
        'generator.submitting': 'Submitting...',
        'generator.success': 'Recipe submitted for admin approval! ✅',
        'generator.errorCountry': 'Please select a country',
        'generator.errorGenerate': 'Failed to generate recipe. Please try again.',
        'generator.errorSubmit': 'Failed to submit recipe. Please try again.',

        // Search & Filter
        'search.placeholder': 'Search recipes...',
        'filter.all': 'All',

        // Common
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
    },
    de: {
        // App & Navigation
        'app.title': 'Rezeptsammlung',
        'hero.title': 'Entdecke Tolle Rezepte',
        'hero.subtitle': 'Deine persönliche Sammlung leckerer Rezepte',
        'nav.login': 'Anmelden',
        'nav.register': 'Registrieren',
        'nav.dashboard': 'Dashboard',
        'nav.back': 'Zurück zur Startseite',
        'nav.allRecipes': 'Alle Rezepte',

        // Recipes
        'recipes.view': 'Rezept ansehen →',
        'recipes.empty': 'Noch keine Rezepte',
        'recipes.empty.subtitle': 'Füge dein erstes Rezept hinzu',
        'recipes.noResults': 'Keine Rezepte gefunden',
        'recipes.noResults.subtitle': 'Versuche deine Suche oder Filter anzupassen',

        // Tabs
        'tabs.all': '🍽️ Alle Rezepte',
        'tabs.favorites': '❤️ Meine Favoriten',
        'tabs.generator': '🤖 Rezept Generator',

        // Favorites
        'favorites.empty': 'Noch keine Lieblingsrezepte',
        'favorites.empty.subtitle': 'Füge Rezepte zu deinen Favoriten hinzu, indem du auf das ❤️ Symbol klickst',
        'favorites.loading': 'Lade Favoriten...',
        'favorites.add': 'Zu Favoriten hinzufügen',
        'favorites.remove': 'Aus Favoriten entfernen',
        'favorites.loginRequired': 'Bitte melde dich an, um Favoriten hinzuzufügen',

        // Recipe Detail
        'recipe.ingredients': 'Zutaten',
        'recipe.instructions': 'Anleitung',
        'recipe.startCooking': '👨‍🍳 Kochen starten',

        // Cooking Mode
        'cooking.title': 'Koch-Modus',
        'cooking.step': 'Schritt',
        'cooking.of': 'von',
        'cooking.previous': 'Zurück',
        'cooking.next': 'Weiter',
        'cooking.finish': 'Fertig',
        'cooking.exit': 'Koch-Modus beenden',
        'cooking.ingredients': 'Zutaten',
        'cooking.checkOff': 'Hake Zutaten ab, wenn du sie verwendest',
        'cooking.completed': '🎉 Rezept fertig!',
        'cooking.completedMessage': 'Gut gemacht! Guten Appetit!',
        'cooking.backToRecipe': 'Zurück zum Rezept',
        'cooking.optimize': '🤖 Mit KI optimieren',
        'cooking.optimizing': 'Optimiere Rezept...',
        'cooking.optimized': 'KI-Optimiert',
        'cooking.original': 'Original',
        'cooking.tips': 'Kochtipps',
        'cooking.estimatedTime': 'Geschätzte Zeit',
        'cooking.showOptimized': 'Optimierte Version anzeigen',
        'cooking.showOriginal': 'Original anzeigen',
        'cooking.optimizationError': 'Fehler beim Optimieren. Bitte versuche es erneut.',

        // Generator
        'generator.title': 'KI Rezept Generator',
        'generator.subtitle': 'Generiere leckere Rezepte aus aller Welt mit KI',
        'generator.generate': 'Rezept generieren',
        'generator.country': 'Land',
        'generator.countryPlaceholder': 'Wähle ein Land...',
        'generator.dishType': 'Gerichtart',
        'generator.dishTypePlaceholder': 'z.B. Pasta, Suppe, Dessert...',
        'generator.optional': '(Optional)',
        'generator.required': '*',
        'generator.generateButton': '✨ Rezept generieren',
        'generator.generating': 'Generiere Rezept...',
        'generator.addToRecipes': '➕ Zu Rezepten hinzufügen (Benötigt Admin-Freigabe)',
        'generator.submitting': 'Wird übermittelt...',
        'generator.success': 'Rezept zur Admin-Freigabe übermittelt! ✅',
        'generator.errorCountry': 'Bitte wähle ein Land',
        'generator.errorGenerate': 'Fehler beim Generieren des Rezepts. Bitte versuche es erneut.',
        'generator.errorSubmit': 'Fehler beim Übermitteln des Rezepts. Bitte versuche es erneut.',

        // Search & Filter
        'search.placeholder': 'Rezepte suchen...',
        'filter.all': 'Alle',

        // Common
        'common.loading': 'Lädt...',
        'common.error': 'Fehler',
        'common.success': 'Erfolg',
    },
};

type Locale = 'en' | 'de';

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('de');
    const [mounted, setMounted] = useState(false);

    // Load language from localStorage on mount
    useEffect(() => {
        const savedLocale = localStorage.getItem('locale') as Locale;
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'de')) {
            setLocaleState(savedLocale);
        }
        setMounted(true);
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
    };

    const t = (key: string): string => {
        return translations[locale]?.[key as keyof typeof translations.en] || key;
    };

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);

    // Fallback for server-side rendering or when provider is not available
    if (!context) {
        const locale: Locale = 'de';
        const t = (key: string): string => {
            return translations[locale]?.[key as keyof typeof translations.en] || key;
        };
        return { locale, setLocale: () => { }, t };
    }

    return context;
}
