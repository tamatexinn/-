import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, CreditCard, History } from "lucide-react";
import "./globals.css";

const navItems = [
  { href: "/", label: "会計", icon: CreditCard },
  { href: "/inventory", label: "在庫管理", icon: Boxes },
  { href: "/history", label: "購入履歴", icon: History },
];

export const metadata: Metadata = {
  title: "電波祭 Cashier",
  description: "Simple cashier, inventory, and sales history for a festival booth.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body className="bg-[#f3f6fb] text-slate-900 antialiased">
        <div className="min-h-screen">
          <header className="border-b border-[#d7e0eb] bg-white/90 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
              <Link href="/" className="flex items-center gap-3 text-base font-bold text-[#1d2a39] md:text-lg">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eff6ff] text-lg text-[#005bac] ring-1 ring-[#d6e7ff]">
                  🎪
                </span>
                電波祭 Cashier
              </Link>

              <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2 rounded-full border border-[#d7e0eb] bg-[#f8fafc] px-3 py-2 text-[#334155] transition hover:border-[#b9d6ff] hover:bg-[#eef5ff] hover:text-[#005bac]"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
