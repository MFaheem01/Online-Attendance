'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/auth/login');
        }
      } catch (err) {
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Attendance System</h1>
        <p className="text-slate-600">Redirecting...</p>
      </div>
    </div>
  );
}
