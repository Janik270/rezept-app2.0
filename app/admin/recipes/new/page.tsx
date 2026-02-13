'use client';

import RecipeForm from '@/app/components/RecipeForm';
import { useRouter } from 'next/navigation';

export default function NewRecipePage() {
    const router = useRouter();

    const handleCreate = async (data: any) => {
        const res = await fetch('/api/recipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (res.ok) {
            router.push('/admin/dashboard');
            router.refresh();
        } else {
            alert('Failed to create recipe');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Create New Recipe</h1>
                <RecipeForm onSubmit={handleCreate} buttonLabel="Create Recipe" />
            </div>
        </div>
    );
}
