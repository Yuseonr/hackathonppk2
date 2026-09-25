import React from "react";

interface SummaryCardsProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SummaryCards({
  balance,
  totalIncome,
  totalExpense,
}: SummaryCardsProps) {
  const isBalancePositive = balance >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Kartu Saldo */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Total Saldo
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isBalancePositive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
            }`}
          >
            {isBalancePositive ? "Surplus" : "Defisit"}
          </span>
        </div>
        <div className="mt-1">
          <h2
            className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              isBalancePositive
                ? "text-zinc-900 dark:text-white"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatRupiah(balance)}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Total Pemasukan dikurangi Pengeluaran
          </p>
        </div>
      </div>

      {/* Kartu Pemasukan */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Total Pemasukan
          </span>
          <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
          </div>
        </div>
        <div className="mt-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            +{formatRupiah(totalIncome)}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Akumulasi seluruh pemasukan
          </p>
        </div>
      </div>

      {/* Kartu Pengeluaran */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Total Pengeluaran
          </span>
          <div className="w-7 h-7 rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 13l-5 5m0 0l-5-5m5 5V6"
              />
            </svg>
          </div>
        </div>
        <div className="mt-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
            -{formatRupiah(totalExpense)}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Akumulasi seluruh pengeluaran
          </p>
        </div>
      </div>
    </div>
  );
}
