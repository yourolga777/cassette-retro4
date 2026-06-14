import Link from "next/link";
import { RetroButton } from "@/components/retro/RetroButton";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 px-4">
      <h1 className="font-heading text-6xl text-wood font-bold">404</h1>
      <p className="font-mono text-sm text-wood/60 text-center">
        Эта страница не найдена. Возможно, плёнка зажевалась.
      </p>
      <Link href="/">
        <RetroButton variant="neon">На главную</RetroButton>
      </Link>
    </div>
  );
}
