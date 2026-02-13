'use client';

import RecipeForm from '@/app/components/RecipeForm';
import { useRouter } from 'next/navigation';

export default function EditRecipeCustomForm({ recipe }: { recipe: any }) {
    const router = useRouter();

    const handleUpdate = async (data: any) => {
        const res = await fetch(`/api/recipes/${recipe.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (res.ok) {
            router.push('/admin/dashboard');
            router.refresh();
        } else {
            alert('Failed to update recipe');
        }
    };

    return <RecipeForm initialData={recipe} onSubmit={handleUpdate} buttonLabel="Update Recipe" />;
}
