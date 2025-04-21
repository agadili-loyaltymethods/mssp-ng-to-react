import { Outlet } from 'react-router-dom';
import { Header } from '../header';
import { useAuth } from '@/lib/hooks/useAuth';

export function Layout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="c-loader flex items-center justify-center">
        <div className={`loader ${isAuthenticated ? '' : 'hidden'}`} />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className={isAuthenticated ? 'mt-[70px]' : ''}>
        <Outlet />
      </main>
    </>
  );
}