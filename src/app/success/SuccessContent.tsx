"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { RetroButton } from "@/components/retro/RetroButton";
import { useTranslation } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface OrderData {
  orderId: string;
  status: string;
  totalAmount: number;
  paymentMethod: "card" | "cash";
  receiptUrl?: string | null;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  createdAt: string;
}

export default function SuccessContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError(t("success.orderIdMissing"));
      setLoading(false);
      return;
    }

    fetch(`/api/order/${orderId}`)
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
        setError(t("success.fetchError"));
        setLoading(false);
      });
  }, [orderId, t]);

  const amount = useMemo(
    () =>
      order
        ? (order.totalAmount / 100).toLocaleString("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
        : "",
    [order],
  );

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <div className="reel" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-copper mb-8">
          <span className="font-heading text-4xl text-copper">✓</span>
        </div>
        <h1 className="font-heading text-3xl text-wood font-bold mb-4">
          {t("success.title")}
        </h1>
        <p className="font-mono text-sm text-wood/60 mb-8">{error || t("success.loading")}</p>
        <Link href="/shop">
          <RetroButton variant="neon">{t("success.toCatalog")}</RetroButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="flex justify-end mb-4">
        <LanguageSwitcher />
      </div>
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-copper mb-8">
        <span className="font-heading text-4xl text-copper">✓</span>
      </div>

      {order.paymentMethod === "card" ? (
        <>
          <h1 className="font-heading text-3xl text-wood font-bold mb-4">
            {t("success.cardTitle")}
          </h1>
          <div className="font-mono text-sm text-wood/60 mb-2">
            {t("success.order", { id: order.orderId })}
          </div>
          <div className="font-mono text-sm text-wood/60 mb-2">
            {t("success.amount", { amount })}
          </div>
          {order.receiptUrl && (
            <a
              href={order.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-neon hover:underline inline-block mb-8"
            >
              {t("success.receiptLink")}
            </a>
          )}
          {!order.receiptUrl && (
            <p className="font-mono text-xs text-wood/40 mb-8">
              {t("success.receiptEmail")}
            </p>
          )}
        </>
      ) : (
        <>
          <h1 className="font-heading text-3xl text-wood font-bold mb-4">
            {t("success.cashTitle")}
          </h1>
          <div className="font-mono text-sm text-wood/60 mb-2">
            {t("success.order", { id: order.orderId })}
          </div>
          <p className="font-mono text-sm text-wood/60 mb-8">
            {t("success.cashMessage")}
          </p>
        </>
      )}

      <div className="flex items-center justify-center gap-4">
        <Link href="/shop">
          <RetroButton variant="neon">{t("success.toCatalog")}</RetroButton>
        </Link>
        <Link href={"/order/" + order.orderId}>
          <RetroButton variant="ghost">{t("success.viewStatus")}</RetroButton>
        </Link>
      </div>
    </div>
  );
}
