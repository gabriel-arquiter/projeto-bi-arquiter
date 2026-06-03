import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Nav } from '@/components/ui/nav';
import { Topbar } from '@/components/ui/topbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === '1';

  let email = 'preview@arquiter.app';
  if (!useMock) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect('/login');
    email = user.email ?? '';
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Nav userEmail={email} />
      <div className="dashboard-main" style={{ display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main
          style={{
            flex: 1,
            padding: '28px clamp(16px, 4vw, 40px) 96px',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
