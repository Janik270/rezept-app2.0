'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RecipeFormProps {
    initialData?: {
        title: string;
        description: string;
        ingredients: string;
        instructions: string;
        imageUrl?: string | null;
        category?: string;
    };
    onSubmit: (data: any) => Promise<void>;
    buttonLabel: string;
}

export default function RecipeForm({ initialData, onSubmit, buttonLabel }: RecipeFormProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        ingredients: initialData?.ingredients || '',
        instructions: initialData?.instructions || '',
        imageUrl: initialData?.imageUrl || '',
        category: initialData?.category || 'Other',
    });
    const [categories, setCategories] = useState<string[]>(['Other']);
    const [loading, setLoading] = useState(false);
    const [importUrl, setImportUrl] = useState('');
    const [importLoading, setImportLoading] = useState(false);
    const [importError, setImportError] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

    useEffect(() => {
        // Fetch categories from API
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const categoryNames = data.map((cat: any) => cat.name);
                    setCategories(['Other', ...categoryNames]);
                }
            })
            .catch(err => console.error('Failed to fetch categories:', err));
    }, []);

    const handleAiImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAiLoading(true);
        setAiError('');

        const formDataPayload = new FormData();
        formDataPayload.append('file', file);

        try {
            const res = await fetch('/api/ai-analyze', {
                method: 'POST',
                body: formDataPayload,
            });
            const data = await res.json();
            if (res.ok) {
                setFormData({
                    ...formData,
                    title: data.title || '',
                    description: data.description || '',
                    ingredients: data.ingredients || '',
                    instructions: data.instructions || '',
                });
            } else {
                setAiError(data.error || 'AI Analysis failed');
            }
        } catch (e) {
            setAiError('Fehler bei der Verbindung zum KI-Dienst.');
        } finally {
            setAiLoading(false);
            // Clear the input
            e.target.value = '';
        }
    };

    const handleImport = async () => {
        if (!importUrl) return;
        setImportLoading(true);
        setImportError('');
        try {
            const res = await fetch('/api/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: importUrl })
            });
            const data = await res.json();
            if (res.ok) {
                setFormData({
                    ...formData,
                    title: data.title || '',
                    description: data.description || '',
                    ingredients: data.ingredients || '',
                    instructions: data.instructions || '',
                    imageUrl: data.imageUrl || '',
                });
            } else {
                setImportError(data.error || 'Import failed');
            }
        } catch (e) {
            setImportError('Vom Server kam keine Antwort.');
        } finally {
            setImportLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(formData);
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Import Section */}
                <div className="bg-white shadow-lg rounded-2xl p-6 border border-purple-100 ring-1 ring-purple-50">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        ✨ KI Rezept-Scan
                    </h3>
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleAiImport}
                            disabled={aiLoading}
                            className="hidden"
                            id="ai-upload"
                        />
                        <label
                            htmlFor="ai-upload"
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors ${aiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <span className="text-3xl mb-2">{aiLoading ? '🔄' : '📄'}</span>
                                <p className="text-sm text-gray-600 font-medium">
                                    {aiLoading ? 'Analysiere...' : 'Bild oder PDF hochladen'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">KI erkennt Titel, Zutaten & Schritte</p>
                            </div>
                        </label>
                    </div>
                    {aiError && <p className="text-red-500 text-sm mt-2">{aiError}</p>}
                </div>

                {/* Chefkoch Section */}
                <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        👩‍🍳 URL Import
                    </h3>
                    <div className="space-y-4">
                        <input
                            type="url"
                            placeholder="Chefkoch.de URL..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                            value={importUrl}
                            onChange={(e) => setImportUrl(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleImport}
                            disabled={importLoading || !importUrl}
                            className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {importLoading ? 'Lade...' : 'Von URL laden'}
                        </button>
                    </div>
                    {importError && <p className="text-red-500 text-sm mt-2">{importError}</p>}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Titel</label>
                    <input
                        required
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kurzbeschreibung</label>
                    <input
                        required
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Bild URL (Optional)</label>
                    <input
                        type="url"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kategorie</label>
                    <select
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none bg-white"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Zutaten (pro Zeile eine)</label>
                    <textarea
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none h-48 font-mono text-sm"
                        value={formData.ingredients}
                        onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                        placeholder="200g Mehl&#10;3 Eier&#10;500ml Milch"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Zubereitung</label>
                    <textarea
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none h-64"
                        value={formData.instructions}
                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                        placeholder="Schritt für Schritt Anleitung..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 active:scale-95 transition-all transform duration-200 disabled:opacity-50"
                >
                    {loading ? 'Speichern...' : buttonLabel}
                </button>
            </form>
        </div>
    );
}
