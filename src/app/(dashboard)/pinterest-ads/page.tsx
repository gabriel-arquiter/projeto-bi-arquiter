export const dynamic = 'force-dynamic';

export default function PinterestAdsPage() {
  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Mídia paga</span>
          <h1>Pinterest Ads</h1>
          <p className="subtitle">
            Conta de mídia paga no Pinterest — em fase de integração.
          </p>
        </div>
        <span className="badge">EM BREVE</span>
      </header>

      <div className="empty-state" style={{ marginTop: 24 }}>
        Aguardando conexão da conta de Pinterest Ads. Assim que o pipeline estiver
        ativo, as métricas (impressões, CPM, CPL e ROAS) aparecem aqui automaticamente.
      </div>
    </div>
  );
}
