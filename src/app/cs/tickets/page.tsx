// app/cs/tickets/page.tsx - STANDALONE VERSION (No Tailwind needed)
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const router = useRouter();

  const fetchTickets = useCallback(async (token: string) => {
    setLoading(true);
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
        throw new Error(`Failed to fetch tickets: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setTickets(result.data.tickets || []);
        setPagination(result.data.pagination || null);
      } else {
        throw new Error(result.message || 'Failed to load tickets');
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
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
    if (token) {
      fetchTickets(token);
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

  if (loading && tickets.length === 0) {
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
          <p style={{ color: '#64748b', fontSize: '18px' }}>Loading tickets...</p>
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
        .hover-row:hover {
          background-color: #f1f5f9 !important;
        }
        .hover-btn:hover {
          opacity: 0.8;
        }
      `}</style>

      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '16px',
        marginBottom: '24px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
            🎫 Ticket Queue
          </h1>
          <p style={{
            color: '#64748b',
            margin: 0,
            fontSize: '16px'
          }}>
            Manage customer support tickets and requests
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={refreshTickets}
            disabled={loading}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              opacity: loading ? 0.5 : 1
            }}
            className="hover-btn"
          >
            {loading ? '↻' : '🔄'} Refresh
          </button>
          <button 
            onClick={() => router.push('/cs/dashboard')} 
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
            className="hover-btn"
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => router.push('/cs/tickets/create')} 
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'white',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
            className="hover-btn"
          >
            ➕ Create New Ticket
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

      {/* Filters */}
      <div style={{
        padding: '16px',
        marginBottom: '24px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b',
            margin: 0
          }}>
            🔍 Filters
          </h3>
          <button
            onClick={clearFilters}
            style={{
              fontSize: '14px',
              color: '#6b7280',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Clear All
          </button>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <input 
            type="text" 
            name="search" 
            placeholder="🔍 Search by ID, subject, customer..." 
            value={filters.search} 
            onChange={handleFilterChange} 
            style={{
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <select 
            name="status" 
            value={filters.status} 
            onChange={handleFilterChange} 
            style={{
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="">All Statuses</option>
            <option value="open">🔴 Open</option>
            <option value="in_progress">🟡 In Progress</option>
            <option value="pending_customer">🔵 Pending Customer</option>
            <option value="resolved">🟢 Resolved</option>
            <option value="closed">⚪ Closed</option>
          </select>
          <select 
            name="priority" 
            value={filters.priority} 
            onChange={handleFilterChange} 
            style={{
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="">All Priorities</option>
            <option value="urgent">🚨 Urgent</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            {pagination && (
              <span>
                📊 {tickets.length} of {pagination.total} tickets
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tickets */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#6b7280' }}>Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '8px'
            }}>
              No tickets found
            </h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '16px'
            }}>
              {filters.search || filters.status || filters.priority 
                ? 'No tickets match the current filters.' 
                : 'No tickets have been created yet.'}
            </p>
            {(filters.search || filters.status || filters.priority) && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '14px' }}>
                <thead>
                  <tr style={{
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    backgroundColor: '#f8fafc',
                    color: '#374151'
                  }}>
                    <th style={{ padding: '12px 24px', textAlign: 'left' }}>Ticket ID</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left' }}>Subject</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left' }}>Priority</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left' }}>Assigned To</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left' }}>Last Updated</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr 
                      key={ticket._id} 
                      className="hover-row"
                      style={{
                        backgroundColor: 'white',
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <td style={{ padding: '16px 24px', fontWeight: '500' }}>
                        <Link 
                          href={`/cs/tickets/${ticket._id}`}
                          style={{
                            color: '#3b82f6',
                            textDecoration: 'none'
                          }}
                        >
                          🎫 {ticket.ticketId}
                        </Link>
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        fontWeight: '600',
                        color: '#374151',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {ticket.subject}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#1e293b' }}>
                            {ticket.customerInfo.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {ticket.customerInfo.email}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: '12px',
                          backgroundColor: getStatusColor(ticket.status) + '20',
                          color: getStatusColor(ticket.status)
                        }}>
                          {getStatusDisplay(ticket.status)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontWeight: '500',
                          borderRadius: '12px',
                          border: `1px solid ${getPriorityColor(ticket.priority)}40`,
                          backgroundColor: getPriorityColor(ticket.priority) + '20',
                          color: getPriorityColor(ticket.priority)
                        }}>
                          {getPriorityDisplay(ticket.priority)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {ticket.assignedAgent?.name ? (
                          <span style={{ color: '#1e293b' }}>👤 {ticket.assignedAgent.name}</span>
                        ) : (
                          <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>❌ Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '12px', color: '#6b7280' }}>
                        📅 {new Date(ticket.updatedAt).toLocaleDateString()}<br/>
                        🕐 {new Date(ticket.updatedAt).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Link 
                          href={`/cs/tickets/${ticket._id}`}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#3b82f6',
                            textDecoration: 'none'
                          }}
                        >
                          👁️ View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  📄 Showing page {pagination.current} of {pagination.pages} ({pagination.total} tickets)
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => handlePageChange(pagination.current - 1)} 
                    disabled={!pagination.hasPrev || loading} 
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: pagination.hasPrev && !loading ? 'pointer' : 'not-allowed',
                      opacity: pagination.hasPrev && !loading ? 1 : 0.5
                    }}
                  >
                    ⬅️ Previous
                  </button>
                  <span style={{
                    padding: '8px 12px',
                    fontSize: '14px',
                    color: '#374151'
                  }}>
                    {pagination.current} / {pagination.pages}
                  </span>
                  <button 
                    onClick={() => handlePageChange(pagination.current + 1)} 
                    disabled={!pagination.hasNext || loading} 
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: pagination.hasNext && !loading ? 'pointer' : 'not-allowed',
                      opacity: pagination.hasNext && !loading ? 1 : 0.5
                    }}
                  >
                    Next ➡️
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}