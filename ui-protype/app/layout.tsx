import "./globals.css";
import type { Metadata } from "next";
import { seedIfEmpty } from "@/lib/db";

export const metadata: Metadata = {
  title: "Test Manager Prototype",
  description: "Open-source TestRail alternative UI prototype",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await seedIfEmpty();
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-7xl p-4">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Test Manager</h1>
            <nav className="flex gap-3 text-sm">
              <a href="/" className="hover:underline">Dashboard</a>
              <a href="/projects" className="hover:underline">Projects</a>
              <a href="/runs" className="hover:underline">Runs</a>
              <a href="/plans" className="hover:underline">Plans</a>
              <a href="/reports" className="hover:underline">Reports</a>
              <a href="/admin" className="hover:underline">Admin</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
