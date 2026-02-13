'use client';

import { useState, useEffect } from 'react';

interface AISettingsProps {
    initialApiKey?: string;
}

export default function AISettings({ initialApiKey = '' }: AISettingsProps) {
    const [apiKey, setApiKey] = useState(initialApiKey);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ text: '', type: '' });
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'openai_api_key', value: apiKey }),
            });

            if (!res.ok) throw new Error('Failed to save');

            setMessage({ text: 'API Key erfolgreich gespeichert!', type: 'success' });
        } catch (error) {
            setMessage({ text: 'Fehler beim Speichern.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mt-6 sm:mt-8 md:mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <span className="mr-2">🤖</span>
                <span className="hidden sm:inline">KI-Konfiguration</span>
                <span className="sm:hidden">KI-Config</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                Gib deinen ChatGPT API-Schlüssel ein, um die Bild- und PDF-Analyse für neue Rezepte zu aktivieren.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-3 sm:px-6 py-2 bg-purple-600 text-white text-sm sm:text-base font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
                >
                    {isSaving ? (
                        <span>Saving...</span>
                    ) : (
                        <>
                            <span className="hidden sm:inline">Schlüssel speichern</span>
                            <span className="sm:hidden">Speichern</span>
                        </>
                    )}
                </button>
            </div>
            {message.text && (
                <p className={`mt-4 text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {message.text}
                </p>
            )}
        </div>
    );
}
