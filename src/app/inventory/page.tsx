"use client";

import { useState, type FormEvent } from "react";
import { Minus, Pencil, Plus, Power, X } from "lucide-react";
import { useCashier } from "@/components/app-shell";
import { useProducts } from "@/hooks/use-products";
import type { Product } from "@/lib/data";
import { supabase } from "@/lib/supabase";

export default function InventoryPage() {
  const { user } = useCashier();
  const { products, setProducts, loading, error, setError } = useProducts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCategory("");
    setPrice("");
    setStock("0");
  };

  const editProduct = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setPrice(String(product.price));
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setError("");
    const values = { name: name.trim(), category: category.trim(), price: Number(price) };
    const query = editingId
      ? supabase.from("products").update(values).eq("id", editingId).eq("owner_id", user.id)
      : supabase.from("products").insert({ ...values, stock: Number(stock), owner_id: user.id });
    const { data, error: saveError } = await query.select("id, name, category, price, stock, is_active").single();
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    const product = data as Product;
    setProducts((current) => editingId
      ? current.map((item) => item.id === product.id ? product : item)
      : [...current, product]);
    resetForm();
  };

  const updateStock = async (product: Product, delta: number) => {
    if (!supabase) return;
    const { data, error: stockError } = await supabase.rpc("adjust_inventory", {
      p_product_id: product.id,
      p_delta: delta,
    });
    if (stockError) {
      setError(stockError.message);
      return;
    }
    setProducts((current) => current.map((item) => item.id === product.id ? { ...item, stock: data } : item));
  };

  const toggleActive = async (product: Product) => {
    if (!supabase) return;
    const { error: updateError } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id)
      .eq("owner_id", user.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setProducts((current) => current.map((item) => item.id === product.id ? { ...item, is_active: !product.is_active } : item));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#d7e0eb] bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-[#005bac]">在庫管理</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1d2a39]">商品在庫</h1>
      </div>

      <section className="rounded-xl border border-[#d7e0eb] bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1d2a39]">{editingId ? "商品を編集" : "商品を追加"}</h2>
          {editingId && <button type="button" onClick={resetForm} aria-label="編集をキャンセル" className="rounded-full p-2 text-[#526071] hover:bg-[#f3f6fb]"><X className="h-4 w-4" /></button>}
        </div>
        <form onSubmit={saveProduct} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm font-medium text-[#334155]">商品名<input required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-[#cfd9e6] px-3 py-2" /></label>
          <label className="text-sm font-medium text-[#334155]">カテゴリ<input maxLength={40} value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 w-full rounded-lg border border-[#cfd9e6] px-3 py-2" /></label>
          <label className="text-sm font-medium text-[#334155]">価格<input required min="0" step="1" type="number" value={price} onChange={(event) => setPrice(event.target.value)} className="mt-1 w-full rounded-lg border border-[#cfd9e6] px-3 py-2" /></label>
          {!editingId && <label className="text-sm font-medium text-[#334155]">初期在庫<input required min="0" step="1" type="number" value={stock} onChange={(event) => setStock(event.target.value)} className="mt-1 w-full rounded-lg border border-[#cfd9e6] px-3 py-2" /></label>}
          <button disabled={saving} className="self-end rounded-lg bg-[#005bac] px-4 py-2.5 font-semibold text-white hover:bg-[#004a8d] disabled:opacity-60">{saving ? "保存中..." : editingId ? "変更を保存" : "商品を追加"}</button>
        </form>
        {error && <p role="alert" className="mt-3 text-sm text-[#b42318]">{error}</p>}
      </section>

      <div className="space-y-3">
        {products.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col gap-3 rounded-xl border border-[#d7e0eb] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between ${item.is_active ? "" : "opacity-60"}`}
          >
            <div>
              <p className="text-lg font-semibold text-[#1d2a39]">{item.name}</p>
              <div className="mt-1 flex items-center gap-3 text-sm text-[#526071]">
                <span>{item.category}</span>
                <span>¥{item.price.toLocaleString()}</span>
                {!item.is_active && <span className="font-medium text-[#b42318]">販売停止中</span>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-full border border-[#d7e0eb] bg-[#f8fafc] px-3 py-1 text-sm text-[#334155]">
                在庫: <span className="font-semibold text-[#1d2a39]">{item.stock}</span>
              </div>

              <div className="flex items-center rounded-full border border-[#d7e0eb] bg-white">
                <button
                  type="button"
                  onClick={() => updateStock(item, -1)}
                  disabled={item.stock === 0}
                  className="p-2 text-[#334155] transition hover:bg-[#eef5ff]"
                  aria-label={`${item.name} の在庫を1つ減らす`}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateStock(item, 1)}
                  className="p-2 text-[#334155] transition hover:bg-[#eef5ff]"
                  aria-label={`${item.name} の在庫を1つ増やす`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button type="button" onClick={() => editProduct(item)} aria-label={`${item.name} を編集`} title="商品を編集" className="rounded-full border border-[#d7e0eb] p-2 text-[#334155] hover:bg-[#eef5ff]"><Pencil className="h-4 w-4" /></button>
              <button type="button" onClick={() => toggleActive(item)} aria-label={item.is_active ? `${item.name} の販売を停止` : `${item.name} の販売を再開`} title={item.is_active ? "販売停止" : "販売再開"} className="rounded-full border border-[#d7e0eb] p-2 text-[#334155] hover:bg-[#eef5ff]"><Power className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {loading && <p className="py-4 text-sm text-[#526071]">商品を読み込み中...</p>}
        {!loading && products.length === 0 && <p className="py-4 text-sm text-[#526071]">商品がありません。上のフォームから登録してください。</p>}
      </div>
    </div>
  );
}
