"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { RetroButton } from "@/components/retro/RetroButton";
import { EqualizerBars } from "@/components/retro/EqualizerBars";
import { useTranslation } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function CheckoutContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [consent, setConsent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    comment: "",
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (items.length === 0) return;
      setLoading(true);
      setError("");

      try {
        const validateRes = await fetch("/api/validate-cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });
        const validateData = await validateRes.json();

        if (!validateData.valid) {
          if (validateData.updates) {
            const changes = validateData.updates
              .map((u: { name: string; available: boolean; newPrice: number }) =>
                u.available === false
                  ? t("checkout.itemUnavailable", { name: u.name })
                  : t("checkout.itemNewPrice", { name: u.name, price: formatPrice(u.newPrice) })
              )
              .join(". ");
            setError(t("checkout.cartError", { changes }));
          } else {
            setError(validateData.error || t("checkout.validationError"));
          }
          setLoading(false);
          return;
        }

        const body = {
          items,
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email,
          shippingAddress: form.address,
          comment: form.comment || undefined,
        };

        if (paymentMethod === "card") {
          const res = await fetch("/api/create-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          const data = await res.json();
          if (data.paymentUrl) {
            clearCart();
            window.location.href = data.paymentUrl;
          } else {
            setError(data.error || t("checkout.paymentError"));
          }
        } else {
          const res = await fetch("/api/create-order-cash", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          const data = await res.json();
          if (data.success && data.orderId) {
            clearCart();
            router.push("/success?orderId=" + data.orderId);
          } else {
            setError(data.error || t("checkout.orderError"));
          }
        }
      } catch {
        setError(t("checkout.connectionError"));
      } finally {
        setLoading(false);
      }
    },
    [items, form, paymentMethod, clearCart, router, t]
  );

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <EqualizerBars />
        <h1 className="font-heading text-3xl text-wood font-bold">{t("checkout.title")}</h1>
        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-6">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">
              {t("checkout.name")}
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="retro-input"
              placeholder={t("checkout.namePlaceholder")}
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">
              {t("checkout.phone")}
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={form.phone}
              onChange={handleChange}
              className="retro-input"
              placeholder={t("checkout.phonePlaceholder")}
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">
              {t("checkout.email")}
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="retro-input"
              placeholder={t("checkout.emailPlaceholder")}
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">
              {t("checkout.address")}
            </label>
            <textarea
              name="address"
              required
              rows={3}
              value={form.address}
              onChange={handleChange}
              className="retro-input resize-none"
              placeholder={t("checkout.addressPlaceholder")}
            />
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">
              {t("checkout.comment")}
            </label>
            <textarea
              name="comment"
              rows={2}
              value={form.comment}
              onChange={handleChange}
              className="retro-input resize-none"
              placeholder={t("checkout.commentPlaceholder")}
            />
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">
              {t("checkout.payment")}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="accent-neon"
                />
                <span className="font-mono text-sm text-wood/80">{t("checkout.card")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                  className="accent-neon"
                />
                <span className="font-mono text-sm text-wood/80">{t("checkout.cash")}</span>
              </label>
            </div>
          </div>

          {error && (
            <p className="font-mono text-xs text-neon">{error}</p>
          )}

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4 accent-copper shrink-0"
              required
            />
            <span className="font-mono text-xs text-wood/60 leading-relaxed">
              {t("checkout.consent")}
              <a href="/privacy" target="_blank" className="text-copper hover:text-neon underline">
                {t("checkout.consentPolicy")}
              </a>
            </span>
          </label>

          <RetroButton
            type="submit"
            variant="neon"
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {loading
              ? t("checkout.submit.processing")
              : paymentMethod === "card"
                ? t("checkout.submit.pay", { amount: formatPrice(totalAmount()) })
                : t("checkout.submit.order")}
          </RetroButton>

          {paymentMethod === "card" && (
            <p className="font-mono text-[10px] text-wood/30 text-center">
              {t("checkout.security")}
            </p>
          )}
          {paymentMethod === "cash" && (
            <p className="font-mono text-[10px] text-wood/30 text-center">
              {t("checkout.cashInfo")}
            </p>
          )}
        </form>

        <div className="md:col-span-2">
          <h3 className="font-heading text-sm text-wood font-semibold uppercase tracking-wider mb-4">
            {t("checkout.yourOrder")}
          </h3>
          <div className="border-2 border-wood/20 p-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="font-mono text-wood/70">
                  {item.name} x {item.quantity}
                </span>
                <span className="font-mono text-wood font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t-2 border-wood/10 pt-3 flex justify-between">
              <span className="font-heading text-base text-wood font-bold">{t("checkout.total")}</span>
              <span className="font-heading text-base text-neon font-bold">
                {formatPrice(totalAmount())}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
