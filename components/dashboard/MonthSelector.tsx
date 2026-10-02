"use client";

import React, { useMemo } from "react";

interface MonthSelectorProps {
  activeMonth: string; // format YYYY-MM atau "all"
  availableMonths: string[];
  onChangeMonth: (newMonth: string) => void;
  isPending: boolean;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatMonthYearLabel(monthYear: string): string {
  if (monthYear === "all") return "Semua Riwayat";
  try {
    const [year, month] = monthYear.split("-").map(Number);
    if (!year || !month || month < 1 || month > 12) return monthYear;
    return `${MONTH_NAMES[month - 1]} ${year}`;
  } catch {
    return monthYear;
  }
}

function getAdjacentMonth(monthYear: string, offset: number): string {
  if (monthYear === "all") {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  const [year, month] = monthYear.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  return `${nextYear}-${nextMonth}`;
}

export default function MonthSelector({
  activeMonth,
  availableMonths,
  onChangeMonth,
  isPending,
}: MonthSelectorProps) {
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const isCurrentMonth = activeMonth === currentMonth;

  // Pastikan daftar pilihan bulan terurut rapi dan menyertakan bulan aktif
  const selectOptions = useMemo(() => {
    const set = new Set<string>();
    set.add(currentMonth);
    if (activeMonth !== "all") {
      set.add(activeMonth);
    }
    for (const m of availableMonths) {
      if (m && m !== "all") set.add(m);
    }
    return Array.from(set).sort().reverse();
  }, [availableMonths, activeMonth, currentMonth]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Label Kiri */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block leading-tight">
            Periode Laporan
          </span>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
              {formatMonthYearLabel(activeMonth)}
            </h3>
            {isPending && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 animate-pulse">
                <svg
                  className="animate-spin h-3 w-3 text-emerald-600 dark:text-emerald-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Memuat...</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Kontrol Navigasi & Filter Bulan */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
        {/* Tombol Cepat: Bulan Ini (jika sedang di bulan lain) */}
        {!isCurrentMonth && (
          <button
            type="button"
            onClick={() => onChangeMonth(currentMonth)}
            disabled={isPending}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            Bulan Ini
          </button>
        )}

        {/* Tombol Bulan Sebelumnya (<) */}
        <button
          type="button"
          onClick={() => onChangeMonth(getAdjacentMonth(activeMonth, -1))}
          disabled={isPending}
          title="Bulan Sebelumnya"
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Dropdown Pilihan Bulan */}
        <div className="relative">
          <select
            value={activeMonth}
            onChange={(e) => onChangeMonth(e.target.value)}
            disabled={isPending}
            className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer disabled:opacity-50"
          >
            <optgroup label="Pilih Bulan">
              {selectOptions.map((m) => (
                <option key={m} value={m}>
                  {formatMonthYearLabel(m)} {m === currentMonth ? "(Bulan Ini)" : ""}
                </option>
              ))}
            </optgroup>
            <optgroup label="Opsi Lain">
              <option value="all">Semua Riwayat (Tanpa Filter Bulan)</option>
            </optgroup>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Date Picker khusus bulan (HTML5 native month input) */}
        <label
          htmlFor="month-picker-input"
          title="Buka Kalender Bulan (Pilih Bulan & Tahun)"
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer relative flex items-center justify-center"
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <input
            id="month-picker-input"
            type="month"
            value={activeMonth === "all" ? currentMonth : activeMonth}
            onChange={(e) => {
              if (e.target.value) {
                onChangeMonth(e.target.value);
              }
            }}
            disabled={isPending}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>

        {/* Tombol Bulan Berikutnya (>) */}
        <button
          type="button"
          onClick={() => onChangeMonth(getAdjacentMonth(activeMonth, 1))}
          disabled={isPending}
          title="Bulan Berikutnya"
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
