import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Garda ERP — Sistem Manajemen BUJP Terintegrasi",
  description: "Enterprise Resource Planning khusus Badan Usaha Jasa Pengamanan (BUJP)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} min-h-screen bg-black text-white antialiased`}>
        {children}
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
