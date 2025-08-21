// src/app/fleet/page.tsx - Fleet Portal Landing Page
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FleetPortalPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to fleet dashboard
    router.push('/fleet/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-2a2 2 0 00-2-2H8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Sri Express Fleet Portal
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Redirecting to Fleet Management Dashboard...
          </p>
        </div>

        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        
        <div className="mt-8 text-slate-500 text-sm">
          <p>If you're not redirected automatically, <a href="/fleet/dashboard" className="text-orange-500 hover:text-orange-400">click here</a></p>
        </div>
      </div>
    </div>
  );
}
