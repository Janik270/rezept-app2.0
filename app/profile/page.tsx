import { db } from "@/lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfilePage() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.user?.isLoggedIn) {
        redirect("/login");
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
            favorites: {
                include: {
                    recipe: true,
                },
            },
        },
    });

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 pb-32">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link
                        href="/"
                        className="text-white/80 hover:text-white font-medium text-sm transition-colors inline-flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>
                </nav>
            </div>

            <main className="-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-12">
                        <div className="flex items-center space-x-6">
                            <ProfileImage user={user} />
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.username}</h1>
                                <p className="text-gray-600 mb-3">{user.email}</p>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="px-8 py-8">
                        {/* Favorite Recipes Section */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <svg className="w-6 h-6 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                Favorite Recipes ({user.favorites.length})
                            </h2>

                            {user.favorites.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {user.favorites.map((fav) => (
                                        <Link
                                            key={fav.id}
                                            href={`/recipes/${fav.recipe.id}`}
                                            className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                        >
                                            {fav.recipe.imageUrl ? (
                                                <div className="h-40 w-full overflow-hidden">
                                                    <img
                                                        src={fav.recipe.imageUrl}
                                                        alt={fav.recipe.title}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-40 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-400 text-5xl">🥘</span>
                                                </div>
                                            )}
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-1">
                                                    {fav.recipe.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 line-clamp-2">
                                                    {fav.recipe.description}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No favorite recipes yet</h3>
                                    <p className="mt-1 text-sm text-gray-500">Start exploring and save your favorite recipes!</p>
                                    <div className="mt-6">
                                        <Link
                                            href="/"
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                                        >
                                            Browse Recipes
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="border-t border-gray-200 pt-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Link
                                    href="/admin/dashboard"
                                    className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                >
                                    <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-gray-900">Go to Dashboard</p>
                                        <p className="text-sm text-gray-500">Manage your recipes</p>
                                    </div>
                                </Link>
                                <Link
                                    href="/"
                                    className="flex items-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                                >
                                    <svg className="w-6 h-6 text-pink-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-gray-900">Browse Recipes</p>
                                        <p className="text-sm text-gray-500">Discover new dishes</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Client Component for Profile Image with Generate Button
import ProfileImage from "./ProfileImage";
