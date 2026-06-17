'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { NavIcons } from '@/components/ui/nav-icons';
import { PeriodSelector } from '@/components/ui/period-selector';
import { PERIOD_ROUTES } from '@/lib/period';

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
    title: 'Visão geral',
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
    title: 'Mídia paga',
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
    title: 'Inteligência',
    items: [
      { href: '/ai', label: 'Agente IA', icon: 'ai' },
      { href: '/acoes', label: 'Ações', icon: 'acoes' },
      { href: '/projecoes', label: 'Projeções', icon: 'projecoes' },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

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

export function Nav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
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

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const currentLabel =
    groups.flatMap((g) => g.items).find((i) => isActive(pathname, i.href))?.label ?? 'Arquiter';

  return (
    <>
      {/* Top bar mobile com hamburger */}
      <header className="mobile-topbar">
        <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="mobile-menu-btn">
          <span style={{ width: 22, height: 22, display: 'inline-flex' }}>{NavIcons.menu}</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span className="brand-mark">A</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentLabel}
          </span>
        </div>
        {PERIOD_ROUTES.has(pathname) ? (
          <Suspense fallback={<span style={{ width: 40 }} aria-hidden />}>
            <PeriodSelector />
          </Suspense>
        ) : (
          <span style={{ width: 40 }} aria-hidden />
        )}
      </header>

      {/* Overlay do drawer */}
      {open && <div className="nav-overlay" onClick={() => setOpen(false)} aria-hidden />}

      {/* Sidebar / drawer */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <span className="brand-mark">A</span>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, flex: 1 }}>
            <span style={{ fontWeight: 700, letterSpacing: 2, fontSize: 12 }}>ARQUITER</span>
            <span
              style={{
                fontSize: 9.5,
                color: 'var(--text-subtle)',
                marginTop: 3,
                letterSpacing: 0.16,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
              }}
            >
              Data platform
            </span>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="mobile-close-btn">
            <span style={{ width: 20, height: 20, display: 'inline-flex' }}>{NavIcons.close}</span>
          </button>
        </div>

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
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      padding: '9px 12px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      background: active ? 'var(--gold-bg)' : 'transparent',
                      color: active ? 'var(--color-secondary)' : 'rgba(255,255,255,0.78)',
                      position: 'relative',
                      transition: 'background 160ms ease, color 160ms ease',
                      borderLeft: active
                        ? '2px solid var(--color-secondary)'
                        : '2px solid transparent',
                      paddingLeft: active ? 10 : 12,
                    }}
                  >
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

        <div className="sidebar-footer">
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
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '9px',
              background: 'transparent',
              border: '1px solid var(--line-strong)',
              borderRadius: 6,
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              transition: 'background 160ms ease, border-color 160ms ease',
            }}
          >
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
