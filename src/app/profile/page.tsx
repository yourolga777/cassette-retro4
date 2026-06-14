"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RetroButton } from "@/components/retro/RetroButton";
import { formatPrice } from "@/lib/utils";

interface User {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  emailSubscribed: boolean | null;
  telegramSubscribed: boolean | null;
}

interface Order {
  id: number;
  orderId: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentMethod: "card" | "cash";
  createdAt: string;
  items: { name: string; quantity: number; price: number }[];
}

type Tab = "orders" | "data" | "subscriptions" | "link";

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  failed: "Ошибка",
  refunded: "Возврат",
  cancelled: "Отменён",
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("orders");
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");

  // Subscriptions
  const [emailSub, setEmailSub] = useState(true);
  const [telegramSub, setTelegramSub] = useState(false);

  // Link order
  const [linkOrderId, setLinkOrderId] = useState("");
  const [linkMsg, setLinkMsg] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setFormName(data.name || "");
        setFormPhone(data.phone || "");
        setFormAddress(data.address || "");
        setEmailSub(data.emailSubscribed ?? true);
        setTelegramSub(data.telegramSubscribed ?? false);
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/profile/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {});
  }, [user]);

  const handleSaveData = async () => {
    setSaving(true);
    await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: formName, phone: formPhone, address: formAddress }),
    });
    setSaving(false);
  };

  const handleSaveSubscriptions = async () => {
    setSaving(true);
    await fetch("/api/profile/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailSubscribed: emailSub, telegramSubscribed: telegramSub }),
    });
    setSaving(false);
  };

  const handleCancel = async (orderId: string) => {
    const res = await fetch(`/api/profile/orders/${orderId}/cancel`, { method: "POST" });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, status: "cancelled" } : o)));
    } else {
      const data = await res.json();
      alert(data.error || "Ошибка");
    }
  };

  const handleLinkOrder = async () => {
    setLinkMsg("");
    const res = await fetch("/api/profile/link-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: linkOrderId }),
    });
    const data = await res.json();
    if (res.ok) {
      setLinkMsg("Заказ привязан!");
      setLinkOrderId("");
    } else {
      setLinkMsg(data.error || "Ошибка");
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete !== "УДАЛИТЬ") return;
    setDeleting(true);
    const res = await fetch("/api/auth/me", { method: "DELETE" });
    if (res.ok) {
      router.push("/");
    } else {
      setDeleting(false);
      alert("Ошибка при удалении аккаунта");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="reel" />
      </div>
    );
  }

  if (!user) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "orders", label: "История заказов" },
    { key: "data", label: "Мои данные" },
    { key: "subscriptions", label: "Подписки" },
    { key: "link", label: "Привязать заказ" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl text-wood font-bold">Личный кабинет</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="font-mono text-xs text-wood/40 hover:text-neon transition-colors"
        >
          Выйти
        </button>
      </div>

      <div className="flex gap-1 border-b-2 border-wood/10 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`font-mono text-xs px-4 py-2 transition-colors ${
              tab === t.key
                ? "text-neon border-b-2 border-neon -mb-[2px]"
                : "text-wood/40 hover:text-wood/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Orders */}
      {tab === "orders" && (
        <div>
          {orders.length === 0 ? (
            <p className="font-mono text-sm text-wood/40 text-center py-8">У вас ещё нет заказов</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="border-2 border-wood/10 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-heading text-sm text-wood font-semibold">#{o.orderId}</span>
                        <span className="font-mono text-[11px] text-wood/40">
                          {new Date(o.createdAt).toLocaleDateString("ru-RU", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                        <span className={`font-mono text-[11px] px-2 py-0.5 border ${STATUS_LABELS[o.status] ? "" : ""}`}>
                          {STATUS_LABELS[o.status] || o.status}
                        </span>
                      </div>
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
                      {o.status === "pending" && (
                        <RetroButton variant="ghost" size="sm" onClick={() => handleCancel(o.orderId)}>
                          Отменить
                        </RetroButton>
                      )}
                      <Link
                        href={"/order/" + o.orderId}
                        className="font-mono text-[10px] text-copper hover:text-neon transition-colors"
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: My Data */}
      {tab === "data" && (
        <div className="max-w-md space-y-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Email</label>
            <input type="email" value={user.email} className="retro-input" disabled />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Имя</label>
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="retro-input" />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Телефон</label>
            <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="retro-input" />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Адрес доставки</label>
            <input type="text" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} className="retro-input" />
          </div>
          <RetroButton variant="neon" onClick={handleSaveData} disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить"}
          </RetroButton>

          <hr className="border-wood/10 my-8" />

          <div>
            <h3 className="font-heading text-sm text-neon font-semibold mb-3">Удаление аккаунта</h3>
            <p className="font-mono text-xs text-wood/60 mb-3">
              Это действие необратимо. Ваши заказы останутся в системе, но будут обезличены.
            </p>
            <input
              type="text"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              className="retro-input mb-3"
              placeholder='Введите "УДАЛИТЬ" для подтверждения'
            />
            <RetroButton
              variant="ghost"
              onClick={handleDeleteAccount}
              disabled={confirmDelete !== "УДАЛИТЬ" || deleting}
              className="text-neon border-neon/30"
            >
              {deleting ? "Удаление..." : "Удалить аккаунт"}
            </RetroButton>
          </div>
        </div>
      )}

      {/* Tab: Subscriptions */}
      {tab === "subscriptions" && (
        <div className="max-w-md space-y-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={emailSub} onChange={(e) => setEmailSub(e.target.checked)} className="w-4 h-4 accent-copper" />
            <div>
              <p className="font-heading text-sm text-wood">Email-рассылка</p>
              <p className="font-mono text-xs text-wood/40">Новости, новинки и акции на почту</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={telegramSub} onChange={(e) => setTelegramSub(e.target.checked)} className="w-4 h-4 accent-copper" />
            <div>
              <p className="font-heading text-sm text-wood">Telegram-уведомления</p>
              <p className="font-mono text-xs text-wood/40">Статус заказов в Telegram (скоро)</p>
            </div>
          </label>
          <RetroButton variant="neon" onClick={handleSaveSubscriptions} disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить"}
          </RetroButton>
        </div>
      )}

      {/* Tab: Link Order */}
      {tab === "link" && (
        <div className="max-w-md space-y-4">
          <p className="font-mono text-xs text-wood/60">
            Если вы сделали заказ без регистрации, укажите его номер, чтобы привязать к аккаунту.
          </p>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Номер заказа</label>
            <input type="text" value={linkOrderId} onChange={(e) => setLinkOrderId(e.target.value)} className="retro-input" placeholder="Например: 7XKQ2P" />
          </div>
          <RetroButton variant="neon" onClick={handleLinkOrder}>Привязать</RetroButton>
          {linkMsg && <p className="font-mono text-xs text-wood/60">{linkMsg}</p>}
        </div>
      )}
    </div>
  );
}
