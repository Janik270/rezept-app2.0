import { db } from "@/lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getRecipes() {
    return await db.recipe.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

async function getSetting(key: string) {
    const setting = await db.setting.findUnique({
        where: { key },
    });
    return setting?.value || '';
}

export default async function DashboardPage() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    console.log("Dashboard session:", JSON.stringify(session.user));
    if (!session.user?.isLoggedIn) {
        redirect("/login");
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
        redirect("/"); // Redirect normal users to home page
    }

    const recipes = await getRecipes();
    const openaiApiKey = await getSetting('openai_api_key');

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 sm:h-16">
                        <div className="flex items-center">
                            <h1 className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                                Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <Link
                                href="/"
                                className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
                            >
                                <span className="hidden sm:inline">View Public Site</span>
                                <span className="sm:hidden">🏠</span>
                            </Link>
                            {session.user && (
                                <UserButton user={session.user} />
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-4 sm:py-6 md:py-10 px-3 sm:px-4 lg:px-8">
                <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Your Recipes</h2>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {session.user?.role === "ADMIN" && (
                            <>
                                <Link
                                    href="/admin/users"
                                    className="flex-1 min-w-[140px] sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border border-purple-200 text-xs sm:text-sm md:text-base font-medium rounded-full shadow-sm text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
                                >
                                    <span className="mr-1.5">👥</span>
                                    <span className="hidden sm:inline">Manage Users</span>
                                    <span className="sm:hidden">Users</span>
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex-1 min-w-[140px] sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border border-purple-200 text-xs sm:text-sm md:text-base font-medium rounded-full shadow-sm text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
                                >
                                    <span className="mr-1.5">👤</span>
                                    <span className="hidden sm:inline">Add User</span>
                                    <span className="sm:hidden">Add</span>
                                </Link>
                            </>
                        )}
                        <Link
                            href="/admin/recipes/new"
                            className="flex-1 min-w-[140px] sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border border-transparent text-xs sm:text-sm md:text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
                        >
                            <span className="mr-1.5">+</span>
                            <span className="hidden sm:inline">Create New Recipe</span>
                            <span className="sm:hidden">New Recipe</span>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {recipes.map((recipe: any) => (
                        <div key={recipe.id} className="bg-white overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                            {recipe.imageUrl && (
                                <div className="h-40 sm:h-48 w-full overflow-hidden relative">
                                    {/* Using standard img for simplicity here, can upgrade to next/image if configured */}
                                    <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-4">
                                        <p className="text-white text-xs sm:text-sm font-medium truncate">{recipe.description}</p>
                                    </div>
                                </div>
                            )}
                            <div className="px-4 sm:px-6 py-4 sm:py-5">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">{recipe.title}</h3>
                                <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 h-8 sm:h-10">{recipe.description}</p>
                            </div>
                            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                <Link href={`/admin/recipes/${recipe.id}/edit`} className="text-purple-600 hover:text-purple-900 font-medium text-xs sm:text-sm transition-colors">
                                    Edit
                                </Link>
                                {/* Delete needs client interaction ideally, or form */}
                                <DeleteButton id={recipe.id} />
                            </div>
                        </div>
                    ))}

                    {recipes.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No recipes yet</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new recipe.</p>
                            <div className="mt-6">
                                <Link
                                    href="/admin/recipes/new"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                                >
                                    Create Recipe
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Configuration Section */}
                <AISettings initialApiKey={openaiApiKey} />

                {/* Pending Recipes Section */}
                <PendingRecipes />

                {/* Category Management Section */}
                <CategoryManagement />
            </main>

            {/* Removed ViewModeSwitcher as requested */}
        </div>
    );
}

// Simple Client Components for Interactivity
import DeleteButton from "../DeleteButton";
import AISettings from "./AISettings";
import UserButton from "@/components/UserButton";
import CategoryManagement from "./CategoryManagement";
import PendingRecipes from "./PendingRecipes";

