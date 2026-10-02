"use client";

import { useState } from "react";
import BudgetFormModal from "./BudgetFormModal";
import type { BudgetItem } from "@/lib/budget/types";

interface BudgetSummaryProps {
  monthYear: string;
  totalExpense: number;
  budget: BudgetItem | null;
  isLoading: boolean;
  onBudgetSaved: (budget: BudgetItem) => void;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMonth(monthYear: string): string {
  return new Date(`${monthYear}-01T00:00:00`).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

export default function BudgetSummary({
  monthYear,
  totalExpense,
  budget,
  isLoading,
  onBudgetSaved,
}: BudgetSummaryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const budgetAmount = budget?.amount ?? 0;
  const usagePercentage = budgetAmount > 0 ? (totalExpense / budgetAmount) * 100 : 0;
  const progressPercentage = Math.min(Math.max(usagePercentage, 0), 100);

  const status =
    !budget
      ? {
          label: "Belum ditetapkan",
          badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
          bar: "bg-zinc-300 dark:bg-zinc-600",
          value: "text-zinc-700 dark:text-zinc-200",
        }
      : usagePercentage < 75
        ? {
            label: "Aman",
            badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
            bar: "bg-emerald-500",
            value: "text-emerald-700 dark:text-emerald-400",
          }
        : usagePercentage < 100
          ? {
              label: "Waspada",
              badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
              bar: "bg-amber-500",
              value: "text-amber-700 dark:text-amber-400",
            }
          : {
              label: "Melebihi batas",
              badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400",
              bar: "bg-rose-500",
              value: "text-rose-700 dark:text-rose-400",
            };

  return (
    <>
      <section className={`rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-opacity dark:border-zinc-800 dark:bg-zinc-900 ${isLoading ? "opacity-60" : ""}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Anggaran bulanan
            </p>
            <h3 className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
              {formatMonth(monthYear)}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={isLoading}
            className="rounded-xl border border-emerald-200 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
          >
            {budget ? "Ubah Anggaran" : "Tetapkan Anggaran"}
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-zinc-600 dark:text-zinc-300">
                Pengeluaran bulan ini
              </span>
              <span className={`font-bold ${status.value}`}>
                {budget ? `${usagePercentage.toFixed(1)}%` : "-"}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${status.bar}`}
                style={{ width: `${budget ? progressPercentage : 0}%` }}
                role="progressbar"
                aria-valuenow={budget ? Math.round(usagePercentage) : 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Penggunaan anggaran"
              />
            </div>
          </div>

          <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${status.badge}`}>
            {status.label}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Terpakai</p>
            <p className="mt-1 font-bold text-rose-600 dark:text-rose-400">
              {formatRupiah(totalExpense)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Anggaran</p>
            <p className="mt-1 font-bold text-zinc-900 dark:text-white">
              {budget ? formatRupiah(budgetAmount) : "Belum ada"}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Sisa anggaran</p>
            <p className={`mt-1 font-bold ${budget && budgetAmount - totalExpense < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {budget ? formatRupiah(budgetAmount - totalExpense) : "-"}
            </p>
          </div>
        </div>
      </section>

      <BudgetFormModal
        isOpen={isModalOpen}
        monthYear={monthYear}
        currentBudget={budget}
        onClose={() => setIsModalOpen(false)}
        onSaved={(savedBudget) => {
          onBudgetSaved(savedBudget);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}
