import type { Metadata } from 'next';
import { PortfolioDashboard } from '@/components/features/PortfolioDashboard';
import { Footer } from '@/components/layout/Footer';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { mockAssets } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Review confirmed token purchases and illustrative listing values for your connected demo wallet.',
};

export default function PortfolioPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavigationHeader assets={mockAssets} />
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1600px] flex-1 px-3 py-6 sm:px-6 sm:py-8"
      >
        <PortfolioDashboard />
      </main>
      <Footer />
    </div>
  );
}
