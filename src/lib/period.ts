// Lógica de resolução de período para as páginas de série diária.
// Server-safe (sem React) — usada tanto nas queries (lib/queries.ts) quanto no
// seletor de período (components/ui/period-selector.tsx). O estado do período
// viaja por URL search params: ?period=15 ou ?period=custom&from=...&to=...&compare=1.

export type DateRange = { from: string; to: string }; // ISO 'YYYY-MM-DD'

export type PeriodPreset = '7' | '15' | '30' | '90' | 'custom';

export interface Period {
  preset: PeriodPreset;
  range: DateRange;
  days: number;
  compare: boolean;
  prevRange: DateRange;
  label: string;
}

// Props padrão de searchParams de um Server Component no App Router.
export type PageSearchParams = Record<string, string | string[] | undefined>;

export const PRESETS = [7, 15, 30, 90] as const;
export const DEFAULT_DAYS = 30;

// Rotas onde o seletor de período aparece (na topbar desktop e na topbar mobile).
// Diárias filtram por dias; Financeiro recorta por mês; CRM são snapshots
// (seletor aparece por consistência, sem alterar os números).
export const PERIOD_ROUTES: ReadonlySet<string> = new Set([
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

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Quantidade de dias (inclusiva) entre from e to.
export function daysBetween(range: DateRange): number {
  const a = new Date(`${range.from}T00:00:00Z`).getTime();
  const b = new Date(`${range.to}T00:00:00Z`).getTime();
  return Math.floor((b - a) / 86_400_000) + 1;
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
function isValidISO(s: string | undefined): s is string {
  if (!s || !ISO_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function rangeForDays(days: number): DateRange {
  const to = todayISO();
  const from = addDays(to, -(days - 1));
  return { from, to };
}

export function defaultRange(): DateRange {
  return rangeForDays(DEFAULT_DAYS);
}

// Período imediatamente anterior, com o mesmo número de dias.
export function previousRange(range: DateRange): DateRange {
  const len = daysBetween(range);
  const prevTo = addDays(range.from, -1);
  const prevFrom = addDays(prevTo, -(len - 1));
  return { from: prevFrom, to: prevTo };
}

const dmy = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export function formatRangeLabel(range: DateRange): string {
  return `${dmy(range.from)} – ${dmy(range.to)}`;
}

// ── Helpers mensais (usados pelas páginas de Financeiro, que são mensais) ──

export function monthStart(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

function shiftMonth(monthStartIso: string, n: number): string {
  const d = new Date(`${monthStartIso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
}

// Meses (YYYY-MM-01) que se sobrepõem ao intervalo, em ordem crescente.
export function monthsInRange(range: DateRange): string[] {
  const out: string[] = [];
  let cur = monthStart(range.from);
  const end = monthStart(range.to);
  while (cur <= end) {
    out.push(cur);
    cur = shiftMonth(cur, 1);
  }
  return out;
}

// Janela fixa dos últimos N meses (para visões que não dependem do seletor).
export function lastMonthsRange(n: number): DateRange {
  const to = todayISO();
  const from = shiftMonth(monthStart(to), -(n - 1));
  return { from, to };
}

const one = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

const isPreset = (n: number): boolean => (PRESETS as readonly number[]).includes(n);

// Lê os search params e devolve o período resolvido. Entradas inválidas caem no
// padrão de 30 dias, de forma que a página nunca quebra por um param malformado.
export function resolvePeriod(searchParams: PageSearchParams = {}): Period {
  const rawPeriod = one(searchParams.period);
  const compare = one(searchParams.compare) === '1';
  const fromParam = one(searchParams.from);
  const toParam = one(searchParams.to);

  let preset: PeriodPreset;
  let range: DateRange;

  if (rawPeriod === 'custom' || (fromParam && toParam)) {
    if (isValidISO(fromParam) && isValidISO(toParam) && fromParam <= toParam) {
      preset = 'custom';
      range = { from: fromParam, to: toParam };
    } else {
      preset = '30';
      range = defaultRange();
    }
  } else if (rawPeriod && isPreset(Number(rawPeriod))) {
    preset = rawPeriod as PeriodPreset;
    range = rangeForDays(Number(rawPeriod));
  } else {
    preset = '30';
    range = defaultRange();
  }

  const days = daysBetween(range);
  const label = preset === 'custom' ? formatRangeLabel(range) : `Últimos ${days} dias`;

  return { preset, range, days, compare, prevRange: previousRange(range), label };
}
