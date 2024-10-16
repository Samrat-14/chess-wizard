import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({
  weight: ['400', '600', '700', '800'],
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Chess Wizard',
  description: 'Chess Wizard is the ultimate chess experience. Become a chess wizard today!',
  keywords: ['chess', 'play chess', 'chess wizard', 'online chess', 'chess game'],
  creator: 'Samrat Sadhu',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
