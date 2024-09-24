import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';

import './globals.css';

const poppins = Poppins({
  weight: ['400', '600', '700', '800'],
  variable: '--font-poppins',
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
      <head>
        <link rel="shortcut icon" href="/favicon.png" type="image/x-icon" />
      </head>
      <body className={`${poppins.variable} antialiased`}>{children}</body>
    </html>
  );
}
