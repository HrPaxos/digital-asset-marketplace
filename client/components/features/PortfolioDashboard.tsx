'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowUpRight, BriefcaseBusiness, WalletCards } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useWallet } from '@/context/WalletContext';
import { CATEGORIES } from '@/lib/constants';
import { mockAssets } from '@/lib/mock-data';
import { formatFiat } from '@/lib/utils';

interface PortfolioPosition {
  assetId: string;
  title: string;
  slug: string;
  thumbnail: string;
  category: string;
  quantity: number;
  costBasisUsd: number;
  estimatedValueUsd: number;
}

const ASSETS_BY_ID = new Map(mockAssets.map((asset) => [asset.id, asset]));

export function PortfolioDashboard() {
  const { wallet, transactions } = useWallet();

  const positions = useMemo(() => {
    if (!wallet.address) return [];

    const holdings = new Map<string, PortfolioPosition>();
    transactions
      .filter(
        (transaction) =>
          transaction.status === 'confirmed' &&
          transaction.buyerAddress.toLowerCase() === wallet.address?.toLowerCase()
      )
      .forEach((transaction) => {
        const asset = ASSETS_BY_ID.get(transaction.assetId);
        if (!asset) return;

        const quantity = transaction.quantity ?? 1;
        const position = holdings.get(asset.id);
        if (position) {
          position.quantity += quantity;
          position.costBasisUsd += transaction.amountFiatUsd;
          position.estimatedValueUsd += asset.priceFiatUsd * quantity;
          return;
        }

        holdings.set(asset.id, {
          assetId: asset.id,
          title: asset.title,
          slug: asset.slug,
          thumbnail: asset.media.thumbnailUrl,
          category: asset.category,
          quantity,
          costBasisUsd: transaction.amountFiatUsd,
          estimatedValueUsd: asset.priceFiatUsd * quantity,
        });
      });

    return Array.from(holdings.values()).sort(
      (left, right) => right.estimatedValueUsd - left.estimatedValueUsd
    );
  }, [transactions, wallet.address]);

  const summary = useMemo(
    () =>
      positions.reduce(
        (total, position) => ({
          value: total.value + position.estimatedValueUsd,
          cost: total.cost + position.costBasisUsd,
          quantity: total.quantity + position.quantity,
        }),
        { value: 0, cost: 0, quantity: 0 }
      ),
    [positions]
  );

  const allocations = useMemo(() => {
    const totals = new Map<string, number>();
    positions.forEach((position) => {
      totals.set(position.category, (totals.get(position.category) ?? 0) + position.estimatedValueUsd);
    });
    return CATEGORIES.map((category) => ({
      ...category,
      value: totals.get(category.value) ?? 0,
    }))
      .filter((category) => category.value > 0)
      .sort((left, right) => right.value - left.value);
  }, [positions]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
          Your account
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-50">Portfolio</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          Review confirmed token purchases for the connected demo wallet. Values use sample
          marketplace listings, not live market prices.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Estimated listing value" value={formatFiat(summary.value)} />
        <SummaryCard label="Recorded purchase total" value={formatFiat(summary.cost)} />
        <SummaryCard label="Token units acquired" value={String(summary.quantity)} />
      </div>

      {!wallet.isConnected ? (
        <GlassPanel padding="lg" className="flex flex-col items-center gap-3 text-center">
          <WalletCards aria-hidden="true" className="size-10 text-cyan-300" />
          <div>
            <h2 className="font-semibold text-slate-100">Connect a wallet to view your portfolio</h2>
            <p className="mt-1 max-w-md text-sm text-slate-400">
              Demo wallet profiles include sample purchase history. Connect from the header to
              explore its positions.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20"
          >
            Browse assets <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </GlassPanel>
      ) : positions.length === 0 ? (
        <GlassPanel padding="lg" className="flex flex-col items-center gap-3 text-center">
          <BriefcaseBusiness aria-hidden="true" className="size-10 text-slate-600" />
          <div>
            <h2 className="font-semibold text-slate-100">No confirmed purchases yet</h2>
            <p className="mt-1 text-sm text-slate-400">
              Completed purchases for this wallet will appear here.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/15 bg-slate-900/60 px-4 text-sm text-slate-100 hover:border-cyan-400/50"
          >
            Explore the marketplace <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </GlassPanel>
      ) : (
        <>
          {allocations.length > 0 ? (
            <GlassPanel padding="md">
              <h2 className="text-sm font-semibold text-slate-100">Allocation by category</h2>
              <div className="mt-4 flex flex-col gap-3">
                {allocations.map((category) => (
                  <div key={category.value}>
                    <div className="mb-1.5 flex justify-between gap-3 text-xs">
                      <span className="text-slate-300">{category.label}</span>
                      <span className="font-mono text-slate-400">{formatFiat(category.value)}</span>
                    </div>
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-slate-800"
                      role="progressbar"
                      aria-label={`${category.label} allocation`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round((category.value / summary.value) * 100)}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-400"
                        style={{ width: `${(category.value / summary.value) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          ) : null}

          <GlassPanel padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <h2 className="text-sm font-semibold text-slate-100">Your positions</h2>
              <Link href="/orders" className="text-xs text-cyan-300 hover:text-cyan-200">
                Transaction history
              </Link>
            </div>
            <ul className="divide-y divide-white/5">
              {positions.map((position) => (
                <li
                  key={position.assetId}
                  className="flex flex-wrap items-center gap-3 p-4"
                  data-testid="portfolio-position"
                >
                  <Image
                    src={position.thumbnail}
                    alt=""
                    aria-hidden="true"
                    width={48}
                    height={48}
                    className="size-12 rounded-xl border border-white/10 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/asset/${position.slug}`}
                      className="block truncate text-sm font-medium text-slate-100 hover:text-cyan-300"
                    >
                      {position.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {position.quantity} unit{position.quantity === 1 ? '' : 's'} ·{' '}
                      {CATEGORIES.find((category) => category.value === position.category)?.label}
                    </p>
                  </div>
                  <dl className="grid grid-cols-2 gap-4 text-right text-xs sm:min-w-64">
                    <div>
                      <dt className="text-slate-500">Purchase total</dt>
                      <dd className="mt-1 font-mono text-slate-300">
                        {formatFiat(position.costBasisUsd)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Est. listing value</dt>
                      <dd className="mt-1 font-mono text-cyan-300">
                        {formatFiat(position.estimatedValueUsd)}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </>
      )}

      <p className="text-xs leading-relaxed text-amber-200/70">
        Demo only: positions are inferred from confirmed sample purchase records and current
        catalog prices. No live balances, valuations, ownership claims, or investment returns are
        provided.
      </p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <GlassPanel padding="md">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-slate-100">{value}</p>
    </GlassPanel>
  );
}
