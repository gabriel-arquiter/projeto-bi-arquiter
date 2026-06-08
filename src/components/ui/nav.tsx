'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Item = {
  href: string;
  label: string;
  icon: string;
  badge?: { text: string; tone: 'gold' };
};

type Group = {
  title: string;
  items: Item[];
};

const groups: Group[] = [
  {
    title: 'VisÃ£o geral',
    items: [
      { href: '/', label: 'Dashboard', icon: 'â³' },
      {
        href: '/investor',
        label: 'Investor View',
        icon: 'â',
        badge: { text: 'LIVE', tone: 'gold' },
      },
    ],
  },
  {
    title: 'Social analytics',
    items: [
      { href: '/instagram', label: 'Instagram', icon: 'â' },
      { href: '/pinterest', label: 'Pinterest', icon: 'â' },
    ],
  },
  {
    title: 'Web analytics',
    items: [
      { href: '/ga', label: 'Google Analytics', icon: 'â' },
      { href: '/gsc', label: 'Google Search Console', icon: 'â' },
    ],
  },
  {
    title: 'MÃ­dia paga',
    items: [
      { href: '/meta-ads', label: 'Meta Ads', icon: 'â' },
      { href: '/google-ads', label: 'Google Ads', icon: 'â' },
      { href: '/pinterest-ads', label: 'Pinterest Ads', icon: 'â' },
    ],
  },
  {
    title: 'CRM',
    items: [
      { href: '/crm/funis', label: 'Funis', icon: '⌗' },
      { href: '/crm/segmentacao', label: 'Segmentação de Base', icon: '◫' },
      { href: '/crm/atribuicao', label: 'Atribuição', icon: '◑' },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { href: '/financeiro/dre', label: 'DRE', icon: '▣' },
      { href: '/financeiro/cash-flow', label: 'Cash Flow', icon: '◷' },
      { href: '/financeiro/forecast', label: 'Forecast Financeiro', icon: '◵' },
    ],
  },
  {
    title: 'InteligÃªncia',
    items: [
      { href: '/ai', label: 'Agente IA', icon: 'â¦' },
      { href: '/acoes', label: 'Ações', icon: '⚑' },
      { href: '/projecoes', label: 'ProjeÃ§Ãµes', icon: 'â§' },
    ],
  },
];

const mobileGroups = [
  { href: '/', label: 'Overview', icon: 'â³' },
  { href: '/meta-ads', label: 'Ads', icon: 'â' },
  { href: '/financeiro/dre', label: 'Fin', icon: '▣' },
  { href: '/ai', label: 'IA', icon: 'â¦' },
  { href: '/investor', label: 'Investor', icon: '◆' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* Sidebar desktop */}
      <aside
        style={{
          width: 'var(--sidebar-w)',
          background: 'var(--sidebar)',
          color: 'var(--text)',
          padding: '22px 14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          position: 'sticky',
          top: 0,
          height: '100vh',
          borderRight: '1px solid var(--line)',
          overflowY: 'auto',
        }}
        className="sidebar-desktop"
      >
        {/* Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 10px 22px',
            borderBottom: '1px solid var(--line)',
            marginBottom: 18,
          }}
        >
          <span
            style={{
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
              letterSpacing: '-0.02em',
            }}
          >
            A
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
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
              Web analytics
            </span>
          </div>
        </div>

        {groups.map((group) => (
          <div key={group.title} style={{ marginBottom: 6 }}>
            <span
              style={{
                display: 'block',
                fontSize: 9.5,
                letterSpacing: 0.18,
                color: 'var(--text-subtle)',
                padding: '12px 12px 6px',
                textTransform: 'uppercase',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                pointerEvents: 'none',
              }}
            >
              {group.title}
            </span>
            {group.items.map((it) => {
              const active = isActive(pathname, it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
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
                  <span
                    style={{
                      width: 16,
                      textAlign: 'center',
                      fontSize: 13,
                      opacity: active ? 1 : 0.7,
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface-2)';
              e.currentTarget.style.borderColor = 'var(--gold-line)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--line-strong)';
            }}
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Bottom nav mobile â 5 grupos */}
      <nav className="bottom-nav">
        {mobileGroups.map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '8px 0 10px',
                fontSize: 10,
                color: active ? 'var(--color-secondary)' : 'var(--text-muted)',
                fontWeight: active ? 600 : 500,
                position: 'relative',
                textTransform: 'uppercase',
                letterSpacing: 0.06,
              }}
            >
              {active && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '30%',
                    right: '30%',
                    height: 2,
                    background: 'var(--color-secondary)',
                    borderRadius: 2,
                  }}
                />
              )}
              <div style={{ fontSize: 16, marginBottom: 2 }}>{it.icon}</div>
              {it.label}
            </Link>
          );
        })}
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
