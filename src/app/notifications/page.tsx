// src/app/notifications/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BellIcon,
  ExclamationTriangleIcon,
  SpeakerWaveIcon,
  ShieldExclamationIcon,
  FireIcon,
  HeartIcon,
  CloudIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  WifiIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useEmergencyAlerts } from '../components/RealTimeEmergencyClient';

export default function NotificationsPage() {
  const router = useRouter();
  const { alerts, unreadCount, criticalCount, markAsRead, connected } = useEmergencyAlerts();
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Filter alerts for users
  const userAlerts = alerts.filter(alert => 
    alert.recipients.includes('all') || 
    alert.recipients.includes('users') ||
    alert.type === 'broadcast'
  );

  // Apply filters
  const filteredAlerts = userAlerts.filter(alert => {
    switch (filter) {
      case 'unread':
        return !alert.read;
      case 'critical':
        return alert.priority === 'critical';
      default:
        return true;
    }
  });

  // Get alert icon
  const getAlertIcon = (alert: any) => {
    switch (alert.type) {
      case 'emergency_created':
        return <ExclamationTriangleIcon width={24} height={24} />;
      case 'broadcast':
        return <SpeakerWaveIcon width={24} height={24} />;
      case 'critical_alert':
        return <ShieldExclamationIcon width={24} height={24} />;
      case 'emergency_resolved':
        return <CheckCircleIcon width={24} height={24} />;
      default:
        return <BellIcon width={24} height={24} />;
    }
  };

  // Get alert color
  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Link href="/dashboard" style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ArrowLeftIcon width={16} height={16} />
              Back to Dashboard
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <BellIcon width={24} height={24} color="#f59e0b" />
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f1f5f9',
                margin: 0
              }}>
                Emergency Notifications
              </h1>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* Connection Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: connected ? '#10b981' : '#ef4444',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              <WifiIcon width={14} height={14} />
              {connected ? 'LIVE' : 'Offline'}
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              color: '#94a3b8',
              fontSize: '0.875rem'
            }}>
              <span>{unreadCount} unread</span>
              {criticalCount > 0 && (
                <span style={{ color: '#dc2626', fontWeight: '600' }}>
                  {criticalCount} critical
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          backgroundColor: '#1e293b',
          padding: '0.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #334155'
        }}>
          {[
            { id: 'all', name: 'All Notifications', count: userAlerts.length },
            { id: 'unread', name: 'Unread', count: unreadCount },
            { id: 'critical', name: 'Critical', count: criticalCount }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: 'none',
                backgroundColor: filter === tab.id ? '#334155' : 'transparent',
                color: filter === tab.id ? '#f1f5f9' : '#94a3b8',
                cursor: 'pointer',
                borderRadius: '0.25rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {tab.name}
              {tab.count > 0 && (
                <span style={{
                  backgroundColor: filter === tab.id ? '#f59e0b' : '#374151',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        {filteredAlerts.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  backgroundColor: alert.read ? '#334155' : '#1e293b',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border: alert.priority === 'critical' ? 
                    '2px solid #dc2626' : '1px solid #475569',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => markAsRead(alert.id)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div style={{ color: getAlertColor(alert.priority) }}>
                    {getAlertIcon(alert)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.5rem'
                    }}>
                      <h3 style={{
                        color: '#f1f5f9',
                        fontSize: '1.125rem',
                        fontWeight: 'bold',
                        margin: 0
                      }}>
                        {alert.title}
                      </h3>
                      
                      <span style={{
                        backgroundColor: getAlertColor(alert.priority),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {alert.priority}
                      </span>
                      
                      {!alert.read && (
                        <span style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.625rem',
                          fontWeight: '600'
                        }}>
                          NEW
                        </span>
                      )}
                    </div>
                    
                    <p style={{
                      color: '#e2e8f0',
                      marginBottom: '1rem',
                      lineHeight: '1.5',
                      fontSize: '1rem'
                    }}>
                      {alert.message}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: '#94a3b8',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <ClockIcon width={16} height={16} />
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                      
                      <div>
                        Type: {alert.type.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            backgroundColor: '#334155',
            padding: '3rem',
            borderRadius: '0.75rem',
            textAlign: 'center',
            color: '#94a3b8'
          }}>
            <BellIcon width={48} height={48} style={{ 
              margin: '0 auto 1rem', 
              opacity: 0.5 
            }} />
            <div style={{ 
              fontSize: '1.125rem', 
              marginBottom: '0.5rem' 
            }}>
              No Emergency Notifications
            </div>
            <div>
              {filter === 'all' ? 
                'You\'ll see emergency alerts and system notifications here.' :
                `No ${filter} notifications at this time.`
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}