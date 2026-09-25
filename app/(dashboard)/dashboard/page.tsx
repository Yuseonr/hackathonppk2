import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardClientView from "@/components/dashboard/DashboardClientView";
import { getDashboardData } from "@/lib/transactions/service";

export const metadata = {
  title: "Dashboard Keuangan — MoneyLover",
  description: "Kelola saldo, pemasukan, dan pengeluaran mahasiswa dengan mudah",
};

// Pastikan data selalu dinamis dan terupdate
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Header Dashboard dengan Identitas Akun & Theme Toggle */}
      <DashboardHeader userEmail={dashboardData.userEmail} />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Ikhtisar Keuangan Anda
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Pantau arus kas mahasiswa Anda secara teratur dan bijak.
          </p>
        </div>

        {/* Client Interactive View */}
        <DashboardClientView initialData={dashboardData} />
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
        MoneyLover • Praktikum Pengembangan Perangkat Lunak Berbasis Komponen (PPK)
      </footer>
    </div>
  );
}
