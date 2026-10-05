"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: number;
};

const initialItems: InventoryItem[] = [
  { id: 1, name: "アミューズメント券", category: "券", stock: 48, price: 500 },
  { id: 2, name: "フードセット", category: "食事", stock: 16, price: 1200 },
  { id: 3, name: "ドリンク", category: "飲み物", stock: 35, price: 400 },
  { id: 4, name: "缶バッジ", category: "グッズ", stock: 22, price: 800 },
];

export default function InventoryPage() {
  const [items, setItems] = useState(initialItems);

  const updateStock = (id: number, delta: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, stock: Math.max(0, item.stock + delta) }
          : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#d7e0eb] bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-[#005bac]">在庫管理</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1d2a39]">商品在庫</h1>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-[#d7e0eb] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-lg font-semibold text-[#1d2a39]">{item.name}</p>
              <div className="mt-1 flex items-center gap-3 text-sm text-[#526071]">
                <span>{item.category}</span>
                <span>¥{item.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-full border border-[#d7e0eb] bg-[#f8fafc] px-3 py-1 text-sm text-[#334155]">
                在庫: <span className="font-semibold text-[#1d2a39]">{item.stock}</span>
              </div>

              <div className="flex items-center rounded-full border border-[#d7e0eb] bg-white">
                <button
                  type="button"
                  onClick={() => updateStock(item.id, -1)}
                  className="p-2 text-[#334155] transition hover:bg-[#eef5ff]"
                  aria-label={`${item.name} の在庫を1つ減らす`}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateStock(item.id, 1)}
                  className="p-2 text-[#334155] transition hover:bg-[#eef5ff]"
                  aria-label={`${item.name} の在庫を1つ増やす`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
