"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getDashboardData,
} from "@/lib/transactions/service";
import type { TransactionType } from "@/lib/transactions/types";

/**
 * Server Action: Mengambil data dashboard
 */
export async function getDashboardDataAction() {
  return await getDashboardData();
}

/**
 * Server Action: Tambah Transaksi
 */
export async function createTransactionAction(data: {
  type: TransactionType;
  amount: number;
  transactionDate: string;
  description?: string | null;
}) {
  const result = await createTransaction(data);
  if (result.ok) {
    revalidatePath("/dashboard");
    revalidatePath("/");
  }
  return result;
}

/**
 * Server Action: Ubah Transaksi
 */
export async function updateTransactionAction(data: {
  id: string;
  type: TransactionType;
  amount: number;
  transactionDate: string;
  description?: string | null;
}) {
  const result = await updateTransaction(data);
  if (result.ok) {
    revalidatePath("/dashboard");
    revalidatePath("/");
  }
  return result;
}

/**
 * Server Action: Hapus Transaksi
 */
export async function deleteTransactionAction(id: string) {
  const result = await deleteTransaction(id);
  if (result.ok) {
    revalidatePath("/dashboard");
    revalidatePath("/");
  }
  return result;
}

/**
 * Server Action: Simpan Preferensi Tema Pengguna ke Cookie
 * Sesuai requirement PRD US-08 dan AC-07
 */
export async function setThemePreferenceAction(theme: "light" | "dark") {
  if (theme !== "light" && theme !== "dark") {
    return { ok: false, message: "Preferensi tema tidak valid." };
  }

  const cookieStore = await cookies();
  cookieStore.set("theme", theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 tahun
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false, // Boleh diakses client untuk script tema instan
  });
  return { ok: true, message: "Preferensi tema disimpan.", theme };
}
