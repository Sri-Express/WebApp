// src/app/fleet/notifications/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BellIcon,
  ExclamationTriangleIcon,
  SpeakerWaveIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  WifiIcon,
  ArrowLeftIcon,
  ClockIcon,
  TruckIcon,
  MapIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useEmergencyAlerts } from '@/app/components/RealTimeEmergencyClient';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import RealTimeEmergencyClient from '@/app/components/RealTimeEmergencyClient';

interface Alert {
  id: string;
  type: string;
  priority: string;
  timestamp: Date | string;
  title: string;
  message: string;
  read?: boolean;
  recipients: string[];
  emergency?: any;
}

type FilterType = 'all' | 'unread' | 'critical' | 'fleet_operations';

function FleetNotificationsContent() {
  const router = useRouter();
  const { theme } = useTheme();
  const { alerts, unreadCount, criticalCount, markAsRead, connected } = useEmergencyAlerts();
  const [filter, setFilter] = useState<FilterType>('all');

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Filter alerts for fleet managers - show fleet-relevant notifications
  const fleetAlerts = alerts.filter(alert => {
    // Show alerts specifically for fleet managers or general alerts
    const isFleetRelevant = alert.recipients.includes('all') || 
                           alert.recipients.includes('fleet_managers') ||
                           alert.type === 'emergency_created' ||
                           (alert.message && (
                             alert.message.toLowerCase().includes('vehicle') ||
                             alert.message.toLowerCase().includes('fleet') ||
                             alert.message.toLowerCase().includes('route') ||
                             alert.message.toLowerCase().includes('driver') ||
                             alert.message.toLowerCase().includes('maintenance') ||
                             alert.message.toLowerCase().includes('breakdown')
                           )) ||
                           (alert.title && (
                             alert.title.toLowerCase().includes('vehicle') ||
                             alert.title.toLowerCase().includes('fleet') ||
                             alert.title.toLowerCase().includes('route') ||
                             alert.title.toLowerCase().includes('driver') ||
                             alert.title.toLowerCase().includes('maintenance') ||
                             alert.title.toLowerCase().includes('breakdown')
                           ));
    
    return isFleetRelevant;
  });

  // Apply secondary filters
  const filteredAlerts = fleetAlerts.filter(alert => {
    switch (filter) {
      case 'unread':
        return !alert.read;
      case 'critical':
        return alert.priority === 'critical';
      case 'fleet_operations':
        return alert.type === 'emergency_created' || 
               alert.message.toLowerCase().includes('vehicle') ||
               alert.message.toLowerCase().includes('route');
      default:
        return true;
    }
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Theme definitions
  const lightTheme = { 
    mainBg: '#fffbeb', 
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', 
    glassPanelBg: 'rgba(255, 255, 255, 0.92)', 
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', 
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', 
    textPrimary: '#1f2937', 
    textSecondary: '#4B5563', 
    textMuted: '#6B7280', 
    quickActionBg: 'rgba(249, 250, 251, 0.8)', 
    quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', 
    alertBg: 'rgba(255, 251, 235, 0.9)' 
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
    quickActionBg: 'rgba(51, 65, 85, 0.8)', 
    quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', 
    alertBg: 'rgba(30, 41, 59, 0.9)' 
  };
  
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
  
  const animationStyles = `
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .animate-pulse { animation: pulse 2s infinite; }
  `;

  const getAlertIcon = (alert: Alert) => {
    if (alert.message.toLowerCase().includes('vehicle') || alert.message.toLowerCase().includes('fleet')) {
      return <TruckIcon width={24} height={24} />;
    }
    if (alert.message.toLowerCase().includes('route')) {
      return <MapIcon width={24} height={24} />;
    }
    if (alert.message.toLowerCase().includes('maintenance')) {
      return <CogIcon width={24} height={24} />;
    }
    switch (alert.type) {
      case 'emergency_created': return <ExclamationTriangleIcon width={24} height={24} />;
      case 'broadcast': return <SpeakerWaveIcon width={24} height={24} />;
      case 'critical_alert': return <ShieldExclamationIcon width={24} height={24} />;
      case 'emergency_resolved': return <CheckCircleIcon width={24} height={24} />;
      default: return <BellIcon width={24} height={24} />;
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getFilterCount = (filterType: FilterType) => {
    switch (filterType) {
      case 'all': return fleetAlerts.length;
      case 'unread': return fleetAlerts.filter(alert => !alert.read).length;
      case 'critical': return fleetAlerts.filter(alert => alert.priority === 'critical').length;
      case 'fleet_operations': return fleetAlerts.filter(alert => 
        alert.type === 'emergency_created' || 
        alert.message.toLowerCase().includes('vehicle') ||
        alert.message.toLowerCase().includes('route')
      ).length;
      default: return 0;
    }
  };

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      
      {/* Animated Background */}
      <div style={{ position: 'absolute', inset: 0, background: currentThemeStyles.bgGradient, zIndex: 1 }}>
        {/* Fleet-themed background elements */}
        <div style={{ 
          position: 'absolute', 
          top: '20%', 
          left: '10%', 
          width: '60px', 
          height: '30px', 
          opacity: '0.1',
          background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
          borderRadius: '8px'
        }} />
        <div style={{ 
          position: 'absolute', 
          top: '60%', 
          right: '15%', 
          width: '40px', 
          height: '25px', 
          opacity: '0.1',
          background: 'linear-gradient(45deg, #10b981, #059669)',
          borderRadius: '6px'
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Navigation */}
        <nav style={{
          backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.92)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/fleet/dashboard" style={{ 
                color: currentThemeStyles.textPrimary, 
                textDecoration: 'none', 
                fontSize: '0.875rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontWeight: '500' 
              }}>
                <ArrowLeftIcon width={16} height={16} />
                Back to Fleet Dashboard
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TruckIcon width={24} height={24} color="#f59e0b" />
                <h1 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: currentThemeStyles.textPrimary, 
                  margin: 0, 
                  textShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.1)' 
                }}>
                  Fleet Notifications
                </h1>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <ThemeSwitcher />
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
                {connected ? 'Live' : 'Offline'}
              </div>
              <div style={{ display: 'flex', gap: '1rem', color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>
                <span>{fleetAlerts.filter(alert => !alert.read).length} unread</span>
                {fleetAlerts.filter(alert => alert.priority === 'critical' && !alert.read).length > 0 && (
                  <span style={{ color: '#dc2626', fontWeight: '600' }}>
                    {fleetAlerts.filter(alert => alert.priority === 'critical' && !alert.read).length} critical
                  </span>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="animate-fade-in-up" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '0.5rem',
            borderRadius: '0.75rem',
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)',
            border: currentThemeStyles.glassPanelBorder
          }}>
            {[
              { id: 'all' as FilterType, name: 'All Notifications', count: getFilterCount('all') },
              { id: 'unread' as FilterType, name: 'Unread', count: getFilterCount('unread') },
              { id: 'critical' as FilterType, name: 'Critical', count: getFilterCount('critical') },
              { id: 'fleet_operations' as FilterType, name: 'Fleet Operations', count: getFilterCount('fleet_operations') }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  border: 'none',
                  backgroundColor: filter === tab.id ? '#F59E0B' : 'transparent',
                  color: filter === tab.id ? 'white' : currentThemeStyles.textPrimary,
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span style={{
                    backgroundColor: filter === tab.id ? (theme === 'dark' ? '#0f172a' : '#a16207') : (theme === 'dark' ? '#334155' : '#fef3c7'),
                    color: filter === tab.id ? 'white' : currentThemeStyles.textPrimary,
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredAlerts.map((alert, index) => (
                <div
                  key={alert.id}
                  style={{
                    backgroundColor: alert.read ? currentThemeStyles.quickActionBg : currentThemeStyles.alertBg,
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: alert.priority === 'critical' ? '2px solid #dc2626' : currentThemeStyles.glassPanelBorder,
                    boxShadow: currentThemeStyles.glassPanelShadow,
                    backdropFilter: 'blur(12px)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    animation: `fade-in-up 0.5s ease-out ${index * 0.1}s both`
                  }}
                  onClick={() => markAsRead(alert.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ color: getAlertColor(alert.priority), flexShrink: 0, marginTop: '0.125rem' }}>
                      {getAlertIcon(alert)}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.125rem', fontWeight: 'bold', margin: 0 }}>
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
                        color: currentThemeStyles.textSecondary, 
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
                        color: currentThemeStyles.textMuted, 
                        fontSize: '0.875rem',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <ClockIcon width={16} height={16} />
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                        <div>Type: {alert.type.replace(/_/g, ' ').toUpperCase()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '3rem',
              borderRadius: '0.75rem',
              textAlign: 'center',
              color: currentThemeStyles.textSecondary,
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(12px)',
              border: currentThemeStyles.glassPanelBorder
            }}>
              <TruckIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: currentThemeStyles.textPrimary }}>
                No Fleet Notifications
              </div>
              <div>
                {filter === 'all' 
                  ? 'No fleet-related notifications at this time.' 
                  : `No ${filter.replace('_', ' ')} notifications found.`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FleetNotificationsPage() {
  return (
    <RealTimeEmergencyClient enableSound={true} enablePushNotifications={true}>
      <FleetNotificationsContent />
    </RealTimeEmergencyClient>
  );
}