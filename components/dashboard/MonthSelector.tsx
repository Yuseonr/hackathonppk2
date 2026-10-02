"use client";

interface MonthSelectorProps {
  monthYear: string;
  isLoading: boolean;
  onChange: (monthYear: string) => void;
}

function formatMonth(monthYear: string): string {
  const date = new Date(`${monthYear}-01T00:00:00`);
  return date.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

export default function MonthSelector({
  monthYear,
  isLoading,
  onChange,
}: MonthSelectorProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Periode aktif
        </p>
        <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
          {formatMonth(monthYear)}
        </p>
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
        <span className="sr-only">Pilih bulan</span>
        <input
          type="month"
          value={monthYear}
          onChange={(event) => onChange(event.target.value)}
          disabled={isLoading}
          aria-label="Pilih bulan dashboard"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-wait disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        {isLoading && (
          <span className="text-emerald-600 dark:text-emerald-400">Memuat...</span>
        )}
      </label>
    </div>
  );
}
