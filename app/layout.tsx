import type { Metadata } from 'next';
import { Inter, Orbitron, Bungee, Press_Start_2P } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Orbitron is a perfect futuristic font for crypto/tech projects
const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

// Bungee is bold and eye-catching, great for headlines
const bungee = Bungee({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bungee',
  display: 'swap',
});

// Press Start 2P is a pixel font perfect for retro gaming style
const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bubu',
  description: 'Bubu website with three sections',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${orbitron.variable} ${bungee.variable} ${pressStart2P.variable}`}>{children}</body>
    </html>
  );
}
