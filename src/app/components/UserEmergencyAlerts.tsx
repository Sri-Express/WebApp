// src/app/components/UserEmergencyAlerts.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ExclamationTriangleIcon,
  BellIcon,
  XMarkIcon,
  ShieldExclamationIcon,
  SpeakerWaveIcon,
  FireIcon,
  HeartIcon,
  CloudIcon,
  TruckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useEmergencyAlerts, EmergencyAlert } from './RealTimeEmergencyClient';

interface UserEmergencyAlertsProps {
  showInDashboard?: boolean;
  maxAlerts?: number;
}

export default function UserEmergencyAlerts({ 
  showInDashboard = false, 
  maxAlerts = 3 
}: UserEmergencyAlertsProps) {
  const router = useRouter();
  const { alerts, unreadCount, criticalCount, markAsRead, connected } = useEmergencyAlerts();
  const [showAll, setShowAll] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Filter alerts for users (exclude admin-only alerts)
  const userAlerts = alerts.filter(alert => 
    alert.recipients.includes('all') || 
    alert.recipients.includes('users') ||
    alert.type === 'broadcast'
  );

  // Get current active alerts (not dismissed)
  const activeAlerts = userAlerts.filter(alert => 
    !dismissedAlerts.includes(alert.id) && !alert.read
  );

  // Dismiss alert
  const dismissAlert = useCallback((alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    markAsRead(alertId);
  }, [markAsRead]);

  // Get alert icon
  const getAlertIcon = (alert: EmergencyAlert) => {
    switch (alert.type) {
      case 'emergency_created':
        return <ExclamationTriangleIcon width={20} height={20} />;
      case 'broadcast':
        return <SpeakerWaveIcon width={20} height={20} />;
      case 'critical_alert':
        return <ShieldExclamationIcon width={20} height={20} />;
      default:
        return <BellIcon width={20} height={20} />;
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

  // Dashboard view (embedded in dashboard)
  if (showInDashboard) {
    if (activeAlerts.length === 0) return null;

    return (
      <div style={{
        backgroundColor: 'rgba(254, 226, 226, 0.9)',
        borderLeft: '4px solid #dc2626',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '1.5rem',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(220, 38, 38, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#dc2626',
            fontWeight: 'bold'
          }}>
            <ExclamationTriangleIcon width={20} height={20} />
            Emergency Alert{activeAlerts.length > 1 ? 's' : ''}
            {criticalCount > 0 && (
              <span style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem'
              }}>
                {criticalCount} Critical
              </span>
            )}
          </div>
          <button
            onClick={() => router.push('/notifications')}
            style={{
              color: '#dc2626',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            View All ({unreadCount})
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {activeAlerts.slice(0, maxAlerts).map((alert) => (
            <div
              key={alert.id}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: `1px solid ${getAlertColor(alert.priority)}`,
                position: 'relative'
              }}
            >
              <button
                onClick={() => dismissAlert(alert.id)}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <XMarkIcon width={16} height={16} />
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <div style={{ color: getAlertColor(alert.priority) }}>
                  {getAlertIcon(alert)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '0.25rem'
                  }}>
                    {alert.title}
                  </div>
                  <div style={{
                    color: '#4b5563',
                    fontSize: '0.875rem',
                    lineHeight: '1.4',
                    marginBottom: '0.5rem'
                  }}>
                    {alert.message}
                  </div>
                  <div style={{
                    color: '#6b7280',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <ClockIcon width={12} height={12} />
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeAlerts.length > maxAlerts && (
          <div style={{
            textAlign: 'center',
            marginTop: '1rem',
            padding: '0.5rem',
            color: '#dc2626',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            +{activeAlerts.length - maxAlerts} more alert{activeAlerts.length - maxAlerts > 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }

  // Floating alert view (for layout)
  if (activeAlerts.length === 0) return null;

  const topAlert = activeAlerts[0];

  return (
    <div style={{
      position: 'fixed',
      top: connected ? '60px' : '10px', // Below connection indicator
      right: '10px',
      zIndex: 9998,
      maxWidth: '400px',
      backgroundColor: getAlertColor(topAlert.priority),
      color: 'white',
      padding: '1rem',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
      animation: 'slideInRight 0.3s ease-out',
      cursor: 'pointer'
    }}
    onClick={() => router.push('/notifications')}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <div style={{ fontSize: '1.25rem' }}>
          {topAlert.priority === 'critical' ? '🚨' : 
           topAlert.priority === 'high' ? '⚠️' : '📢'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '0.25rem',
            fontSize: '1rem'
          }}>
            {topAlert.title}
          </div>
          <div style={{
            fontSize: '0.875rem',
            opacity: 0.9,
            marginBottom: '0.5rem',
            lineHeight: '1.4'
          }}>
            {topAlert.message}
          </div>
          <div style={{
            fontSize: '0.75rem',
            opacity: 0.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>{new Date(topAlert.timestamp).toLocaleTimeString()}</span>
            {activeAlerts.length > 1 && (
              <span>+{activeAlerts.length - 1} more</span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            dismissAlert(topAlert.id);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            opacity: 0.8,
            padding: '0.25rem'
          }}
        >
          <XMarkIcon width={16} height={16} />
        </button>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}