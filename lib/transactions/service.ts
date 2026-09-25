import { prisma } from "./db";
import { requireSession } from "./auth";
import type { DashboardData, TransactionItem, TransactionType, ActionResult } from "./types";

/**
 * Mengambil data transaksi dan ringkasan keuangan untuk pengguna yang sedang login.
 * Sesuai kontrak PRD getDashboardData:
 * Output: { userEmail, totalIncome, totalExpense, balance, transactions }
 */
export async function getDashboardData(): Promise<DashboardData> {
  const { userId, userEmail } = await requireSession();

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: [
      { transactionDate: "desc" },
      { createdAt: "desc" },
    ],
  });

  let totalIncome = 0;
  let totalExpense = 0;

  const formattedTransactions: TransactionItem[] = transactions.map((t) => {
    const numericAmount = Number(t.amount);
    if (t.type === "income") {
      totalIncome += numericAmount;
    } else if (t.type === "expense") {
      totalExpense += numericAmount;
    }

    return {
      id: t.id,
      userId: t.userId,
      type: t.type as TransactionType,
      amount: numericAmount,
      transactionDate: t.transactionDate.toISOString().split("T")[0],
      description: t.description,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  });

  const balance = totalIncome - totalExpense;

  return {
    userId,
    userEmail,
    totalIncome,
    totalExpense,
    balance,
    transactions: formattedTransactions,
  };
}

/**
 * Menambah transaksi baru milik pengguna yang login.
 * Sesuai kontrak PRD createTransaction.
 */
export async function createTransaction(data: {
  type: TransactionType;
  amount: number;
  transactionDate: string;
  description?: string | null;
}): Promise<ActionResult<TransactionItem>> {
  const { userId } = await requireSession();

  const fieldErrors: Record<string, string> = {};

  if (!data.type || (data.type !== "income" && data.type !== "expense")) {
    fieldErrors.type = "Jenis transaksi harus 'income' (pemasukan) atau 'expense' (pengeluaran)";
  }

  if (typeof data.amount !== "number" || isNaN(data.amount) || data.amount <= 0) {
    fieldErrors.amount = "Nominal harus berupa angka lebih besar dari 0";
  }

  if (!data.transactionDate || isNaN(Date.parse(data.transactionDate))) {
    fieldErrors.transactionDate = "Tanggal transaksi wajib diisi dengan format tanggal valid";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Validasi form gagal. Mohon periksa kembali input Anda.",
      fieldErrors,
    };
  }

  try {
    const created = await prisma.transaction.create({
      data: {
        userId,
        type: data.type,
        amount: data.amount,
        transactionDate: new Date(data.transactionDate),
        description: data.description ? data.description.trim() : null,
      },
    });

    return {
      ok: true,
      message: "Transaksi berhasil dicatat.",
      data: {
        id: created.id,
        userId: created.userId,
        type: created.type as TransactionType,
        amount: Number(created.amount),
        transactionDate: created.transactionDate.toISOString().split("T")[0],
        description: created.description,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Gagal membuat transaksi:", error);
    return {
      ok: false,
      message: "Terjadi kesalahan pada server saat menyimpan transaksi.",
    };
  }
}

/**
 * Mengubah transaksi milik pengguna yang login.
 * Memastikan otorisasi kepemilikan transaksi (AC-06).
 */
export async function updateTransaction(data: {
  id: string;
  type: TransactionType;
  amount: number;
  transactionDate: string;
  description?: string | null;
}): Promise<ActionResult<TransactionItem>> {
  const { userId } = await requireSession();

  const fieldErrors: Record<string, string> = {};

  if (!data.id) {
    return {
      ok: false,
      message: "ID transaksi tidak ditemukan.",
    };
  }

  if (!data.type || (data.type !== "income" && data.type !== "expense")) {
    fieldErrors.type = "Jenis transaksi harus 'income' atau 'expense'";
  }

  if (typeof data.amount !== "number" || isNaN(data.amount) || data.amount <= 0) {
    fieldErrors.amount = "Nominal harus berupa angka lebih besar dari 0";
  }

  if (!data.transactionDate || isNaN(Date.parse(data.transactionDate))) {
    fieldErrors.transactionDate = "Tanggal transaksi wajib diisi dengan format valid";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Validasi form gagal.",
      fieldErrors,
    };
  }

  // Verifikasi kepemilikan transaksi
  const existing = await prisma.transaction.findFirst({
    where: {
      id: data.id,
      userId,
    },
  });

  if (!existing) {
    return {
      ok: false,
      message: "Transaksi tidak ditemukan atau Anda tidak memiliki akses untuk mengubahnya.",
    };
  }

  try {
    const updated = await prisma.transaction.update({
      where: { id: data.id },
      data: {
        type: data.type,
        amount: data.amount,
        transactionDate: new Date(data.transactionDate),
        description: data.description ? data.description.trim() : null,
      },
    });

    return {
      ok: true,
      message: "Transaksi berhasil diperbarui.",
      data: {
        id: updated.id,
        userId: updated.userId,
        type: updated.type as TransactionType,
        amount: Number(updated.amount),
        transactionDate: updated.transactionDate.toISOString().split("T")[0],
        description: updated.description,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Gagal memperbarui transaksi:", error);
    return {
      ok: false,
      message: "Terjadi kesalahan saat memperbarui transaksi.",
    };
  }
}

/**
 * Menghapus transaksi milik pengguna yang login.
 * Memastikan otorisasi kepemilikan transaksi (AC-06).
 */
export async function deleteTransaction(id: string): Promise<ActionResult> {
  const { userId } = await requireSession();

  if (!id) {
    return {
      ok: false,
      message: "ID transaksi tidak valid.",
    };
  }

  const existing = await prisma.transaction.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existing) {
    return {
      ok: false,
      message: "Transaksi tidak ditemukan atau Anda tidak memiliki akses untuk menghapusnya.",
    };
  }

  try {
    await prisma.transaction.delete({
      where: { id },
    });

    return {
      ok: true,
      message: "Transaksi berhasil dihapus.",
    };
  } catch (error) {
    console.error("Gagal menghapus transaksi:", error);
    return {
      ok: false,
      message: "Terjadi kesalahan saat menghapus transaksi.",
    };
  }
}
