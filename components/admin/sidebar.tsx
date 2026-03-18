'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function AdminSidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-white p-6 min-h-screen flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-slate-400 text-sm">Attendance Management</p>
      </div>

      <nav className="flex-1 space-y-2">
        <Link
          href="/admin"
          className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/employees"
          className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Employees
        </Link>
        <Link
          href="/admin/attendance"
          className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Attendance
        </Link>
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
