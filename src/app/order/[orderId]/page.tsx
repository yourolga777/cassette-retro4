"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RetroButton } from "@/components/retro/RetroButton";
import { EqualizerBars } from "@/components/retro/EqualizerBars";
import { useTranslation } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderData {
  orderId: string;
  status: string;
  totalAmount: number;
  paymentMethod: "card" | "cash";
  receiptUrl?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  comment?: string | null;
  items: OrderItem[];
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-600",
  paid: "text-green-600",
  failed: "text-red-600",
  refunded: "text-wood/50",
  cancelled: "text-wood/40",
};

export default function OrderStatusPage() {
  const { t, locale } = useTranslation();
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.orderId) {
      setError(t("order.idMissing"));
      setLoading(false);
      return;
    }

    fetch(`/api/order/${params.orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(t("order.fetchError"));
        setLoading(false);
      });
  }, [params.orderId, t]);

  const amount = useMemo(
    () =>
      order
        ? (order.totalAmount / 100).toLocaleString(locale === "en" ? "en-US" : "ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
        : "",
    [order, locale],
  );

  const createdAt = useMemo(
    () =>
      order?.createdAt
        ? new Date(order.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
    [order, locale],
  );

  const statusLabel = order ? t("status." + order.status) || order.status : "";

  const formatItemPrice = (price: number, quantity: number) =>
    ((price * quantity) / 100).toLocaleString(locale === "en" ? "en-US" : "ru-RU") + " ₽";

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="reel" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-3xl text-wood font-bold mb-4">{t("order.notFound")}</h1>
        <p className="font-mono text-sm text-wood/60 mb-8">{error}</p>
        <Link href="/shop">
          <RetroButton variant="neon">{t("order.toCatalog")}</RetroButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <EqualizerBars />
        <h1 className="font-heading text-3xl text-wood font-bold">{t("order.title")}</h1>
        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="border-2 border-wood/20 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-mono text-xs text-wood/70">{t("order.number")}</span>
          <span className="font-mono text-sm text-wood">#{order.orderId}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-mono text-xs text-wood/70">{t("order.date")}</span>
          <span className="font-mono text-sm text-wood">{createdAt}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-mono text-xs text-wood/70">{t("order.status")}</span>
          <span className={"font-mono text-sm font-semibold " + (STATUS_COLORS[order.status] || "text-wood")}>
            {statusLabel}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-mono text-xs text-wood/70">{t("order.paymentMethod")}</span>
          <span className="font-mono text-sm text-wood">
            {order.paymentMethod === "card" ? t("order.card") : t("order.cash")}
          </span>
        </div>

        {order.receiptUrl && (
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-wood/70">{t("order.receipt")}</span>
            <a
              href={order.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-neon hover:underline"
            >
              {t("order.receiptLink")}
            </a>
          </div>
        )}

        <hr className="border-wood/10" />

        <div>
          <span className="font-mono text-xs text-wood/70 block mb-2">{t("order.recipient")}</span>
          <p className="font-mono text-sm text-wood">{order.customerName}</p>
          <p className="font-mono text-sm text-wood/60">{order.customerPhone}</p>
          <p className="font-mono text-sm text-wood/60">{order.customerEmail}</p>
        </div>

        <div>
          <span className="font-mono text-xs text-wood/70 block mb-2">{t("order.address")}</span>
          <p className="font-mono text-sm text-wood/60">{order.shippingAddress}</p>
        </div>

        {order.comment && (
          <div>
            <span className="font-mono text-xs text-wood/70 block mb-2">{t("order.comment")}</span>
            <p className="font-mono text-sm text-wood/60">{order.comment}</p>
          </div>
        )}

        <hr className="border-wood/10" />

        <div>
          <span className="font-mono text-xs text-wood/70 block mb-2">{t("order.items")}</span>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="font-mono text-wood/70">
                  {item.name} x {item.quantity}
                </span>
                <span className="font-mono text-wood">
                  {formatItemPrice(item.price, item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-wood/10" />

        <div className="flex justify-between items-center">
          <span className="font-heading text-base text-wood font-bold">{t("order.total")}</span>
          <span className="font-heading text-base text-neon font-bold">{amount}</span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/shop">
          <RetroButton variant="neon">{t("order.toCatalog")}</RetroButton>
        </Link>
      </div>
    </div>
  );
}
