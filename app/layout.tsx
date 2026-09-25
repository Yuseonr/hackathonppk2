import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoneyLover — Expense Tracker Mahasiswa",
  description: "Aplikasi pengelola keuangan pribadi mahasiswa sederhana dan aman",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const isDark = themeCookie === "dark";

  return (
    <html lang="id" className={isDark ? "dark" : ""}>
      <body className="min-h-screen flex flex-col transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
