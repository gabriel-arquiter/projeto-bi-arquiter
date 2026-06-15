'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { PeriodSelector } from '@/components/ui/period-selector';

const labels: Record<string, string> = {
  '/': 'Dashboard',
  '/investor': 'Investor View',
  '/instagram': 'Instagram',
  '/pinterest': 'Pinterest',
  '/ga': 'Google Analytics',
  '/gsc': 'Google Search Console',
  '/meta-ads': 'Meta Ads',
  '/google-ads': 'Google Ads',
  '/ai': 'Agente IA',
  '/acoes': 'Ações',
  '/projecoes': 'Projeções',
  '/financeiro/dre': 'DRE',
  '/financeiro/cash-flow': 'Cash Flow',
  '/financeiro/forecast': 'Forecast Financeiro',
  '/crm/funis': 'Funis',
  '/crm/segmentacao': 'Segmentação de Base',
  '/crm/atribuicao': 'Atribuição',
};

// Rotas onde o seletor de período aparece. As diárias filtram por intervalo de
// dias; as de Financeiro recortam por mês dentro do intervalo; as de CRM são
// snapshots (o seletor aparece por consistência, mas os números não mudam).
const PERIOD_ROUTES = new Set([
  '/',
  '/investor',
  '/instagram',
  '/pinterest',
  '/ga',
  '/gsc',
  '/meta-ads',
  '/google-ads',
  '/financeiro/dre',
  '/financeiro/cash-flow',
  '/financeiro/forecast',
  '/crm/funis',
  '/crm/segmentacao',
  '/crm/atribuicao',
]);

export function Topbar() {
  const pathname = usePathname();
  const current = labels[pathname] ?? 'Arquiter';
  const showPeriod = PERIOD_ROUTES.has(pathname);

  return (
    <div className="topbar">
      <div className="crumb">
        Arquiter <span style={{ color: 'var(--text-subtle)', margin: '0 8px' }}>/</span>
        <strong>{current}</strong>
      </div>
      <div className="topbar-right">
        {showPeriod && (
          <Suspense fallback={null}>
            <PeriodSelector />
          </Suspense>
        )}
        <div className="status-indicator">
          <span className="pulse" />
          Sistema operacional
        </div>
      </div>
    </div>
  );
}
