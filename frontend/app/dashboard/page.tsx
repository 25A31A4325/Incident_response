'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);
  return (
    <div style={{ minHeight: '100vh', background: '#0a0e17', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#60a5fa', fontSize: 14 }}>Loading dashboard…</div>
    </div>
  );
}
