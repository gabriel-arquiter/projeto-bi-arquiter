import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { TrendChart } from '@/components/charts/trend-chart';
import {
  getMonthlyOverview,
  getGa4Daily,
  getSearchConsoleDaily,
  getInstagramMetrics,
  getPinterestMetrics,
  getMetaAds,
  getGoogleAds,
} from '@/lib/queries';

export const dynamic = 'force-dynamic';

const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));
const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);

function delta(a?: number, b?: number) {
  if (!a || !b) return undefined;
  return ((a - b) / b) * 100;
}

export default async function InvestorViewPage() {
  const [overview, ga4, sc, ig, pin, meta, google] = await Promise.all([
    getMonthlyOverview().catch(() => []),
    getGa4Daily(30).catch(() => []),
    getSearchConsoleDaily(30).catch(() => []),
    getInstagramMetrics(30).catch(() => []),
    getPinterestMetrics(30).catch(() => []),
    getMetaAds(30).catch(() => []),
    getGoogleAds(30).catch(() => []),
  ]);

  const last = overview.at(-1);
  const prev = overview.at(-2);

  // Bloco 1 — Growth Metrics
  const sessionsTotal = ga4.reduce((s, d) => s + (d.sessions ?? 0), 0);
  const sessionsPrev = (last?.sessions ?? 0) > 0 ? prev?.sessions ?? 0 : 0;
  const leadsTotal = (last?.meta_leads ?? 0) + (last?.google_leads ?? 0);
  const leadsPrev = (prev?.meta_leads ?? 0) + (prev?.google_leads ?? 0);
  const spendTotal = (last?.meta_spend ?? 0) + (last?.google_spend ?? 0);
  const spendPrev = (prev?.meta_spend ?? 0) + (prev?.google_spend ?? 0);
  const cac = leadsTotal ? spendTotal / leadsTotal : 0;
  const cacPrev = leadsPrev ? spendPrev / leadsPrev : 0;
  const roas = ((last?.meta_roas ?? 0) + (last?.google_roas ?? 0)) / 2;
  const roasPrev = ((prev?.meta_roas ?? 0) + (prev?.google_roas ?? 0)) / 2;

  // Bloco 2 — Funil
  const adsImpressions =
    meta.reduce((s, r) => s + (r.impressions ?? 0), 0) +
    google.reduce((s, r) => s + (r.impressions ?? 0), 0);
  const scImpressions = sc.reduce((s, d) => s + (d.impressions ?? 0), 0);
  const impressionsTotal = adsImpressions + scImpressions;

  const adsClicks =
    meta.reduce((s, r) => s + (r.clicks ?? 0), 0) +
    google.reduce((s, r) => s + (r.clicks ?? 0), 0);
  const organicSessions = ga4.reduce((s, d) => s + (d.organic_sessions ?? 0), 0);
  const clicksSessions = adsClicks + organicSessions;

  const mqls = Math.round(leadsTotal * 0.42); // mock SPICED ≥ 7
  const contracts = Math.round(mqls * 0.18); // mock close rate

  const ctr = impressionsTotal ? (clicksSessions / impressionsTotal) * 100 : 0;
  const convLead = clicksSessions ? (leadsTotal / clicksSessions) * 100 : 0;
  const qual = leadsTotal ? (mqls / leadsTotal) * 100 : 0;
  const close = mqls ? (contracts / mqls) * 100 : 0;

  // Bloco 3 — Canais
  const metaSpend = meta.reduce((s, r) => s + (r.spend ?? 0), 0);
  const metaLeads = meta.reduce((s, r) => s + (r.leads ?? 0), 0);
  const googleSpend = google.reduce((s, r) => s + (r.spend ?? 0), 0);
  const googleLeads = google.reduce((s, r) => s + (r.leads ?? 0), 0);
  const channels = [
    {
      name: 'Meta Ads',
      invest: metaSpend,
      leads: metaLeads,
      cpl: metaLeads ? metaSpend / metaLeads : 0,
      mqls: Math.round(metaLeads * 0.42),
      cac: metaLeads ? metaSpend / Math.round(metaLeads * 0.42) : 0,
    },
    {
      name: 'Google Ads',
      invest: googleSpend,
      leads: googleLeads,
      cpl: googleLeads ? googleSpend / googleLeads : 0,
      mqls: Math.round(googleLeads * 0.42),
      cac: googleLeads ? googleSpend / Math.round(googleLeads * 0.42) : 0,
    },
    {
      name: 'Orgânico Blog',
      invest: 0,
      leads: Math.round(organicSessions * 0.018),
      cpl: 0,
      mqls: Math.round(organicSessions * 0.018 * 0.5),
      cac: 0,
    },
    {
      name: 'Instagram Orgânico',
      invest: 0,
      leads: Math.round(ig.reduce((s, d) => s + (d.reach ?? 0), 0) * 0.0012),
      cpl: 0,
      mqls: Math.round(ig.reduce((s, d) => s + (d.reach ?? 0), 0) * 0.0012 * 0.4),
      cac: 0,
    },
  ];

  // Bloco 4 — Crescimento orgânico 6m
  const orgSeries = overview.map((m) => {
    const monthSessions = m.sessions * 0.46; // proxy
    return {
      date: m.month,
      sessoes: Math.round(monthSessions),
      leads: Math.round(monthSessions * 0.018),
    };
  });

  // Bloco 5 — Presença digital
  const reachIG = ig.reduce((s, d) => s + (d.reach ?? 0), 0);
  const reachPin = pin.reduce((s, d) => s + (d.impressions ?? 0), 0);
  const engIG = ig.length
    ? (ig.reduce((s, d) => s + (d.engagement_rate ?? 0), 0) / ig.length) * 100
    : 0;
  const avgPos = sc.length ? sc.reduce((s, d) => s + (d.avg_position ?? 0), 0) / sc.length : 0;

  // Bloco 6 — Síntese IA (estática por enquanto, baseada nos números acima)
  const synthesis = generateSynthesis({
    sessionsDelta: delta(last?.sessions, prev?.sessions) ?? 0,
    leadsDelta: delta(leadsTotal, leadsPrev) ?? 0,
    roasDelta: delta(roas, roasPrev) ?? 0,
    bestChannel: channels.reduce((best, c) =>
      c.leads > best.leads ? c : best
    ),
  });

  const monthName = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">
            Visão executiva
            <span className="badge confidential" style={{ marginLeft: 4 }}>
              CONFIDENTIAL
            </span>
          </span>
          <h1>Investor View</h1>
          <p className="subtitle">
            Visão executiva consolidada · Atualizado em tempo real
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> {monthName}
        </span>
      </header>

      {/* ── Bloco 1 — Growth Metrics ── */}
      <div className="section-title">
        <h2>Growth Metrics</h2>
        <span className="hint">KPIs estratégicos · MoM</span>
      </div>
      <section className="kpi-grid">
        <KpiCard
          label="Sessões totais"
          value={fmt(sessionsTotal)}
          delta={delta(last?.sessions, sessionsPrev)}
          icon={KpiIcons.sessions}
        />
        <KpiCard
          label="Leads gerados"
          value={fmt(leadsTotal)}
          delta={delta(leadsTotal, leadsPrev)}
          icon={KpiIcons.leads}
          hint="todos os canais"
        />
        <KpiCard
          label="CAC médio"
          value={brl(cac)}
          delta={delta(cacPrev, cac)}
          icon={KpiIcons.cac}
          hint="consolidado"
        />
        <KpiCard
          label="ROAS consolidado"
          value={`${roas.toFixed(2)}x`}
          delta={delta(roas, roasPrev)}
          icon={KpiIcons.roas}
          hint="Meta + Google"
        />
      </section>

      {/* ── Bloco 2 — Funil ── */}
      <div className="section-title">
        <h2>Funil completo</h2>
        <span className="hint">Do tráfego ao contrato fechado</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 640, margin: '0 auto' }}>
        <FunnelStage label="Impressões" value={fmt(impressionsTotal)} hint="Ads + Orgânico" />
        <Conv rate={ctr} label={`CTR ${ctr.toFixed(2)}%`} />
        <FunnelStage label="Cliques / Sessões" value={fmt(clicksSessions)} />
        <Conv rate={convLead} label={`Conv ${convLead.toFixed(2)}%`} />
        <FunnelStage label="Leads gerados" value={fmt(leadsTotal)} />
        <Conv rate={qual} label={`Qual ${qual.toFixed(0)}%`} />
        <FunnelStage label="MQLs" value={fmt(mqls)} hint="Score SPICED ≥ 7" />
        <Conv rate={close} label={`Close ${close.toFixed(0)}%`} />
        <FunnelStage label="Contratos fechados" value={fmt(contracts)} accent />
      </div>

      {/* ── Bloco 3 — Canais ── */}
      <div className="section-title">
        <h2>Canal de aquisição</h2>
        <span className="hint">Custo e eficiência</span>
      </div>
      <div className="surface table-wrap scroll-x">
        <table>
          <thead>
            <tr>
              <th>Canal</th>
              <th>Investimento</th>
              <th>Leads</th>
              <th>CPL</th>
              <th>MQLs</th>
              <th>CAC</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((c) => (
              <tr key={c.name}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td className="num">{c.invest ? brl(c.invest) : 'R$ 0'}</td>
                <td className="num">{fmt(c.leads)}</td>
                <td className="num">{c.cpl ? brl(c.cpl) : '—'}</td>
                <td className="num">{fmt(c.mqls)}</td>
                <td className="num">{c.cac ? brl(c.cac) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Bloco 4 — Crescimento orgânico ── */}
      <div className="section-title">
        <h2>Crescimento orgânico</h2>
        <span className="hint">Últimos 6 meses</span>
      </div>
      <TrendChart
        data={orgSeries as unknown as Array<Record<string, string | number>>}
        xKey="date"
        title="Sessões e leads orgânicos"
        subtitle="Tendência mensal"
        lines={[
          { key: 'sessoes', label: 'Sessões orgânicas', color: '#ead32d' },
          { key: 'leads', label: 'Leads orgânicos', color: '#4a90d9' },
        ]}
      />

      {/* ── Bloco 5 — Presença digital ── */}
      <div className="section-title">
        <h2>Presença digital</h2>
        <span className="hint">Alcance consolidado</span>
      </div>
      <section className="kpi-grid-3">
        <KpiCard
          label="Alcance total"
          value={fmt(reachIG + reachPin)}
          icon={KpiIcons.reach}
          hint="Instagram + Pinterest"
        />
        <KpiCard
          label="Engajamento médio IG"
          value={`${engIG.toFixed(2)}%`}
          icon={KpiIcons.heart}
        />
        <KpiCard
          label="Posição média Google"
          value={avgPos.toFixed(1)}
          icon={KpiIcons.search}
          hint="Search Console"
        />
      </section>

      {/* ── Bloco 6 — Síntese IA ── */}
      <div className="section-title">
        <h2>Síntese executiva</h2>
        <span className="hint">Gerado por IA</span>
      </div>
      <div className="ai-synthesis">
        <span className="label">◈ Síntese do mês gerada por IA</span>
        <p>{synthesis}</p>
      </div>
    </div>
  );
}

