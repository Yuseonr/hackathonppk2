"use client";

import React from "react";

export interface BudgetSlotProps {
  monthYear: string;
  totalExpense: number;
}

/**
 * BudgetSlot Component
 * 
 * Kontrak Integrasi PRD Fase 2 (Fritz ↔ Anandra):
 * - Fritz adalah pemegang state `monthYear` yang sedang aktif dan `totalExpense` bulanan.
 * - Komponen Anandra membutuhkan `monthYear` dan `totalExpense` sebagai props.
 * - Slot ini ditempatkan di halaman dashboard Fritz untuk menghubungkan state Fritz ke komponen Anandra saat di-merge.
 */
export default function BudgetSlot({ monthYear, totalExpense }: BudgetSlotProps) {
  return (
    <div
      id="budget-indicator-slot"
      data-month-year={monthYear}
      data-total-expense={totalExpense}
      className="empty:hidden"
    >
      {/* Kontrak Props untuk Komponen Anandra: */}
      {/* <BudgetIndicator monthYear={monthYear} totalExpense={totalExpense} /> */}
    </div>
  );
}
