export const dynamic = 'force-dynamic';

export default function ProjecoesPage() {
  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Inteligência</span>
          <h1>Projeções</h1>
          <p className="subtitle">
            Modelos preditivos de tráfego, leads e ROAS — em construção.
          </p>
        </div>
        <span className="badge gold">BETA</span>
      </header>

      <div className="empty-state" style={{ marginTop: 24 }}>
        Em breve: projeções de 30/60/90 dias para sessões, leads e investimento,
        baseadas nos dados reais consolidados no Supabase.
      </div>
    </div>
  );
}
