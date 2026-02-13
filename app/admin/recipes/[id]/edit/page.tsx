import Link from 'next/link';
import EditRecipeCustomForm from './EditRecipeForm';
// Note: We need a client component for the form logic, but keeping the page server-side to fetch data is nicer pattern.
// However, since params are async now in Next.js 15, let's just make the page async server component and fetch data using params.

import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.user?.isLoggedIn) {
        redirect('/login');
    }

    const { id } = await params;
    const recipe = await db.recipe.findUnique({
        where: { id: parseInt(id) },
    });

    if (!recipe) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link href="/admin/dashboard" className="text-purple-600 hover:text-purple-800 font-medium">
                        &larr; Back to Dashboard
                    </Link>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Edit Recipe</h1>
                <EditRecipeCustomForm recipe={recipe} />
            </div>
        </div>
    );
}
