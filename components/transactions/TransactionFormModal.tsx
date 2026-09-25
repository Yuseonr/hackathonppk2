"use client";

import React, { useState, useEffect } from "react";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/actions/transactions";
import type {
  TransactionItem,
  TransactionType,
} from "@/lib/transactions/types";

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: TransactionItem | null;
}

export default function TransactionFormModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
}: TransactionFormModalProps) {
  const isEditing = Boolean(editData);

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setType(editData.type);
        setAmount(editData.amount.toString());
        setTransactionDate(editData.transactionDate);
        setDescription(editData.description || "");
      } else {
        setType("expense");
        setAmount("");
        // Default to today in YYYY-MM-DD local format
        const today = new Date().toISOString().split("T")[0];
        setTransactionDate(today);
        setDescription("");
      }
      setErrorMsg(null);
      setFieldErrors({});
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const numericAmount = parseFloat(amount);
    const errors: Record<string, string> = {};

    if (isNaN(numericAmount) || numericAmount <= 0) {
      errors.amount = "Nominal harus berupa angka lebih besar dari 0";
    }

    if (!transactionDate) {
      errors.transactionDate = "Tanggal transaksi wajib diisi";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      if (isEditing && editData) {
        const res = await updateTransactionAction({
          id: editData.id,
          type,
          amount: numericAmount,
          transactionDate,
          description,
        });

        if (!res.ok) {
          setErrorMsg(res.message);
          if (res.fieldErrors) setFieldErrors(res.fieldErrors);
          setLoading(false);
          return;
        }
      } else {
        const res = await createTransactionAction({
          type,
          amount: numericAmount,
          transactionDate,
          description,
        });

        if (!res.ok) {
          setErrorMsg(res.message);
          if (res.fieldErrors) setFieldErrors(res.fieldErrors);
          setLoading(false);
          return;
        }
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg("Terjadi kegagalan komunikasi dengan server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            {isEditing ? "Edit Transaksi" : "Catat Transaksi Baru"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tipe Transaksi: Income vs Expense Toggle */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === "expense"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
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
                    d="M17 13l-5 5m0 0l-5-5m5 5V6"
                  />
                </svg>
                <span>Pengeluaran (Expense)</span>
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === "income"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
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
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
                <span>Pemasukan (Income)</span>
              </button>
            </div>
            {fieldErrors.type && (
              <p className="text-xs text-rose-500 mt-1">{fieldErrors.type}</p>
            )}
          </div>

          {/* Nominal (Amount) */}
          <div>
            <label
              htmlFor="amount-input"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Nominal (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400">
                Rp
              </span>
              <input
                id="amount-input"
                type="number"
                min="1"
                step="any"
                required
                placeholder="Contoh: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium transition-all"
              />
            </div>
            {fieldErrors.amount && (
              <p className="text-xs text-rose-500 mt-1">{fieldErrors.amount}</p>
            )}
          </div>

          {/* Tanggal Transaksi */}
          <div>
            <label
              htmlFor="date-input"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Tanggal Transaksi <span className="text-rose-500">*</span>
            </label>
            <input
              id="date-input"
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium transition-all"
            />
            {fieldErrors.transactionDate && (
              <p className="text-xs text-rose-500 mt-1">
                {fieldErrors.transactionDate}
              </p>
            )}
          </div>

          {/* Deskripsi / Keterangan */}
          <div>
            <label
              htmlFor="desc-input"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Keterangan / Deskripsi
            </label>
            <input
              id="desc-input"
              type="text"
              placeholder="Contoh: Makan siang kantin, Uang bulanan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{isEditing ? "Simpan Perubahan" : "Simpan Transaksi"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
