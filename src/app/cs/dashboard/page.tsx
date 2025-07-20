'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define interfaces for type safety
interface TicketSummary {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  total: number;
}

interface ChatSummary {
  waiting: number;
  active: number;
  ended: number;
  total: number;
  avgDuration: number;
}

interface DashboardData {
  overview: {
    tickets: TicketSummary;
    chats: ChatSummary;
    agentWorkload: { assignedTickets: number; activeChats: number; };
    satisfaction: { avgSatisfaction: number; totalRatings: number; };
  };
  performance: any;
  queues: { urgent: any[]; waiting: any[]; escalated: any[]; };
  alerts: any[];
  recentActivity: any[];
}

export default function CSDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    const userData = localStorage.getItem('cs_user');
    if (!token || !userData) {
      router.push('/cs/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchDashboardData(token);
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/dashboard`, {
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

  const logout = () => {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
    router.push('/cs/login');
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-8 text-center">No data available.</div>;

  const { overview, queues, alerts } = data;

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between pb-6 mb-6 border-b border-gray-300 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CS Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name || 'Agent'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/cs/tickets')} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Tickets</button>
          <button onClick={() => router.push('/cs/chat')} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Live Chat</button>
          <button onClick={logout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Logout</button>
        </div>
      </header>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Open Tickets" value={overview.tickets.open} change={-3} changeType="decrease" />
        <StatCard title="Active Chats" value={overview.chats.active} change={1} changeType="increase" />
        <StatCard title="Avg. Satisfaction" value={`${(overview.satisfaction.avgSatisfaction * 20).toFixed(1)}%`} change={0.5} changeType="increase" />
        <StatCard title="Your Active Tasks" value={overview.agentWorkload.assignedTickets + overview.agentWorkload.activeChats} change={2} changeType="increase" />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">System Alerts</h2>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-md ${alert.priority === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <strong>{alert.priority.toUpperCase()}:</strong> {alert.message} - <em>{alert.action}</em>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Queues */}
      <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-3">
        <QueuePanel title="Urgent Tickets" items={queues.urgent} type="ticket" />
        <QueuePanel title="Waiting Chats" items={queues.waiting} type="chat" />
        <QueuePanel title="Escalated Tickets" items={queues.escalated} type="ticket" />
      </div>
    </div>
  );
}

// Helper components for a cleaner dashboard
const StatCard = ({ title, value, change, changeType }: { title: string, value: string | number, change: number, changeType: 'increase' | 'decrease' }) => (
  <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const QueuePanel = ({ title, items, type }: { title: string, items: any[], type: 'ticket' | 'chat' }) => (
  <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
    <div className="space-y-3">
      {items.length > 0 ? items.map(item => (
        <div key={item._id} className="p-2 border-l-4 rounded-r-md bg-gray-50 dark:bg-gray-700 border-blue-500">
          <p className="font-medium text-gray-900 dark:text-white">{type === 'ticket' ? item.subject : `Chat with ${item.customerInfo.name}`}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{type === 'ticket' ? `ID: ${item.ticketId}` : `Session: ${item.sessionId}`}</p>
        </div>
      )) : <p className="text-sm text-gray-500 dark:text-gray-400">Queue is empty.</p>}
    </div>
  </div>
);