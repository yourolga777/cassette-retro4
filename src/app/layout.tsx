import type { Metadata } from "next";
import "./globals.css";
import { CorporateHeader } from "@/components/corporate/CorporateHeader";
import { CorporateFooter } from "@/components/corporate/CorporateFooter";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "Cassette Retro — Магазин аудиокассет и оборудования",
  description:
    "Оригинальные аудиокассеты TDK, BASF, Sony, микстейпы, кассетные деки и плееры. Доставка по России.",
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
        <LanguageProvider>
          <CorporateHeader />
          <main className="flex-1">{children}</main>
          <CorporateFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
