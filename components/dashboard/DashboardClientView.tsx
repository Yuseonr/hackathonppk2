"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SummaryCards from "./SummaryCards";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionFormModal from "@/components/transactions/TransactionFormModal";
import DeleteConfirmModal from "@/components/transactions/DeleteConfirmModal";
import { deleteTransactionAction } from "@/actions/transactions";
import type { DashboardData, TransactionItem } from "@/lib/transactions/types";

interface DashboardClientViewProps {
  initialData: DashboardData;
}

export default function DashboardClientView({
  initialData,
}: DashboardClientViewProps) {
  const router = useRouter();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TransactionItem | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<TransactionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success toast/message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
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
        router.refresh();
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

  function handleFormSuccess() {
    showToast(
      editingItem
        ? "Transaksi berhasil diperbarui."
        : "Transaksi baru berhasil disimpan."
    );
    router.refresh();
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

      {/* Kartu Ringkasan Keuangan */}
      <SummaryCards
        balance={initialData.balance}
        totalIncome={initialData.totalIncome}
        totalExpense={initialData.totalExpense}
      />

      {/* Daftar & Riwayat Transaksi */}
      <TransactionList
        transactions={initialData.transactions}
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
