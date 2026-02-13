import { SessionOptions } from "iron-session";

export interface SessionData {
    user?: {
        isLoggedIn: boolean;
        username: string;
        email: string;
        role: string;
        id: number;
        profileImageUrl?: string | null;
    };
}

export const sessionOptions: SessionOptions = {
    password: process.env.SECRET_COOKIE_PASSWORD || "complex_password_at_least_32_characters_long",
    cookieName: "rezept-app-session",
    cookieOptions: {
        // Only use secure cookies if explicitly in production AND using HTTPS
        // For local Raspberry Pi deployments without SSL, this should be false
        secure: process.env.NODE_ENV === "production" && process.env.USE_SECURE_COOKIES === "true",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    },
};
