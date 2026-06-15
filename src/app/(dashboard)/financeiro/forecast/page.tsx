import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { TrendChart } from '@/components/charts/trend-chart';
import { getFinanceForecast } from '@/lib/queries';
import { resolvePeriod, type PageSearchParams } from '@/lib/period';

export const dynamic = 'force-dynamic';

const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);

function monthLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

export default async function FinanceForecastPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const period = resolvePeriod(searchParams);
  const fc = await getFinanceForecast(period.range).catch(() => []);
  const real = fc.filter((m) => m.tipo === 'real');
  const previsto = fc.filter((m) => m.tipo === 'previsto');

  const ultimoReal = real.at(-1);
  const proximo = previsto.at(0);
  const horizonte = previsto.at(-1);

  // Soma da receita projetada e do resultado no horizonte.
  const receitaProjetada = previsto.reduce((s, m) => s + m.receita, 0);
  const resultadoProjetado = previsto.reduce((s, m) => s + m.resultado, 0);
  const crescimentoProj =
    ultimoReal && horizonte && ultimoReal.receita
      ? ((horizonte.receita - ultimoReal.receita) / ultimoReal.receita) * 100
      : 0;

  const series = fc.map((m) => ({
    month: monthLabel(m.month),
    receita: m.receita,
    banda_inf: m.receita_low ?? m.receita,
    banda_sup: m.receita_high ?? m.receita,
    resultado: m.resultado,
  }));

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Financeiro · Inteligência</span>
          <h1>Forecast Financeiro</h1>
          <p className="subtitle">
            Projeção de receita, custos e resultado a partir das séries históricas —
            com intervalo de confiança, nunca um ponto único.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="period-chip">
            <span className="dot" /> {period.label}
          </span>
          <span className="badge gold">BASELINE</span>
        </div>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Receita projetada"
          value={brl(receitaProjetada)}
          icon={KpiIcons.money}
          hint={`próximos ${previsto.length} meses`}
        />
        <KpiCard
          label="Resultado projetado"
          value={brl(resultadoProjetado)}
          icon={KpiIcons.roas}
          hint="acumulado do horizonte"
        />
        <KpiCard
          label="Próximo mês"
          value={brl(proximo?.receita ?? 0)}
          icon={KpiIcons.leads}
          hint={
            proximo
              ? `intervalo ${brl(proximo.receita_low ?? 0)}–${brl(proximo.receita_high ?? 0)}`
              : '—'
          }
        />
        <KpiCard
          label="Crescimento projetado"
          value={`${crescimentoProj >= 0 ? '+' : ''}${crescimentoProj.toFixed(1)}%`}
          icon={KpiIcons.roas}
          hint="no horizonte"
        />
      </section>

      <div className="section-title">
        <h2>Trajetória de receita</h2>
        <span className="hint">Real + previsto com banda de confiança</span>
      </div>
      <TrendChart
        data={series}
        xKey="month"
        title="Receita projetada"
        subtitle="Em R$ · banda = intervalo de previsão"
        lines={[
          { key: 'banda_sup', label: 'Banda superior', color: 'rgba(234,211,45,0.2)' },
          { key: 'receita', label: 'Receita', color: '#ead32d' },
          { key: 'banda_inf', label: 'Banda inferior', color: 'rgba(234,211,45,0.2)' },
          { key: 'resultado', label: 'Resultado', color: '#00d97e' },
        ]}
      />

      <div className="section-title">
        <h2>Projeção mês a mês</h2>
        <span className="hint">Receita · custos · resultado</span>
      </div>
      <div className="surface table-wrap scroll-x">
        <table>
          <thead>
            <tr>
              <th>Mês</th>
              <th>Tipo</th>
              <th style={{ textAlign: 'right' }}>Receita</th>
              <th style={{ textAlign: 'right' }}>Intervalo</th>
              <th style={{ textAlign: 'right' }}>Custos</th>
              <th style={{ textAlign: 'right' }}>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {fc.map((m) => (
              <tr key={m.month}>
                <td style={{ fontWeight: 600 }}>{monthLabel(m.month)}</td>
                <td>
                  <span
                    className={`badge ${m.tipo === 'previsto' ? 'gold' : ''}`}
                    style={{ fontSize: 9 }}
                  >
                    {m.tipo === 'previsto' ? 'PREVISTO' : 'REAL'}
                  </span>
                </td>
                <td className="num" style={{ textAlign: 'right', fontWeight: 600 }}>
                  {brl(m.receita)}
                </td>
                <td
                  className="num"
                  style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}
                >
                  {m.receita_low !== undefined && m.receita_high !== undefined
                    ? `${brl(m.receita_low)} – ${brl(m.receita_high)}`
                    : '—'}
                </td>
                <td className="num" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                  {brl(m.custos)}
                </td>
                <td
                  className="num"
                  style={{
                    textAlign: 'right',
                    fontWeight: 600,
                    color: m.resultado >= 0 ? 'var(--positive)' : 'var(--negative)',
                  }}
                >
                  {brl(m.resultado)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ai-synthesis" style={{ marginTop: 24 }}>
        <span className="label">◈ Nota de credibilidade</span>
        <p>
          Com pouco histórico, os intervalos de previsão são largos por princípio — e
          estreitam conforme o dado acumula. O forecast roda em job Python agendado, lê
          o mart.mmm_input e grava em mart.forecast; o que aparece aqui é{' '}
          <strong>baseline + framework de medição</strong>, não conclusão de performance.
        </p>
      </div>

      {fc.length === 0 && (
        <p className="empty-state" style={{ marginTop: 18 }}>
          Sem projeções ainda. Assim que houver série histórica suficiente, o job de
          forecast grava em mart.forecast e o painel aparece automaticamente.
        </p>
      )}
    </div>
  );
}
