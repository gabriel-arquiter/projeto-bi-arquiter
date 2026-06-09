import { KpiCard } from '@/components/ui/kpi-card';
import { KpiIcons } from '@/components/ui/kpi-icons';
import { TrendChart } from '@/components/charts/trend-chart';
import { getProjections } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n));
const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);

export default async function ProjecoesPage() {
  const points = await getProjections().catch(() => []);
  const previsto = points.filter((p) => p.tipo === 'previsto');

  // Janelas de 30/60/90 dias ≈ 4/8/12 semanas projetadas.
  const sum = (arr: typeof previsto, key: 'leads' | 'sessoes' | 'investimento') =>
    arr.reduce((s, p) => s + (p[key] ?? 0), 0);
  const leads30 = sum(previsto.slice(0, 4), 'leads');
  const leads60 = sum(previsto.slice(0, 8), 'leads');
  const leads90 = sum(previsto.slice(0, 12), 'leads');
  const invest90 = sum(previsto.slice(0, 12), 'investimento');
  const cac90 = leads90 ? invest90 / leads90 : 0;

  const leadsSeries = points.map((p) => ({
    periodo: p.periodo,
    leads: p.leads,
    banda_inf: p.leads_low ?? p.leads,
    banda_sup: p.leads_high ?? p.leads,
  }));
  const trafSeries = points.map((p) => ({
    periodo: p.periodo,
    sessoes: p.sessoes,
    investimento: p.investimento,
  }));

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Inteligência · Forecast</span>
          <h1>Projeções</h1>
          <p className="subtitle">
            Modelos preditivos de leads, tráfego e investimento — projeção de 30/60/90
            dias a partir das séries históricas, com banda de confiança.
          </p>
        </div>
        <span className="badge gold">BASELINE</span>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Leads · 30 dias"
          value={fmt(leads30)}
          icon={KpiIcons.leads}
          hint="próximas 4 semanas"
        />
        <KpiCard
          label="Leads · 60 dias"
          value={fmt(leads60)}
          icon={KpiIcons.leads}
          hint="próximas 8 semanas"
        />
        <KpiCard
          label="Leads · 90 dias"
          value={fmt(leads90)}
          icon={KpiIcons.leads}
          hint="próximas 12 semanas"
        />
        <KpiCard
          label="CAC projetado · 90d"
          value={brl(cac90)}
          icon={KpiIcons.cac}
          hint="investimento / leads"
        />
      </section>

      <div className="section-title">
        <h2>Projeção de leads</h2>
        <span className="hint">Real + previsto com banda de confiança</span>
      </div>
      <TrendChart
        data={leadsSeries}
        xKey="periodo"
        title="Leads por semana"
        subtitle="Banda = intervalo de previsão"
        lines={[
          { key: 'banda_sup', label: 'Banda superior', color: 'rgba(234,211,45,0.2)' },
          { key: 'leads', label: 'Leads', color: '#ead32d' },
          { key: 'banda_inf', label: 'Banda inferior', color: 'rgba(234,211,45,0.2)' },
        ]}
      />

      <div className="section-title">
        <h2>Tráfego e investimento</h2>
        <span className="hint">Sessões projetadas × spend</span>
      </div>
      <TrendChart
        data={trafSeries}
        xKey="periodo"
        title="Sessões e investimento"
        subtitle="Projeção semanal"
        lines={[
          { key: 'sessoes', label: 'Sessões', color: '#4a90d9' },
          { key: 'investimento', label: 'Investimento (R$)', color: '#00d97e' },
        ]}
      />

      <div className="ai-synthesis" style={{ marginTop: 24 }}>
        <span className="label">◈ Nota de credibilidade</span>
        <p>
          As projeções combinam baseline (ETS/SARIMA para tendência e sazonalidade) com
          drivers (verba, nº de artigos). A saída é sempre um <strong>intervalo</strong>,
          nunca um ponto único — e com pouco histórico a banda é larga por princípio,
          estreitando conforme o dado acumula. Os números aqui são fictícios, para
          ilustrar a visualização até o job de forecast popular mart.forecast.
        </p>
      </div>
    </div>
  );
}
