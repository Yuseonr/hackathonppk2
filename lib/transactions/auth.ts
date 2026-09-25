import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";

export interface SessionUser {
  userId: string;
  userEmail: string;
}

/**
 * requireSession contract implementation.
 * Sesuai kontrak integrasi PRD:
 * Memvalidasi session aktif dari cookie di server dan mengembalikan { userId, userEmail }.
 * Jika tidak valid, mengarahkan (redirect) ke /login.
 */
export async function requireSession(): Promise<SessionUser> {
  // 1. Coba delegasikan ke Yuma (@/lib/auth/session atau @/lib/auth) jika modul tersebut sudah di-merge
  try {
    const authPath = "@/lib/auth/session";
    // @ts-ignore - Modul autentikasi disediakan oleh Dev 1 (Yuma)
    const authModule = await import(/* webpackIgnore: true */ authPath).catch(() => null);
    if (authModule && typeof authModule.requireSession === "function") {
      const res = await authModule.requireSession();
      if (res && res.userId) {
        return {
          userId: res.userId,
          userEmail: res.userEmail || res.email || "user@moneylover.com",
        };
      }
    }
  } catch (err: unknown) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
  }

  // 2. Fallback validasi session langsung dari database melalui cookie
  const cookieStore = await cookies();
  const sessionId =
    cookieStore.get("session_id")?.value ||
    cookieStore.get("session")?.value;

  if (sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (session && session.expiresAt > new Date()) {
      return {
        userId: session.userId,
        userEmail: session.user.email,
      };
    }
  }

  // 3. Jika sesi tidak ada:
  // Untuk keperluan development sebelum modul auth Yuma diintegrasikan,
  // siapkan default dev user jika database kosong, atau redirect jika rute privat.
  if (process.env.NODE_ENV === "development") {
    let defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: "fritz.dev@moneylover.local",
          passwordHash: "demo_hash_dev",
        },
      });
    }
    return {
      userId: defaultUser.id,
      userEmail: defaultUser.email,
    };
  }

  // Pada mode produksi, redirect ke login jika tidak terautentikasi
  redirect("/login");
}
