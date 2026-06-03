'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const items = [
  { href: '/', label: 'Overview', icon: '◳' },
  { href: '/social', label: 'Social', icon: '◎' },
  { href: '/google', label: 'Google', icon: '◍' },
  { href: '/ads', label: 'Ads', icon: '◈' },
  { href: '/ai', label: 'IA', icon: '✦' },
];

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
          background:
            'linear-gradient(180deg, #2a2a2a 0%, #1f1f1f 100%)',
          color: '#fff',
          padding: '26px 18px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          position: 'sticky',
          top: 0,
          height: '100vh',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.03)',
        }}
        className="sidebar-desktop"
      >
        {/* Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 10px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 18,
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              background: 'var(--color-secondary)',
              borderRadius: 6,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#1a1a1a',
              fontSize: 12,
              fontFamily: 'var(--font-display)',
            }}
          >
            A
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontWeight: 700, letterSpacing: 2, fontSize: 13 }}>ARQUITER</span>
            <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', marginTop: 3, letterSpacing: 0.4 }}>
              Web analytics
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: 10,
            letterSpacing: 0.2,
            color: 'rgba(255,255,255,0.4)',
            padding: '0 12px 8px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Painéis
        </span>

        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                background: active ? 'rgba(234,211,45,0.12)' : 'transparent',
                color: active ? 'var(--color-secondary)' : 'rgba(255,255,255,0.78)',
                position: 'relative',
                transition: 'background 160ms ease, color 160ms ease',
              }}
            >
              {active && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: -18,
                    top: 8,
                    bottom: 8,
                    width: 3,
                    background: 'var(--color-secondary)',
                    borderRadius: '0 3px 3px 0',
                  }}
                />
              )}
              <span style={{ width: 18, textAlign: 'center', fontSize: 14 }}>{it.icon}</span>
              {it.label}
            </Link>
          );
        })}

        <div style={{ marginTop: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
          <div
            style={{
              padding: '12px 12px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              marginBottom: 8,
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <p style={{ fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>
              Logado como
            </p>
            <p style={{ wordBreak: 'break-all', fontSize: 12.5, color: 'rgba(255,255,255,0.85)' }}>
              {userEmail}
            </p>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 10,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              transition: 'background 160ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Bottom nav mobile */}
      <nav className="bottom-nav">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '8px 0 10px',
                fontSize: 11,
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: active ? 700 : 500,
                position: 'relative',
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
              <div style={{ fontSize: 18 }}>{it.icon}</div>
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
            background: #fff !important;
            border-top: 1px solid var(--color-border);
            z-index: 50;
            padding-bottom: env(safe-area-inset-bottom);
            box-shadow: 0 -6px 18px rgba(0,0,0,0.04);
          }
        }
      `}</style>
    </>
  );
}
