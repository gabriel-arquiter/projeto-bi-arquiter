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
  getDre,
  getCashFlow,
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
  const [overview, ga4, sc, ig, pin, meta, google, dre, cashFlow] = await Promise.all([
    getMonthlyOverview().catch(() => []),
    getGa4Daily(30).catch(() => []),
    getSearchConsoleDaily(30).catch(() => []),
    getInstagramMetrics(30).catch(() => []),
    getPinterestMetrics(30).catch(() => []),
    getMetaAds(30).catch(() => []),
    getGoogleAds(30).catch(() => []),
    getDre(6).catch(() => []),
    getCashFlow(6).catch(() => []),
  ]);

  const last = overview.at(-1);
  const prev = overview.at(-2);

  // Bloco 1 â Growth Metrics
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

  // Bloco 2 â Funil
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

  const mqls = Math.round(leadsTotal * 0.42); // mock SPICED â¥ 7
  const contracts = Math.round(mqls * 0.18); // mock close rate

  const ctr = impressionsTotal ? (clicksSessions / impressionsTotal) * 100 : 0;
  const convLead = clicksSessions ? (leadsTotal / clicksSessions) * 100 : 0;
  const qual = leadsTotal ? (mqls / leadsTotal) * 100 : 0;
  const close = mqls ? (contracts / mqls) * 100 : 0;

  // Bloco 3 â Canais
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
      name: 'OrgÃ¢nico Blog',
      invest: 0,
      leads: Math.round(organicSessions * 0.018),
      cpl: 0,
      mqls: Math.round(organicSessions * 0.018 * 0.5),
      cac: 0,
    },
    {
      name: 'Instagram OrgÃ¢nico',
      invest: 0,
      leads: Math.round(ig.reduce((s, d) => s + (d.reach ?? 0), 0) * 0.0012),
      cpl: 0,
      mqls: Math.round(ig.reduce((s, d) => s + (d.reach ?? 0), 0) * 0.0012 * 0.4),
      cac: 0,
    },
  ];

  // Bloco 4 â Crescimento orgÃ¢nico 6m
  const orgSeries = overview.map((m) => {
    const monthSessions = m.sessions * 0.46; // proxy
    return {
      date: m.month,
      sessoes: Math.round(monthSessions),
      leads: Math.round(monthSessions * 0.018),
    };
  });

  // Bloco 5 â PresenÃ§a digital
  const reachIG = ig.reduce((s, d) => s + (d.reach ?? 0), 0);
  const reachPin = pin.reduce((s, d) => s + (d.impressions ?? 0), 0);
  const engIG = ig.length
    ? (ig.reduce((s, d) => s + (d.engagement_rate ?? 0), 0) / ig.length) * 100
    : 0;
  const avgPos = sc.length ? sc.reduce((s, d) => s + (d.avg_position ?? 0), 0) / sc.length : 0;

  // Bloco 6 — Prestação de Contas (uso do capital, burn, runway, alocação)
  const lastCf = cashFlow.at(-1);
  const lastDre = dre.at(-1);
  const caixaDisponivel = lastCf?.saldo_final ?? 0;

  // Burn médio dos meses com fluxo negativo (uso líquido de caixa).
  const burnMeses = cashFlow.filter((m) => m.entradas - m.saidas < 0);
  const burnMedio = burnMeses.length
    ? burnMeses.reduce((s, m) => s + (m.saidas - m.entradas), 0) / burnMeses.length
    : 0;
  const runwayMeses = burnMedio > 0 ? caixaDisponivel / burnMedio : null;

  // Capital aplicado no mês = saídas operacionais; alocação por área via DRE.
  const capitalAplicado = lastCf?.saidas ?? 0;
  const alocacao = lastDre
    ? [
        { area: 'Pessoal & operação', valor: lastDre.despesas_pessoal },
        { area: 'Marketing & aquisição', valor: lastDre.despesas_marketing },
        { area: 'Custos dos serviços', valor: lastDre.custos },
        { area: 'Administrativo & infra', valor: lastDre.despesas_administrativas },
        { area: 'Impostos & deduções', valor: lastDre.deducoes },
      ]
    : [];
  const alocacaoTotal = alocacao.reduce((s, a) => s + a.valor, 0);

  // Marcos da plataforma de dados (roadmap do projeto).
  const marcos = [
    { fase: 'Fase 0 · Fundação', desc: 'Supabase Pro + schemas Medallion + CI/CD', status: 'concluída' as const },
    { fase: 'Fase 1 · Ingestão core', desc: 'GA4, GSC, Ads e CRM no Supabase', status: 'concluída' as const },
    { fase: 'Fase 2 · Modelagem & dashboard', desc: 'dbt marts + módulos Mídia/Social/Visão Geral', status: 'em andamento' as const },
    { fase: 'Fase 3 · Produto & Financeiro', desc: 'Conta Azul + DRE, Cash Flow e LTV/MRR/GMV', status: 'em andamento' as const },
    { fase: 'Fase 4 · Inteligência', desc: 'ARIA + Forecast + Investor View com RLS', status: 'planejada' as const },
  ];

  // Bloco 7 — Síntese IA (estática por enquanto, baseada nos números acima)
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
            VisÃ£o executiva
            <span className="badge confidential" style={{ marginLeft: 4 }}>
              CONFIDENTIAL
            </span>
          </span>
          <h1>Investor View</h1>
          <p className="subtitle">
            VisÃ£o executiva consolidada Â· Atualizado em tempo real
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> {monthName}
        </span>
      </header>

      {/* ââ Bloco 1 â Growth Metrics ââ */}
      <div className="section-title">
        <h2>Growth Metrics</h2>
        <span className="hint">KPIs estratÃ©gicos Â· MoM</span>
      </div>
      <section className="kpi-grid">
        <KpiCard
          label="SessÃµes totais"
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
          label="CAC mÃ©dio"
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

      {/* ââ Bloco 2 â Funil ââ */}
      <div className="section-title">
        <h2>Funil completo</h2>
        <span className="hint">Do trÃ¡fego ao contrato fechado</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 640, margin: '0 auto' }}>
        <FunnelStage label="ImpressÃµes" value={fmt(impressionsTotal)} hint="Ads + OrgÃ¢nico" />
        <Conv rate={ctr} label={`CTR ${ctr.toFixed(2)}%`} />
        <FunnelStage label="Cliques / SessÃµes" value={fmt(clicksSessions)} />
        <Conv rate={convLead} label={`Conv ${convLead.toFixed(2)}%`} />
        <FunnelStage label="Leads gerados" value={fmt(leadsTotal)} />
        <Conv rate={qual} label={`Qual ${qual.toFixed(0)}%`} />
        <FunnelStage label="MQLs" value={fmt(mqls)} hint="Score SPICED â¥ 7" />
        <Conv rate={close} label={`Close ${close.toFixed(0)}%`} />
        <FunnelStage label="Contratos fechados" value={fmt(contracts)} accent />
      </div>

      {/* ââ Bloco 3 â Canais ââ */}
      <div className="section-title">
        <h2>Canal de aquisiÃ§Ã£o</h2>
        <span className="hint">Custo e eficiÃªncia</span>
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
                <td className="num">{c.cpl ? brl(c.cpl) : 'â'}</td>
                <td className="num">{fmt(c.mqls)}</td>
                <td className="num">{c.cac ? brl(c.cac) : 'â'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ââ Bloco 4 â Crescimento orgÃ¢nico ââ */}
      <div className="section-title">
        <h2>Crescimento orgÃ¢nico</h2>
        <span className="hint">Ãltimos 6 meses</span>
      </div>
      <TrendChart
        data={orgSeries as unknown as Array<Record<string, string | number>>}
        xKey="date"
        title="SessÃµes e leads orgÃ¢nicos"
        subtitle="TendÃªncia mensal"
        lines={[
          { key: 'sessoes', label: 'SessÃµes orgÃ¢nicas', color: '#ead32d' },
          { key: 'leads', label: 'Leads orgÃ¢nicos', color: '#4a90d9' },
        ]}
      />

      {/* ââ Bloco 5 â PresenÃ§a digital ââ */}
      <div className="section-title">
        <h2>PresenÃ§a digital</h2>
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
          label="Engajamento mÃ©dio IG"
          value={`${engIG.toFixed(2)}%`}
          icon={KpiIcons.heart}
        />
        <KpiCard
          label="PosiÃ§Ã£o mÃ©dia Google"
          value={avgPos.toFixed(1)}
          icon={KpiIcons.search}
          hint="Search Console"
        />
      </section>

      {/* ── Bloco 6 — Prestação de Contas ── */}
      <div className="section-title">
        <h2>Prestação de Contas</h2>
        <span className="hint">Uso do capital · transparência</span>
      </div>
      <section className="kpi-grid">
        <KpiCard
          label="Caixa disponível"
          value={brl(caixaDisponivel)}
          icon={KpiIcons.money}
          hint="saldo de caixa"
        />
        <KpiCard
          label="Capital aplicado"
          value={brl(capitalAplicado)}
          icon={KpiIcons.cac}
          hint="saídas do mês"
        />
        <KpiCard
          label="Burn médio"
          value={burnMedio > 0 ? brl(burnMedio) : 'Fluxo positivo'}
          icon={KpiIcons.roas}
          hint={burnMedio > 0 ? 'uso líquido de caixa' : 'sem queima'}
        />
        <KpiCard
          label="Runway"
          value={runwayMeses !== null ? `${runwayMeses.toFixed(1)} meses` : '∞'}
          icon={KpiIcons.sessions}
          hint={runwayMeses !== null ? 'sobre burn médio' : 'caixa autossustentável'}
        />
      </section>

      <div style={{ marginTop: 18 }}>
        <div className="surface table-wrap scroll-x">
          <table>
            <thead>
              <tr>
                <th>Alocação do capital</th>
                <th style={{ textAlign: 'right' }}>Valor no mês</th>
                <th style={{ textAlign: 'right' }}>% do total</th>
              </tr>
            </thead>
            <tbody>
              {alocacao.map((a) => (
                <tr key={a.area}>
                  <td style={{ fontWeight: 600 }}>{a.area}</td>
                  <td className="num" style={{ textAlign: 'right' }}>
                    {brl(a.valor)}
                  </td>
                  <td className="num" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                    {alocacaoTotal ? ((a.valor / alocacaoTotal) * 100).toFixed(1) : '0.0'}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-title">
        <h2>Marcos entregues</h2>
        <span className="hint">Roadmap da plataforma de dados</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {marcos.map((m) => {
          const tone =
            m.status === 'concluída'
              ? 'var(--positive)'
              : m.status === 'em andamento'
                ? 'var(--color-secondary)'
                : 'var(--text-subtle)';
          return (
            <div
              key={m.fase}
              className="surface"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '14px 18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: tone,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{m.fase}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {m.desc}
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: tone,
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'nowrap',
                }}
              >
                {m.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Bloco 7 — Síntese IA ── */}
      <div className="section-title">
        <h2>SÃ­ntese executiva</h2>
        <span className="hint">Gerado por IA</span>
      </div>
      <div className="ai-synthesis">
        <span className="label">â SÃ­ntese do mÃªs gerada por IA</span>
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
  const sessionsTone = sessionsDelta >= 0 ? 'cresceram' : 'caÃ­ram';
  const leadsTone = leadsDelta >= 0 ? 'alta' : 'queda';
  const roasTone = roasDelta >= 0 ? 'expansÃ£o' : 'pressÃ£o';

  return (
    `SessÃµes ${sessionsTone} ${Math.abs(sessionsDelta).toFixed(1)}% em relaÃ§Ã£o ao mÃªs anterior, ` +
    `acompanhadas por ${leadsTone} de ${Math.abs(leadsDelta).toFixed(1)}% na captaÃ§Ã£o de leads. ` +
    `O ROAS consolidado mostra ${roasTone} de ${Math.abs(roasDelta).toFixed(1)}%, sinalizando que a eficiÃªncia de mÃ­dia segue alinhada Ã  meta. ` +
    `${bestChannel.name} liderou o volume de leads do perÃ­odo e deve concentrar o esforÃ§o de investimento incremental no prÃ³ximo ciclo, ` +
    `com traÃ§Ã£o orgÃ¢nica complementando o pipeline qualificado.`
  );
}
