"use server";

import { revalidatePath } from "next/cache";
import { getBudget, setBudget } from "@/lib/budget/service";

export async function getBudgetAction(monthYear: string) {
  return await getBudget(monthYear);
}

export async function setBudgetAction(monthYear: string, amount: number) {
  const result = await setBudget(monthYear, amount);

  if (result.ok) {
    revalidatePath("/dashboard");
  }

  return result;
}
