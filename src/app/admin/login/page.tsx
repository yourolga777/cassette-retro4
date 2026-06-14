"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/retro/RetroButton";

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Неверный логин или пароль");
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl text-wood font-bold text-center mb-8">
          Вход в админку
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">
              Логин
            </label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="retro-input"
              required
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="retro-input"
              required
            />
          </div>
          {error && (
            <p className="font-mono text-xs text-neon">{error}</p>
          )}
          <RetroButton type="submit" variant="neon" className="w-full">
            Войти
          </RetroButton>
        </form>
      </div>
    </div>
  );
}
