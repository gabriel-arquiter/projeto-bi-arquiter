import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { TrendChart } from '@/components/charts/trend-chart';
import { getPinterestMetrics } from '@/lib/queries';
import { resolvePeriod, type PageSearchParams } from '@/lib/period';

export const dynamic = 'force-dynamic';
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));
const pct = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : undefined);

export default async function PinterestPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const period = resolvePeriod(searchParams);
  const [pin, pinPrev] = await Promise.all([
    getPinterestMetrics(period.range).catch(() => []),
    period.compare ? getPinterestMetrics(period.prevRange).catch(() => []) : Promise.resolve([]),
  ]);
  const last = pin.at(-1);
  const sparkImpr = pin.slice(-14).map((d) => d.impressions);
  const sparkSaves = pin.slice(-14).map((d) => d.saves);
  const sparkClicks = pin.slice(-14).map((d) => d.outbound_clicks);
  const totalImpr = pin.reduce((s, d) => s + (d.impressions ?? 0), 0);
  const prevTotalImpr = pinPrev.reduce((s, d) => s + (d.impressions ?? 0), 0);

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Social analytics</span>
          <h1>Pinterest</h1>
          <p className="subtitle">
            Impressões, saves e cliques de saída — orgânico do Pinterest.
          </p>
        </div>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Impressões"
          value={fmt(last?.impressions ?? 0)}
          spark={sparkImpr}
          icon={KpiIcons.reach}
        />
        <KpiCard
          label="Saves"
          value={fmt(last?.saves ?? 0)}
          spark={sparkSaves}
          icon={KpiIcons.heart}
        />
        <KpiCard
          label="Cliques saída"
          value={fmt(last?.outbound_clicks ?? 0)}
          spark={sparkClicks}
          icon={KpiIcons.sessions}
        />
        <KpiCard
          label={`Impressões ${period.days}d`}
          value={fmt(totalImpr)}
          delta={period.compare ? pct(totalImpr, prevTotalImpr) : undefined}
          hint="acumulado"
          icon={KpiIcons.leads}
        />
      </section>

      <div className="section-title">
        <h2>Tendência</h2>
        <span className="hint">Impressões e saves · {period.days}d</span>
      </div>
      <TrendChart
        data={pin as unknown as Array<Record<string, string | number>>}
        xKey="date"
        title="Pinterest · evolução diária"
        subtitle="Impressões vs saves"
        lines={[
          { key: 'impressions', label: 'Impressões', color: '#ead32d' },
          { key: 'saves', label: 'Saves', color: '#4a90d9' },
        ]}
      />
    </div>
  );
}
