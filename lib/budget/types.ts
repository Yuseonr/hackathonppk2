import type { ActionResult } from "@/lib/transactions/types";

export interface BudgetItem {
  id: string;
  userId: string;
  monthYear: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export type BudgetActionResult = ActionResult<BudgetItem>;
