import type { Metadata } from "next";
import "./globals.css";
import { RetroHeader } from "@/components/retro/RetroHeader";
import { RetroFooter } from "@/components/retro/RetroFooter";
import { CrtOverlay } from "@/components/retro/CrtOverlay";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const metadata: Metadata = {
  title: "Cassette Retro — Магазин аудиокассет и оборудования",
  description:
    "Пустые аудиокассеты Type I/II/IV, микстейпы, кассетные деки, плееры. TDK, BASF, Sony — с доставкой по России.",
  openGraph: {
    title: "Cassette Retro",
    description: "Магазин аудиокассет и оборудования",
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full flex flex-col">
        <CrtOverlay />
        <LanguageProvider>
          <RetroHeader />
          <main className="flex-1">{children}</main>
          <RetroFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
