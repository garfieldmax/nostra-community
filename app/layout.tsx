import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PrivyProviderWrapper } from "@/components/PrivyProviderWrapper";
import { SiteHeader } from "@/components/shell/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agartha Dashboard",
  description: "Prototype dashboard scaffold with Privy auth and Supabase data",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 text-slate-900 antialiased min-h-screen`}>
        <PrivyProviderWrapper>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 pt-16 md:pt-0">{children}</main>
          </div>
        </PrivyProviderWrapper>
      </body>
    </html>
  );
}
