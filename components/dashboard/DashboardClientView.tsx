"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import SummaryCards from "./SummaryCards";
import MonthSelector from "./MonthSelector";
import BudgetSlot from "./BudgetSlot";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionFormModal from "@/components/transactions/TransactionFormModal";
import DeleteConfirmModal from "@/components/transactions/DeleteConfirmModal";
import {
  deleteTransactionAction,
  getDashboardDataAction,
} from "@/actions/transactions";
import type { DashboardData, TransactionItem } from "@/lib/transactions/types";

interface DashboardClientViewProps {
  initialData: DashboardData;
}

export default function DashboardClientView({
  initialData,
}: DashboardClientViewProps) {
  const router = useRouter();

  // State data dashboard lokal untuk update instan via AJAX
  const [data, setData] = useState<DashboardData>(initialData);
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TransactionItem | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<TransactionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success toast/message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sinkronisasi data jika initialData dari Server Component berubah
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  // Handler AJAX untuk perubahan bulan tanpa reload halaman browser (US-12)
  function handleMonthChange(newMonth: string) {
    startTransition(async () => {
      try {
        const freshData = await getDashboardDataAction(newMonth);
        setData(freshData);
        // Update URL search parameters secara shallow tanpa me-reload browser
        const url = newMonth === "all" ? "/dashboard?month=all" : `/dashboard?month=${newMonth}`;
        router.replace(url, { scroll: false });
      } catch (err) {
        console.error("Gagal memuat data bulan:", err);
        showToast("Gagal memuat data periode yang dipilih.");
      }
    });
  }

  // Refresh data transaksi untuk bulan aktif saat ini
  async function refreshActiveMonth() {
    try {
      const freshData = await getDashboardDataAction(data.monthYear);
      setData(freshData);
    } catch {
      router.refresh();
    }
  }

  function handleOpenAdd() {
    setEditingItem(null);
    setIsFormOpen(true);
  }

  function handleOpenEdit(item: TransactionItem) {
    setEditingItem(item);
    setIsFormOpen(true);
  }

  function handleOpenDelete(item: TransactionItem) {
    setDeletingItem(item);
    setIsDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingItem) return;

    setIsDeleting(true);
    try {
      const res = await deleteTransactionAction(deletingItem.id);
      if (res.ok) {
        showToast(res.message);
        await refreshActiveMonth();
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus transaksi.");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeletingItem(null);
    }
  }

  async function handleFormSuccess() {
    showToast(
      editingItem
        ? "Transaksi berhasil diperbarui."
        : "Transaksi baru berhasil disimpan."
    );
    await refreshActiveMonth();
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-3 rounded-2xl shadow-xl border border-zinc-700 dark:border-zinc-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <svg
            className="w-4 h-4 text-emerald-400 dark:text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Kontrol Pemilihan Bulan (Monthly Filter via AJAX - Tugas Fritz) */}
      <MonthSelector
        activeMonth={data.monthYear}
        availableMonths={data.availableMonths || []}
        onChangeMonth={handleMonthChange}
        isPending={isPending}
      />

      {/* Kontrak Integrasi dengan Anandra: Indikator Anggaran (Budget) */}
      <BudgetSlot
        monthYear={data.monthYear}
        totalExpense={data.totalExpense}
      />

      {/* Kartu Ringkasan Keuangan (Saldo, Pemasukan, Pengeluaran) */}
      <SummaryCards
        balance={data.balance}
        totalIncome={data.totalIncome}
        totalExpense={data.totalExpense}
        monthYear={data.monthYear}
      />

      {/* Daftar & Riwayat Transaksi */}
      <TransactionList
        transactions={data.transactions}
        onAddClick={handleOpenAdd}
        onEditClick={handleOpenEdit}
        onDeleteClick={handleOpenDelete}
      />

      {/* Modal Form Tambah / Edit */}
      <TransactionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        editData={editingItem}
      />

      {/* Modal Konfirmasi Hapus */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingItem(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        transactionDescription={deletingItem?.description}
        amount={deletingItem?.amount}
      />
    </div>
  );
}
