"use client";

import { useEffect, useState } from "react";
import { useCashier } from "@/components/app-shell";
import { fetchSales, type Sale } from "@/lib/data";
import { supabase } from "@/lib/supabase";

export default function HistoryPage() {
  const { user } = useCashier();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const client = supabase;
    const load = async (initial = false) => {
      if (initial) setLoading(true);
      try {
        const result = await fetchSales(user.id);
        if (mounted) {
          setSales(result);
          setError("");
        }
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : "履歴を読み込めませんでした。");
      } finally {
        if (mounted && initial) setLoading(false);
      }
    };

    void load(true);
    if (!client) return () => { mounted = false; };
    const channel = client
      .channel(`sales-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "sales", filter: `owner_id=eq.${user.id}` }, () => {
        void load();
      })
      .subscribe();

    return () => {
      mounted = false;
      void client.removeChannel(channel);
    };
  }, [user.id]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#d7e0eb] bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-[#005bac]">購入履歴</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1d2a39]">最近の販売</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#d7e0eb] bg-white shadow-sm">
        <div className="grid grid-cols-[1.2fr_1.4fr_0.8fr_0.8fr] bg-[#f8fafc] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#526071]">
          <span>時間</span>
          <span>商品</span>
          <span>金額</span>
          <span>支払</span>
        </div>

        {sales.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[1.2fr_1.4fr_0.8fr_0.8fr] border-t border-[#d7e0eb] px-4 py-3 text-sm text-[#334155]"
          >
            <span>{new Date(row.created_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</span>
            <span>{row.sale_items.map((item) => `${item.product_name} x${item.quantity}`).join(", ")}</span>
            <span className="font-semibold text-[#0a6e54]">¥{row.total.toLocaleString()}</span>
            <span>{row.payment_method}</span>
          </div>
        ))}
        {loading && <p className="border-t border-[#d7e0eb] px-4 py-6 text-sm text-[#526071]">履歴を読み込み中...</p>}
        {!loading && !error && sales.length === 0 && <p className="border-t border-[#d7e0eb] px-4 py-6 text-sm text-[#526071]">まだ会計履歴がありません。</p>}
      </div>
      {error && <p role="alert" className="text-sm text-[#b42318]">{error}</p>}
    </div>
  );
}
