import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import type {
  ActionResult,
  DashboardData,
  TransactionInput,
  TransactionItem,
  TransactionType,
} from "./types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DESCRIPTION_LENGTH = 2_000;

function toTransactionItem(transaction: {
  id: string;
  userId: string;
  type: string;
  amount: unknown;
  transactionDate: Date;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}): TransactionItem {
  return {
    id: transaction.id,
    userId: transaction.userId,
    type: transaction.type as TransactionType,
    amount: Number(transaction.amount),
    transactionDate: transaction.transactionDate.toISOString().slice(0, 10),
    description: transaction.description,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
}

function parseTransactionDate(value: unknown): Date | null {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function validateTransactionInput(data: unknown) {
  const input = (data ?? {}) as Partial<TransactionInput>;
  const fieldErrors: Record<string, string> = {};

  if (input.type !== "income" && input.type !== "expense") {
    fieldErrors.type = "Jenis transaksi harus pemasukan atau pengeluaran.";
  }

  if (
    typeof input.amount !== "number" ||
    !Number.isFinite(input.amount) ||
    input.amount <= 0 ||
    !Number.isInteger(input.amount * 100)
  ) {
    fieldErrors.amount = "Nominal harus lebih dari 0 dan maksimal 2 angka desimal.";
  }

  const transactionDate = parseTransactionDate(input.transactionDate);
  if (!transactionDate) {
    fieldErrors.transactionDate = "Tanggal transaksi wajib diisi dengan format yang valid.";
  }

  const description =
    typeof input.description === "string" ? input.description.trim() : "";
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    fieldErrors.description = `Keterangan maksimal ${MAX_DESCRIPTION_LENGTH} karakter.`;
  }

  return {
    input,
    transactionDate,
    description: description || null,
    fieldErrors,
  };
}

/** Mengambil dashboard hanya untuk pengguna dari session aktif. */
export async function getDashboardData(): Promise<DashboardData> {
  const { userId, userEmail } = await requireSession();
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const formattedTransactions = transactions.map(toTransactionItem);

  for (const transaction of formattedTransactions) {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  }

  return {
    userId,
    userEmail,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactions: formattedTransactions,
  };
}

/** Membuat transaksi dengan owner yang selalu berasal dari session. */
export async function createTransaction(
  data: TransactionInput,
): Promise<ActionResult<TransactionItem>> {
  const { userId } = await requireSession();
  const validated = validateTransactionInput(data);

  if (Object.keys(validated.fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Validasi form gagal. Mohon periksa kembali input Anda.",
      fieldErrors: validated.fieldErrors,
    };
  }

  try {
    const created = await prisma.transaction.create({
      data: {
        userId,
        type: validated.input.type as TransactionType,
        amount: validated.input.amount as number,
        transactionDate: validated.transactionDate as Date,
        description: validated.description,
      },
    });

    return {
      ok: true,
      message: "Transaksi berhasil dicatat.",
      data: toTransactionItem(created),
    };
  } catch (error) {
    console.error("Gagal membuat transaksi:", error);
    return {
      ok: false,
      message: "Terjadi kesalahan pada server saat menyimpan transaksi.",
    };
  }
}

/** Mengubah transaksi hanya jika id dan owner cocok. */
export async function updateTransaction(
  data: TransactionInput & { id: string },
): Promise<ActionResult<TransactionItem>> {
  const { userId } = await requireSession();

  if (!isUuid(data?.id)) {
    return { ok: false, message: "Transaksi tidak ditemukan." };
  }

  const validated = validateTransactionInput(data);
  if (Object.keys(validated.fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Validasi form gagal. Mohon periksa kembali input Anda.",
      fieldErrors: validated.fieldErrors,
    };
  }

  try {
    const result = await prisma.transaction.updateMany({
      where: { id: data.id, userId },
      data: {
        type: validated.input.type as TransactionType,
        amount: validated.input.amount as number,
        transactionDate: validated.transactionDate as Date,
        description: validated.description,
      },
    });

    if (result.count !== 1) {
      return {
        ok: false,
        message: "Transaksi tidak ditemukan atau bukan milik Anda.",
      };
    }

    const updated = await prisma.transaction.findUniqueOrThrow({
      where: { id: data.id },
    });

    return {
      ok: true,
      message: "Transaksi berhasil diperbarui.",
      data: toTransactionItem(updated),
    };
  } catch (error) {
    console.error("Gagal memperbarui transaksi:", error);
    return {
      ok: false,
      message: "Terjadi kesalahan saat memperbarui transaksi.",
    };
  }
}

/** Menghapus transaksi hanya jika id dan owner cocok. */
export async function deleteTransaction(id: string): Promise<ActionResult> {
  const { userId } = await requireSession();

  if (!isUuid(id)) {
    return { ok: false, message: "Transaksi tidak ditemukan." };
  }

  try {
    const result = await prisma.transaction.deleteMany({
      where: { id, userId },
    });

    return result.count === 1
      ? { ok: true, message: "Transaksi berhasil dihapus." }
      : { ok: false, message: "Transaksi tidak ditemukan atau bukan milik Anda." };
  } catch (error) {
    console.error("Gagal menghapus transaksi:", error);
    return {
      ok: false,
      message: "Terjadi kesalahan saat menghapus transaksi.",
    };
  }
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}
