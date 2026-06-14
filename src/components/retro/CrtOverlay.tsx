"use client";

import { useEffect, useState } from "react";

export function CrtOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return <div className="crt-overlay" aria-hidden />;

  return (
    <div className="crt-overlay" aria-hidden>
      <div
        className="absolute inset-0 bg-white"
        style={{ animation: "crt-on 0.8s ease-out forwards" }}
      />
    </div>
  );
}
