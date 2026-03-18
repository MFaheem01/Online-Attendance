'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AttendanceSummary } from '@/components/admin/attendance-summary';
import { GroupChat } from '@/components/GroupChat';

export default function AttendancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/auth/login');
        return;
      }

      const data = await response.json();
      if (data.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    } catch (err) {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900">Attendance Tracking</h1>
            <p className="text-slate-600 mt-2">Monitor employee attendance in real-time</p>
          </div>

          <AttendanceSummary />
          <GroupChat isAdmin={true} />
        </div>
      </main>
    </div>
  );
}
