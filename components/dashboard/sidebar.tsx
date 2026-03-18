'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-white p-6 min-h-screen flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-slate-400 text-sm">Management System</p>
      </div>

      <nav className="flex-1 space-y-2">
        <a
          href="/dashboard"
          className="block px-4 py-2 rounded-lg bg-slate-800 text-white"
        >
          Dashboard
        </a>
      </nav>

      <Button
        onClick={handleLogout}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        Logout
      </Button>
    </aside>
  );
}
