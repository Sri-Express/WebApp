// app/cs/tickets/page.tsx - REFACTORED VERSION
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/cs/components/AnimatedBackground'; // IMPORT THE NEW COMPONENT
import { TicketIcon, Squares2X2Icon, ArrowPathIcon, PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// --- Interfaces (Unchanged) ---
interface ITicket {
  _id: string;
  ticketId: string;
  subject: string;
  customerInfo: { name: string; email: string; };
  assignedAgent?: { name: string; };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

interface IPagination {
  current: number;
  pages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function CSTickets() {
  const router = useRouter();
  const { theme } = useTheme();

  // --- State Management (Unchanged) ---
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [pagination, setPagination] = useState<IPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ 
    status: '', 
    priority: '', 
    search: '', 
    page: '1' 
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- Data Fetching (Unchanged) ---
  const fetchTickets = useCallback(async (token: string, isRefresh: boolean = false) => {
    if (!isRefresh) setLoading(true);
    else setIsRefreshing(true);
    
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      params.append('limit', '15');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setTickets(result.data.tickets || []);
        setPagination(result.data.pagination || null);
      } else {
        throw new Error(result.message || 'Failed to load tickets');
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please check the API server.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      router.push('/cs/login');
      return;
    }
    fetchTickets(token);
  }, [fetchTickets, router]);

  // --- Event Handlers (Unchanged) ---
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: '1' }));
  };
  
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage.toString() }));
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '', search: '', page: '1' });
  };

  const refreshTickets = () => {
    const token = localStorage.getItem('cs_token');
    if (token) fetchTickets(token, true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('cs_token');
    router.push('/cs/login');
  };

  // --- Display & Color Logic (Unchanged) ---
  const getPriorityColor = (priority: string) => ({ 'urgent': '#dc2626', 'high': '#ea580c', 'medium': '#2563eb', 'low': '#6b7280' }[priority] || '#6b7280');
  const getStatusColor = (status: string) => ({ 'open': '#dc2626', 'in_progress': '#d97706', 'pending_customer': '#2563eb', 'resolved': '#16a34a', 'closed': '#6b7280' }[status] || '#6b7280');
  const getStatusDisplay = (status: string) => ({ 'open': '🔴 Open', 'in_progress': '🟡 In Progress', 'pending_customer': '🔵 Pending Customer', 'resolved': '🟢 Resolved', 'closed': '⚪ Closed' }[status] || status);
  const getPriorityDisplay = (priority: string) => ({ 'urgent': '🚨 Urgent', 'high': '🔴 High', 'medium': '🟡 Medium', 'low': '🟢 Low' }[priority] || priority);

  // --- Theme & Style Definitions ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', inputBg: 'rgba(249, 250, 251, 0.8)', inputBorder: '1px solid rgba(209, 213, 219, 0.5)', tableHeaderBg: 'rgba(249, 250, 251, 0.6)', tableRowHover: 'rgba(249, 250, 251, 0.9)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', inputBg: 'rgba(51, 65, 85, 0.8)', inputBorder: '1px solid rgba(75, 85, 99, 0.5)', tableHeaderBg: 'rgba(51, 65, 85, 0.6)', tableRowHover: 'rgba(51, 65, 85, 0.9)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
  
  // --- Animation styles for UI elements ---
  const animationStyles = `
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .animate-spin { animation: spin 1s linear infinite; }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
  `;

  // --- Loading State ---
  if (loading) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading tickets...</p>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style jsx>{animationStyles}</style>
      
      {/* --- Use the Animated Background Component --- */}
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      {/* --- Navigation Bar --- */}
      <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 clamp(1rem, 3vw, 1.5rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)', minWidth: '200px' }}>
            <TicketIcon width={32} height={32} color="#3b82f6" />
            <div>
              <h1 style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
                <span style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', marginRight: '0.5rem' }}>ශ්‍රී</span> E<span style={{ color: '#DC2626' }}>x</span>press Support
              </h1>
              <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#94a3b8', margin: 0 }}>Customer Service Ticket Queue</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ThemeSwitcher />
            <button onClick={() => router.push('/cs/dashboard')} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Squares2X2Icon width={16} height={16}/> Dashboard</button>
            <button onClick={handleLogout} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main style={{ width: '100%', minHeight: 'calc(100vh - 90px)', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem', position: 'relative', zIndex: 5 }}>
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
          
          {/* Header */}
          <header style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '2rem',
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '1.5rem',
            borderRadius: '1rem',
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)',
            border: currentThemeStyles.glassPanelBorder
          }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0, textShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.5)' : 'none' }}>Ticket Queue</h2>
              <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0', fontSize: '1rem' }}>Manage all customer support tickets and requests.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => router.push('/cs/tickets/create')} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600', color: 'white', backgroundColor: '#3b82f6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}><PlusIcon width={20} height={20}/> Create Ticket</button>
            </div>
          </header>

          {/* Error Display */}
          {error && (
            <div style={{ backgroundColor: 'rgba(254, 226, 226, 0.8)', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem', color: '#b91c1c', backdropFilter: 'blur(5px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ExclamationTriangleIcon width={20} height={20} /><strong>Error:</strong> {error}</div>
            </div>
          )}

          {/* Filters */}
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0 }}>🔍 Filters</h3>
              <button onClick={clearFilters} style={{ fontSize: '0.875rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear All</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <input type="text" name="search" placeholder="Search by ID, subject, customer..." value={filters.search} onChange={handleFilterChange} style={{ padding: '0.75rem', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', fontSize: '1rem', color: currentThemeStyles.textPrimary }} />
              <select name="status" value={filters.status} onChange={handleFilterChange} style={{ padding: '0.75rem', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', fontSize: '1rem', color: currentThemeStyles.textPrimary }}>
                <option value="">All Statuses</option><option value="open">🔴 Open</option><option value="in_progress">🟡 In Progress</option><option value="pending_customer">🔵 Pending Customer</option><option value="resolved">🟢 Resolved</option><option value="closed">⚪ Closed</option>
              </select>
              <select name="priority" value={filters.priority} onChange={handleFilterChange} style={{ padding: '0.75rem', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', fontSize: '1rem', color: currentThemeStyles.textPrimary }}>
                <option value="">All Priorities</option><option value="urgent">🚨 Urgent</option><option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option>
              </select>
              {pagination && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: currentThemeStyles.textSecondary }}>📊 {tickets.length} of {pagination.total} tickets</div>}
            </div>
          </div>

          {/* Tickets List */}
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, overflow: 'hidden' }}>
            {tickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: currentThemeStyles.textSecondary }}>
                <TicketIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '0.5rem' }}>No Tickets Found</h3>
                <p>No tickets match the current filters. Try clearing the filters to see all tickets.</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '1rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ fontSize: '0.75rem', textTransform: 'uppercase', backgroundColor: currentThemeStyles.tableHeaderBg, color: currentThemeStyles.textSecondary }}>
                        {['Ticket ID', 'Subject', 'Customer', 'Status', 'Priority', 'Assigned To', 'Last Updated', 'Actions'].map(h => <th key={h} style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600' }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map(ticket => (
                        <tr key={ticket._id} style={{ borderBottom: `1px solid ${currentThemeStyles.inputBorder}`, transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = currentThemeStyles.tableRowHover} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}><Link href={`/cs/tickets/${ticket._id}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>#{ticket.ticketId}</Link></td>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: currentThemeStyles.textPrimary, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <div style={{ fontWeight: '600', color: currentThemeStyles.textPrimary }}>{ticket.customerInfo.name}</div>
                            <div style={{ fontSize: '0.875rem', color: currentThemeStyles.textMuted }}>{ticket.customerInfo.email}</div>
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}><span style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', fontWeight: '600', borderRadius: '9999px', backgroundColor: getStatusColor(ticket.status) + '20', color: getStatusColor(ticket.status) }}>{getStatusDisplay(ticket.status)}</span></td>
                          <td style={{ padding: '1rem 1.5rem' }}><span style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', fontWeight: '600', borderRadius: '9999px', backgroundColor: getPriorityColor(ticket.priority) + '20', color: getPriorityColor(ticket.priority) }}>{getPriorityDisplay(ticket.priority)}</span></td>
                          <td style={{ padding: '1rem 1.5rem', color: currentThemeStyles.textSecondary }}>{ticket.assignedAgent?.name ? `👤 ${ticket.assignedAgent.name}` : <span style={{ fontStyle: 'italic' }}>Unassigned</span>}</td>
                          <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: currentThemeStyles.textMuted }}>{new Date(ticket.updatedAt).toLocaleString()}</td>
                          <td style={{ padding: '1rem 1.5rem' }}><Link href={`/cs/tickets/${ticket._id}`} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: '600', color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', textDecoration: 'none' }}>View</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pagination && pagination.pages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: `1px solid ${currentThemeStyles.inputBorder}` }}>
                    <span style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary }}>Page {pagination.current} of {pagination.pages}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handlePageChange(pagination.current - 1)} disabled={!pagination.hasPrev || isRefreshing} style={{ padding: '0.5rem 1rem', border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', cursor: 'pointer', opacity: !pagination.hasPrev || isRefreshing ? 0.5 : 1, backgroundColor: 'transparent', color: currentThemeStyles.textPrimary }}>Previous</button>
                      <button onClick={() => handlePageChange(pagination.current + 1)} disabled={!pagination.hasNext || isRefreshing} style={{ padding: '0.5rem 1rem', border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', cursor: 'pointer', opacity: !pagination.hasNext || isRefreshing ? 0.5 : 1, backgroundColor: 'transparent', color: currentThemeStyles.textPrimary }}>Next</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
