import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "session_id";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SessionUser {
  userId: string;
  userEmail: string;
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
    path: "/",
  });

  return session;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId || !isUuid(sessionId)) {
    return null;
  }

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

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return session;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId && isUuid(sessionId)) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Required by Fritz & protected server components/actions.
 * Returns { userId, userEmail } if valid session exists.
 * Redirects to /login if session is missing or invalid.
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/login");
  }
  return {
    userId: session.userId,
    userEmail: session.user.email,
  };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
