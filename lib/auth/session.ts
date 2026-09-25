import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "session_id";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
    },
  });

  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, session.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
    });
  } catch {
    // Ignore error if invoked outside Next.js request context (e.g., CLI tests)
  }

  return session;
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionId) return null;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!session) {
      try {
        cookieStore.delete(SESSION_COOKIE_NAME);
      } catch {
        // ignore
      }
      return null;
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
      try {
        cookieStore.delete(SESSION_COOKIE_NAME);
      } catch {
        // ignore
      }
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (sessionId) {
      await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
      cookieStore.delete(SESSION_COOKIE_NAME);
    }
  } catch {
    // ignore
  }
}

/**
 * Required by Fritz & protected server components/actions.
 * Returns { userId, userEmail } if valid session exists.
 * Redirects to /login if session is missing or invalid.
 */
export async function requireSession(): Promise<{ userId: string; userEmail: string }> {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/login");
  }
  return {
    userId: session.userId,
    userEmail: session.user.email,
  };
}
