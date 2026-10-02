const MONTH_YEAR_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isValidMonthYear(value: unknown): value is string {
  if (typeof value !== "string" || !MONTH_YEAR_PATTERN.test(value)) {
    return false;
  }

  const year = Number(value.slice(0, 4));
  return year >= 1 && year <= 9999;
}

export function getMonthDateRange(monthYear: string) {
  if (!isValidMonthYear(monthYear)) {
    throw new Error("Bulan harus menggunakan format YYYY-MM yang valid.");
  }

  const year = Number(monthYear.slice(0, 4));
  const month = Number(monthYear.slice(5, 7));

  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

export function getCurrentMonthYear(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
