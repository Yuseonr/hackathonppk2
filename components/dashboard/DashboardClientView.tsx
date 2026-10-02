"use client";

import React, { useRef, useState } from "react";
import {
  deleteTransactionAction,
  getDashboardDataAction,
} from "@/actions/transactions";
import { getBudgetAction } from "@/actions/budget";
import type { BudgetItem } from "@/lib/budget/types";
import type { DashboardData, TransactionItem } from "@/lib/transactions/types";
import SummaryCards from "./SummaryCards";
import MonthSelector from "./MonthSelector";
import BudgetSummary from "@/components/budget/BudgetSummary";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionFormModal from "@/components/transactions/TransactionFormModal";
import DeleteConfirmModal from "@/components/transactions/DeleteConfirmModal";

interface DashboardClientViewProps {
  initialData: DashboardData;
  initialBudget: BudgetItem | null;
}

export default function DashboardClientView({
  initialData,
  initialBudget,
}: DashboardClientViewProps) {
  const [dashboardData, setDashboardData] = useState(initialData);
  const [budget, setBudget] = useState(initialBudget);
  const [monthYear, setMonthYear] = useState(initialData.monthYear);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const requestSequence = useRef(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TransactionItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<TransactionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(message: string) {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3500);
  }

  async function loadMonth(nextMonthYear: string) {
    if (!nextMonthYear) return;

    const sequence = ++requestSequence.current;
    setMonthYear(nextMonthYear);
    setIsRefreshing(true);
    setFilterError(null);

    try {
      const [nextData, nextBudget] = await Promise.all([
        getDashboardDataAction(nextMonthYear),
        getBudgetAction(nextMonthYear),
      ]);

      if (sequence !== requestSequence.current) return;

      setDashboardData(nextData);
      setBudget(nextBudget);
    } catch (error) {
      console.error(error);
      if (sequence === requestSequence.current) {
        setFilterError("Data bulan tersebut tidak dapat dimuat. Silakan coba lagi.");
      }
    } finally {
      if (sequence === requestSequence.current) {
        setIsRefreshing(false);
      }
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
      const result = await deleteTransactionAction(deletingItem.id);
      if (!result.ok) {
        alert(result.message);
        return;
      }

      showToast(result.message);
      await loadMonth(monthYear);
    } catch (error) {
      console.error(error);
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
        : "Transaksi baru berhasil disimpan.",
    );
    void loadMonth(monthYear);
  }

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-xs font-semibold text-white shadow-xl dark:border-zinc-300 dark:bg-zinc-100 dark:text-zinc-900">
          <svg className="h-4 w-4 text-emerald-400 dark:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      <MonthSelector
        monthYear={monthYear}
        isLoading={isRefreshing}
        onChange={(nextMonthYear) => void loadMonth(nextMonthYear)}
      />

      {filterError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {filterError}
        </div>
      )}

      <SummaryCards
        balance={dashboardData.balance}
        totalIncome={dashboardData.totalIncome}
        totalExpense={dashboardData.totalExpense}
      />

      <BudgetSummary
        monthYear={monthYear}
        totalExpense={dashboardData.totalExpense}
        budget={budget}
        isLoading={isRefreshing}
        onBudgetSaved={(savedBudget) => {
          setBudget(savedBudget);
          showToast("Anggaran bulanan berhasil disimpan.");
        }}
      />

      <TransactionList
        transactions={dashboardData.transactions}
        onAddClick={handleOpenAdd}
        onEditClick={handleOpenEdit}
        onDeleteClick={handleOpenDelete}
      />

      <TransactionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        editData={editingItem}
      />

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
