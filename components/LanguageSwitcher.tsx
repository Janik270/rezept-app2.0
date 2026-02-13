'use client';

import { useTranslation } from '@/lib/i18n';

export default function LanguageSwitcher() {
    const { locale, setLocale } = useTranslation();

    const toggleLanguage = () => {
        const newLang = locale === 'en' ? 'de' : 'en';
        setLocale(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full border border-white/20 transition-all"
            title="Switch Language"
        >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
            </svg>
            <span className="text-white text-sm font-medium">{locale.toUpperCase()}</span>
        </button>
    );
}
