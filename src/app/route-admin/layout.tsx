// src/app/route-admin/layout.tsx - Route Admin Layout
"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  MapIcon,
  TruckIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function RouteAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Skip authentication for login page
  const isLoginPage = pathname === '/route-admin/login';

  useEffect(() => {
    // Don't run auth checks on login page
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/route-admin/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }

        const data = await response.json();
        
        if (data.user.role !== 'route_admin' && data.user.role !== 'system_admin') {
          router.push('/login');
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        router.push('/route-admin/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, pathname, isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/route-admin/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/route-admin/dashboard', icon: ChartBarIcon },
    { name: 'Vehicle Assignment', href: '/route-admin/vehicles', icon: TruckIcon },
    { name: 'Analytics', href: '/route-admin/analytics', icon: ChartBarIcon },
    { name: 'Schedules', href: '/route-admin/schedules', icon: ClockIcon },
    { name: 'Profile', href: '/route-admin/profile', icon: UserIcon },
  ];

  // For login page, just render children without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // For other pages, show loading if still checking auth
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0f172a'
      }}>
        <div style={{ color: '#f1f5f9' }}>Loading...</div>
      </div>
    );
  }

  // If no user and not login page, the useEffect will redirect
  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0f172a'
      }}>
        <div style={{ color: '#f1f5f9' }}>Redirecting...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '256px' : '0',
        backgroundColor: '#1e293b',
        borderRight: '1px solid #334155',
        transition: 'width 0.3s ease-in-out',
        overflow: 'hidden',
        position: 'fixed',
        height: '100vh',
        zIndex: 40
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: '256px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <MapIcon width={24} height={24} color="#8b5cf6" />
            <span style={{
              color: '#f1f5f9',
              fontSize: '1.125rem',
              fontWeight: 'bold'
            }}>
              Route Admin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <XMarkIcon width={20} height={20} />
          </button>
        </div>

        <nav style={{ padding: '1rem', minWidth: '256px' }}>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem',
                  textDecoration: 'none',
                  color: isActive ? '#8b5cf6' : '#d1d5db',
                  backgroundColor: isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                  transition: 'all 0.2s ease-in-out'
                }}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon width={20} height={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginTop: '2rem',
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ArrowRightOnRectangleIcon width={20} height={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '256px' : '0',
        transition: 'margin-left 0.3s ease-in-out'
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: '#1e293b',
          borderBottom: '1px solid #334155',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <Bars3Icon width={24} height={24} />
            </button>
            <h1 style={{
              color: '#f1f5f9',
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: 0
            }}>
              Route Administrator
            </h1>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                color: '#f1f5f9',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {user.name}
              </div>
              <div style={{
                color: '#94a3b8',
                fontSize: '0.75rem'
              }}>
                Route Administrator
              </div>
            </div>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}