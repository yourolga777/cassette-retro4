"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RetroButton } from "@/components/retro/RetroButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/profile");
    } else {
      const data = await res.json();
      setError(data.error || "Ошибка входа");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl text-wood font-bold text-center mb-8">Вход</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="retro-input" required />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="retro-input" required />
          </div>
          {error && <p className="font-mono text-xs text-neon">{error}</p>}
          <RetroButton type="submit" variant="neon" className="w-full" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </RetroButton>
        </form>
        <div className="mt-4 text-center space-y-2">
          <p className="font-mono text-xs text-wood/40">
            Нет аккаунта? <Link href="/register" className="text-copper hover:text-neon transition-colors">Зарегистрироваться</Link>
          </p>
          <p className="font-mono text-xs">
            <Link href="/forgot-password" className="text-copper hover:text-neon transition-colors">Забыли пароль?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
