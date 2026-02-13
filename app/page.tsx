import { db } from "@/lib/db";
import HomeContent from "./HomeContent";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";

export default async function HomePage() {
  const recipes = await db.recipe.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // Get session data
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  // Prepare session data for client component
  const sessionData = session.user?.isLoggedIn ? {
    isLoggedIn: true,
    user: {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
      role: session.user.role,
      profileImageUrl: session.user.profileImageUrl || undefined,
    },
    role: session.user.role,
  } : null;

  // Show register button for first two users (who will become admins)
  const userCount = await db.user.count();
  const showRegisterButton = userCount < 2;

  return <HomeContent recipes={recipes} session={sessionData} showRegisterButton={showRegisterButton} />;
}
