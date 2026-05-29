import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Smart Buy Store — Witgoed Specialist | Gratis installatie & zelfde dag bezorging',
  description: 'Topmerken witgoed met gratis installatie, zelfde dag bezorging en gratis afvoer oud apparaat. Koelkasten, wasmachines, vaatwassers, drogers en meer.',
  keywords: 'witgoed, koelkast, wasmachine, vaatwasser, droger, gratis installatie, zelfde dag bezorging',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-screen flex flex-col font-body">{children}</body>
    </html>
  );
}
