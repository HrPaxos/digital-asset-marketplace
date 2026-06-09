import type { Metadata, Viewport } from 'next';
import './globals.css';
import { WalletProvider } from '@/context/WalletContext';
import { CartProvider } from '@/context/CartContext';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    default: 'Tokenized Asset Marketplace | Real Estate, Bonds & Commodities',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Explore tokenized gold, commodities, bonds, fractional real estate and digital assets in a marketplace demo with transparent transaction history.',
  icons: {
    icon: '/paxos_logo.png',
    shortcut: '/paxos_logo.png',
    apple: '/paxos_logo.png',
  },
  applicationName: SITE_NAME,
  keywords: [
    'digital assets',
    'tokenized gold',
    'tokenized commodities',
    'tokenized bonds',
    'fractional real estate',
    'digital tokens',
  ],
};

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-cyan-500 focus:px-4 focus:py-2 focus:text-slate-950"
        >
          Skip to main content
        </a>
        <WalletProvider>
          <CartProvider>{children}</CartProvider>
        </WalletProvider>
      </body>
    </html>
  );
}