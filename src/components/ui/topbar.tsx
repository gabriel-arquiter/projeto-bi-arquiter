'use client';

import { usePathname } from 'next/navigation';

const labels: Record<string, string> = {
  '/': 'Dashboard',
  '/investor': 'Investor View',
  '/instagram': 'Instagram',
  '/pinterest': 'Pinterest',
  '/ga': 'Google Analytics',
  '/gsc': 'Google Search Console',
  '/meta-ads': 'Meta Ads',
  '/google-ads': 'Google Ads',
  '/pinterest-ads': 'Pinterest Ads',
  '/ai': 'Agente IA',
  '/acoes': 'Ações',
  '/acoes': 'AÃ§Ãµes',
  '/financeiro/dre': 'DRE',
  '/financeiro/cash-flow': 'Cash Flow',
  '/financeiro/forecast': 'Forecast Financeiro',
  '/crm/funis': 'Funis',
  '/crm/segmentacao': 'Segmentação de Base',
  '/crm/atribuicao': 'Atribuição',
  '/projecoes': 'ProjeÃÂ§ÃÂµes',
  '/financeiro/dre': 'DRE',
  '/financeiro/cash-flow': 'Cash Flow',
  '/financeiro/forecast': 'Forecast Financeiro',
  '/crm/funis': 'Funis',
  '/crm/segmentacao': 'SegmentaÃ§Ã£o de Base',
  '/crm/atribuicao': 'AtribuiÃ§Ã£o',
};

export function Topbar() {
  const pathname = usePathname();
  const current = labels[pathname] ?? 'Arquiter';

  return (
    <div className="topbar">
      <div className="crumb">
        Arquiter <span style={{ color: 'var(--text-subtle)', margin: '0 8px' }}>/</span>
        <strong>{current}</strong>
      </div>
      <div className="status-indicator">
        <span className="pulse" />
        Sistema operacional
      </div>
    </div>
  );
}
