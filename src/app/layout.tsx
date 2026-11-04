import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { sobre } from "@/content/sobre";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: sobre.nome, template: `%s · ${sobre.nome}` },
  description: sobre.slogan,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <Header />
        <main className="mx-auto max-w-5xl px-5 pb-24">{children}</main>
        <footer className="border-t border-linha py-8 text-center text-sm text-grafite">
          {sobre.nome} · feito com café e PDFs
        </footer>
      </body>
    </html>
  );
}
