"use client";

import { useEffect, useState } from "react";

export function CrtOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9997] pointer-events-none animate-fade-in" />
  );
}
