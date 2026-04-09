import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { YandexMetrika } from "@/lib/analytics/YandexMetrika";
import { ThemeScript } from "@/lib/layout/ThemeScript";
import { SITE_WIDE_SEO_KEYWORDS } from "@/lib/seo-keywords";
import "./globals.scss";
import "./tailwind.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "wbobzor — обзоры товаров Wildberries",
    template: "%s — wbobzor",
  },
  description:
    "Обзоры товаров с Wildberries: честные впечатления, плюсы и минусы, сравнения и подборки.",
  keywords: SITE_WIDE_SEO_KEYWORDS,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`app-root ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="app-root__body" suppressHydrationWarning>
        {children}
        <YandexMetrika />
      </body>
    </html>
  );
}
