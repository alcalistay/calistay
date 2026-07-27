import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { PageGlows } from "@/components/fx/page-glows";
import { LoadingScreen } from "@/components/fx/loading-screen";
import { SettingsProvider } from "@/components/providers/settings-provider";
import { event } from "@/constants/event";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const description =
  "ALÇAL'26 — Eskişehir Atatürk Lisesi'nin düzenlediği, ulusal katılıma açık lise düzeyi çalıştay konferansı. 300 delege, 8 komite, Aralık 2026.";

export const metadata: Metadata = {
  metadataBase: new URL("https://alcal26.com"),
  title: {
    default: `${event.shortName} — ${event.name}`,
    template: `%s · ${event.shortName}`,
  },
  description,
  keywords: [
    "ALÇAL'26",
    "Atatürk Lisesi Çalıştayı",
    "çalıştay",
    "Eskişehir",
    "lise konferansı",
    "delege",
    "komite",
  ],
  authors: [{ name: event.organizer }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: event.shortName,
    title: `${event.shortName} — ${event.name}`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${event.shortName} — ${event.name}`,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d1a2b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="relative flex min-h-full flex-col">
        {/* Sayfa boyunca süren ambiyans ışıkları — bölüm sınırlarından bağımsız */}
        <LoadingScreen />
        <PageGlows />
        <SettingsProvider>{children}</SettingsProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
