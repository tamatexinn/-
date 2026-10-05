"use client";

import { useEffect, useState } from "react";
import { useCashier } from "@/components/app-shell";
import { fetchProducts, type Product } from "@/lib/data";
import { supabase } from "@/lib/supabase";

export function useProducts() {
  const { user } = useCashier();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const client = supabase;
    const load = async (showLoading = false) => {
      if (showLoading) setLoading(true);
      try {
        const result = await fetchProducts(user.id);
        if (mounted) {
          setProducts(result);
          setError("");
        }
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : "商品を読み込めませんでした。");
      } finally {
        if (mounted && showLoading) setLoading(false);
      }
    };

    void load(true);
    if (!client) return () => { mounted = false; };
    const channel = client
      .channel(`products-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "products", filter: `owner_id=eq.${user.id}` }, () => {
        void load();
      })
      .subscribe();

    return () => {
      mounted = false;
      void client.removeChannel(channel);
    };
  }, [user.id]);

  return { products, setProducts, loading, error, setError };
}