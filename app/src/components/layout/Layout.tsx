import { Outlet } from 'react-router-dom';
import { useAuthService } from '@/hooks/useAuthService';
import { Header } from '../header/Header';

export function Layout() {
  const { isAuthenticated$ } = useAuthService();

  if (!isAuthenticated$) {
    return (
      <div className="c-loader flex items-center justify-center">
        <div className={`loader ${isAuthenticated$ ? '' : 'hidden'}`} />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className={isAuthenticated$ ? 'mt-[70px]' : ''}>
        <Outlet />
      </main>
    </>
  );
}