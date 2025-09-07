"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import { MagnifyingGlassIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface TicketData {
  ticketId: string;
  subject: string;
  status: 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  submittedAt: string;
  estimatedResponse: string | null;
  timeline: Array<{
    action: string;
    timestamp: string;
    note?: string;
    systemGenerated?: boolean;
  }>;
}

export default function SupportPage() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const [ticketId, setTicketId] = useState('');
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-populate ticket ID from URL params
  useEffect(() => {
    const ticket = searchParams.get('ticket');
    if (ticket) {
      setTicketId(ticket);
      // Auto-track if ticket ID is provided
      setTimeout(() => {
        const tempTicketId = ticket;
        setLoading(true);
        setError('');

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets/track/${tempTicketId}`)
          .then(response => response.json())
          .then(result => {
            if (result.success) {
              setTicketData(result.data);
            } else {
              setError(result.message || 'Ticket not found');
              setTicketData(null);
            }
          })
          .catch(() => {
            setError('Failed to fetch ticket information. Please try again.');
            setTicketData(null);
          })
          .finally(() => {
            setLoading(false);
          });
      }, 100);
    }
  }, [searchParams]);

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
    inputBg: 'rgba(249, 250, 251, 0.8)',
    inputBorder: '1px solid rgba(209, 213, 219, 0.5)',
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
    inputBg: 'rgba(51, 65, 85, 0.8)',
    inputBorder: '1px solid rgba(75, 85, 99, 0.5)',
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  const trackTicket = async () => {
    if (!ticketId.trim()) {
      setError('Please enter a ticket ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets/track/${ticketId.trim()}`);
      const result = await response.json();

      if (result.success) {
        setTicketData(result.data);
      } else {
        setError(result.message || 'Ticket not found');
        setTicketData(null);
      }
    } catch (err) {
      setError('Failed to fetch ticket information. Please try again.');
      setTicketData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <ClockIcon width={20} height={20} color="#F59E0B" />;
      case 'in_progress': return <InformationCircleIcon width={20} height={20} color="#3B82F6" />;
      case 'pending_customer': return <ExclamationTriangleIcon width={20} height={20} color="#F59E0B" />;
      case 'resolved': return <CheckCircleIcon width={20} height={20} color="#10B981" />;
      case 'closed': return <XCircleIcon width={20} height={20} color="#6B7280" />;
      default: return <ClockIcon width={20} height={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#F59E0B';
      case 'in_progress': return '#3B82F6';
      case 'pending_customer': return '#F59E0B';
      case 'resolved': return '#10B981';
      case 'closed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'urgent': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, background: currentThemeStyles.bgGradient, minHeight: '100vh', position: 'relative' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <span style={{ fontSize: '2rem', color: '#F59E0B' }}>ශ්‍රී</span>
            <span style={{ color: '#ffffff' }}>E</span><span style={{ color: '#DC2626' }}>x</span><span style={{ color: '#ffffff' }}>press</span>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem', marginLeft: '0.5rem' }}>Support</span>
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ThemeSwitcher />
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
            <Link href="/contact" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '500' }}>Contact</Link>
            <Link href="/help" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '500' }}>Help</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0, textShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.5)' : 'none' }}>
            Track Your Support Ticket
          </h1>
          <p style={{ color: currentThemeStyles.textSecondary, fontSize: '1.125rem', marginTop: '1rem' }}>
            Enter your ticket ID to check the status and updates
          </p>
        </div>

        {/* Search Section */}
        <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>
                Ticket ID
              </label>
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="Enter your ticket ID (e.g., TKT202509071234)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: currentThemeStyles.inputBg,
                  border: currentThemeStyles.inputBorder,
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  color: currentThemeStyles.textPrimary
                }}
                onKeyPress={(e) => e.key === 'Enter' && trackTicket()}
              />
            </div>
            <button
              onClick={trackTicket}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'white',
                backgroundColor: loading ? '#9CA3AF' : '#3B82F6',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '1.5rem'
              }}
            >
              <MagnifyingGlassIcon width={20} height={20} />
              {loading ? 'Searching...' : 'Track Ticket'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{ backgroundColor: 'rgba(254, 226, 226, 0.8)', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem', color: '#b91c1c', backdropFilter: 'blur(5px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ExclamationTriangleIcon width={20} height={20} />
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Ticket Information */}
        {ticketData && (
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
            {/* Ticket Header */}
            <div style={{ borderBottom: `1px solid ${currentThemeStyles.inputBorder}`, paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0 }}>
                    Ticket #{ticketData.ticketId}
                  </h2>
                  <p style={{ fontSize: '1.125rem', color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0' }}>
                    {ticketData.subject}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    backgroundColor: getStatusColor(ticketData.status), 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {getStatusIcon(ticketData.status)}
                    {ticketData.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    backgroundColor: getPriorityColor(ticketData.priority), 
                    color: 'white'
                  }}>
                    {ticketData.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem', color: currentThemeStyles.textSecondary }}>
                <div><strong>Category:</strong> {ticketData.category}</div>
                <div><strong>Submitted:</strong> {formatDate(ticketData.submittedAt)}</div>
                {ticketData.estimatedResponse && (
                  <div><strong>Expected Response:</strong> {ticketData.estimatedResponse}</div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1.5rem' }}>
                Ticket Timeline
              </h3>
              
              <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                {/* Timeline line */}
                <div style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '0', 
                  bottom: '0', 
                  width: '2px', 
                  backgroundColor: currentThemeStyles.inputBorder 
                }}></div>
                
                {ticketData.timeline.map((event, index) => (
                  <div key={index} style={{ position: 'relative', marginBottom: index === ticketData.timeline.length - 1 ? 0 : '2rem' }}>
                    {/* Timeline dot */}
                    <div style={{ 
                      position: 'absolute', 
                      left: '-2rem', 
                      top: '0.25rem', 
                      width: '1rem', 
                      height: '1rem', 
                      backgroundColor: getStatusColor(event.action === 'created' ? 'open' : event.action === 'resolved' ? 'resolved' : 'in_progress'), 
                      borderRadius: '50%',
                      border: `3px solid ${currentThemeStyles.glassPanelBg}`
                    }}></div>
                    
                    <div style={{ backgroundColor: currentThemeStyles.inputBg, padding: '1rem', borderRadius: '0.5rem', border: currentThemeStyles.inputBorder }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '600', color: currentThemeStyles.textPrimary, textTransform: 'capitalize' }}>
                          {event.action.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: '0.875rem', color: currentThemeStyles.textMuted }}>
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      {event.note && (
                        <p style={{ margin: 0, color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>
                          {event.note}
                        </p>
                      )}
                      {event.systemGenerated && (
                        <span style={{ fontSize: '0.75rem', color: currentThemeStyles.textMuted, fontStyle: 'italic' }}>
                          System generated
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${currentThemeStyles.inputBorder}`, display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link 
                href="/contact" 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: 'white', 
                  backgroundColor: '#3B82F6', 
                  textDecoration: 'none', 
                  borderRadius: '0.5rem',
                  display: 'inline-block'
                }}
              >
                Submit Another Ticket
              </Link>
              <Link 
                href="/help" 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: currentThemeStyles.textPrimary, 
                  backgroundColor: currentThemeStyles.inputBg, 
                  textDecoration: 'none', 
                  borderRadius: '0.5rem',
                  border: currentThemeStyles.inputBorder,
                  display: 'inline-block'
                }}
              >
                Help Center
              </Link>
            </div>
          </div>
        )}

        {/* Info Section */}
        {!ticketData && !loading && !error && (
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>
              Need to submit a support ticket?
            </h3>
            <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1.5rem' }}>
              Contact our support team through multiple channels
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link 
                href="/contact" 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: 'white', 
                  backgroundColor: '#10B981', 
                  textDecoration: 'none', 
                  borderRadius: '0.5rem',
                  display: 'inline-block'
                }}
              >
                Submit Ticket
              </Link>
              <Link 
                href="/help" 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: currentThemeStyles.textPrimary, 
                  backgroundColor: currentThemeStyles.inputBg, 
                  textDecoration: 'none', 
                  borderRadius: '0.5rem',
                  border: currentThemeStyles.inputBorder,
                  display: 'inline-block'
                }}
              >
                Browse FAQ
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}