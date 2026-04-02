import { TabNav } from '../../components/TabNav';
import { BottomTabNav } from '../../components/BottomTabNav';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TabNav />
      <main style={{ padding: 16, paddingBottom: 80 }}>
        {children}
      </main>
      <BottomTabNav />
    </>
  );
}
