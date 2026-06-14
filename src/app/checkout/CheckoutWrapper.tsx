"use client";

import dynamic from "next/dynamic";

const CheckoutContent = dynamic(() => import("./CheckoutContent"), { ssr: false });

export default function CheckoutWrapper() {
  return <CheckoutContent />;
}
