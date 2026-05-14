import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Buy Store — Witgoed Specialist | Gratis installatie & zelfde dag bezorging',
  description: 'Topmerken witgoed met gratis installatie, zelfde dag bezorging en gratis afvoer oud apparaat. Koelkasten, wasmachines, vaatwassers, drogers en meer.',
  keywords: 'witgoed, koelkast, wasmachine, vaatwasser, droger, gratis installatie, zelfde dag bezorging',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
