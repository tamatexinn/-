"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, CreditCard, History, LogOut } from "lucide-react";
import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const navItems = [
  { href: "/", label: "会計", icon: CreditCard },
  { href: "/inventory", label: "商品・在庫", icon: Boxes },
  { href: "/history", label: "購入履歴", icon: History },
];

type CashierContextValue = { user: User };
const CashierContext = createContext<CashierContextValue | null>(null);

export function useCashier() {
  const context = useContext(CashierContext);
  if (!context) throw new Error("useCashier must be used inside an authenticated app");
  return context;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!supabase);
  const pathname = usePathname();

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user ?? null);
        setReady(true);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!supabase) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <section className="rounded-xl border border-[#d7e0eb] bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#1d2a39]">データベースの設定が必要です</h1>
          <p className="mt-3 text-sm leading-6 text-[#526071]">
            Supabase プロジェクトを作成し、環境変数 NEXT_PUBLIC_SUPABASE_URL と
            NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。
          </p>
        </section>
      </main>
    );
  }

  if (!ready) {
    return <p className="px-4 py-16 text-center text-sm text-[#526071]">読み込み中...</p>;
  }

  if (!user) return <AuthScreen />;

  return (
    <CashierContext.Provider value={{ user }}>
      <div className="min-h-screen">
        <header className="border-b border-[#d7e0eb] bg-white/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
            <Link href="/" className="flex items-center gap-3 text-base font-bold text-[#1d2a39] md:text-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eff6ff] text-lg text-[#005bac] ring-1 ring-[#d6e7ff]">🎪</span>
              電波祭 Cashier
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    aria-current={pathname === href ? "page" : undefined}
                    className={`flex items-center gap-2 rounded-full border px-3 py-2 transition ${pathname === href ? "border-[#005bac] bg-[#eef5ff] text-[#005bac]" : "border-[#d7e0eb] bg-[#f8fafc] text-[#334155] hover:border-[#b9d6ff] hover:bg-[#eef5ff] hover:text-[#005bac]"}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </nav>
              <button
                type="button"
                onClick={() => { void supabase?.auth.signOut(); }}
                aria-label="ログアウト"
                title="ログアウト"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e0eb] bg-white text-[#526071] hover:bg-[#f8fafc]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </CashierContext.Provider>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setError("");
    setMessage("");
    setSubmitting(true);
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setSubmitting(false);
    if (result.error) {
      setError(result.error.message);
    } else if (mode === "signup" && !result.data.session) {
      setMessage("確認メールを送信しました。メール内のリンクから登録を完了してください。");
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <section className="rounded-xl border border-[#d7e0eb] bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-[#005bac]">電波祭 Cashier</p>
        <h1 className="mt-2 text-2xl font-bold text-[#1d2a39]">{mode === "signin" ? "ログイン" : "アカウント作成"}</h1>
        <p className="mt-2 text-sm text-[#526071]">同じアカウントでログインすると、端末間でデータを共有できます。</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium text-[#334155]">
            メールアドレス
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-[#cfd9e6] px-3 py-2.5" />
          </label>
          <label className="block text-sm font-medium text-[#334155]">
            パスワード
            <input required minLength={8} type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-[#cfd9e6] px-3 py-2.5" />
          </label>
          {error && <p role="alert" className="text-sm text-[#b42318]">{error}</p>}
          {message && <p role="status" className="text-sm text-[#0a6e54]">{message}</p>}
          <button disabled={submitting} className="w-full rounded-lg bg-[#005bac] px-4 py-3 font-semibold text-white hover:bg-[#004a8d] disabled:opacity-60">
            {submitting ? "処理中..." : mode === "signin" ? "ログイン" : "アカウントを作成"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }}
          className="mt-4 text-sm font-medium text-[#005bac] underline"
        >
          {mode === "signin" ? "初めて使う場合はアカウント作成" : "ログイン画面に戻る"}
        </button>
      </section>
    </main>
  );
}