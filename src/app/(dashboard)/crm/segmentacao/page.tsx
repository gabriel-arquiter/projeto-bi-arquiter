import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { getCrmSegments } from '@/lib/queries';
import type { CrmSegment } from '@/types/database';

export const dynamic = 'force-dynamic';

const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));

const DIM_LABEL: Record<CrmSegment['dimensao'], { titulo: string; hint: string }> = {
  temperatura: { titulo: 'Por temperatura', hint: 'dim_pessoa · score de engajamento' },
  vertical: { titulo: 'Por vertical de negócio', hint: 'dim_conta · segmento de mercado' },
  classificacao: { titulo: 'Por estágio do funil', hint: 'lead → MQL → SQL → cliente' },
};

const SEG_COLOR: Record<string, string> = {
  Quente: '#ff4d4f',
  Morno: '#ead32d',
  Frio: '#4a90d9',
  Lead: 'rgba(255,255,255,0.3)',
  MQL: '#4a90d9',
  SQL: '#ead32d',
  Cliente: '#00d97e',
};

function group(rows: CrmSegment[], dim: CrmSegment['dimensao']) {
  return rows.filter((r) => r.dimensao === dim).sort((a, b) => b.contatos - a.contatos);
}

export default async function SegmentacaoPage() {
  const segments = await getCrmSegments().catch(() => []);

  const totalContatos = segments
    .filter((s) => s.dimensao === 'temperatura')
    .reduce((s, r) => s + r.contatos, 0);
  const quentes = segments.find((s) => s.dimensao === 'temperatura' && s.segmento === 'Quente');
  const clientes = segments.find(
    (s) => s.dimensao === 'classificacao' && s.segmento === 'Cliente',
  );
  const pipelineTotal = segments
    .filter((s) => s.dimensao === 'temperatura')
    .reduce((s, r) => s + r.valor_pipeline, 0);

  const dims: CrmSegment['dimensao'][] = ['temperatura', 'classificacao', 'vertical'];

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">CRM · Funnels</span>
          <h1>Segmentação de Base</h1>
          <p className="subtitle">
            A base de contatos fatiada por temperatura, estágio do funil e vertical de
            negócio — costurada via arquiter_id.
          </p>
        </div>
        <span className="period-chip">
          <span className="dot" /> {fmt(totalContatos)} contatos
        </span>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Base total"
          value={fmt(totalContatos)}
          icon={KpiIcons.users}
          hint="contatos únicos"
        />
        <KpiCard
          label="Leads quentes"
          value={fmt(quentes?.contatos ?? 0)}
          icon={KpiIcons.heart}
          hint={
            totalContatos
              ? `${(((quentes?.contatos ?? 0) / totalContatos) * 100).toFixed(0)}% da base`
              : '—'
          }
        />
        <KpiCard
          label="Clientes ativos"
          value={fmt(clientes?.contatos ?? 0)}
          icon={KpiIcons.roas}
          hint="classificação cliente"
        />
        <KpiCard
          label="Pipeline da base"
          value={brl(pipelineTotal)}
          icon={KpiIcons.money}
          hint="valor potencial"
        />
      </section>

      {dims.map((dim) => {
        const rows = group(segments, dim);
        const max = Math.max(1, ...rows.map((r) => r.contatos));
        const meta = DIM_LABEL[dim];
        return (
          <div key={dim}>
            <div className="section-title">
              <h2>{meta.titulo}</h2>
              <span className="hint">{meta.hint}</span>
            </div>
            <div className="surface" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rows.map((r) => {
                  const w = Math.max(3, (r.contatos / max) * 100);
                  const color = SEG_COLOR[r.segmento] ?? 'rgba(234,211,45,0.5)';
                  return (
                    <div key={r.segmento}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 12.5,
                          marginBottom: 5,
                        }}
                      >
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{r.segmento}</span>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {fmt(r.contatos)} · {brl(r.valor_pipeline)}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          borderRadius: 4,
                          background: 'var(--surface-2)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{ width: `${w}%`, height: '100%', borderRadius: 4, background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {segments.length === 0 && (
        <p className="empty-state" style={{ marginTop: 18 }}>
          Sem dados de base ainda. Assim que dim_pessoa e dim_conta forem modeladas no
          dbt, a segmentação aparece automaticamente.
        </p>
      )}
    </div>
  );
}