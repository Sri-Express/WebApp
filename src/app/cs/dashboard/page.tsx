// app/cs/dashboard/page.tsx - CLEAN VERSION THAT ACTUALLY LOOKS GOOD
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    urgent: any[];
    waiting: any[];
    escalated: any[];
  };
  alerts: any[];
  recentActivity?: any[];
}

export default function CSDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [period, setPeriod] = useState('7');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('cs_token');
    const userData = localStorage.getItem('cs_user');
    if (!token || !userData) {
      router.push('/cs/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchDashboardData(token);
  }, [period, router]);

  const fetchDashboardData = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/dashboard?period=${period}`, {
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
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '18px' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Dashboard Error</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>{error}</p>
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
    );
  }

  if (!data) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '16px' }}>No data available</p>
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
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Add CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingBottom: '24px', 
        marginBottom: '24px', 
        borderBottom: '1px solid #e2e8f0' 
      }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' }}>
            🎧 CS Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <p style={{ color: '#64748b', margin: 0 }}>
              Welcome back, {user?.name || 'Agent'} 👋
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#10b981'
              }}></div>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Connected</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              fontSize: '14px'
            }}
          >
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
          <button 
            onClick={refreshData}
            disabled={refreshing}
            style={{
              padding: '8px 12px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
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
          <button 
            onClick={logout} 
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
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
      </header>

      {/* Error Display */}
      {error && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#dc2626',
          borderRadius: '8px'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>{error}</p>
          <button 
            onClick={() => setError(null)}
            style={{
              fontSize: '14px',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '24px', 
        marginBottom: '32px' 
      }}>
        <StatCard 
          title="🎫 Open Tickets" 
          value={overview.tickets.open} 
          total={overview.tickets.total}
          color="#ef4444"
          subtitle={`${overview.tickets.total} total tickets`}
        />
        <StatCard 
          title="💬 Active Chats" 
          value={overview.chats.active} 
          total={overview.chats.total}
          color="#10b981"
          subtitle={`${overview.chats.total} total chats`}
        />
        <StatCard 
          title="⭐ Avg. Satisfaction" 
          value={`${(overview.satisfaction.avgSatisfaction * 20).toFixed(1)}%`} 
          color="#3b82f6"
          subtitle={`${overview.satisfaction.totalRatings} ratings`}
        />
        <StatCard 
          title="📊 Your Active Tasks" 
          value={overview.agentWorkload.assignedTickets + overview.agentWorkload.activeChats} 
          color="#8b5cf6"
          subtitle={`${overview.agentWorkload.assignedTickets} tickets, ${overview.agentWorkload.activeChats} chats`}
        />
      </div>

      {/* Performance Metrics */}
      {performance && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
              🎯 Your Performance (Last {period} days)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                  {performance.tickets.totalHandled}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Tickets Handled</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                  {performance.tickets.resolved}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Resolved</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {performance.tickets.avgResolutionTime ? `${performance.tickets.avgResolutionTime.toFixed(1)}h` : 'N/A'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Avg Resolution</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {performance.tickets.avgSatisfaction ? `${(performance.tickets.avgSatisfaction * 20).toFixed(1)}%` : 'N/A'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Satisfaction</div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
              💬 Chat Performance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                  {performance.chats.totalChats}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Chats Handled</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                  {performance.chats.avgDuration ? `${Math.round(performance.chats.avgDuration / 60)}m` : 'N/A'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Avg Duration</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {performance.chats.avgResponseTime ? `${Math.round(performance.chats.avgResponseTime)}s` : 'N/A'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Response Time</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {performance.chats.avgSatisfaction ? `${(performance.chats.avgSatisfaction * 20).toFixed(1)}%` : 'N/A'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
            🚨 System Alerts
          </h2>
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
                  backgroundColor: alert.priority === 'critical' ? '#fef2f2' : 
                                   alert.priority === 'high' ? '#fff7ed' : '#fffbeb',
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

      {/* Priority Queues */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        <QueuePanel 
          title="🚨 Urgent Tickets" 
          items={queues.urgent} 
          type="ticket"
          onItemClick={(item) => router.push(`/cs/tickets/${item._id}`)}
        />
        <QueuePanel 
          title="⏳ Waiting Chats" 
          items={queues.waiting} 
          type="chat"
          onItemClick={(item) => router.push(`/cs/chat`)}
        />
        <QueuePanel 
          title="⬆️ Escalated Tickets" 
          items={queues.escalated} 
          type="ticket"
          onItemClick={(item) => router.push(`/cs/tickets/${item._id}`)}
        />
      </div>

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
            📝 Recent Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                    {activity.action} by {activity.userId?.name || 'Unknown User'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
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
  );
}

// Helper Components
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  color 
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
}) => (
  <div style={{
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
  }}>
    <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 8px 0' }}>
      {title}
    </h3>
    <p style={{ fontSize: '32px', fontWeight: 'bold', color, margin: '0 0 4px 0' }}>
      {value}
    </p>
    {subtitle && (
      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{subtitle}</p>
    )}
  </div>
);

const QueuePanel = ({ 
  title, 
  items, 
  type, 
  onItemClick 
}: { 
  title: string;
  items: any[];
  type: 'ticket' | 'chat';
  onItemClick: (item: any) => void;
}) => (
  <div style={{
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }}>
    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px 0' }}>
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
            backgroundColor: '#f8fafc',
            borderRadius: '0 8px 8px 0',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e2e8f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
          }}
        >
          <p style={{ fontWeight: '500', color: '#1e293b', margin: '0 0 4px 0' }}>
            {type === 'ticket' ? item.subject : `Chat with ${item.customerInfo?.name || 'Customer'}`}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>
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
        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', padding: '16px' }}>
          Queue is empty 📭
        </p>
      )}
    </div>
  </div>
);