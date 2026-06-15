'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PRESETS, formatRangeLabel, todayISO } from '@/lib/period';

// Seletor de período global (vive na topbar). Escreve o estado na URL
// (?period=15 ou ?period=custom&from=...&to=...&compare=1); como as páginas
// são server components com `dynamic = 'force-dynamic'`, elas re-renderizam
// com os dados do novo período a cada navegação.
export function PeriodSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const period = searchParams.get('period') ?? '30';
  const compare = searchParams.get('compare') === '1';
  const fromParam = searchParams.get('from') ?? '';
  const toParam = searchParams.get('to') ?? '';
  const today = todayISO();

  const [customFrom, setCustomFrom] = useState(fromParam);
  const [customTo, setCustomTo] = useState(toParam);

  // Mantém os inputs em sincronia se a URL mudar por fora.
  useEffect(() => {
    setCustomFrom(fromParam);
    setCustomTo(toParam);
  }, [fromParam, toParam]);

  // Fecha o painel ao clicar fora.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  function pushParams(mutate: (p: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function selectPreset(days: number) {
    pushParams((p) => {
      p.set('period', String(days));
      p.delete('from');
      p.delete('to');
    });
    setOpen(false);
  }

  const customInvalid = !customFrom || !customTo || customFrom > customTo;

  function applyCustom() {
    if (customInvalid) return;
    pushParams((p) => {
      p.set('period', 'custom');
      p.set('from', customFrom);
      p.set('to', customTo);
    });
    setOpen(false);
  }

  function toggleCompare() {
    pushParams((p) => {
      if (compare) p.delete('compare');
      else p.set('compare', '1');
    });
  }

  const label =
    period === 'custom' && fromParam && toParam
      ? formatRangeLabel({ from: fromParam, to: toParam })
      : `Últimos ${period} dias`;

  return (
    <div className="period-selector" ref={ref}>
      <button
        type="button"
        className="period-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="dot" />
        <span className="period-trigger-label">{label}</span>
        {compare && <span className="cmp-tag">vs ant.</span>}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="period-caret">
          <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>

      {open && (
        <div className="period-panel" role="dialog" aria-label="Selecionar período">
          <div className="period-presets">
            {PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                className={`period-preset ${period === String(d) ? 'active' : ''}`}
                onClick={() => selectPreset(d)}
              >
                {d} dias
              </button>
            ))}
          </div>

          <div className="period-custom">
            <span className="period-custom-label">Período personalizado</span>
            <div className="period-dates">
              <input
                type="date"
                value={customFrom}
                max={customTo || today}
                onChange={(e) => setCustomFrom(e.target.value)}
                aria-label="Data inicial"
              />
              <span className="period-arrow">→</span>
              <input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                max={today}
                onChange={(e) => setCustomTo(e.target.value)}
                aria-label="Data final"
              />
            </div>
            <button
              type="button"
              className="period-apply"
              onClick={applyCustom}
              disabled={customInvalid}
            >
              Aplicar
            </button>
          </div>

          <label className="period-compare">
            <input type="checkbox" checked={compare} onChange={toggleCompare} />
            <span>Comparar com período anterior</span>
          </label>
        </div>
      )}
    </div>
  );
}
