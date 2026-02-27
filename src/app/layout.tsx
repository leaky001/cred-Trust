import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import { Providers } from "./providers";
import { Layout } from "@/components/layout/Layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "CredTrust — Decentralised Credit & Micro-Lending",
  description:
    "Reputation-based lending on Creditcoin. Access capital without heavy collateral.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans">
      <body className="min-h-screen bg-surface-secondary font-sans antialiased">
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
