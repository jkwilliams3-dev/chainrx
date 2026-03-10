import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNav />
      <main className="flex-1 p-4 md:p-6 max-w-screen-2xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
