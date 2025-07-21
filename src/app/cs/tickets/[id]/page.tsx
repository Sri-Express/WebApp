// app/cs/tickets/[id]/page.tsx - STANDALONE VERSION (No external dependencies)
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface ITicket {
  _id: string;
  ticketId: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    customerId?: string;
  };
  assignedAgent?: {
    id: string;
    name: string;
    email: string;
  };
  source: string;
  tags: string[];
  timeline: Array<{
    _id: string;
    action: string;
    description: string;
    performedBy: {
      name: string;
      role: string;
    };
    timestamp: string;
    metadata?: Record<string, unknown>;
  }>;
  resolution?: {
    solution: string;
    resolvedAt: string;
    customerSatisfaction?: number;
  };
  escalation?: {
    escalated: boolean;
    escalatedAt?: string;
    reason?: string;
    escalatedTo?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function TicketDetails() {
  const [ticket, setTicket] = useState<ITicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const router = useRouter();
  const params = useParams();

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ticket: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setTicket(result.data);
      } else {
        throw new Error(result.message || 'Failed to load ticket');
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      setError(error instanceof Error ? error.message : 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !ticket) return;

    setAddingNote(true);
    try {
      const token = localStorage.getItem('cs_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets/${ticket._id}/notes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note: newNote })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setNewNote('');
          if(token) fetchTicket(token, ticket._id);
        }
      } else {
        throw new Error('Failed to add note');
      }
    } catch (error) {
      console.error('Failed to add note:', error);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets/${ticket._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          if(token) fetchTicket(token, ticket._id);
        }
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      setError('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const resolveTicket = async () => {
    if (!resolutionText.trim() || !ticket) return;

    setUpdatingStatus(true);
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

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setResolutionText('');
          setShowResolutionForm(false);
          if(token) fetchTicket(token, ticket._id);
        }
      } else {
        throw new Error('Failed to resolve ticket');
      }
    } catch (error) {
      console.error('Failed to resolve ticket:', error);
      setError('Failed to resolve ticket');
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets/${ticket._id}/escalate`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          if(token) fetchTicket(token, ticket._id);
        }
      } else {
        throw new Error('Failed to escalate ticket');
      }
    } catch (error) {
      console.error('Failed to escalate ticket:', error);
      setError('Failed to escalate ticket');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#2563eb';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#dc2626';
      case 'in_progress': return '#d97706';
      case 'pending_customer': return '#2563eb';
      case 'resolved': return '#16a34a';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusDisplay = (status: string) => {
    const displays = {
      'open': '🔴 Open',
      'in_progress': '🟡 In Progress',
      'pending_customer': '🔵 Pending Customer',
      'resolved': '🟢 Resolved',
      'closed': '⚪ Closed'
    };
    return displays[status as keyof typeof displays] || status;
  };

  const getPriorityDisplay = (priority: string) => {
    const displays = {
      'urgent': '🚨 Urgent',
      'high': '🔴 High',
      'medium': '🟡 Medium',
      'low': '🟢 Low'
    };
    return displays[priority as keyof typeof displays] || priority;
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
          <p style={{ color: '#64748b', fontSize: '18px' }}>Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            Ticket Not Found
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            {error || 'The requested ticket could not be found.'}
          </p>
          <Link
            href="/cs/tickets"
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px'
            }}
          >
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .hover-btn:hover {
          opacity: 0.8;
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
            🎫 {ticket.ticketId}
          </h1>
          <p style={{
            color: '#64748b',
            margin: 0
          }}>
            {ticket.subject}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            href="/cs/tickets"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              textDecoration: 'none'
            }}
          >
            ⬅️ Back to Tickets
          </Link>
          <button
            onClick={() => router.push('/cs/dashboard')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            className="hover-btn"
          >
            📊 Dashboard
          </button>
        </div>
      </div>

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
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px'
      }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Ticket Info */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              📋 Ticket Information
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Status
                </div>
                <span style={{
                  padding: '4px 8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  backgroundColor: getStatusColor(ticket.status) + '20',
                  color: getStatusColor(ticket.status)
                }}>
                  {getStatusDisplay(ticket.status)}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Priority
                </div>
                <span style={{
                  padding: '4px 8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '12px',
                  border: `1px solid ${getPriorityColor(ticket.priority)}40`,
                  backgroundColor: getPriorityColor(ticket.priority) + '20',
                  color: getPriorityColor(ticket.priority)
                }}>
                  {getPriorityDisplay(ticket.priority)}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Category
                </div>
                <div style={{ fontSize: '14px', color: '#1e293b' }}>
                  {ticket.category.replace('_', ' ')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Source
                </div>
                <div style={{ fontSize: '14px', color: '#1e293b' }}>
                  {ticket.source}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                Description
              </div>
              <div style={{
                fontSize: '14px',
                color: '#374151',
                backgroundColor: '#f8fafc',
                padding: '12px',
                borderRadius: '6px',
                whiteSpace: 'pre-wrap'
              }}>
                {ticket.description}
              </div>
            </div>

            {ticket.tags.length > 0 && (
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                  Tags
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ticket.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '12px',
                        borderRadius: '12px'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resolution */}
          {ticket.resolution && (
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #16a34a'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#16a34a',
                marginBottom: '16px'
              }}>
                ✅ Resolution
              </h2>
              <div style={{
                fontSize: '14px',
                color: '#374151',
                backgroundColor: '#f0fdf4',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '8px'
              }}>
                {ticket.resolution.solution}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Resolved on {new Date(ticket.resolution.resolvedAt).toLocaleString()}
                {ticket.resolution.customerSatisfaction && (
                  <span> • Customer Rating: {'⭐'.repeat(ticket.resolution.customerSatisfaction)}</span>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              📅 Timeline
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ticket.timeline.map((item, index) => (
                <div key={item._id} style={{
                  display: 'flex',
                  gap: '12px',
                  paddingBottom: index < ticket.timeline.length - 1 ? '16px' : '0',
                  borderBottom: index < ticket.timeline.length - 1 ? '1px solid #f1f5f9' : 'none'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    marginTop: '6px',
                    flexShrink: 0
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '4px'
                    }}>
                      {item.action}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#64748b',
                      marginBottom: '4px'
                    }}>
                      {item.description}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {item.performedBy.name} • {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Note */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              📝 Add Note
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="Add a note to the ticket timeline..."
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim() || addingNote}
                style={{
                  alignSelf: 'flex-start',
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: !newNote.trim() || addingNote ? 'not-allowed' : 'pointer',
                  opacity: !newNote.trim() || addingNote ? 0.5 : 1
                }}
              >
                {addingNote ? 'Adding...' : '✅ Add Note'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Customer Info */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              👤 Customer Information
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Name
                </div>
                <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                  {ticket.customerInfo.name}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Email
                </div>
                <div style={{ fontSize: '14px', color: '#1e293b' }}>
                  {ticket.customerInfo.email}
                </div>
              </div>
              {ticket.customerInfo.phone && (
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    Phone
                  </div>
                  <div style={{ fontSize: '14px', color: '#1e293b' }}>
                    {ticket.customerInfo.phone}
                  </div>
                </div>
              )}
              {ticket.customerInfo.customerId && (
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    Customer ID
                  </div>
                  <div style={{ fontSize: '14px', color: '#1e293b' }}>
                    {ticket.customerInfo.customerId}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Agent */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              👨‍💼 Assigned Agent
            </h3>
            
            {ticket.assignedAgent ? (
              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#1e293b',
                  fontWeight: '500',
                  marginBottom: '4px'
                }}>
                  {ticket.assignedAgent.name}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {ticket.assignedAgent.email}
                </div>
              </div>
            ) : (
              <div style={{
                fontSize: '14px',
                color: '#9ca3af',
                fontStyle: 'italic'
              }}>
                No agent assigned
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              ⚡ Actions
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ticket.status === 'open' && (
                <button
                  onClick={() => updateStatus('in_progress')}
                  disabled={updatingStatus}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#d97706',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: updatingStatus ? 'not-allowed' : 'pointer',
                    opacity: updatingStatus ? 0.5 : 1
                  }}
                >
                  🟡 Start Progress
                </button>
              )}
              
              {ticket.status === 'in_progress' && (
                <>
                  <button
                    onClick={() => setShowResolutionForm(!showResolutionForm)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    ✅ Resolve Ticket
                  </button>
                  <button
                    onClick={() => updateStatus('pending_customer')}
                    disabled={updatingStatus}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: updatingStatus ? 'not-allowed' : 'pointer',
                      opacity: updatingStatus ? 0.5 : 1
                    }}
                  >
                    🔵 Pending Customer
                  </button>
                </>
              )}

              {ticket.status !== 'escalated' && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <button
                  onClick={escalateTicket}
                  disabled={updatingStatus}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: updatingStatus ? 'not-allowed' : 'pointer',
                    opacity: updatingStatus ? 0.5 : 1
                  }}
                >
                  ⬆️ Escalate
                </button>
              )}

              {ticket.status === 'resolved' && (
                <button
                  onClick={() => updateStatus('closed')}
                  disabled={updatingStatus}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: updatingStatus ? 'not-allowed' : 'pointer',
                    opacity: updatingStatus ? 0.5 : 1
                  }}
                >
                  ⚪ Close Ticket
                </button>
              )}
            </div>

            {/* Resolution Form */}
            {showResolutionForm && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: '#f0fdf4',
                borderRadius: '6px',
                border: '1px solid #16a34a'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#16a34a',
                  marginBottom: '8px'
                }}>
                  Resolve Ticket
                </h4>
                <textarea
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #16a34a',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                    marginBottom: '8px'
                  }}
                  placeholder="Describe how the issue was resolved..."
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={resolveTicket}
                    disabled={!resolutionText.trim() || updatingStatus}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: !resolutionText.trim() || updatingStatus ? 'not-allowed' : 'pointer',
                      opacity: !resolutionText.trim() || updatingStatus ? 0.5 : 1,
                      fontSize: '12px'
                    }}
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => setShowResolutionForm(false)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Ticket Metadata */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              ℹ️ Metadata
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Created
                </div>
                <div style={{ fontSize: '14px', color: '#1e293b' }}>
                  {new Date(ticket.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Last Updated
                </div>
                <div style={{ fontSize: '14px', color: '#1e293b' }}>
                  {new Date(ticket.updatedAt).toLocaleString()}
                </div>
              </div>
              {ticket.escalation?.escalated && (
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    Escalated
                  </div>
                  <div style={{ fontSize: '14px', color: '#dc2626' }}>
                    {new Date(ticket.escalation.escalatedAt!).toLocaleString()}
                  </div>
                  {ticket.escalation.reason && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      Reason: {ticket.escalation.reason}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
