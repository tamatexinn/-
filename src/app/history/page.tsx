const transactions = [
  { id: "TX-1001", time: "10:15", item: "フードセット x2", total: 2400, payment: "カード" },
  { id: "TX-1002", time: "10:42", item: "ドリンク x3", total: 1200, payment: "現金" },
  { id: "TX-1003", time: "11:05", item: "缶バッジ x1", total: 800, payment: "QR Pay" },
  { id: "TX-1004", time: "11:28", item: "アミューズメント券 x4", total: 2000, payment: "カード" },
];

export default function HistoryPage() {
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

        {transactions.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[1.2fr_1.4fr_0.8fr_0.8fr] border-t border-[#d7e0eb] px-4 py-3 text-sm text-[#334155]"
          >
            <span>{row.time}</span>
            <span>{row.item}</span>
            <span className="font-semibold text-[#0a6e54]">¥{row.total.toLocaleString()}</span>
            <span>{row.payment}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
