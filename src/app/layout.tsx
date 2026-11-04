import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { sobre } from "@/content/sobre";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: sobre.nome, template: `%s · ${sobre.nome}` },
  description: sobre.slogan,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen font-sans text-[15px] antialiased">
        <Header />
        <main className="mx-auto max-w-3xl px-5 pb-24 sm:px-6 sm:pb-32">{children}</main>
        <footer className="mx-auto max-w-3xl px-5 py-10 text-sm text-grafite sm:px-6">{sobre.lema}</footer>
      </body>
    </html>
  );
}
