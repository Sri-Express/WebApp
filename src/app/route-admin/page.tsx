// src/app/route-admin/page.tsx - Route Admin Main Page (Redirects to Dashboard)
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RouteAdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.replace('/route-admin/dashboard');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#0f172a'
    }}>
      <div style={{ color: '#f1f5f9' }}>Redirecting to dashboard...</div>
    </div>
  );
}