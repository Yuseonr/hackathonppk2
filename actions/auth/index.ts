"use server";

import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { createUser, findUserByEmail } from "@/lib/users";

export interface AuthActionResult {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

function readCredentials(email: unknown, password: unknown) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const rawPassword = typeof password === "string" ? password : "";
  const fieldErrors: Record<string, string> = {};

  if (!normalizedEmail || !EMAIL_PATTERN.test(normalizedEmail)) {
    fieldErrors.email = "Masukkan alamat email yang valid.";
  }

  if (rawPassword.length < MIN_PASSWORD_LENGTH) {
    fieldErrors.password = `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  } else if (rawPassword.length > MAX_PASSWORD_LENGTH) {
    fieldErrors.password = `Password maksimal ${MAX_PASSWORD_LENGTH} karakter.`;
  }

  return { normalizedEmail, rawPassword, fieldErrors };
}

export async function register(
  email: unknown,
  password: unknown,
): Promise<AuthActionResult> {
  const { normalizedEmail, rawPassword, fieldErrors } = readCredentials(
    email,
    password,
  );

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Periksa kembali data pendaftaran Anda.",
      fieldErrors,
    };
  }

  if (await findUserByEmail(normalizedEmail)) {
    return {
      ok: false,
      message: "Email tersebut sudah terdaftar.",
      fieldErrors: { email: "Gunakan email lain atau masuk ke akun Anda." },
    };
  }

  try {
    await createUser(normalizedEmail, await hashPassword(rawPassword));
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return {
        ok: false,
        message: "Email tersebut sudah terdaftar.",
        fieldErrors: { email: "Gunakan email lain atau masuk ke akun Anda." },
      };
    }

    console.error("Gagal mendaftarkan pengguna:", error);
    return { ok: false, message: "Pendaftaran gagal. Silakan coba lagi." };
  }

  return {
    ok: true,
    message: "Akun berhasil dibuat. Silakan masuk untuk melanjutkan.",
  };
}

export async function login(
  email: unknown,
  password: unknown,
): Promise<AuthActionResult> {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const rawPassword = typeof password === "string" ? password : "";

  if (!normalizedEmail || !rawPassword) {
    return { ok: false, message: "Email atau password salah." };
  }

  const user = await findUserByEmail(normalizedEmail);
  const isValid = user ? await verifyPassword(rawPassword, user.passwordHash) : false;

  if (!user || !isValid) {
    return { ok: false, message: "Email atau password salah." };
  }

  await createSession(user.id);
  return { ok: true, message: "Login berhasil." };
}

export async function logout(): Promise<never> {
  await deleteSession();
  redirect("/login");
}
