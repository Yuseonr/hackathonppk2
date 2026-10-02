import { requireSession } from "@/lib/auth/session";
import { isValidMonthYear } from "@/lib/month";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/transactions/types";
import type { BudgetActionResult, BudgetItem } from "./types";

const MAX_BUDGET_AMOUNT = 9_999_999_999.99;

function toBudgetItem(budget: {
  id: string;
  userId: string;
  monthYear: string;
  amount: unknown;
  createdAt: Date;
  updatedAt: Date;
}): BudgetItem {
  return {
    id: budget.id,
    userId: budget.userId,
    monthYear: budget.monthYear,
    amount: Number(budget.amount),
    createdAt: budget.createdAt.toISOString(),
    updatedAt: budget.updatedAt.toISOString(),
  };
}

function validateBudgetInput(monthYear: unknown, amount: unknown) {
  const fieldErrors: Record<string, string> = {};

  if (!isValidMonthYear(monthYear)) {
    fieldErrors.monthYear = "Bulan harus menggunakan format yang valid.";
  }

  const numericAmount =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount)
        : Number.NaN;

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0 ||
    numericAmount > MAX_BUDGET_AMOUNT ||
    !Number.isInteger(numericAmount * 100)
  ) {
    fieldErrors.amount =
      "Anggaran harus lebih dari 0, maksimal 2 angka desimal, dan tidak melebihi batas nominal.";
  }

  return {
    monthYear: typeof monthYear === "string" ? monthYear : "",
    amount: numericAmount,
    fieldErrors,
  };
}

export async function getBudget(monthYear: string): Promise<BudgetItem | null> {
  const { userId } = await requireSession();

  if (!isValidMonthYear(monthYear)) {
    throw new Error("Bulan harus menggunakan format YYYY-MM yang valid.");
  }

  const budget = await prisma.budget.findUnique({
    where: {
      userId_monthYear: {
        userId,
        monthYear,
      },
    },
  });

  return budget ? toBudgetItem(budget) : null;
}

export async function setBudget(
  monthYear: unknown,
  amount: unknown,
): Promise<BudgetActionResult> {
  const { userId } = await requireSession();
  const validated = validateBudgetInput(monthYear, amount);

  if (Object.keys(validated.fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Validasi anggaran gagal. Mohon periksa kembali input Anda.",
      fieldErrors: validated.fieldErrors,
    };
  }

  try {
    const budget = await prisma.budget.upsert({
      where: {
        userId_monthYear: {
          userId,
          monthYear: validated.monthYear,
        },
      },
      create: {
        userId,
        monthYear: validated.monthYear,
        amount: validated.amount,
      },
      update: {
        amount: validated.amount,
      },
    });

    return {
      ok: true,
      message: "Anggaran bulanan berhasil disimpan.",
      data: toBudgetItem(budget),
    };
  } catch (error) {
    console.error("Gagal menyimpan anggaran:", error);
    return {
      ok: false,
      message: "Terjadi kesalahan pada server saat menyimpan anggaran.",
    } satisfies ActionResult<BudgetItem>;
  }
}
