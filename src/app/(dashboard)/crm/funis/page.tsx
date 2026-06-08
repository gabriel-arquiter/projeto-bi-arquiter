import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { getCrmPipelines, getLossReasons } from '@/lib/queries';
import type { PipelineStage } from '@/types/database';

export const dynamic = 'force-dynamic';

const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));

const WON_STAGE = 'Ganho';

function byPipeline(rows: PipelineStage[]) {
  const map = new Map<string, PipelineStage[]>();
  for (const r of rows) {
    const arr = map.get(r.pipeline) ?? [];
    arr.push(r);
    map.set(r.pipeline, arr);
  }
  for (const arr of map.values()) arr.sort((a, b) => a.ordem - b.ordem);
  return map;
}

export default async function FunisPage() {
  const [pipelines, losses] = await Promise.all([
    getCrmPipelines().catch(() => []),
    getLossReasons().catch(() => []),
  ]);

  const grouped = byPipeline(pipelines);

  // KPIs consolidados
  const topo = pipelines.filter((s) => s.ordem === 0).reduce((s, r) => s + r.oportunidades, 0);
  const ganhos = pipelines
    .filter((s) => s.stage === WON_STAGE)
    .reduce((s, r) => s + r.oportunidades, 0);
  const pipelineAberto = pipelines
    .filter((s) => s.stage !== WON_STAGE)
    .reduce((s, r) => s + r.valor, 0);
  const valorGanho = pipelines
    .filter((s) => s.stage === WON_STAGE)
    .reduce((s, r) => s + r.valor, 0);
  const winRate = topo ? (ganhos / topo) * 100 : 0;
  const ticketMedio = ganhos ? valorGanho / ganhos : 0;
  const totalPerdas = losses.reduce((s, l) => s + l.quantidade, 0);

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">CRM · Funnels</span>
          <h1>Funis de venda</h1>
          <p className="subtitle">
            As 4 pipelines estruturadas no Funnels — Inbound, Outbound, Recontratação e
            Nutrição — por estágio, com win rate e motivos de perda.
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> Pipeline ao vivo
        </span>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Oportunidades no topo"
          value={fmt(topo)}
          icon={KpiIcons.leads}
          hint="entradas nas 4 pipelines"
        />
        <KpiCard
          label="Pipeline em aberto"
          value={brl(pipelineAberto)}
          icon={KpiIcons.money}
          hint="valor não fechado"
        />
        <KpiCard
          label="Win rate"
          value={`${winRate.toFixed(1)}%`}
          icon={KpiIcons.roas}
          hint="ganho / topo"
        />
        <KpiCard
          label="Ticket médio"
          value={brl(ticketMedio)}
          icon={KpiIcons.cac}
          hint="por contrato ganho"
        />
      </section>

      <div className="section-title">
        <h2>Pipelines por estágio</h2>
        <span className="hint">Volume e valor em cada etapa</span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 14,
        }}
      >
        {[...grouped.entries()].map(([pipeline, stages]) => {
          const topoStage = stages[0]?.oportunidades ?? 1;
          const won = stages.find((s) => s.stage === WON_STAGE);
          const pwr = topoStage ? ((won?.oportunidades ?? 0) / topoStage) * 100 : 0;
          return (
            <div key={pipeline} className="surface" style={{ padding: '18px 20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                  {pipeline}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-secondary)',
                  }}
                >
                  win {pwr.toFixed(1)}%
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stages.map((s) => {
                  const w = topoStage ? Math.max(4, (s.oportunidades / topoStage) * 100) : 0;
                  const isWon = s.stage === WON_STAGE;
                  return (
                    <div key={s.stage}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 11.5,
                          marginBottom: 4,
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span style={{ color: isWon ? 'var(--color-secondary)' : undefined }}>
                          {s.stage}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text)',
                          }}
                        >
                          {fmt(s.oportunidades)} · {brl(s.valor)}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 3,
                          background: 'var(--surface-2)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${w}%`,
                            height: '100%',
                            borderRadius: 3,
                            background: isWon
                              ? 'var(--color-secondary)'
                              : 'rgba(234,211,45,0.35)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="section-title">
        <h2>Motivos de perda</h2>
        <span className="hint">{fmt(totalPerdas)} deals perdidos · campo do Funnels</span>
      </div>
      <div className="surface table-wrap scroll-x">
        <table>
          <thead>
            <tr>
              <th>Motivo principal</th>
              <th style={{ textAlign: 'right' }}>Deals</th>
              <th style={{ textAlign: 'right' }}>% do total</th>
              <th style={{ textAlign: 'right' }}>Valor perdido</th>
            </tr>
          </thead>
          <tbody>
            {losses.map((l) => (
              <tr key={l.motivo}>
                <td style={{ fontWeight: 600 }}>{l.motivo}</td>
                <td className="num" style={{ textAlign: 'right' }}>
                  {fmt(l.quantidade)}
                </td>
                <td className="num" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                  {totalPerdas ? ((l.quantidade / totalPerdas) * 100).toFixed(1) : '0.0'}%
                </td>
                <td className="num" style={{ textAlign: 'right', color: 'var(--negative)' }}>
                  {brl(l.valor_perdido)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pipelines.length === 0 && (
        <p className="empty-state" style={{ marginTop: 18 }}>
          Sem dados de pipeline ainda. Assim que os webhooks do Funnels populam
          fct_oportunidades, os funis aparecem automaticamente.
        </p>
      )}
    </div>
  );
}