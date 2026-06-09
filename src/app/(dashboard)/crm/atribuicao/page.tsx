import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { getAttribution } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));

export default async function AtribuicaoPage() {
  const channels = await getAttribution().catch(() => []);

  const sorted = [...channels].sort((a, b) => b.receita_atribuida - a.receita_atribuida);
  const totalReceita = channels.reduce((s, c) => s + c.receita_atribuida, 0);
  const totalFirst = channels.reduce((s, c) => s + c.first_touch, 0);
  const totalLast = channels.reduce((s, c) => s + c.last_touch, 0);
  const totalAssist = channels.reduce((s, c) => s + c.assist, 0);
  const lider = sorted[0];

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">CRM · Atribuição multi-touch</span>
          <h1>Atribuição</h1>
          <p className="subtitle">
            Como cada canal participa da jornada — primeiro toque, fechamento e apoio —
            reaproveitando o modelo de UTM já estruturado nas Oportunidades.
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> fct_atribuicao
        </span>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Receita atribuída"
          value={brl(totalReceita)}
          icon={KpiIcons.money}
          hint="modelo last-touch"
        />
        <KpiCard
          label="Toques de origem"
          value={fmt(totalFirst)}
          icon={KpiIcons.reach}
          hint="first-touch"
        />
        <KpiCard
          label="Toques de fechamento"
          value={fmt(totalLast)}
          icon={KpiIcons.roas}
          hint="last-touch"
        />
        <KpiCard
          label="Canal líder"
          value={lider?.canal ?? '—'}
          icon={KpiIcons.leads}
          hint={lider ? brl(lider.receita_atribuida) : '—'}
        />
      </section>

      <div className="section-title">
        <h2>Atribuição por canal</h2>
        <span className="hint">First · last · assist · UTM</span>
      </div>
      <div className="surface table-wrap scroll-x">
        <table>
          <thead>
            <tr>
              <th>Canal</th>
              <th>UTM source / medium</th>
              <th style={{ textAlign: 'right' }}>First</th>
              <th style={{ textAlign: 'right' }}>Last</th>
              <th style={{ textAlign: 'right' }}>Assist</th>
              <th style={{ textAlign: 'right' }}>Receita atribuída</th>
              <th style={{ textAlign: 'right' }}>% receita</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr key={c.canal}>
                <td style={{ fontWeight: 600 }}>{c.canal}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                  {c.utm_source} / {c.utm_medium}
                </td>
                <td className="num" style={{ textAlign: 'right' }}>{fmt(c.first_touch)}</td>
                <td className="num" style={{ textAlign: 'right' }}>{fmt(c.last_touch)}</td>
                <td className="num" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                  {fmt(c.assist)}
                </td>
                <td className="num" style={{ textAlign: 'right', fontWeight: 600 }}>
                  {brl(c.receita_atribuida)}
                </td>
                <td
                  className="num"
                  style={{ textAlign: 'right', color: 'var(--color-secondary)' }}
                >
                  {totalReceita ? ((c.receita_atribuida / totalReceita) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-title">
        <h2>Peso por tipo de toque</h2>
        <span className="hint">Participação first · last · assist</span>
      </div>
      <div className="surface" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map((c) => {
            const total = c.first_touch + c.last_touch + c.assist || 1;
            const segs = [
              { v: c.first_touch, color: '#4a90d9', label: 'First' },
              { v: c.last_touch, color: '#ead32d', label: 'Last' },
              { v: c.assist, color: 'rgba(255,255,255,0.22)', label: 'Assist' },
            ];
            return (
              <div key={c.canal}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    marginBottom: 5,
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{c.canal}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{fmt(total)} toques</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    height: 8,
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: 'var(--surface-2)',
                  }}
                >
                  {segs.map((s) => (
                    <div
                      key={s.label}
                      style={{ width: `${(s.v / total) * 100}%`, background: s.color }}
                      title={`${s.label}: ${fmt(s.v)}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 16 }}>
          {[
            { color: '#4a90d9', label: `First-touch (${fmt(totalFirst)})` },
            { color: '#ead32d', label: `Last-touch (${fmt(totalLast)})` },
            { color: 'rgba(255,255,255,0.22)', label: `Assist (${fmt(totalAssist)})` },
          ].map((l) => (
            <span key={l.label} className="legend-pill">
              <span className="swatch" style={{ background: l.color, height: 8, width: 8, borderRadius: 2 }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="ai-synthesis" style={{ marginTop: 24 }}>
        <span className="label">◈ Nota de método</span>
        <p>
          Atribuição multi-touch (MTA) dá o detalhe da jornada a nível de usuário, mas
          carrega viés de last-click e não captura marca/offline. Conforme o histórico
          cresce, ela é complementada pelo MMM (foto macro e alocação de budget) e por
          testes de incrementalidade — as três camadas se calibram entre si.
        </p>
      </div>

      {channels.length === 0 && (
        <p className="empty-state" style={{ marginTop: 18 }}>
          Sem dados de atribuição ainda. Assim que fct_atribuicao for modelada a partir
          dos UTMs e click IDs das Oportunidades, o painel aparece automaticamente.
        </p>
      )}
    </div>
  );
}
