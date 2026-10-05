import { supabase } from "@/lib/supabase";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  is_active: boolean;
};

export type SaleItem = {
  product_name: string;
  unit_price: number;
  quantity: number;
};

export type Sale = {
  id: string;
  payment_method: string;
  subtotal: number;
  service_fee: number;
  total: number;
  created_at: string;
  sale_items: SaleItem[];
};

const defaultProducts = [
  { name: "アミューズメント券", category: "券", price: 500, stock: 48 },
  { name: "フードセット", category: "食事", price: 1200, stock: 16 },
  { name: "ドリンク", category: "飲み物", price: 400, stock: 35 },
  { name: "缶バッジ", category: "グッズ", price: 800, stock: 22 },
];

export async function fetchProducts(ownerId: string) {
  if (!supabase) throw new Error("Supabase が設定されていません。");

  const { data, error } = await supabase
    .from("products")
    .select("id, name, category, price, stock, is_active")
    .eq("owner_id", ownerId)
    .order("created_at");
  if (error) throw error;
  if (data.length > 0) return data as Product[];

  const { error: seedError } = await supabase.from("products").upsert(
    defaultProducts.map((product) => ({ ...product, owner_id: ownerId })),
    { onConflict: "owner_id,name", ignoreDuplicates: true },
  );
  if (seedError) throw seedError;

  const { data: seeded, error: reloadError } = await supabase
    .from("products")
    .select("id, name, category, price, stock, is_active")
    .eq("owner_id", ownerId)
    .order("created_at");
  if (reloadError) throw reloadError;
  return seeded as Product[];
}

export async function fetchSales(ownerId: string) {
  if (!supabase) throw new Error("Supabase が設定されていません。");
  const { data, error } = await supabase
    .from("sales")
    .select("id, payment_method, subtotal, service_fee, total, created_at, sale_items(product_name, unit_price, quantity)")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Sale[];
}