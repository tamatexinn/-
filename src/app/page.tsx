"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ReceiptText, ShoppingCart, Trash2 } from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
};

const products: Product[] = [
  { id: 1, name: "アミューズメント券", price: 500, category: "券" },
  { id: 2, name: "フードセット", price: 1200, category: "食事" },
  { id: 3, name: "ドリンク", price: 400, category: "飲み物" },
  { id: 4, name: "缶バッジ", price: 800, category: "グッズ" },
];

export default function HomePage() {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [payment, setPayment] = useState("カード");

  const lineItems = useMemo(
    () =>
      products
        .filter((product) => cart[product.id])
        .map((product) => ({
          ...product,
          quantity: cart[product.id],
        })),
    [cart],
  );

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const serviceFee = Math.round(subtotal * 0.08);
  const total = subtotal + serviceFee;

  const addToCart = (product: Product) => {
    setCart((current) => ({
      ...current,
      [product.id]: (current[product.id] ?? 0) + 1,
    }));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((current) => {
      const next = (current[productId] ?? 0) + delta;
      if (next <= 0) {
        const { [productId]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [productId]: next };
    });
  };

  const clearCart = () => setCart({});

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#d7e0eb] bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-[#005bac]">会計</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1d2a39]">レジ</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <section className="rounded-2xl border border-[#d7e0eb] bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-[#1d2a39]">商品一覧</h2>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5ff] px-3 py-1.5 text-sm font-medium text-[#005bac]">
              <ShoppingCart className="h-4 w-4" />
              {Object.values(cart).reduce((sum, num) => sum + num, 0)} 点
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addToCart(product)}
                className="rounded-2xl border border-[#d7e0eb] bg-[#f8fafc] p-4 text-left transition hover:border-[#b9d6ff] hover:bg-[#eef5ff]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-[#eaf3ff] px-2 py-1 text-[10px] font-medium text-[#005bac]">
                    {product.category}
                  </span>
                  <span className="text-xs text-[#526071]">追加</span>
                </div>
                <p className="text-lg font-semibold text-[#1d2a39]">{product.name}</p>
                <p className="mt-3 text-2xl font-bold text-[#0a6e54]">
                  ¥{product.price.toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl border border-[#d7e0eb] bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#1d2a39]">注文</h2>
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-1 rounded-full border border-[#f2d0d0] bg-[#fff3f3] px-2 py-1 text-xs font-medium text-[#b42318]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              クリア
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#cfd9e6] bg-[#f8fafc] p-5 text-center text-sm text-[#526071]">
                商品を選択してください
              </div>
            ) : (
              lineItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-[#d7e0eb] bg-[#f8fafc] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#1d2a39]">{item.name}</p>
                      <p className="text-xs text-[#526071]">¥{item.price.toLocaleString()} / 個</p>
                    </div>
                    <p className="text-sm font-semibold text-[#0a6e54]">
                      ¥{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-[#d7e0eb] bg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-2 text-[#334155] hover:bg-[#eef5ff]"
                        aria-label={`${item.name} を1個減らす`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-medium text-[#1d2a39]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-2 text-[#334155] hover:bg-[#eef5ff]"
                        aria-label={`${item.name} を1個増やす`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -item.quantity)}
                      className="text-xs font-medium text-[#b42318]"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 rounded-xl border border-[#d7e0eb] bg-[#edf5ff] p-3">
            <p className="mb-2 text-sm font-medium text-[#1d2a39]">支払い方法</p>
            <div className="grid grid-cols-3 gap-2 text-xs font-medium">
              {"現金,カード,QR Pay".split(",").map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPayment(method)}
                  className={`rounded-lg border px-2 py-2 ${
                    payment === method
                      ? "border-[#005bac] bg-[#005bac] text-white"
                      : "border-[#cfd9e6] bg-white text-[#334155]"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-2 text-sm text-[#334155]">
            <div className="flex items-center justify-between">
              <span>小計</span>
              <span>¥{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>手数料</span>
              <span>¥{serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#d7e0eb] pt-2 text-base font-semibold text-[#1d2a39]">
              <span>合計</span>
              <span className="text-2xl text-[#0a6e54]">¥{total.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#005bac] px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-[#004a8d]"
          >
            <ReceiptText className="h-5 w-5" />
            会計確定
          </button>
        </aside>
      </div>
    </div>
  );
}
