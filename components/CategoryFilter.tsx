'use client';

interface CategoryFilterProps {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => onSelectCategory('All')}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${selectedCategory === 'All'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                    }`}
            >
                All Categories
            </button>
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onSelectCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${selectedCategory === category
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                        }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}
