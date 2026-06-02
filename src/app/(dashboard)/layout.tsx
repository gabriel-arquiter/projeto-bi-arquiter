import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Nav } from '@/components/ui/nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Nav userEmail={user.email ?? ''} />
      <main
        style={{
          flex: 1,
          padding: '28px clamp(16px, 4vw, 40px) 96px',
          marginLeft: 0,
        }}
        className="dashboard-main"
      >
        {children}
      </main>
    </div>
  );
}
