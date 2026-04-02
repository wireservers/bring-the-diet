import { AdminSideNav } from '../../components/AdminSideNav';

export const metadata = {
  title: 'Admin | Bring the Diet',
  description: 'Admin console for Bring the Diet',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSideNav />
      <main style={{ flex: 1, padding: 16 }}>
        {children}
      </main>
    </div>
  );
}
