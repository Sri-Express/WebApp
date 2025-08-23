// src/app/fleet/layout.tsx - Fleet Portal Layout with Theme Integration
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/fleet/components/AnimatedBackground';
import { 
  TruckIcon,
  HomeIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

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
  const { theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Theme and Style Definitions
  const lightTheme = { 
    mainBg: '#fffbeb', 
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', 
    glassPanelBg: 'rgba(255, 255, 255, 0.92)', 
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', 
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', 
    textPrimary: '#1f2937', 
    textSecondary: '#4B5563', 
    textMuted: '#6B7280', 
    quickActionBg: 'rgba(249, 250, 251, 0.8)', 
    quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', 
    alertBg: 'rgba(249, 250, 251, 0.6)',
    navBg: 'rgba(255, 255, 255, 0.92)',
    navBorder: '1px solid rgba(251, 191, 36, 0.3)'
  };
  
  const darkTheme = { 
    mainBg: '#0f172a', 
    bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', 
    glassPanelBg: 'rgba(30, 41, 59, 0.8)', 
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', 
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', 
    textPrimary: '#f9fafb', 
    textSecondary: '#9ca3af', 
    textMuted: '#9ca3af', 
    quickActionBg: 'rgba(51, 65, 85, 0.8)', 
    quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', 
    alertBg: 'rgba(51, 65, 85, 0.6)',
    navBg: 'rgba(30, 41, 59, 0.92)',
    navBorder: '1px solid rgba(251, 191, 36, 0.3)'
  };
  
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // Fleet-specific layout styles with animations
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

    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in-down {
      animation: fadeInDown 0.8s ease-out forwards;
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.8s ease-out forwards;
    }
    
    .nav-link:hover {
      transform: translateY(-1px);
      transition: all 0.2s ease;
    }
  `;

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
        backgroundColor: currentThemeStyles.mainBg,
        color: currentThemeStyles.textPrimary
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: `4px solid ${theme === 'dark' ? '#fef3c7' : '#fde68a'}`, 
            borderTop: '4px solid #F59E0B', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite', 
            margin: '0 auto 16px' 
          }}></div>
          <div style={{ 
            color: currentThemeStyles.textPrimary, 
            fontSize: '16px', 
            fontWeight: '600' 
          }}>
            Loading Fleet Portal...
          </div>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // For login page, render without navigation
  if (pathname === '/fleet/login') {
    return <>{children}</>;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      position: 'relative',
      overflowX: 'hidden'
    }}>
      <style jsx>{fleetLayoutStyles}</style>
      
      {/* Animated Background */}
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Top Navigation */}
        <nav style={{
          backgroundColor: currentThemeStyles.navBg,
          borderBottom: currentThemeStyles.navBorder,
          backdropFilter: 'blur(12px)',
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
              <ShieldCheckIcon width={32} height={32} color="#dc2626" />
              <div>
                <h1 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: currentThemeStyles.textPrimary, 
                  margin: 0, 
                  textShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express
                </h1>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: currentThemeStyles.textSecondary, 
                  margin: 0 
                }}>
                  Fleet Management Portal
                </p>
              </div>
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
                    className="nav-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      color: isActive(item.href) ? '#F59E0B' : currentThemeStyles.textSecondary,
                      backgroundColor: isActive(item.href) ? (theme === 'dark' ? '#451a03' : '#fef3c7') : 'transparent',
                      fontSize: '0.875rem',
                      fontWeight: isActive(item.href) ? '600' : '400',
                      transition: 'all 0.2s',
                      border: isActive(item.href) ? '1px solid #F59E0B' : '1px solid transparent'
                    }}
                  >
                    <item.icon width={16} height={16} />
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Theme Switcher */}
              <ThemeSwitcher />

              {/* User Menu */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    color: currentThemeStyles.textPrimary, 
                    fontSize: '0.875rem', 
                    fontWeight: '600' 
                  }}>
                    {user?.name}
                  </div>
                  <div style={{ 
                    color: currentThemeStyles.textSecondary, 
                    fontSize: '0.75rem' 
                  }}>
                    Fleet Manager
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: '#374151',
                    color: '#f9fafb',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4B5563';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#374151';
                    e.currentTarget.style.transform = 'translateY(0)';
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
                  color: currentThemeStyles.textSecondary,
                  cursor: 'pointer'
                }}
              >
                {mobileMenuOpen ? <XMarkIcon width={24} height={24} /> : <Bars3Icon width={24} height={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="mobile-menu animate-fade-in-down" style={{
              borderTop: currentThemeStyles.glassPanelBorder,
              padding: '1rem 0',
              backgroundColor: currentThemeStyles.glassPanelBg,
              backdropFilter: 'blur(12px)'
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
                    color: isActive(item.href) ? '#F59E0B' : currentThemeStyles.textSecondary,
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

        {/* Main Content */}
        <main className="animate-fade-in-up">
          {children}
        </main>
      </div>
    </div>
  );
}