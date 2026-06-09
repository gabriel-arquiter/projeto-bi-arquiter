/* Ícones SVG do menu lateral. Sem dependência de glyphs unicode (que renderizam
   como mojibake em algumas fontes/encodings). Cada ícone usa currentColor, então
   herda a cor do link ativo/inativo da navegação. */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const NavIcons: Record<string, React.ReactNode> = {
  dashboard: (
    <svg {...base}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  investor: (
    <svg {...base}>
      <path d="M3 17l5-5 4 3 5-7 4 4" />
      <path d="M16 5h5v5" />
    </svg>
  ),
  instagram: (
    <svg {...base}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  ),
  pinterest: (
    <svg {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 20l2-7" />
      <path d="M9 11.5a3 3 0 116 0c0 2-1.2 3.5-2.8 3.5-1 0-1.7-.6-1.7-1.5" />
    </svg>
  ),
  ga: (
    <svg {...base}>
      <path d="M4 20V8" />
      <path d="M10 20V4" />
      <path d="M16 20v-8" />
      <path d="M3 20h18" />
    </svg>
  ),
  gsc: (
    <svg {...base}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.5-4.5" />
    </svg>
  ),
  metaAds: (
    <svg {...base}>
      <path d="M3 11v3l13 5V6L3 11z" />
      <path d="M16 8c3 0 3 8 0 8" />
      <path d="M6 14v3a2 2 0 003.5 1.3" />
    </svg>
  ),
  googleAds: (
    <svg {...base}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </svg>
  ),
  pinterestAds: (
    <svg {...base}>
      <path d="M12 21s-6-4.5-6-9a6 6 0 0112 0c0 4.5-6 9-6 9z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  ),
  funis: (
    <svg {...base}>
      <path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" />
    </svg>
  ),
  segmentacao: (
    <svg {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v9l6.5 3.5" />
      <path d="M12 12L5.5 15.5" />
    </svg>
  ),
  atribuicao: (
    <svg {...base}>
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="M8.2 11l7.6-4" />
      <path d="M8.2 13l7.6 4" />
    </svg>
  ),
  dre: (
    <svg {...base}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </svg>
  ),
  cashflow: (
    <svg {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.2c-.5-.9-1.5-1.4-2.6-1.4-1.5 0-2.6.8-2.6 2 0 2.8 5.4 1.6 5.4 4.4 0 1.2-1.1 2-2.8 2-1.2 0-2.3-.5-2.8-1.5" />
      <path d="M12 6v1.8M12 16.2V18" />
    </svg>
  ),
  forecast: (
    <svg {...base}>
      <path d="M3 16l5-5 4 3 4-6" />
      <path d="M16 8h4v4" />
      <path d="M3 20h18" strokeDasharray="2 2" />
    </svg>
  ),
  ai: (
    <svg {...base}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      <path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />
    </svg>
  ),
  acoes: (
    <svg {...base}>
      <path d="M5 21V4" />
      <path d="M5 4h11l-2 3 2 3H5" />
    </svg>
  ),
  projecoes: (
    <svg {...base}>
      <path d="M4 20V5" />
      <path d="M4 20h16" />
      <path d="M7 16l3-4 3 2 4-7" />
      <path d="M17 7h2.5v2.5" strokeDasharray="2 2" />
    </svg>
  ),
  menu: (
    <svg {...base}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  ),
  close: (
    <svg {...base}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  ),
};