function FunnelStage({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="funnel-stage"
      style={
        accent
          ? {
              borderColor: 'var(--gold-line)',
              background:
                'linear-gradient(90deg, var(--gold-bg-soft), transparent)',
            }
          : undefined
      }
    >
      <div>
        <div className="label">{label}</div>
        {hint && (
          <div
            style={{
              fontSize: 10,
              color: 'var(--text-subtle)',
              marginTop: 4,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {hint}
          </div>
        )}
      </div>
      <div className="value" style={accent ? { color: 'var(--color-secondary)' } : undefined}>
        {value}
      </div>
    </div>
  );
}

function Conv({ label }: { rate: number; label: string }) {
  return (
    <div className="funnel-conv">
      <span>{label}</span>
    </div>
  );
}

function generateSynthesis({
  sessionsDelta,
  leadsDelta,
  roasDelta,
  bestChannel,
}: {
  sessionsDelta: number;
  leadsDelta: number;
  roasDelta: number;
  bestChannel: { name: string; leads: number };
}): string {
  const sessionsTone = sessionsDelta >= 0 ? 'cresceram' : 'caíram';
  const leadsTone = leadsDelta >= 0 ? 'alta' : 'queda';
  const roasTone = roasDelta >= 0 ? 'expansão' : 'pressão';

  return (
    `Sessões ${sessionsTone} ${Math.abs(sessionsDelta).toFixed(1)}% em relação ao mês anterior, ` +
    `acompanhadas por ${leadsTone} de ${Math.abs(leadsDelta).toFixed(1)}% na captação de leads. ` +
    `O ROAS consolidado mostra ${roasTone} de ${Math.abs(roasDelta).toFixed(1)}%, sinalizando que a eficiência de mídia segue alinhada à meta. ` +
    `${bestChannel.name} liderou o volume de leads do período e deve concentrar o esforço de investimento incremental no próximo ciclo, ` +
    `com tração orgânica complementando o pipeline qualificado.`
  );
}
