// components/CSAuthGuard.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CSAuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function CSAuthGuard({ children, fallback }: CSAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    const user = localStorage.getItem('cs_user');
    
    if (!token || !user) {
      router.push('/cs/login');
      setIsAuthenticated(false);
      return;
    }

    try {
      const userData = JSON.parse(user);
      // Verify user has CS role
      if (!userData.role || !['customer_service', 'system_admin'].includes(userData.role)) {
        router.push('/cs/login');
        setIsAuthenticated(false);
        return;
      }
      
      setIsAuthenticated(true);
    } catch {
      router.push('/cs/login');
      setIsAuthenticated(false);
    }
  }, [router]);

  if (isAuthenticated === null) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}