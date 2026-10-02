"use client";

import { useEffect, useState } from "react";
import { setBudgetAction } from "@/actions/budget";
import type { BudgetItem } from "@/lib/budget/types";

interface BudgetFormModalProps {
  isOpen: boolean;
  monthYear: string;
  currentBudget: BudgetItem | null;
  onClose: () => void;
  onSaved: (budget: BudgetItem) => void;
}

function formatMonth(monthYear: string): string {
  return new Date(`${monthYear}-01T00:00:00`).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

export default function BudgetFormModal({
  isOpen,
  monthYear,
  currentBudget,
  onClose,
  onSaved,
}: BudgetFormModalProps) {
  const [amount, setAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = window.setTimeout(() => {
      setAmount(currentBudget ? String(currentBudget.amount) : "");
      setErrorMessage(null);
      setFieldError(null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [currentBudget, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setFieldError(null);

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFieldError("Masukkan nominal anggaran yang lebih besar dari 0.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await setBudgetAction(monthYear, numericAmount);
      if (!result.ok) {
        setErrorMessage(result.message);
        setFieldError(result.fieldErrors?.amount ?? null);
        return;
      }

      if (!result.data) {
        setErrorMessage("Data anggaran tidak dapat dibaca setelah disimpan.");
        return;
      }

      onSaved(result.data);
      onClose();
    } catch (error) {
      console.error(error);
      setErrorMessage("Terjadi kegagalan komunikasi dengan server.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Tetapkan Anggaran
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Periode {formatMonth(monthYear)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Tutup form anggaran"
            className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          <div>
            <label
              htmlFor="budget-amount"
              className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Batas pengeluaran bulanan (Rp)
            </label>
            <input
              id="budget-amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              autoFocus
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Contoh: 1500000"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            {fieldError && <p className="mt-1 text-xs text-rose-500">{fieldError}</p>}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
            >
              {isSaving ? "Menyimpan..." : "Simpan Anggaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
