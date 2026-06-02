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
          background: 'var(--color-primary)',
          color: '#fff',
          padding: '24px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
        className="sidebar-desktop"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 8px 22px' }}>
          <span
            style={{ width: 11, height: 11, background: 'var(--color-secondary)', borderRadius: 3 }}
          />
          <span style={{ fontWeight: 700, letterSpacing: 1.5, fontSize: 14 }}>ARQUITER</span>
        </div>

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
                padding: '11px 12px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                background: active ? 'rgba(234,211,45,0.15)' : 'transparent',
                color: active ? 'var(--color-secondary)' : 'rgba(255,255,255,0.78)',
              }}
            >
              <span style={{ width: 18, textAlign: 'center' }}>{it.icon}</span>
              {it.label}
            </Link>
          );
        })}

        <div style={{ marginTop: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
          <p style={{ padding: '0 8px 8px', wordBreak: 'break-all' }}>{userEmail}</p>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '9px',
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
            }}
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
                padding: '8px 0',
                fontSize: 11,
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: active ? 700 : 500,
              }}
            >
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
          }
        }
      `}</style>
    </>
  );
}
