// app/cs/customers/[id]/page.tsx - Customer Profile View for CS Agents
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/cs/components/AnimatedBackground';
import { 
  ShieldCheckIcon, UserCircleIcon, ClockIcon, ChatBubbleOvalLeftEllipsisIcon, 
  TicketIcon, StarIcon, ArrowLeftIcon, PowerIcon, EnvelopeIcon, PhoneIcon,
  CalendarIcon, MapPinIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Data Interfaces
interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  registrationDate: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'blocked';
  previousChats: ChatHistory[];
  tickets: TicketHistory[];
  satisfaction: {
    avgRating: number;
    totalFeedback: number;
  };
  notes: CustomerNote[];
}

interface ChatHistory {
  _id: string;
  sessionId: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  duration: number;
  assignedAgent?: { name: string };
  feedback?: { rating: number; comment?: string };
  messageCount: number;
}

interface TicketHistory {
  _id: string;
  ticketId: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  resolvedAt?: string;
  assignedAgent?: { name: string };
}

interface CustomerNote {
  _id: string;
  content: string;
  addedBy: { name: string };
  addedAt: string;
  type: 'general' | 'warning' | 'important';
}

export default function CustomerProfile() {
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();
  
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'chats' | 'tickets' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Theme styles
  const lightTheme = { 
    mainBg: '#fffbeb', 
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', 
    glassPanelBg: 'rgba(255, 255, 255, 0.92)', 
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', 
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', 
    textPrimary: '#1f2937', 
    textSecondary: '#4B5563', 
    textMuted: '#6B7280', 
    cardBg: 'rgba(249, 250, 251, 0.8)', 
    cardBorder: '1px solid rgba(209, 213, 219, 0.5)' 
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
    cardBg: 'rgba(51, 65, 85, 0.8)', 
    cardBorder: '1px solid rgba(75, 85, 99, 0.5)' 
  };
  
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      router.push('/cs/login');
      return;
    }
    
    fetchCustomerProfile(token);
  }, [params.id, router]);

  const fetchCustomerProfile = async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/customers/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch customer profile: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setCustomer(result.data);
      } else {
        throw new Error(result.message || 'Failed to load customer profile');
      }
      
    } catch (fetchError) {
      console.error('Failed to fetch customer profile:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    const token = localStorage.getItem('cs_token');
    if (!token) return;
    
    setAddingNote(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/customers/${params.id}/notes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newNote,
          noteType: 'general'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add note: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (result.success) {
        // Add the new note to the customer's notes
        setCustomer(prev => prev ? { ...prev, notes: [result.data, ...prev.notes] } : null);
        setNewNote('');
      } else {
        throw new Error(result.message || 'Failed to add note');
      }
      
    } catch (error) {
      console.error('Failed to add note:', error);
      setError('Failed to add note. Please try again.');
    } finally {
      setAddingNote(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'inactive': return '#f59e0b'; 
      case 'blocked': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'normal': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading Customer Profile...</p>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary }}>
          <ExclamationTriangleIcon width={48} height={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h2>Customer Not Found</h2>
          <p>{error}</p>
          <button 
            onClick={() => router.back()} 
            style={{ 
              marginTop: '1rem', 
              padding: '0.5rem 1rem', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.5rem', 
              cursor: 'pointer' 
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      {/* Navigation Bar */}
      <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ShieldCheckIcon width={32} height={32} color="#dc2626" />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span> Express Support
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Customer Profile</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={() => router.back()}
              style={{ 
                backgroundColor: '#374151', 
                color: '#f9fafb', 
                padding: '0.5rem 1rem', 
                border: 'none', 
                borderRadius: '0.5rem', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem' 
              }}
            >
              <ArrowLeftIcon width={16} /> Back
            </button>
            <ThemeSwitcher />
            <button 
              onClick={() => router.push('/cs/dashboard')} 
              style={{ 
                backgroundColor: '#3b82f6', 
                color: '#ffffff', 
                padding: '0.5rem 1rem', 
                border: 'none', 
                borderRadius: '0.5rem', 
                cursor: 'pointer' 
              }}
            >
              Dashboard
            </button>
            <button 
              onClick={() => { localStorage.removeItem('cs_token'); router.push('/cs/login'); }} 
              style={{ 
                backgroundColor: '#374151', 
                color: '#f9fafb', 
                padding: '0.5rem 1rem', 
                border: 'none', 
                borderRadius: '0.5rem', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem' 
              }}
            >
              <PowerIcon width={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ width: '100%', minHeight: 'calc(100vh - 90px)', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem', position: 'relative', zIndex: 5 }}>
        <div style={{ width: '100%', maxWidth: '1400px' }}>
          {/* Customer Header */}
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', backgroundColor: '#3b82f6', borderRadius: '50%', color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
                {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0 }}>{customer.name}</h2>
                  <span style={{ 
                    backgroundColor: getStatusColor(customer.status) + '30', 
                    color: getStatusColor(customer.status), 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.875rem', 
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {customer.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '2rem', color: currentThemeStyles.textSecondary }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <EnvelopeIcon width={16} />
                    <span>{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <PhoneIcon width={16} />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPinIcon width={16} />
                      <span>{customer.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <StarIcon width={20} color="#f59e0b" />
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary }}>
                    {customer.satisfaction.avgRating.toFixed(1)}
                  </span>
                </div>
                <p style={{ color: currentThemeStyles.textSecondary, margin: 0, fontSize: '0.875rem' }}>
                  {customer.satisfaction.totalFeedback} ratings
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ChatBubbleOvalLeftEllipsisIcon width={32} color="#22c55e" />
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e', margin: 0 }}>{customer.previousChats.length}</h3>
                  <p style={{ color: currentThemeStyles.textSecondary, margin: 0 }}>Total Chats</p>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <TicketIcon width={32} color="#3b82f6" />
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>{customer.tickets.length}</h3>
                  <p style={{ color: currentThemeStyles.textSecondary, margin: 0 }}>Total Tickets</p>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <CalendarIcon width={32} color="#8b5cf6" />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#8b5cf6', margin: 0 }}>
                    {new Date(customer.registrationDate).toLocaleDateString()}
                  </h3>
                  <p style={{ color: currentThemeStyles.textSecondary, margin: 0 }}>Member Since</p>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ClockIcon width={32} color="#f59e0b" />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>
                    {new Date(customer.lastActive).toLocaleDateString()}
                  </h3>
                  <p style={{ color: currentThemeStyles.textSecondary, margin: 0 }}>Last Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: currentThemeStyles.cardBg, padding: '0.5rem', borderRadius: '0.75rem', border: currentThemeStyles.cardBorder }}>
              {(['overview', 'chats', 'tickets', 'notes'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    backgroundColor: activeTab === tab ? '#3b82f6' : 'transparent',
                    color: activeTab === tab ? 'white' : currentThemeStyles.textPrimary,
                    cursor: 'pointer',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1.5rem' }}>Customer Overview</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <h4 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>Recent Activity</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {customer.previousChats.slice(0, 3).map(chat => (
                        <div key={chat._id} style={{ backgroundColor: currentThemeStyles.cardBg, padding: '1rem', borderRadius: '0.5rem', border: currentThemeStyles.cardBorder }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', color: currentThemeStyles.textPrimary }}>{chat.sessionId}</span>
                            <span style={{ fontSize: '0.875rem', color: currentThemeStyles.textMuted }}>
                              {new Date(chat.startedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary }}>
                              Duration: {chat.duration}m
                            </span>
                            {chat.feedback?.rating && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <StarIcon width={16} color="#f59e0b" />
                                <span style={{ color: currentThemeStyles.textPrimary }}>{chat.feedback.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>Recent Notes</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {customer.notes.slice(0, 3).map(note => (
                        <div key={note._id} style={{ backgroundColor: currentThemeStyles.cardBg, padding: '1rem', borderRadius: '0.5rem', border: currentThemeStyles.cardBorder }}>
                          <p style={{ color: currentThemeStyles.textPrimary, margin: '0 0 0.5rem 0' }}>{note.content}</p>
                          <div style={{ fontSize: '0.875rem', color: currentThemeStyles.textMuted }}>
                            By {note.addedBy.name} • {new Date(note.addedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chats' && (
              <div>
                <h3 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1.5rem' }}>Chat History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {customer.previousChats.map(chat => (
                    <div key={chat._id} style={{ backgroundColor: currentThemeStyles.cardBg, padding: '1.5rem', borderRadius: '0.75rem', border: currentThemeStyles.cardBorder }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ color: currentThemeStyles.textPrimary, margin: '0 0 0.25rem 0' }}>{chat.sessionId}</h4>
                          <p style={{ color: currentThemeStyles.textSecondary, margin: 0 }}>
                            {new Date(chat.startedAt).toLocaleString()} - {chat.duration}m duration
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ 
                            backgroundColor: chat.status === 'ended' ? '#22c55e30' : '#f59e0b30',
                            color: chat.status === 'ended' ? '#22c55e' : '#f59e0b',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}>
                            {chat.status}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                          <span style={{ color: currentThemeStyles.textSecondary }}>
                            Agent: {chat.assignedAgent?.name || 'Unassigned'}
                          </span>
                          <span style={{ color: currentThemeStyles.textSecondary }}>
                            Messages: {chat.messageCount}
                          </span>
                        </div>
                        {chat.feedback?.rating && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <StarIcon width={16} color="#f59e0b" />
                            <span style={{ color: currentThemeStyles.textPrimary, fontWeight: '600' }}>{chat.feedback.rating}/5</span>
                            {chat.feedback.comment && (
                              <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', fontStyle: 'italic' }}>
                                "{chat.feedback.comment}"
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div>
                <h3 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1.5rem' }}>Ticket History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {customer.tickets.map(ticket => (
                    <div key={ticket._id} style={{ backgroundColor: currentThemeStyles.cardBg, padding: '1.5rem', borderRadius: '0.75rem', border: currentThemeStyles.cardBorder }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ color: currentThemeStyles.textPrimary, margin: '0 0 0.25rem 0' }}>{ticket.ticketId}</h4>
                          <p style={{ color: currentThemeStyles.textPrimary, fontWeight: '600', margin: '0 0 0.5rem 0' }}>{ticket.subject}</p>
                          <p style={{ color: currentThemeStyles.textSecondary, margin: 0 }}>
                            Created: {new Date(ticket.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <span style={{ 
                              backgroundColor: getPriorityColor(ticket.priority) + '30',
                              color: getPriorityColor(ticket.priority),
                              padding: '0.25rem 0.75rem',
                              borderRadius: '999px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              marginRight: '0.5rem'
                            }}>
                              {ticket.priority}
                            </span>
                            <span style={{ 
                              backgroundColor: ticket.status === 'resolved' ? '#22c55e30' : '#f59e0b30',
                              color: ticket.status === 'resolved' ? '#22c55e' : '#f59e0b',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '999px',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}>
                              {ticket.status}
                            </span>
                          </div>
                          {ticket.resolvedAt && (
                            <p style={{ color: currentThemeStyles.textSecondary, margin: 0, fontSize: '0.875rem' }}>
                              Resolved: {new Date(ticket.resolvedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {ticket.assignedAgent && (
                        <p style={{ color: currentThemeStyles.textSecondary, margin: 0 }}>
                          Assigned to: {ticket.assignedAgent.name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ color: currentThemeStyles.textPrimary, margin: 0 }}>Customer Notes</h3>
                </div>
                
                {/* Add Note Form */}
                <div style={{ backgroundColor: currentThemeStyles.cardBg, padding: '1.5rem', borderRadius: '0.75rem', border: currentThemeStyles.cardBorder, marginBottom: '1.5rem' }}>
                  <h4 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>Add New Note</h4>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note about this customer..."
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: currentThemeStyles.cardBorder,
                        borderRadius: '0.5rem',
                        backgroundColor: currentThemeStyles.glassPanelBg,
                        color: currentThemeStyles.textPrimary,
                        resize: 'vertical',
                        minHeight: '100px'
                      }}
                    />
                    <button
                      onClick={addNote}
                      disabled={!newNote.trim() || addingNote}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: newNote.trim() && !addingNote ? 'pointer' : 'not-allowed',
                        opacity: newNote.trim() && !addingNote ? 1 : 0.6,
                        alignSelf: 'flex-start'
                      }}
                    >
                      {addingNote ? 'Adding...' : 'Add Note'}
                    </button>
                  </div>
                </div>

                {/* Notes List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {customer.notes.map(note => (
                    <div key={note._id} style={{ backgroundColor: currentThemeStyles.cardBg, padding: '1.5rem', borderRadius: '0.75rem', border: currentThemeStyles.cardBorder }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span style={{ 
                          backgroundColor: note.type === 'important' ? '#ef444430' : note.type === 'warning' ? '#f59e0b30' : '#3b82f630',
                          color: note.type === 'important' ? '#ef4444' : note.type === 'warning' ? '#f59e0b' : '#3b82f6',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {note.type}
                        </span>
                        <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>
                          {new Date(note.addedAt).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ color: currentThemeStyles.textPrimary, margin: '0 0 0.75rem 0', lineHeight: 1.6 }}>{note.content}</p>
                      <p style={{ color: currentThemeStyles.textSecondary, margin: 0, fontSize: '0.875rem' }}>
                        Added by: {note.addedBy.name}
                      </p>
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