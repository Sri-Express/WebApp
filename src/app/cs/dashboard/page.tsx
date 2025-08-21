// app/cs/dashboard/page.tsx - REFACTORED VERSION
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/cs/components/AnimatedBackground'; // IMPORT THE NEW COMPONENT
import { TicketIcon, ChatBubbleLeftRightIcon, ArrowPathIcon, PowerIcon, StarIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

// --- Data Interfaces ---
interface User { name: string; }
interface AlertItem { priority: 'critical' | 'high' | 'low'; message: string; action: string; }
interface QueueItem { _id: string; subject?: string; customerInfo?: { name: string; }; ticketId?: string; sessionId?: string; priority?: 'urgent' | 'high' | 'normal'; }
interface ActivityItem { action: string; userId?: { name: string; }; timestamp: string; category: string; }
interface DashboardData {
  overview: {
    tickets: { open: number; in_progress: number; resolved: number; closed: number; total: number; };
    chats: { waiting: number; active: number; ended: number; total: number; avgDuration: number; };
    agentWorkload: { assignedTickets: number; activeChats: number; };
    satisfaction: { avgSatisfaction: number; totalRatings: number; };
  };
  performance?: {
    tickets: { totalHandled: number; resolved: number; avgResolutionTime: number; avgSatisfaction: number; };
    chats: { totalChats: number; avgDuration: number; avgResponseTime: number; avgSatisfaction: number; };
  };
  queues: { urgent: QueueItem[]; waiting: QueueItem[]; escalated: QueueItem[]; };
  alerts: AlertItem[];
  recentActivity?: ActivityItem[];
}

export default function CSDashboard() {
  const { theme } = useTheme();
  const router = useRouter();

  // --- State Management ---
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [period, setPeriod] = useState('7');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- Data Fetching ---
  const fetchDashboardData = useCallback(async (token: string, isRefresh: boolean = false) => {
    if (!isRefresh) setLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/dashboard?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
      const result = await response.json();
      if (result.success) setData(result.data);
      else throw new Error(result.message || 'An unknown error occurred');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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
  }, [fetchDashboardData, router]);

  const logout = () => {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
    router.push('/cs/login');
  };

  // --- Theme & Style Definitions ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', cardBg: 'rgba(249, 250, 251, 0.8)', cardBorder: '1px solid rgba(209, 213, 219, 0.5)', alertCriticalBg: 'rgba(254, 226, 226, 0.8)', alertHighBg: 'rgba(255, 247, 237, 0.8)', alertLowBg: 'rgba(255, 251, 235, 0.8)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', cardBg: 'rgba(51, 65, 85, 0.8)', cardBorder: '1px solid rgba(75, 85, 99, 0.5)', alertCriticalBg: 'rgba(153, 27, 27, 0.5)', alertHighBg: 'rgba(124, 45, 18, 0.5)', alertLowBg: 'rgba(113, 63, 18, 0.5)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
  
  // --- Animation styles for loading spinner ---
  const animationStyles = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
  `;

  // --- Loading & Error States ---
  if (loading || !data) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>{error ? `Error: ${error}` : 'Loading Dashboard...'}</p>
          {error && <button onClick={() => { const token = localStorage.getItem('cs_token'); if (token) fetchDashboardData(token); }} style={{ marginTop: '1rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer' }}>Retry</button>}
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { overview, performance, queues, alerts, recentActivity } = data;

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style jsx>{animationStyles}</style>
      
      {/* --- Use the Animated Background Component --- */}
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      {/* --- Navigation Bar --- */}
      <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ShieldCheckIcon width={32} height={32} color="#dc2626" />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span> E<span style={{ color: '#DC2626' }}>x</span>press Support
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Agent Command Center</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ThemeSwitcher />
            <span style={{ color: '#94a3b8' }}>Welcome, {user?.name || 'Agent'}</span>
            <button onClick={logout} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PowerIcon width={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main style={{ width: '100%', minHeight: 'calc(100vh - 90px)', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem', position: 'relative', zIndex: 5 }}>
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0, textShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.5)' : 'none' }}>Agent Dashboard</h2>
              <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0', fontSize: '1rem' }}>Your command center for all support activities.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ padding: '0.75rem', backgroundColor: currentThemeStyles.cardBg, border: currentThemeStyles.cardBorder, borderRadius: '0.5rem', fontSize: '1rem', color: currentThemeStyles.textPrimary, cursor: 'pointer' }}>
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
              <button onClick={() => fetchDashboardData(localStorage.getItem('cs_token') || '', true)} disabled={isRefreshing} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600', color: currentThemeStyles.textPrimary, backgroundColor: currentThemeStyles.cardBg, border: currentThemeStyles.cardBorder, borderRadius: '0.5rem', cursor: 'pointer', opacity: isRefreshing ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowPathIcon width={20} height={20} className={isRefreshing ? 'animate-spin' : ''}/> Refresh
              </button>
              <button onClick={() => router.push('/cs/chat')} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600', color: 'white', backgroundColor: '#10b981', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChatBubbleLeftRightIcon width={20} height={20}/> Live Chat
              </button>
              <button onClick={() => router.push('/cs/tickets')} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600', color: 'white', backgroundColor: '#3b82f6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>View Tickets</button>
            </div>
          </header>

          {/* Main Statistics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <StatCard title="Open Tickets" value={overview.tickets.open} icon={TicketIcon} color="#ef4444" subtitle={`${overview.tickets.total} total`} />
            <StatCard title="Active Chats" value={overview.chats.active} icon={ChatBubbleLeftRightIcon} color="#10b981" subtitle={`${overview.chats.total} total`} />
            <StatCard title="Avg. Satisfaction" value={`${(overview.satisfaction.avgSatisfaction * 20).toFixed(1)}%`} icon={StarIcon} color="#3b82f6" subtitle={`${overview.satisfaction.totalRatings} ratings`} />
            <StatCard title="Your Active Tasks" value={overview.agentWorkload.assignedTickets + overview.agentWorkload.activeChats} icon={ClockIcon} color="#8b5cf6" subtitle={`${overview.agentWorkload.assignedTickets} tickets, ${overview.agentWorkload.activeChats} chats`} />
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>🚨 System Alerts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {alerts.map((alert, index) => (
                  <div key={index} style={{ padding: '1rem', borderRadius: '0.75rem', borderLeft: '4px solid', borderLeftColor: alert.priority === 'critical' ? '#ef4444' : alert.priority === 'high' ? '#f97316' : '#f59e0b', backgroundColor: alert.priority === 'critical' ? currentThemeStyles.alertCriticalBg : alert.priority === 'high' ? currentThemeStyles.alertHighBg : currentThemeStyles.alertLowBg, color: alert.priority === 'critical' ? '#dc2626' : alert.priority === 'high' ? '#ea580c' : '#d97706', backdropFilter: 'blur(5px)' }}>
                    <div style={{ fontWeight: '600' }}>{alert.priority.toUpperCase()}: {alert.message}</div>
                    <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{alert.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Queues */}
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: '0 0 1.5rem 0' }}>Priority Queues</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <QueuePanel title="🚨 Urgent Tickets" items={queues.urgent} type="ticket" onItemClick={(item) => router.push(`/cs/tickets/${item._id}`)} />
              <QueuePanel title="⏳ Waiting Chats" items={queues.waiting} type="chat" onItemClick={() => router.push(`/cs/chat`)} />
              <QueuePanel title="⬆️ Escalated Tickets" items={queues.escalated} type="ticket" onItemClick={(item) => router.push(`/cs/tickets/${item._id}`)} />
            </div>
          </div>

          {/* Performance & Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {performance && (
              <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, marginBottom: '1.5rem' }}>🎯 Your Performance (Last {period} days)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <PerformanceMetric value={performance.tickets.totalHandled} label="Tickets Handled" color="#3b82f6" />
                  <PerformanceMetric value={performance.tickets.resolved} label="Resolved" color="#10b981" />
                  <PerformanceMetric value={performance.tickets.avgResolutionTime ? `${performance.tickets.avgResolutionTime.toFixed(1)}h` : 'N/A'} label="Avg Resolution" color="#8b5cf6" />
                  <PerformanceMetric value={performance.tickets.avgSatisfaction ? `${(performance.tickets.avgSatisfaction * 20).toFixed(1)}%` : 'N/A'} label="Satisfaction" color="#f59e0b" />
                </div>
              </div>
            )}
            {recentActivity && recentActivity.length > 0 && (
              <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, marginBottom: '1.5rem' }}>📝 Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: currentThemeStyles.cardBg, borderRadius: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: currentThemeStyles.textPrimary }}>{activity.action} by {activity.userId?.name || 'System'}</div>
                        <div style={{ fontSize: '0.75rem', color: currentThemeStyles.textMuted }}>{new Date(activity.timestamp).toLocaleString()}</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontWeight: '600' }}>{activity.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Helper Components ---
const StatCard = ({ title, value, subtitle, color, icon: Icon }: { title: string; value: string | number; subtitle?: string; color: string; icon: React.ElementType }) => {
  const { theme } = useTheme();
  const currentThemeStyles = theme === 'dark' ? { glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af' } : { glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563' };
  return (
    <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, transition: 'all 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Icon width={32} height={32} color={color} />
        <div>
          <h3 style={{ color: color, fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{value}</h3>
          <p style={{ color: currentThemeStyles.textPrimary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>{title}</p>
          {subtitle && <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

const QueuePanel = ({ title, items, type, onItemClick }: { title: string; items: QueueItem[]; type: 'ticket' | 'chat'; onItemClick: (item: QueueItem) => void; }) => {
  const { theme } = useTheme();
  const currentThemeStyles = theme === 'dark' ? { cardBg: 'rgba(51, 65, 85, 0.8)', cardHoverBg: 'rgba(75, 85, 99, 0.9)', textPrimary: '#f9fafb', textSecondary: '#9ca3af' } : { cardBg: 'rgba(249, 250, 251, 0.8)', cardHoverBg: 'rgba(243, 244, 246, 1)', textPrimary: '#1f2937', textSecondary: '#4B5563' };
  return (
    <div>
      <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: '0 0 1rem 0' }}>{title}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.length > 0 ? items.map(item => (
          <div key={item._id} onClick={() => onItemClick(item)} style={{ padding: '0.75rem', backgroundColor: currentThemeStyles.cardBg, borderRadius: '0.5rem', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentThemeStyles.cardHoverBg} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentThemeStyles.cardBg}>
            <p style={{ fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{type === 'ticket' ? item.subject : `Chat with ${item.customerInfo?.name || 'Customer'}`}</p>
            <p style={{ fontSize: '0.75rem', color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0' }}>{type === 'ticket' ? `ID: ${item.ticketId}` : `Session: ${item.sessionId}`}</p>
          </div>
        )) : <p style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary, textAlign: 'center', padding: '1rem', backgroundColor: currentThemeStyles.cardBg, borderRadius: '0.5rem' }}>Queue is empty 📭</p>}
      </div>
    </div>
  );
};

const PerformanceMetric = ({ value, label, color }: { value: string | number; label: string; color: string; }) => {
  const { theme } = useTheme();
  const textSecondary = theme === 'dark' ? '#9ca3af' : '#6b7280';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontSize: '0.875rem', color: textSecondary, marginTop: '0.25rem' }}>{label}</div>
    </div>
  );
};
