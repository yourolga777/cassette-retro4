"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RetroButton } from "@/components/retro/RetroButton";
import { formatPrice } from "@/lib/utils";

interface Order {
  id: number;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  comment?: string | null;
  totalAmount: number;
  status: string;
  paymentMethod: "card" | "cash";
  paymentUrl?: string | null;
  receiptUrl?: string | null;
  createdAt: string;
  items: { name: string; quantity: number; price: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает",
  paid: "Оплачен",
  failed: "Ошибка",
  refunded: "Возврат",
  cancelled: "Отменён",
};

const STATUS_OPTIONS = ["pending", "paid", "failed", "refunded", "cancelled"] as const;

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchOrders = useCallback(async () => {
    const params = new URLSearchParams();
    if (paymentFilter) params.set("paymentMethod", paymentFilter);
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    if (res.status === 401) return router.push("/admin/login");
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  }, [router, paymentFilter, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (id: number, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="reel" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl text-wood font-bold">Заказы</h1>
      </div>
      <Link href="/admin" className="font-mono text-xs text-copper hover:text-neon transition-colors mb-4 inline-block">
        ← Назад
      </Link>

      <div className="flex gap-4 mb-6">
        <select
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setLoading(true); }}
          className="retro-input text-sm"
        >
          <option value="">Все способы оплаты</option>
          <option value="card">Карта онлайн</option>
          <option value="cash">Наличные</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setLoading(true); }}
          className="retro-input text-sm"
        >
          <option value="">Все статусы</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {orders.length === 0 ? (
        <p className="font-mono text-sm text-wood/40 text-center py-8">Нет заказов</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="border-2 border-wood/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-heading text-sm text-wood font-semibold">#{o.orderId}</span>
                    <span className="font-mono text-[11px] text-wood/40">
                      {new Date(o.createdAt).toLocaleDateString("ru-RU", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                    <span className={`font-mono text-[11px] px-2 py-0.5 border ${o.paymentMethod === "card" ? "border-neon/30 text-neon" : "border-copper/30 text-copper"}`}>
                      {o.paymentMethod === "card" ? "Карта" : "Наличные"}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-wood/70">
                    {o.customerName} &middot; {o.customerPhone} &middot; {o.customerEmail}
                  </p>
                  <p className="font-mono text-xs text-wood/40 truncate" title={o.shippingAddress}>
                    {o.shippingAddress}
                  </p>
                  {o.comment && (
                    <p className="font-mono text-xs text-wood/50 italic">&ldquo;{o.comment}&rdquo;</p>
                  )}
                  <p className="font-heading text-sm text-neon font-bold">{formatPrice(o.totalAmount)}</p>
                  <details className="text-xs">
                    <summary className="font-mono text-wood/40 cursor-pointer hover:text-wood/70">
                      Состав ({o.items.length} поз.)
                    </summary>
                    <ul className="font-mono text-wood/50 mt-1 space-y-0.5">
                      {o.items.map((item, i) => (
                        <li key={i}>{item.name} x{item.quantity} — {formatPrice(item.price * item.quantity)}</li>
                      ))}
                    </ul>
                  </details>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="retro-input text-xs py-1 px-2 min-w-[120px]"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  {o.receiptUrl && (
                    <a
                      href={o.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-neon hover:underline"
                    >
                      Чек
                    </a>
                  )}
                  <Link
                    href={"/order/" + o.orderId}
                    className="font-mono text-[10px] text-copper hover:text-neon transition-colors"
                  >
                    Открыть
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
