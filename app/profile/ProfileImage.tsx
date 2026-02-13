'use client';

import { useState } from 'react';

interface ProfileImageProps {
    user: {
        username: string;
        profileImageUrl?: string | null;
    };
}

export default function ProfileImage({ user }: ProfileImageProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [profileImage, setProfileImage] = useState(user.profileImageUrl);

    const handleGenerateImage = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate-profile-image', {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                setProfileImage(data.imageUrl);
                // Refresh the page to update the session
                setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error || 'Failed to generate profile image');
            }
        } catch (error) {
            console.error('Error generating profile image:', error);
            alert('Failed to generate profile image');
        } finally {
            setIsGenerating(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="relative group">
            {profileImage ? (
                <img
                    src={profileImage}
                    alt={user.username}
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl"
                />
            ) : (
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-xl">
                    {getInitials(user.username)}
                </div>
            )}
            <button
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-purple-200"
                title={profileImage ? "Regenerate profile image" : "Generate profile image"}
            >
                {isGenerating ? (
                    <svg className="animate-spin h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )}
            </button>
        </div>
    );
}
