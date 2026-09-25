"use client";

import React, { useState, useMemo } from "react";
import type { TransactionItem } from "@/lib/transactions/types";

interface TransactionListProps {
  transactions: TransactionItem[];
  onAddClick: () => void;
  onEditClick: (item: TransactionItem) => void;
  onDeleteClick: (item: TransactionItem) => void;
}

type FilterType = "all" | "income" | "expense";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateIndo(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function TransactionList({
  transactions,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: TransactionListProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredTransactions = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
      {/* List Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Riwayat Transaksi
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Daftar pemasukan dan pengeluaran Anda
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Filter Tabs */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Semua ({transactions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("income")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === "income"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setFilter("expense")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === "expense"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Pengeluaran
            </button>
          </div>

          {/* Tombol Tambah Transaksi */}
          <button
            type="button"
            onClick={onAddClick}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ml-auto sm:ml-0"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Transaction List Body */}
      {filteredTransactions.length === 0 ? (
        /* Empty State */
        <div className="py-14 px-4 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-3">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {transactions.length === 0
              ? "Belum ada transaksi"
              : "Tidak ada transaksi dalam kategori ini"}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 mb-4">
            {transactions.length === 0
              ? "Mulai catat pemasukan dan pengeluaran harian Anda agar kondisi keuangan tetap terkontrol."
              : "Coba ganti filter tab atau tambahkan transaksi baru."}
          </p>
          {transactions.length === 0 && (
            <button
              type="button"
              onClick={onAddClick}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              + Catat Transaksi Pertama
            </button>
          )}
        </div>
      ) : (
        /* List Items */
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {filteredTransactions.map((item) => {
            const isIncome = item.type === "income";

            return (
              <div
                key={item.id}
                className="p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
              >
                {/* Info Kiri */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? (
                      <svg
                        className="w-5 h-5"
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
                    ) : (
                      <svg
                        className="w-5 h-5"
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
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {item.description || (isIncome ? "Pemasukan" : "Pengeluaran")}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      <span>{formatDateIndo(item.transactionDate)}</span>
                      <span>•</span>
                      <span
                        className={`font-medium ${
                          isIncome
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isIncome ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nominal & Actions Kanan */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-sm sm:text-base font-bold ${
                      isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatRupiah(item.amount)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditClick(item)}
                      title="Edit transaksi"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteClick(item)}
                      title="Hapus transaksi"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
