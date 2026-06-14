"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/retro/RetroButton";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-heading text-2xl text-wood font-bold mb-4">Пароль изменён</h1>
          <p className="font-mono text-sm text-wood/60 mb-6">Можете войти с новым паролем.</p>
          <RetroButton variant="neon" onClick={() => router.push("/login")}>Войти</RetroButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl text-wood font-bold text-center mb-8">Новый пароль</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="retro-input" required />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Новый пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="retro-input" required minLength={6} />
          </div>
          <RetroButton type="submit" variant="neon" className="w-full">Сохранить</RetroButton>
        </form>
      </div>
    </div>
  );
}
