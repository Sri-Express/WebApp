// src/app/route-admin/notifications/page.tsx - Route Admin Notifications Page
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import RealTimeEmergencyClient, { useEmergencyAlerts, useEmergencyContext } from '@/app/components/RealTimeEmergencyClient';
import AnimatedBackground from '@/app/sysadmin/components/AnimatedBackground';

function RouteAdminNotificationsContent() {
  const { theme } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Emergency notifications integration
  const { alerts: realtimeAlerts, unreadCount, criticalCount, markAsRead } = useEmergencyAlerts();
  const { connectionStatus } = useEmergencyContext();

  // Local function to mark all alerts as read
  const markAllAsRead = useCallback(() => {
    realtimeAlerts.filter(alert => !alert.read).forEach(alert => markAsRead(alert.id));
  }, [realtimeAlerts, markAsRead]);

  // Filter alerts relevant to route admins
  const routeRelevantAlerts = realtimeAlerts.filter(alert => 
    alert.recipients.includes('all') || 
    alert.recipients.includes('route_admins') ||
    alert.recipients.includes('emergency_responders') ||
    alert.type === 'emergency_created' ||
    (alert.emergency && (
      alert.message.toLowerCase().includes('route') ||
      alert.message.toLowerCase().includes('vehicle') ||
      alert.message.toLowerCase().includes('bus')
    ))
  );

  // Apply filters
  const filteredAlerts = routeRelevantAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority;
    const matchesType = filterType === 'all' || alert.type === filterType;
    
    return matchesSearch && matchesPriority && matchesType;
  });

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
    cardBorder: '1px solid rgba(209, 213, 219, 0.5)',
    inputBg: 'rgba(255, 255, 255, 0.7)'
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
    cardBorder: '1px solid rgba(75, 85, 99, 0.5)',
    inputBg: 'rgba(51, 65, 85, 0.7)'
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency_created':
      case 'critical_alert':
        return '🚨';
      case 'emergency_resolved':
        return '✅';
      case 'emergency_escalated':
        return '⬆️';
      case 'broadcast':
        return '📢';
      default:
        return '📋';
    }
  };

  return (
    <div style={{
      backgroundColor: currentThemeStyles.mainBg,
      background: currentThemeStyles.bgGradient,
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />
      
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'rgba(30, 41, 59, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
        padding: '1rem 0',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              href="/route-admin/dashboard"
              style={{
                color: '#9ca3af',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              <ArrowLeftIcon width={20} height={20} />
              Back to Dashboard
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BellIcon width={24} height={24} color="#f59e0b" />
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#ffffff',
                margin: 0
              }}>
                Route Admin Notifications
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeSwitcher />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: connectionStatus.connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
              border: `1px solid ${connectionStatus.connected ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'}`,
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              🔗 {connectionStatus.connected ? 'Connected' : 'Offline'}
            </div>
            {criticalCount > 0 && (
              <div style={{
                backgroundColor: 'rgba(220, 38, 38, 0.8)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                animation: 'pulse 2s infinite'
              }}>
                🚨 {criticalCount} Critical
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {[
            { label: 'Total Notifications', value: routeRelevantAlerts.length, color: '#3b82f6', icon: BellIcon },
            { label: 'Unread Notifications', value: unreadCount, color: '#dc2626', icon: ExclamationTriangleIcon },
            { label: 'Critical Alerts', value: criticalCount, color: '#f59e0b', icon: ExclamationTriangleIcon },
            { label: 'Read Notifications', value: routeRelevantAlerts.length - unreadCount, color: '#10b981', icon: CheckCircleIcon }
          ].map((stat, index) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: currentThemeStyles.glassPanelBg,
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: currentThemeStyles.glassPanelBorder,
                backdropFilter: 'blur(12px)',
                boxShadow: currentThemeStyles.glassPanelShadow,
                animation: `fade-in-up 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{
                    color: stat.color,
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    color: currentThemeStyles.textSecondary,
                    fontSize: '0.875rem'
                  }}>
                    {stat.label}
                  </div>
                </div>
                <stat.icon width={32} height={32} color={stat.color} />
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: currentThemeStyles.glassPanelBorder,
          backdropFilter: 'blur(12px)',
          boxShadow: currentThemeStyles.glassPanelShadow,
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
              <MagnifyingGlassIcon
                width={20}
                height={20}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: currentThemeStyles.textMuted
                }}
              />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: currentThemeStyles.cardBorder,
                  borderRadius: '0.5rem',
                  backgroundColor: currentThemeStyles.inputBg,
                  color: currentThemeStyles.textPrimary,
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: showFilters ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                color: showFilters ? 'white' : '#3b82f6',
                border: '1px solid #3b82f6',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              <FunnelIcon width={16} height={16} />
              Filters
            </button>

            {/* Mark All Read */}
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Mark All Read
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: currentThemeStyles.cardBg,
              borderRadius: '0.5rem',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  color: currentThemeStyles.textSecondary,
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem'
                }}>
                  Priority
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: currentThemeStyles.cardBorder,
                    borderRadius: '0.25rem',
                    backgroundColor: currentThemeStyles.inputBg,
                    color: currentThemeStyles.textPrimary
                  }}
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: currentThemeStyles.textSecondary,
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem'
                }}>
                  Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: currentThemeStyles.cardBorder,
                    borderRadius: '0.25rem',
                    backgroundColor: currentThemeStyles.inputBg,
                    color: currentThemeStyles.textPrimary
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="emergency_created">Emergency Created</option>
                  <option value="emergency_resolved">Emergency Resolved</option>
                  <option value="emergency_escalated">Emergency Escalated</option>
                  <option value="broadcast">Broadcast</option>
                  <option value="critical_alert">Critical Alert</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          borderRadius: '0.75rem',
          border: currentThemeStyles.glassPanelBorder,
          backdropFilter: 'blur(12px)',
          boxShadow: currentThemeStyles.glassPanelShadow,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1.5rem',
            borderBottom: `1px solid ${currentThemeStyles.cardBorder}`
          }}>
            <h2 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              Notifications ({filteredAlerts.length})
            </h2>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert, index) => (
                <div
                  key={alert.id}
                  onClick={() => markAsRead(alert.id)}
                  style={{
                    padding: '1.5rem',
                    borderBottom: index < filteredAlerts.length - 1 ? `1px solid ${currentThemeStyles.cardBorder}` : 'none',
                    backgroundColor: alert.read ? 'transparent' : (alert.priority === 'critical' ? 'rgba(220, 38, 38, 0.05)' : 'rgba(59, 130, 246, 0.05)'),
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderLeft: `4px solid ${getPriorityColor(alert.priority)}`
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {getTypeIcon(alert.type)}
                      </span>
                      <div>
                        <h3 style={{
                          color: currentThemeStyles.textPrimary,
                          fontSize: '1.125rem',
                          fontWeight: 'bold',
                          margin: '0 0 0.25rem 0'
                        }}>
                          {alert.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            backgroundColor: getPriorityColor(alert.priority),
                            color: 'white',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            {alert.priority}
                          </span>
                          <span style={{
                            color: currentThemeStyles.textMuted,
                            fontSize: '0.875rem'
                          }}>
                            {alert.type.replace('_', ' ').toUpperCase()}
                          </span>
                          {!alert.read && (
                            <span style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.625rem',
                              fontWeight: '600'
                            }}>
                              NEW
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      color: currentThemeStyles.textMuted,
                      fontSize: '0.875rem',
                      textAlign: 'right'
                    }}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <p style={{
                    color: currentThemeStyles.textSecondary,
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {alert.message}
                  </p>

                  {alert.emergency && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      backgroundColor: currentThemeStyles.cardBg,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      <strong>Emergency Details:</strong> {(alert.emergency as any).location?.address || 'Location not specified'}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: currentThemeStyles.textSecondary
              }}>
                <BellIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  No notifications found
                </div>
                <div>
                  Try adjusting your search or filter criteria
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

export default function RouteAdminNotifications() {
  return (
    <RealTimeEmergencyClient enableSound={true} enablePushNotifications={true}>
      <RouteAdminNotificationsContent />
    </RealTimeEmergencyClient>
  );
}