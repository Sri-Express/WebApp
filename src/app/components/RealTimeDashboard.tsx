// File: src/app/components/RealTimeDashboard.tsx
"use client";

import { useEmergencyAlerts } from './RealTimeEmergencyClient';
import { BellIcon, WifiIcon } from '@heroicons/react/24/outline';

export default function RealTimeDashboard() {
  const { alerts, unreadCount, criticalCount, connected } = useEmergencyAlerts();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#1e293b',
      borderRadius: '0.5rem',
      border: '1px solid #334155'
    }}>
      {/* Connection Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: connected ? '#10b981' : '#ef4444'
      }}>
        <WifiIcon width={16} height={16} />
        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
          {connected ? 'LIVE' : 'Offline'}
        </span>
      </div>

      {/* Alert Counter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#f1f5f9'
      }}>
        <BellIcon width={16} height={16} />
        <span style={{ fontSize: '0.875rem' }}>
          {unreadCount} unread
        </span>
        {criticalCount > 0 && (
          <span style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {criticalCount} critical
          </span>
        )}
      </div>

      {/* Recent Alert */}
      {alerts.length > 0 && (
        <div style={{
          fontSize: '0.875rem',
          color: '#94a3b8',
          maxWidth: '300px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          Latest: {alerts[0].title}
        </div>
      )}
    </div>
  );
}