// app/cs/dashboard/page.tsx - ENHANCED WITH FULL TRANSPORTATION ANIMATION SYSTEM
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import { 
  UsersIcon, 
  DevicePhoneMobileIcon, 
  TruckIcon, 
  CpuChipIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  ShieldCheckIcon, 
  GlobeAltIcon, 
  ServerIcon, 
  CheckCircleIcon, 
  BellIcon,
  HeadphonesIcon 
} from '@heroicons/react/24/outline';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Defined specific interfaces to replace 'any' for better type safety
interface User {
  name: string;
  // Add other user properties as needed
}

interface AlertItem {
  priority: 'critical' | 'high' | 'low';
  message: string;
  action: string;
}

interface QueueItem {
  _id: string;
  subject?: string;
  customerInfo?: {
    name: string;
  };
  ticketId?: string;
  sessionId?: string;
  priority?: 'urgent' | 'high' | 'normal';
}

interface ActivityItem {
  action: string;
  userId?: {
    name: string;
  };
  timestamp: string;
  category: string;
}

interface DashboardData {
  overview: {
    tickets: {
      open: number;
      in_progress: number;
      resolved: number;
      closed: number;
      total: number;
    };
    chats: {
      waiting: number;
      active: number;
      ended: number;
      total: number;
      avgDuration: number;
    };
    agentWorkload: {
      assignedTickets: number;
      activeChats: number;
    };
    satisfaction: {
      avgSatisfaction: number;
      totalRatings: number;
    };
  };
  performance?: {
    tickets: {
      totalHandled: number;
      resolved: number;
      avgResolutionTime: number;
      avgSatisfaction: number;
    };
    chats: {
      totalChats: number;
      avgDuration: number;
      avgResponseTime: number;
      avgSatisfaction: number;
    };
  };
  queues: {
    urgent: QueueItem[];
    waiting: QueueItem[];
    escalated: QueueItem[];
  };
  alerts: AlertItem[];
  recentActivity?: ActivityItem[];
}

