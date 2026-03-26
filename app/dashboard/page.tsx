'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { AttendanceCard } from '@/components/dashboard/attendance-card';
import { Card } from '@/components/ui/card';
import { GroupChat } from '@/components/GroupChat';

interface UserInfo {
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
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
      setUserInfo(data);
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
      <Sidebar />
      <main className="flex-1 p-8 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900">Welcome, {userInfo?.name}</h1>
            <p className="text-slate-600 mt-2">{userInfo?.email}</p>
          </div>

          <div className="space-y-6">
            <AttendanceCard />
            <GroupChat />

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Quick Stats</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-slate-600 text-sm">Status</p>
                  <p className="text-2xl font-bold text-blue-600">Active</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-slate-600 text-sm">Role</p>
                  <p className="text-2xl font-bold text-green-600 capitalize">{userInfo?.role}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-slate-600 text-sm">Joined</p>
                  <p className="text-2xl font-bold text-purple-600">Today</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
