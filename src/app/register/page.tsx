"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RetroButton } from "@/components/retro/RetroButton";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError("Необходимо дать согласие на обработку персональных данных");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (res.ok) {
      router.push("/profile");
    } else {
      const data = await res.json();
      setError(data.error || "Ошибка регистрации");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl text-wood font-bold text-center mb-8">Регистрация</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Имя</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="retro-input" />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="retro-input" required />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Пароль *</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="retro-input" required minLength={6} />
          </div>
          {error && <p className="font-mono text-xs text-neon">{error}</p>}

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4 accent-copper shrink-0"
              required
            />
            <span className="font-mono text-xs text-wood/60 leading-relaxed">
              Я даю согласие на обработку моих персональных данных в соответствии с{" "}
              <a href="/privacy" target="_blank" className="text-copper hover:text-neon underline">
                Политикой конфиденциальности
              </a>
            </span>
          </label>

          <RetroButton type="submit" variant="neon" className="w-full" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </RetroButton>
        </form>
        <p className="mt-4 text-center font-mono text-xs text-wood/40">
          Уже есть аккаунт? <Link href="/login" className="text-copper hover:text-neon transition-colors">Войти</Link>
        </p>
      </div>
    </div>
  );
}
