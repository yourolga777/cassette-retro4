"use client";

import { useState } from "react";
import Link from "next/link";
import { RetroButton } from "@/components/retro/RetroButton";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-heading text-2xl text-wood font-bold mb-4">Проверьте почту</h1>
          <p className="font-mono text-sm text-wood/60 mb-6">
            Если такой email зарегистрирован, мы отправили ссылку для сброса пароля.
          </p>
          <Link href="/login" className="text-copper hover:text-neon font-mono text-xs transition-colors">
            Вернуться ко входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl text-wood font-bold text-center mb-8">Восстановление пароля</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="retro-input" required />
          </div>
          <RetroButton type="submit" variant="neon" className="w-full">Отправить</RetroButton>
        </form>
        <p className="mt-4 text-center">
          <Link href="/login" className="font-mono text-xs text-copper hover:text-neon transition-colors">Вспомнили пароль?</Link>
        </p>
      </div>
    </div>
  );
}