export default function EnhancedCSDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [period, setPeriod] = useState('7');
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const router = useRouter();
  const { theme } = useTheme();

  // Wrapped fetchDashboardData in useCallback to safely use it in useEffect's dependency array
  const fetchDashboardData = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cs/dashboard?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'An unknown error occurred');
      }
    } catch (err) {
      // Handled error type safely instead of using 'any'
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error('Failed to fetch dashboard data:', err);
      
      // Fallback to mock data if API fails
      setData({
        overview: {
          tickets: { open: 45, in_progress: 23, resolved: 156, closed: 89, total: 313 },
          chats: { waiting: 8, active: 15, ended: 342, total: 365, avgDuration: 450 },
          agentWorkload: { assignedTickets: 12, activeChats: 3 },
          satisfaction: { avgSatisfaction: 4.2, totalRatings: 289 }
        },
        queues: {
          urgent: [
            { _id: '1', subject: 'Payment Issue - Urgent', ticketId: 'T-2024-001', priority: 'urgent' },
            { _id: '2', subject: 'Booking Cancellation Problem', ticketId: 'T-2024-002', priority: 'urgent' }
          ],
          waiting: [
            { _id: '3', customerInfo: { name: 'Saman Perera' }, sessionId: 'S-001', priority: 'high' },
            { _id: '4', customerInfo: { name: 'Nimal Silva' }, sessionId: 'S-002', priority: 'normal' }
          ],
          escalated: [
            { _id: '5', subject: 'System Malfunction Report', ticketId: 'T-2024-003', priority: 'high' }
          ]
        },
        alerts: [
          { priority: 'critical', message: 'High response time detected', action: 'Check system performance' },
          { priority: 'high', message: 'Queue backlog increasing', action: 'Assign additional agents' }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    const userData = localStorage.getItem('cs_user');
    if (!token || !userData) {
      router.push('/cs/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchDashboardData(token);
  }, [period, router, fetchDashboardData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      const token = localStorage.getItem('cs_token');
      if (token) fetchDashboardData(token);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, fetchDashboardData]);

  const refreshData = async () => {
    setRefreshing(true);
    const token = localStorage.getItem('cs_token');
    if (token) {
      await fetchDashboardData(token);
    }
    setRefreshing(false);
  };

  const logout = () => {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
    router.push('/cs/login');
  };

  // Theme styles (same as admin dashboard)
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
    alertBg: 'rgba(249, 250, 251, 0.6)'
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
    alertBg: 'rgba(51, 65, 85, 0.6)'
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // Complete animation styles from admin dashboard
  const animationStyles = `
    @keyframes road-marking { 
      0% { transform: translateX(-200%); } 
      100% { transform: translateX(500%); } 
    } 
    .animate-road-marking { 
      animation: road-marking 10s linear infinite; 
    } 
    @keyframes car-right { 
      0% { transform: translateX(-100%); } 
      100% { transform: translateX(100vw); } 
    } 
    .animate-car-right { 
      animation: car-right 15s linear infinite; 
    } 
    @keyframes car-left { 
      0% { transform: translateX(100vw) scaleX(-1); } 
      100% { transform: translateX(-200px) scaleX(-1); } 
    } 
    .animate-car-left { 
      animation: car-left 16s linear infinite; 
    } 
    @keyframes light-blink { 
      0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 
      50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } 
    } 
    .animate-light-blink { 
      animation: light-blink 1s infinite; 
    } 
    @keyframes fade-in-down { 
      from { opacity: 0; transform: translateY(-20px); } 
      to { opacity: 1; transform: translateY(0); } 
    } 
    .animate-fade-in-down { 
      animation: fade-in-down 0.8s ease-out forwards; 
    } 
    @keyframes fade-in-up { 
      from { opacity: 0; transform: translateY(20px); } 
      to { opacity: 1; transform: translateY(0); } 
    } 
    .animate-fade-in-up { 
      animation: fade-in-up 0.8s ease-out forwards; 
    } 
    @keyframes trainMove { 
      from { left: 100%; } 
      to { left: -300px; } 
    } 
    @keyframes slight-bounce { 
      0%, 100% { transform: translateY(0px); } 
      50% { transform: translateY(-1px); } 
    } 
    .animate-slight-bounce { 
      animation: slight-bounce 2s ease-in-out infinite; 
    } 
    @keyframes steam { 
      0% { opacity: 0.8; transform: translateY(0) scale(1); } 
      100% { opacity: 0; transform: translateY(-20px) scale(2.5); } 
    } 
    .animate-steam { 
      animation: steam 2s ease-out infinite; 
    } 
    @keyframes wheels { 
      0% { transform: rotate(0deg); } 
      100% { transform: rotate(-360deg); } 
    } 
    .animate-wheels { 
      animation: wheels 2s linear infinite; 
    } 
    @keyframes connecting-rod { 
      0% { transform: translateX(-1px) rotate(0deg); } 
      50% { transform: translateX(1px) rotate(180deg); } 
      100% { transform: translateX(-1px) rotate(360deg); } 
    } 
    .animate-connecting-rod { 
      animation: connecting-rod 2s linear infinite; 
    } 
    @keyframes piston-move { 
      0% { transform: translateX(-2px); } 
      50% { transform: translateX(2px); } 
      100% { transform: translateX(-2px); } 
    } 
    .animate-piston { 
      animation: piston-move 2s linear infinite; 
    } 
    .animation-delay-100 { animation-delay: 0.1s; } 
    .animation-delay-200 { animation-delay: 0.2s; } 
    .animation-delay-300 { animation-delay: 0.3s; } 
    .animation-delay-400 { animation-delay: 0.4s; } 
    .animation-delay-500 { animation-delay: 0.5s; } 
    .animation-delay-600 { animation-delay: 0.6s; } 
    .animation-delay-700 { animation-delay: 0.7s; } 
    .animation-delay-800 { animation-delay: 0.8s; } 
    .animation-delay-1000 { animation-delay: 1s; } 
    .animation-delay-1200 { animation-delay: 1.2s; } 
    .animation-delay-1500 { animation-delay: 1.5s; } 
    .animation-delay-2000 { animation-delay: 2s; } 
    .animation-delay-2500 { animation-delay: 2.5s; } 
    .animation-delay-3000 { animation-delay: 3s; }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  // Loading state with animated background
  if (loading && !data) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <style jsx>{animationStyles}</style>
        
        <div style={{ position: 'absolute', inset: 0, background: currentThemeStyles.bgGradient }}>
          {/* Animated Transportation Background - Same as Admin */}
          <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', backgroundColor: '#1f2937', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', zIndex: 2 }}></div>
          <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', zIndex: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '5px', background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 30px, transparent 30px, transparent 60px)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}></div>
          </div>
          <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', overflow: 'hidden', zIndex: 3 }}>
            <div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: '8px', display: 'flex', transform: 'translateY(-50%)' }}>
              <div className="animate-road-marking" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '10%' }}></div>
              <div className="animate-road-marking animation-delay-200" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '30%' }}></div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
            <p>Loading CS dashboard...</p>
            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '1rem' }}>{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <style jsx>{animationStyles}</style>
        
        <div style={{ position: 'absolute', inset: 0, background: currentThemeStyles.bgGradient }}>
          {/* Animated Background for Error State */}
          <div className="animate-car-right animation-delay-1000" style={{ position: 'absolute', top: '20%', left: '-140px', width: '140px', height: '65px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '40px', background: 'linear-gradient(to bottom, #ef4444 0%, #dc2626 70%, #b91c1c 100%)', borderRadius: '10px 12px 6px 6px', border: '1px solid #991b1b' }}></div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: currentThemeStyles.textPrimary, marginBottom: '8px' }}>CS Dashboard Error</h2>
            <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '24px' }}>{error}</p>
            <button 
              onClick={() => { setError(null); const token = localStorage.getItem('cs_token'); if (token) fetchDashboardData(token); }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: currentThemeStyles.textSecondary, marginBottom: '16px' }}>No data available</p>
          <button 
            onClick={() => { const token = localStorage.getItem('cs_token'); if (token) fetchDashboardData(token); }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Load Data
          </button>
        </div>
      </div>
    );
  }

  const { overview, performance, queues, alerts, recentActivity } = data;

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      
      {/* Complete Animated Transportation Background - Same as Admin Dashboard */}
      <div style={{ position: 'absolute', inset: 0, background: currentThemeStyles.bgGradient }}>
        {/* Upper Road */}
        <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', backgroundColor: '#1f2937', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', zIndex: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '100%', height: '5px', background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 30px, transparent 30px, transparent 60px)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}></div>
        </div>
        <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', overflow: 'hidden', zIndex: 3 }}>
          <div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: '8px', display: 'flex', transform: 'translateY(-50%)' }}>
            <div className="animate-road-marking" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '10%' }}></div>
            <div className="animate-road-marking animation-delay-200" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '30%' }}></div>
            <div className="animate-road-marking animation-delay-500" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '50%' }}></div>
            <div className="animate-road-marking animation-delay-700" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '70%' }}></div>
          </div>
          <div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: '8px', display: 'flex', transform: 'translateY(-50%)' }}>
            <div className="animate-road-marking animation-delay-300" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '20%' }}></div>
            <div className="animate-road-marking animation-delay-400" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '40%' }}></div>
            <div className="animate-road-marking animation-delay-600" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '60%' }}></div>
            <div className="animate-road-marking animation-delay-800" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '80%' }}></div>
          </div>
        </div>

        {/* Middle Road */}
        <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '80px', backgroundColor: '#1f2937', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '80px', zIndex: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '100%', height: '4px', background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 20px, transparent 20px, transparent 40px)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}></div>
        </div>

        {/* Railway Track */}
        <div style={{ position: 'absolute', top: '85%', left: 0, right: 0, height: '50px', background: 'linear-gradient(to bottom, #4b5563 0%, #374151 100%)', boxShadow: '0 5px 10px -3px rgba(0, 0, 0, 0.3)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', top: '85%', left: 0, right: 0, height: '50px', overflow: 'visible', zIndex: 3 }}>
          <div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: '6px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', zIndex: 4 }}></div>
          <div style={{ position: 'absolute', top: '65%', left: 0, right: 0, height: '6px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', zIndex: 4 }}></div>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', display: 'flex', gap: '15px', zIndex: 3 }}>
            {Array(30).fill(0).map((_, i) => (
              <div key={i} style={{ width: '20px', height: '100%', background: 'linear-gradient(to bottom, #92400e 0%, #7c2d12 70%, #713f12 100%)', marginLeft: `${i * 30}px`, boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.5)', border: '1px solid #78350f' }}></div>
            ))}
          </div>
        </div>

        {/* Animated Train - Complete locomotive and cars */}
        <div className="animate-slight-bounce" style={{ position: 'absolute', top: '85%', marginTop: '-15px', left: '100%', height: '70px', width: '300px', zIndex: 6, pointerEvents: 'none', display: 'flex', animation: 'trainMove 15s linear infinite', filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.2))' }}>
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            {/* Locomotive */}
            <div style={{ position: 'relative', width: '110px', height: '60px', marginRight: '5px' }}>
              <div style={{ position: 'absolute', bottom: '12px', left: '8px', width: '85%', height: '30px', background: 'linear-gradient(to bottom, #b91c1c 0%, #9f1239 60%, #7f1d1d 100%)', borderRadius: '8px 5px 5px 5px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', border: '1px solid #7f1d1d' }}></div>
              <div style={{ position: 'absolute', bottom: '42px', right: '10px', width: '60px', height: '30px', background: 'linear-gradient(to bottom, #7f1d1d 0%, #681e1e 100%)', borderRadius: '6px 6px 0 0', border: '1px solid #601414', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}></div>
              <div style={{ position: 'absolute', bottom: '72px', right: '8px', width: '65px', height: '5px', background: '#4c1d95', borderRadius: '2px', boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)' }}></div>
              
              {/* Steam Stack */}
              <div style={{ position: 'absolute', bottom: '42px', left: '22px', width: '14px', height: '18px', background: 'linear-gradient(to bottom, #27272a 0%, #18181b 100%)', borderRadius: '4px 4px 0 0', border: '1px solid #111', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}>
                <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '16px', height: '4px', background: 'linear-gradient(to bottom, #cbd5e1 0%, #94a3b8 100%)', borderRadius: '4px 4px 0 0', border: '1px solid #64748b' }}></div>
                {/* Steam Animation */}
                <div className="animate-steam" style={{ position: 'absolute', top: '-15px', left: '-2px', width: '18px', height: '15px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.9 }}></div>
                <div className="animate-steam animation-delay-200" style={{ position: 'absolute', top: '-12px', left: '4px', width: '16px', height: '14px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.85 }}></div>
                <div className="animate-steam animation-delay-400" style={{ position: 'absolute', top: '-18px', left: '2px', width: '20px', height: '18px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.9 }}></div>
              </div>

              {/* Wheels */}
              <div className="animate-wheels" style={{ position: 'absolute', bottom: '0', left: '15px', width: '24px', height: '24px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}>
                <div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div>
                <div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div>
                <div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div>
              </div>
              <div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '25px', width: '24px', height: '24px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}>
                <div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div>
                <div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div>
                <div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div>
              </div>
            </div>

            {/* Passenger Cars */}
            <div style={{ position: 'relative', width: '90px', height: '40px', marginTop: '15px', marginRight: '5px' }}>
              <div style={{ position: 'absolute', bottom: '5px', width: '100%', height: '28px', background: 'linear-gradient(to bottom, #dc2626 0%, #be123c 60%, #9f1239 100%)', borderRadius: '4px', boxSizing: 'border-box', border: '1px solid #881337', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
                <div style={{ position: 'absolute', top: '18px', left: '0', width: '100%', height: '3px', backgroundColor: '#fbbf24', opacity: 0.8 }}></div>
              </div>
              <div className="animate-wheels" style={{ position: 'absolute', bottom: '0', left: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}>
                <div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div>
                <div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div>
                <div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div>
              </div>
              <div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}>
                <div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div>
                <div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div>
                <div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Vehicles */}
        {/* Customer Service Van */}
        <div className="animate-car-right animation-delay-500" style={{ position: 'absolute', top: '15%', marginTop: '15px', left: '-140px', width: '140px', height: '65px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '40px', background: 'linear-gradient(to bottom, #3b82f6 0%, #2563eb 70%, #1d4ed8 100%)', borderRadius: '10px 12px 6px 6px', border: '1px solid #1e40af', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.2), inset 2px 0 6px rgba(255, 255, 255, 0.3)' }}></div>
            <div style={{ position: 'absolute', top: '8px', left: '40px', right: '8px', height: '25px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '4px', border: '2px solid #1e40af', boxShadow: 'inset 0 0 8px rgba(255, 255, 255, 0.6)', overflow: 'hidden' }}></div>
            <div style={{ position: 'absolute', top: '35px', left: '50%', transform: 'translateX(-50%)', width: '40px', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #1e40af', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}>
              <div style={{ fontSize: '4px', fontWeight: 'bold', color: '#1e40af' }}>SUPPORT</div>
            </div>
            {/* Wheels */}
            <div style={{ position: 'absolute', bottom: '-7px', left: '18px', width: '18px', height: '18px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}>
              <div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div>
            </div>
            <div style={{ position: 'absolute', bottom: '-7px', right: '18px', width: '18px', height: '18px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}>
              <div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240px, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div>
            </div>
            {/* Blinking Lights */}
            <div className="animate-light-blink animation-delay-100" style={{ position: 'absolute', top: '3px', left: '5px', width: '6px', height: '6px', background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%', border: '1px solid #1e40af', boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}></div>
            <div className="animate-light-blink animation-delay-600" style={{ position: 'absolute', top: '3px', right: '5px', width: '6px', height: '6px', background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%', border: '1px solid #1e40af', boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}></div>
          </div>
        </div>

        {/* Support Car going opposite direction */}
        <div className="animate-car-left animation-delay-2000" style={{ position: 'absolute', top: '60%', marginTop: '15px', right: '-100px', width: '100px', height: '45px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '25px', background: 'linear-gradient(to bottom, #10b981 0%, #059669 70%, #047857 100%)', borderRadius: '15px 10px 5px 5px', border: '1px solid #065f46', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.2), inset -2px 0 6px rgba(255, 255, 255, 0.3)' }}></div>
            <div style={{ position: 'absolute', top: '8px', right: '10px', width: '20px', height: '12px', background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '3px', border: '1px solid #065f46', boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.6)' }}></div>
            <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '25px', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #065f46', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
              <div style={{ fontSize: '3px', fontWeight: 'bold', color: '#065f46', fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif" }}>සේවා</div>
            </div>
            {/* Wheels */}
            <div style={{ position: 'absolute', bottom: '-5px', right: '20px', width: '16px', height: '16px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}>
              <div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div>
            </div>
            <div style={{ position: 'absolute', bottom: '-5px', left: '20px', width: '16px', height: '16px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}>
              <div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div>
            </div>
            {/* Blinking Lights */}
            <div className="animate-light-blink animation-delay-400" style={{ position: 'absolute', bottom: '15px', right: '8px', width: '4px', height: '4px', background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #065f46', boxShadow: '0 0 6px rgba(252, 211, 77, 0.6)' }}></div>
            <div className="animate-light-blink animation-delay-500" style={{ position: 'absolute', bottom: '8px', left: '5px', width: '6px', height: '4px', background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', borderRadius: '2px', border: '1px solid #065f46', boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)' }}></div>
          </div>
        </div>
      </div>

      {/* Navigation Bar with Glassmorphism */}
      <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ShieldCheckIcon width={32} height={32} color="#3b82f6" />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 4px 8px rgba(0, 0, 0, 0.7)' }}>
                <span style={{ fontSize: '2rem', marginRight: '0.5rem', textShadow: '0 4px 8px rgba(0, 0, 0, 0.7), 0 0 30px rgba(250, 204, 21, 0.4)' }}>🎧</span> CS Control Center
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Customer Service Dashboard {error && <span style={{ color: '#f59e0b' }}>⚠ Using fallback data</span>}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ThemeSwitcher />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} style={{ accentColor: '#3b82f6' }} />
              Auto Refresh
            </label>
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '6px',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                color: '#f9fafb',
                fontSize: '14px',
                backdropFilter: 'blur(8px)'
              }}
            >
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
            <div style={{ position: 'relative' }}>
              <BellIcon width={20} height={20} color="#F59E0B" />
              {alerts.length > 0 && <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', backgroundColor: '#ef4444', borderRadius: '50%', fontSize: '0.625rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{alerts.length}</div>}
            </div>
            <button 
              onClick={refreshData}
              disabled={refreshing}
              style={{
                padding: '8px 12px',
                backgroundColor: 'rgba(51, 65, 85, 0.8)',
                color: '#f9fafb',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                backdropFilter: 'blur(8px)',
                opacity: refreshing ? 0.5 : 1
              }}
            >
              {refreshing ? '↻' : '🔄'} Refresh
            </button>
            <button 
              onClick={() => router.push('/cs/tickets')} 
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📋 Tickets
            </button>
            <button 
              onClick={() => router.push('/cs/chat')} 
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              💬 Live Chat
            </button>
            <div style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>CS AGENT</div>
            <span style={{ color: '#94a3b8' }}>Welcome, {user?.name || 'Agent'} 👋</span>
            <button 
              onClick={logout} 
              style={{
                padding: '8px 16px',
                backgroundColor: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content with Animated Background */}
      <div style={{ width: '100%', minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 10 }}>
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
          
          {/* Error Display */}
          {error && (
            <div style={{ backgroundColor: currentThemeStyles.alertBg, border: '1px solid #f59e0b', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem', color: '#92400e', backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ExclamationTriangleIcon width={20} height={20} color="#f59e0b" />
                <strong>Warning:</strong> {error}
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                Displaying fallback data. Please check your backend server at <code>http://localhost:5000</code>
              </p>
              <button 
                onClick={() => setError(null)}
                style={{
                  fontSize: '14px',
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Main Statistics with Glassmorphism */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <StatCard 
              title="🎫 Open Tickets" 
              value={overview.tickets.open} 
              subtitle={`${overview.tickets.total} total tickets`}
              color="#ef4444"
              theme={currentThemeStyles}
            />
            <StatCard 
              title="💬 Active Chats" 
              value={overview.chats.active} 
              subtitle={`${overview.chats.total} total chats`}
              color="#10b981"
              theme={currentThemeStyles}
            />
            <StatCard 
              title="⭐ Avg. Satisfaction" 
              value={`${(overview.satisfaction.avgSatisfaction * 20).toFixed(1)}%`} 
              color="#3b82f6"
              subtitle={`${overview.satisfaction.totalRatings} ratings`}
              theme={currentThemeStyles}
            />
            <StatCard 
              title="📊 Your Active Tasks" 
              value={overview.agentWorkload.assignedTickets + overview.agentWorkload.activeChats} 
              color="#8b5cf6"
              subtitle={`${overview.agentWorkload.assignedTickets} tickets, ${overview.agentWorkload.activeChats} chats`}
              theme={currentThemeStyles}
            />
          </div>

          {/* Performance Metrics with Glassmorphism */}
          {performance && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{
                backgroundColor: currentThemeStyles.glassPanelBg,
                padding: '24px',
                borderRadius: '12px',
                boxShadow: currentThemeStyles.glassPanelShadow,
                backdropFilter: 'blur(12px)',
                border: currentThemeStyles.glassPanelBorder
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '16px' }}>
                  🎯 Your Performance (Last {period} days)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                      {performance.tickets.totalHandled}
                    </div>
                    <div style={{ fontSize: '14px', color: currentThemeStyles.textMuted }}>Tickets Handled</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                      {performance.tickets.resolved}
                    </div>
                    <div style={{ fontSize: '14px', color: currentThemeStyles.textMuted }}>Resolved</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                      {performance.tickets.avgResolutionTime ? `${performance.tickets.avgResolutionTime.toFixed(1)}h` : 'N/A'}
                    </div>
                    <div style={{ fontSize: '14px', color: currentThemeStyles.textMuted }}>Avg Resolution</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                      {performance.tickets.avgSatisfaction ? `${(performance.tickets.avgSatisfaction * 20).toFixed(1)}%` : 'N/A'}
                    </div>
                    <div style={{ fontSize: '14px', color: currentThemeStyles.textMuted }}>Satisfaction</div>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: currentThemeStyles.glassPanelBg,
                padding: '24px',
                borderRadius: '12px',
                boxShadow: currentThemeStyles.glassPanelShadow,
                backdropFilter: 'blur(12px)',
                border: currentThemeStyles.glassPanelBorder
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '16px' }}>
                  💬 Chat Performance
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                      {performance.chats.totalChats}
                    </div>
                    <div style={{ fontSize: '14px', color: currentThemeStyles.textMuted }}>Chats Handled</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                      {performance.chats.avgDuration ? `${Math.round(performance.chats.avgDuration / 60)}m` : 'N/A'}
                    </div>
                    <div style={{ fontSize: '14px', color: currentThemeStyles.textMuted }}>Avg Duration</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                      {performance.chats.avgResponseTime ? `${Math.round(performance.chats.avgResponseTime)}s` : 'N/A'}
                    </div>
                    <div style={{ fontSize: '14px', color: currentThemeStyles.textMuted }}>Response Time</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                      {performance.chats.avgSatisfaction ? `${(performance.chats.avgSatisfaction * 20).toFixed(1)}%` : 'N/A'}
                    </div>
                    <div style={{ fontSize: '14px', color: currentThemeStyles.textMuted }}>Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Alerts with Glassmorphism */}
          {alerts.length > 0 && (
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(12px)',
              border: currentThemeStyles.glassPanelBorder,
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.5rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ExclamationTriangleIcon width={24} height={24} color="#f59e0b" />
                  System Alerts
                </h2>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                  <span style={{ color: '#ef4444' }}>{alerts.filter(a => a.priority === 'critical').length} Critical</span>
                  <span style={{ color: '#f59e0b' }}>{alerts.filter(a => a.priority === 'high').length} High</span>
                  <span style={{ color: '#3b82f6' }}>{alerts.filter(a => a.priority === 'low').length} Low</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {alerts.map((alert, index) => (
                  <div 
                    key={index} 
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      borderLeft: '4px solid',
                      borderLeftColor: alert.priority === 'critical' ? '#ef4444' : 
                                       alert.priority === 'high' ? '#f97316' : '#f59e0b',
                      backgroundColor: currentThemeStyles.alertBg,
                      backdropFilter: 'blur(8px)',
                      color: alert.priority === 'critical' ? '#dc2626' : 
                             alert.priority === 'high' ? '#ea580c' : '#d97706'
                    }}
                  >
                    <div style={{ fontWeight: '600' }}>
                      {alert.priority.toUpperCase()}: {alert.message}
                    </div>
                    <div style={{ fontSize: '14px', marginTop: '4px' }}>{alert.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Queues with Glassmorphism */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <QueuePanel 
              title="🚨 Urgent Tickets" 
              items={queues.urgent} 
              type="ticket"
              onItemClick={(item) => router.push(`/cs/tickets/${item._id}`)}
              theme={currentThemeStyles}
            />
            <QueuePanel 
              title="⏳ Waiting Chats" 
              items={queues.waiting} 
              type="chat"
              onItemClick={() => router.push(`/cs/chat`)}
              theme={currentThemeStyles}
            />
            <QueuePanel 
              title="⬆️ Escalated Tickets" 
              items={queues.escalated} 
              type="ticket"
              onItemClick={(item) => router.push(`/cs/tickets/${item._id}`)}
              theme={currentThemeStyles}
            />
          </div>

          {/* Recent Activity with Glassmorphism */}
          {recentActivity && recentActivity.length > 0 && (
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '24px',
              borderRadius: '12px',
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(12px)',
              border: currentThemeStyles.glassPanelBorder
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '16px' }}>
                📝 Recent Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: currentThemeStyles.alertBg,
                    borderRadius: '8px',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: currentThemeStyles.textPrimary }}>
                        {activity.action} by {activity.userId?.name || 'Unknown User'}
                      </div>
                      <div style={{ fontSize: '12px', color: currentThemeStyles.textMuted }}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8',
                      padding: '4px 8px',
                      borderRadius: '12px'
                    }}>
                      {activity.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components with Glassmorphism
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  color,
  theme 
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  theme: any;
}) => (
  <div style={{
    padding: '2rem',
    backgroundColor: theme.glassPanelBg,
    borderRadius: '1rem',
    boxShadow: theme.glassPanelShadow,
    backdropFilter: 'blur(12px)',
    border: theme.glassPanelBorder,
    transition: 'transform 0.2s, box-shadow 0.2s'
  }}
  className="animate-fade-in-up"
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = theme.glassPanelShadow;
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: '500', color: theme.textMuted, margin: '0 0 8px 0' }}>
          {title}
        </h3>
        <p style={{ fontSize: '32px', fontWeight: 'bold', color, margin: '0 0 4px 0' }}>
          {value}
        </p>
        {subtitle && (
          <p style={{ fontSize: '14px', color: theme.textMuted, margin: 0 }}>{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

const QueuePanel = ({ 
  title, 
  items, 
  type, 
  onItemClick,
  theme 
}: { 
  title: string;
  items: QueueItem[];
  type: 'ticket' | 'chat';
  onItemClick: (item: QueueItem) => void;
  theme: any;
}) => (
  <div style={{
    padding: '24px',
    backgroundColor: theme.glassPanelBg,
    borderRadius: '12px',
    boxShadow: theme.glassPanelShadow,
    backdropFilter: 'blur(12px)',
    border: theme.glassPanelBorder
  }}
  className="animate-fade-in-up">
    <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.textPrimary, margin: '0 0 16px 0' }}>
      {title}
    </h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.length > 0 ? items.map(item => (
        <div 
          key={item._id} 
          onClick={() => onItemClick(item)}
          style={{
            padding: '12px',
            borderLeft: '4px solid #3b82f6',
            backgroundColor: theme.alertBg,
            borderRadius: '0 8px 8px 0',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backdropFilter: 'blur(8px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.alertBg;
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <p style={{ fontWeight: '500', color: theme.textPrimary, margin: '0 0 4px 0' }}>
            {type === 'ticket' ? item.subject : `Chat with ${item.customerInfo?.name || 'Customer'}`}
          </p>
          <p style={{ fontSize: '12px', color: theme.textMuted, margin: '0 0 8px 0' }}>
            {type === 'ticket' ? `ID: ${item.ticketId}` : `Session: ${item.sessionId}`}
          </p>
          {item.priority && (
            <span style={{
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: item.priority === 'urgent' ? '#fee2e2' : 
                               item.priority === 'high' ? '#fed7aa' : '#dbeafe',
              color: item.priority === 'urgent' ? '#dc2626' : 
                     item.priority === 'high' ? '#ea580c' : '#1d4ed8'
            }}>
              {item.priority}
            </span>
          )}
        </div>
      )) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: theme.textMuted }}>
          <CheckCircleIcon width={48} height={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
          <p style={{ margin: 0 }}>Queue is empty 📭</p>
        </div>
      )}
    </div>
  </div>
);