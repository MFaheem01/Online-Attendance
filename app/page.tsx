'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        const parsed = JSON.parse(user);
        router.replace(parsed.role === 'admin' ? '/admin' : '/dashboard');
      } catch {
        router.replace('/auth/login');
      }
    } else {
      router.replace('/auth/login');
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#080c14' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🏢</div>
        <h1 style={{ color: '#4f7eff', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>AttendX</h1>
        <p style={{ color: '#6b7a99', fontSize: 14 }}>Redirecting...</p>
      </div>
    </div>
  );
}