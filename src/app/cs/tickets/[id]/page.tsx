// app/cs/tickets/[id]/page.tsx - REFACTORED VERSION
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/cs/components/AnimatedBackground';
import { ArrowLeftIcon, Squares2X2Icon, TicketIcon, UserCircleIcon, CalendarDaysIcon, PencilSquareIcon, CheckCircleIcon, ArrowUpCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// --- Interfaces (Updated to match backend structure) ---
interface ITicket {
  _id: string;
  ticketId: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
  customerInfo: { name: string; email: string; phone?: string; previousTickets?: number; };
  assignedAgent?: { _id: string; name: string; email: string; role: string; };
  tags: string[];
  timeline: Array<{ _id?: string; action: string; note?: string; agent?: any; timestamp: string; systemGenerated?: boolean; }>;
  resolution?: { solution: string; resolvedAt: string; resolvedBy: any; customerSatisfaction?: number; feedback?: string; };
  escalation?: { escalated: boolean; escalatedAt?: string; reason?: string; escalatedTo?: string; escalatedBy?: any; };
  createdAt: string;
  updatedAt: string;
}

export default function TicketDetails() {
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();

  // --- State Management (Unchanged) ---
  const [ticket, setTicket] = useState<ITicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [showResolutionForm, setShowResolutionForm] = useState(false);

  // --- Logic and Handlers (Unchanged) ---
  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      router.push('/cs/login');
      return;
    }
    if (params.id) {
      fetchTicket(token, params.id as string);
    }
  }, [params.id, router]);

  const fetchTicket = async (token: string, ticketId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets/${ticketId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error(`Failed to fetch ticket: ${response.statusText}`);
      const result = await response.json();
      if (result.success) setTicket(result.data.ticket);
      else throw new Error(result.message || 'Failed to load ticket');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !ticket) return;
    setAddingNote(true);
    try {
      const token = localStorage.getItem('cs_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets/${ticket._id}/notes`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ note: newNote }) });
      if (response.ok) {
        setNewNote('');
        if (token) fetchTicket(token, ticket._id);
      } else throw new Error('Failed to add note');
    } catch (err) {
      setError('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!ticket) return;
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('cs_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets/${ticket._id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      if (response.ok) {
        if (token) fetchTicket(token, ticket._id);
      } else throw new Error('Failed to update status');
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const resolveTicket = async () => {
    if (!resolutionText.trim() || !ticket) return;
    setUpdatingStatus(true);
    setError(null); // Clear any previous errors
    try {
      const token = localStorage.getItem('cs_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets/${ticket._id}/resolve`, { 
        method: 'PUT', 
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        }, 
        body: JSON.stringify({ solution: resolutionText }) 
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setResolutionText('');
        setShowResolutionForm(false);
        if (token) fetchTicket(token, ticket._id);
        setError(null); // Clear any errors on success
      } else {
        throw new Error(result.message || 'Failed to resolve ticket');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve ticket';
      setError(`Resolve Error: ${errorMessage}`);
      console.error('Resolve ticket error:', err);
      // Don't redirect, just show the error and stay on the page
    } finally {
      setUpdatingStatus(false);
    }
  };

  const escalateTicket = async () => {
    if (!ticket) return;
    const reason = prompt('Please provide a reason for escalation:');
    if (!reason) return;
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('cs_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets/${ticket._id}/escalate`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
      if (response.ok) {
        if (token) fetchTicket(token, ticket._id);
      } else throw new Error('Failed to escalate ticket');
    } catch (err) {
      setError('Failed to escalate ticket');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // --- Theme & Style Definitions ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', inputBg: 'rgba(249, 250, 251, 0.8)', inputBorder: '1px solid rgba(209, 213, 219, 0.5)', tableHeaderBg: 'rgba(249, 250, 251, 0.6)', tableRowHover: 'rgba(249, 250, 251, 0.9)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', inputBg: 'rgba(51, 65, 85, 0.8)', inputBorder: '1px solid rgba(75, 85, 99, 0.5)', tableHeaderBg: 'rgba(51, 65, 85, 0.6)', tableRowHover: 'rgba(51, 65, 85, 0.9)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  const animationStyles = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`;

  // --- Display & Color Logic (Unchanged) ---
  const getPriorityColor = (priority: string) => ({ 'urgent': '#dc2626', 'high': '#ea580c', 'medium': '#2563eb', 'low': '#6b7280' }[priority] || '#6b7280');
  const getStatusColor = (status: string) => ({ 'open': '#dc2626', 'in_progress': '#d97706', 'pending_customer': '#2563eb', 'resolved': '#16a34a', 'closed': '#6b7280' }[status] || '#6b7280');
  const getStatusDisplay = (status: string) => ({ 'open': '🔴 Open', 'in_progress': '🟡 In Progress', 'pending_customer': '🔵 Pending Customer', 'resolved': '🟢 Resolved', 'closed': '⚪ Closed' }[status] || status);
  const getPriorityDisplay = (priority: string) => ({ 'urgent': '🚨 Urgent', 'high': '🔴 High', 'medium': '🟡 Medium', 'low': '🟢 Low' }[priority] || priority);

  if (loading) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading ticket...</p>
        </div>
        <style jsx>{animationStyles}</style>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentThemeStyles.textPrimary }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <ExclamationTriangleIcon width={48} height={48} style={{ margin: '0 auto 1rem', color: '#ef4444' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Ticket Not Found</h2>
          <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1.5rem' }}>{error || 'The requested ticket could not be found.'}</p>
          <Link href="/cs/tickets" style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '0.5rem' }}>Back to Tickets</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflowX: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style jsx>{animationStyles}</style>
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <TicketIcon width={32} height={32} color="#3b82f6" />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
                <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span> E<span style={{ color: '#DC2626' }}>x</span>press Support
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Ticket Details</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ThemeSwitcher />
            <button onClick={() => router.push('/cs/dashboard')} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Squares2X2Icon width={16} height={16}/> Dashboard</button>
          </div>
        </div>
      </nav>

      <main style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem', position: 'relative', zIndex: 5 }}>
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0 }}>Ticket #{ticket.ticketId}</h2>
              <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0', fontSize: '1rem' }}>{ticket.subject}</p>
            </div>
            <button onClick={() => router.push('/cs/tickets')} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600', color: currentThemeStyles.textPrimary, backgroundColor: currentThemeStyles.glassPanelBg, border: currentThemeStyles.glassPanelBorder, borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowLeftIcon width={20} height={20}/> Back to Queue</button>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Ticket Info */}
              <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><TicketIcon width={28} height={28} /> Ticket Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div><div style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary, marginBottom: '0.25rem' }}>Status</div><span style={{ padding: '0.25rem 0.75rem', fontSize: '1rem', fontWeight: '600', borderRadius: '9999px', backgroundColor: getStatusColor(ticket.status) + '20', color: getStatusColor(ticket.status) }}>{getStatusDisplay(ticket.status)}</span></div>
                  <div><div style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary, marginBottom: '0.25rem' }}>Priority</div><span style={{ padding: '0.25rem 0.75rem', fontSize: '1rem', fontWeight: '600', borderRadius: '9999px', backgroundColor: getPriorityColor(ticket.priority) + '20', color: getPriorityColor(ticket.priority) }}>{getPriorityDisplay(ticket.priority)}</span></div>
                  <div><div style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary, marginBottom: '0.25rem' }}>Category</div><div style={{ fontSize: '1rem', color: currentThemeStyles.textPrimary, textTransform: 'capitalize' }}>{ticket.category.replace('_', ' ')}</div></div>
                  <div><div style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary, marginBottom: '0.25rem' }}>Source</div><div style={{ fontSize: '1rem', color: currentThemeStyles.textPrimary, textTransform: 'capitalize' }}>Web Portal</div></div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary, marginBottom: '0.25rem' }}>Description</div>
                  <div style={{ fontSize: '1rem', color: currentThemeStyles.textPrimary, backgroundColor: currentThemeStyles.inputBg, padding: '1rem', borderRadius: '0.5rem', whiteSpace: 'pre-wrap', border: currentThemeStyles.inputBorder }}>{ticket.description}</div>
                </div>
                {ticket.tags.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>Tags</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {ticket.tags.map(tag => <span key={tag} style={{ padding: '0.25rem 0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', fontSize: '0.875rem', fontWeight: '600', borderRadius: '9999px' }}>{tag}</span>)}
                    </div>
                  </div>
                )}
              </div>

              {/* Resolution */}
              {ticket.resolution && (
                <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: `1px solid ${getStatusColor('resolved')}` }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: getStatusColor('resolved'), marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircleIcon width={28} height={28} /> Resolution</h3>
                  <div style={{ fontSize: '1rem', color: currentThemeStyles.textPrimary, backgroundColor: currentThemeStyles.inputBg, padding: '1rem', borderRadius: '0.5rem', marginBottom: '0.5rem', border: currentThemeStyles.inputBorder }}>{ticket.resolution.solution}</div>
                  <div style={{ fontSize: '0.875rem', color: currentThemeStyles.textMuted }}>Resolved on {new Date(ticket.resolution.resolvedAt).toLocaleString()}{ticket.resolution.customerSatisfaction && ` • Customer Rating: ${'⭐'.repeat(ticket.resolution.customerSatisfaction)}`}</div>
                </div>
              )}

              {/* Timeline */}
              <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CalendarDaysIcon width={28} height={28} /> Timeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {ticket.timeline.map((item, index) => (
                    <div key={item._id || index} style={{ display: 'flex', gap: '1rem', paddingBottom: index < ticket.timeline.length - 1 ? '1rem' : '0', borderBottom: index < ticket.timeline.length - 1 ? `1px solid ${currentThemeStyles.inputBorder}` : 'none' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6', marginTop: '0.5rem', flexShrink: 0 }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1rem', fontWeight: '500', color: currentThemeStyles.textPrimary, marginBottom: '0.25rem', textTransform: 'capitalize' }}>{item.action.replace('_', ' ')}</div>
                        {item.note && <div style={{ fontSize: '1rem', color: currentThemeStyles.textSecondary, marginBottom: '0.25rem' }}>{item.note}</div>}
                        <div style={{ fontSize: '0.875rem', color: currentThemeStyles.textMuted }}>
                          {item.systemGenerated ? 'System' : (item.agent?.name || 'Agent')} • {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Note */}
              <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><PencilSquareIcon width={28} height={28} /> Add Note</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={4} style={{ width: '100%', padding: '0.75rem', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', fontSize: '1rem', color: currentThemeStyles.textPrimary, resize: 'vertical' }} placeholder="Add a note to the ticket timeline..." />
                  <button onClick={addNote} disabled={!newNote.trim() || addingNote} style={{ alignSelf: 'flex-start', padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: !newNote.trim() || addingNote ? 'not-allowed' : 'pointer', opacity: !newNote.trim() || addingNote ? 0.5 : 1, fontWeight: 600 }}>{addingNote ? 'Adding...' : 'Add Note'}</button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '2rem' }}>
              <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><UserCircleIcon width={24} height={24} /> Customer</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div><div style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary }}>Name</div><div style={{ fontSize: '1rem', color: currentThemeStyles.textPrimary, fontWeight: '500' }}>{ticket.customerInfo.name}</div></div>
                  <div><div style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary }}>Email</div><div style={{ fontSize: '1rem', color: currentThemeStyles.textPrimary }}>{ticket.customerInfo.email}</div></div>
                  {ticket.customerInfo.phone && <div><div style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary }}>Phone</div><div style={{ fontSize: '1rem', color: currentThemeStyles.textPrimary }}>{ticket.customerInfo.phone}</div></div>}
                  {ticket.customerInfo.previousTickets !== undefined && <div><div style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary }}>Previous Tickets</div><div style={{ fontSize: '1rem', color: currentThemeStyles.textPrimary }}>{ticket.customerInfo.previousTickets}</div></div>}
                </div>
              </div>

              <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1.5rem' }}>⚡ Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {ticket.status === 'open' && <button onClick={() => updateStatus('in_progress')} disabled={updatingStatus} style={{ padding: '0.75rem', backgroundColor: getStatusColor('in_progress'), color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Start Progress</button>}
                  {ticket.status === 'in_progress' && <>
                    <button onClick={() => setShowResolutionForm(!showResolutionForm)} style={{ padding: '0.75rem', backgroundColor: getStatusColor('resolved'), color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Resolve Ticket</button>
                    <button onClick={() => updateStatus('pending_customer')} disabled={updatingStatus} style={{ padding: '0.75rem', backgroundColor: getStatusColor('pending_customer'), color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Set to Pending</button>
                  </>}
                  {!ticket.escalation?.escalated && ticket.status !== 'resolved' && ticket.status !== 'closed' && <button onClick={escalateTicket} disabled={updatingStatus} style={{ padding: '0.75rem', backgroundColor: getPriorityColor('urgent'), color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Escalate</button>}
                  {ticket.status === 'resolved' && <button onClick={() => updateStatus('closed')} disabled={updatingStatus} style={{ padding: '0.75rem', backgroundColor: getStatusColor('closed'), color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Close Ticket</button>}
                </div>
                {showResolutionForm && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: currentThemeStyles.inputBg, borderRadius: '0.5rem', border: `1px solid ${getStatusColor('resolved')}` }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: getStatusColor('resolved'), marginBottom: '0.5rem' }}>Resolve Ticket</h4>
                    <textarea value={resolutionText} onChange={(e) => setResolutionText(e.target.value)} rows={3} style={{ width: '100%', padding: '0.5rem', border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', fontSize: '1rem', resize: 'vertical', marginBottom: '0.5rem', backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary }} placeholder="Describe the solution..." />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={resolveTicket} disabled={!resolutionText.trim() || updatingStatus} style={{ padding: '0.5rem 1rem', backgroundColor: getStatusColor('resolved'), color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>Resolve</button>
                      <button onClick={() => setShowResolutionForm(false)} style={{ padding: '0.5rem 1rem', backgroundColor: getStatusColor('closed'), color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><InformationCircleIcon width={24} height={24} /> Metadata</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                  <div><div style={{ color: currentThemeStyles.textSecondary }}>Created</div><div style={{ color: currentThemeStyles.textPrimary }}>{new Date(ticket.createdAt).toLocaleString()}</div></div>
                  <div><div style={{ color: currentThemeStyles.textSecondary }}>Last Updated</div><div style={{ color: currentThemeStyles.textPrimary }}>{new Date(ticket.updatedAt).toLocaleString()}</div></div>
                  {ticket.escalation?.escalated && <div><div style={{ color: currentThemeStyles.textSecondary }}>Escalated</div><div style={{ color: getPriorityColor('urgent') }}>{new Date(ticket.escalation.escalatedAt!).toLocaleString()}</div><div style={{ fontSize: '0.75rem', color: currentThemeStyles.textMuted }}>Reason: {ticket.escalation.reason}</div></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
