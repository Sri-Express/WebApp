// src/app/fleet/layout.tsx - Fleet Portal Layout
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  TruckIcon,
  HomeIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Fleet-specific layout styles
const fleetLayoutStyles = `
  .desktop-nav {
    display: flex;
    gap: 1.5rem;
  }
  
  .mobile-menu-btn {
    display: none;
  }
  
  .mobile-menu {
    display: none;
  }
  
  @media (max-width: 768px) {
    .desktop-nav {
      display: none;
    }
    
    .mobile-menu-btn {
      display: block;
    }
    
    .mobile-menu {
      display: block;
    }
  }
  
  @media (min-width: 769px) {
    .mobile-menu {
      display: none;
    }
  }
`;

interface User {
  name: string;
  email: string;
  role: string;
}

export default function FleetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip authentication check for login page
    if (pathname === '/fleet/login') {
      return;
    }

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/fleet/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Invalid user data');
      router.push('/fleet/login');
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/fleet/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/fleet/dashboard', icon: HomeIcon },
    { name: 'Vehicles', href: '/fleet/vehicles', icon: TruckIcon },
    { name: 'Routes', href: '/fleet/routes', icon: CogIcon },
    { name: 'Analytics', href: '/fleet/analytics', icon: ChartBarIcon },
    { name: 'Profile', href: '/fleet/profile', icon: UsersIcon },
  ];

  const isActive = (href: string) => pathname === href;

  if (!user && pathname !== '/fleet/login') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9'
      }}>
        Loading...
      </div>
    );
  }

  // For login page, render without navigation
  if (pathname === '/fleet/login') {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {/* Top Navigation */}
      <nav style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '0 1rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <TruckIcon width={28} height={28} color="#10b981" />
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#f1f5f9'
            }}>
              Fleet Portal
            </span>
          </div>

          {/* Desktop Navigation */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '1.5rem'
            }} className="desktop-nav">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    color: isActive(item.href) ? '#10b981' : '#94a3b8',
                    backgroundColor: isActive(item.href) ? '#064e3b' : 'transparent',
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.href) ? '600' : '400',
                    transition: 'all 0.2s'
                  }}
                >
                  <item.icon width={16} height={16} />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>
                  {user?.name}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  Fleet Manager
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  backgroundColor: '#374151',
                  color: '#f9fafb',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                <ArrowRightOnRectangleIcon width={16} height={16} />
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              {mobileMenuOpen ? <XMarkIcon width={24} height={24} /> : <Bars3Icon width={24} height={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mobile-menu" style={{
            borderTop: '1px solid #334155',
            padding: '1rem 0'
          }}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0',
                  textDecoration: 'none',
                  color: isActive(item.href) ? '#10b981' : '#94a3b8',
                  fontSize: '0.875rem',
                  fontWeight: isActive(item.href) ? '600' : '400'
                }}
              >
                <item.icon width={20} height={20} />
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Add CSS styles */}
      <style jsx>{fleetLayoutStyles}</style>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}