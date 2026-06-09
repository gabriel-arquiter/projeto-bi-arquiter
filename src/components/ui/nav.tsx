'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { NavIcons } from '@/components/ui/nav-icons';

type Item = {
  href: string;
  label: string;
  icon: keyof typeof NavIcons;
  badge?: { text: string; tone: 'gold' };
};

type Group = {
  title: string;
  items: Item[];
};

const groups: Group[] = [
  {
    title: 'VisÃÂ£o geral',
    items: [
      { href: '/', label: 'Dashboard', icon: 'dashboard' },
      {
        href: '/investor',
        label: 'Investor View',
        icon: 'investor',
        badge: { text: 'LIVE', tone: 'gold' },
      },
    ],
  },
  {
    title: 'Social analytics',
    items: [
      { href: '/instagram', label: 'Instagram', icon: 'instagram' },
      { href: '/pinterest', label: 'Pinterest', icon: 'pinterest' },
    ],
  },
  {
    title: 'Web analytics',
    items: [
      { href: '/ga', label: 'Google Analytics', icon: 'ga' },
      { href: '/gsc', label: 'Google Search Console', icon: 'gsc' },
    ],
  },
  {
    title: 'MÃÂ­dia paga',
    items: [
      { href: '/meta-ads', label: 'Meta Ads', icon: 'metaAds' },
      { href: '/google-ads', label: 'Google Ads', icon: 'googleAds' },
      { href: '/pinterest-ads', label: 'Pinterest Ads', icon: 'pinterestAds' },
    ],
  },
  {
    title: 'CRM',
    items: [
      { href: '/crm/funis', label: 'Funis', icon: 'funis' },
      { href: '/crm/segmentacao', label: 'Segmentação de Base', icon: 'segmentacao' },
      { href: '/crm/atribuicao', label: 'Atribuição', icon: 'atribuicao' },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { href: '/financeiro/dre', label: 'DRE', icon: 'dre' },
      { href: '/financeiro/cash-flow', label: 'Cash Flow', icon: 'cashflow' },
      { href: '/financeiro/forecast', label: 'Forecast Financeiro', icon: 'forecast' },
    ],
  },
  {
    title: 'CRM',
    items: [
      { href: '/ai', label: 'Agente IA', icon: 'ai' },
      { href: '/acoes', label: 'Ações', icon: 'acoes' },
      { href: '/projecoes', label: 'Projeções', icon: 'projecoes' },
      { href: '/crm/atribuicao', label: 'AtribuiÃ§Ã£o', icon: 'â' },
    ],
  },
  {
    title: 'InteligÃÂªncia',
    items: [
      { href: '/ai', label: 'Agente IA', icon: 'Ã¢ÂÂ¦' },
      { href: '/acoes', label: 'AÃ§Ãµes', icon: 'â' },
      { href: '/projecoes', label: 'ProjeÃÂ§ÃÂµes', icon: 'Ã¢ÂÂ§' },
function IconSlot({ name, active }: { name: keyof typeof NavIcons; active: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 18,
        height: 18,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        opacity: active ? 1 : 0.78,
      }}
      className="nav-icon"
    >
      {NavIcons[name]}
    </span>
  );
}

    ],
  },
];
  const [open, setOpen] = useState(false);

  // Fecha o drawer ao navegar.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Trava o scroll do body enquanto o drawer está aberto.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

const mobileGroups = [
  { href: '/', label: 'Overview', icon: 'Ã¢ÂÂ³' },
  { href: '/meta-ads', label: 'Ads', icon: 'Ã¢ÂÂ' },
  { href: '/financeiro/dre', label: 'Fin', icon: 'â£' },
  { href: '/ai', label: 'IA', icon: 'Ã¢ÂÂ¦' },
  { href: '/investor', label: 'Investor', icon: 'â' },
];
  const currentLabel =
    groups.flatMap((g) => g.items).find((i) => isActive(pathname, i.href))?.label ?? 'Arquiter';


function isActive(pathname: string, href: string): boolean {
      {/* Top bar mobile com hamburger */}
      <header className="mobile-topbar">
        <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="mobile-menu-btn">
          <span style={{ width: 22, height: 22, display: 'inline-flex' }}>{NavIcons.menu}</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span className="brand-mark">A</span>
          height: '100vh',
          borderRight: '1px solid var(--line)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            marginBottom: 18,
          }}
            {currentLabel}
          <span
        </div>
        <span style={{ width: 40 }} aria-hidden />
      </header>

      {/* Overlay do drawer */}
      {open && <div className="nav-overlay" onClick={() => setOpen(false)} aria-hidden />}

      {/* Sidebar / drawer */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <span className="brand-mark">A</span>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, flex: 1 }}>
              width: 24,
              height: 24,
              background: 'var(--color-secondary)',
              borderRadius: 5,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#0f0f0f',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              Data platform
            }}
          >
          <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="mobile-close-btn">
            <span style={{ width: 20, height: 20, display: 'inline-flex' }}>{NavIcons.close}</span>
          </button>
            A
          </span>
        <div className="sidebar-scroll">
          {groups.map((group) => (
            <div key={group.title} style={{ marginBottom: 6 }}>
              <span className="nav-group-title">{group.title}</span>
              {group.items.map((it) => {
                const active = isActive(pathname, it.href);
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setOpen(false)}
                    alignItems: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      padding: '9px 12px',
                      borderRadius: 6,
                    borderRadius: 6,
                      fontWeight: active ? 600 : 500,
                      background: active ? 'var(--gold-bg)' : 'transparent',
                      color: active ? 'var(--color-secondary)' : 'rgba(255,255,255,0.78)',
                      position: 'relative',
                      transition: 'background 160ms ease, color 160ms ease',
                      borderLeft: active
                        ? '2px solid var(--color-secondary)'
                        : '2px solid transparent',
                      paddingLeft: active ? 10 : 12,
                    fontWeight: active ? 600 : 500,
                    background: active ? 'var(--gold-bg)' : 'transparent',
                    <IconSlot name={it.icon} active={active} />
                    <span style={{ flex: 1 }}>{it.label}</span>
                    {it.badge && (
                      <span className={`badge ${it.badge.tone}`} style={{ fontSize: 9 }}>
                        {it.badge.text}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
                      fontSize: 13,
        <div className="sidebar-footer">
                    }}
                  >
                    {it.icon}
                  </span>
                  <span style={{ flex: 1 }}>{it.label}</span>
                  {it.badge && (
                    <span className={`badge ${it.badge.tone}`} style={{ fontSize: 9 }}>
                      {it.badge.text}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        <div style={{ marginTop: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 6,
              background: 'var(--surface-2)',
              marginBottom: 8,
              border: '1px solid var(--line)',
            }}
          >
            <p
              style={{
                fontSize: 9,
                letterSpacing: 0.16,
                textTransform: 'uppercase',
                color: 'var(--text-subtle)',
                marginBottom: 4,
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
              }}
            >
              Logado como
            </p>
            <p style={{ wordBreak: 'break-all', fontSize: 11.5, color: 'var(--text)' }}>
              {userEmail}
            </p>
              borderRadius: 6,
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
      </nav>

      <style>{`
        .bottom-nav { display: none; }
        @media (max-width: 820px) {
          .sidebar-desktop { display: none !important; }
          .bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: var(--sidebar) !important;
            border-top: 1px solid var(--line);
            z-index: 50;
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </>
  );
}
