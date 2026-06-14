"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RetroButton } from "@/components/retro/RetroButton";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const info = {
      message: error.message,
      digest: error.digest,
      url: typeof window !== "undefined" ? window.location.href : "",
      time: new Date().toISOString(),
    };
    fetch("/api/notify-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info),
    }).catch(() => {});
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 px-4">
      <h1 className="font-heading text-6xl text-wood font-bold">500</h1>
      <p className="font-mono text-sm text-wood/60 text-center max-w-md">
        Chto-to poshlo ne tak. Nasha plenka zavalas. My uznaem ob etom i
        postaraemsya ispravit.
      </p>
      <div className="flex items-center gap-4">
        <RetroButton variant="neon" onClick={reset}>
          Poprobovat snova
        </RetroButton>
        <Link href="/">
          <RetroButton variant="ghost">Na glavnuyu</RetroButton>
        </Link>
      </div>
    </div>
  );
}
