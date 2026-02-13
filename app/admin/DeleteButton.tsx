'use client';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ id }: { id: number }) {
    const router = useRouter();

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this recipe?')) {
            const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to delete');
            }
        }
    };

    return (
        <button onClick={handleDelete} className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors">
            Delete
        </button>
    );
}
