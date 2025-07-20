// File: src/app/components/NotificationPermissions.tsx
"use client";

import { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function NotificationPermissions() {
  const [showBanner, setShowBanner] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setShowBanner(Notification.permission === 'default');
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowBanner(false);
      
      if (result === 'granted') {
        // Show test notification
        new Notification('Emergency Alerts Enabled', {
          body: 'You will now receive real-time emergency notifications',
          icon: '/emergency-icon.png'
        });
      }
    }
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '1rem',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <BellIcon width={24} height={24} />
        <div>
          <div style={{ fontWeight: '600' }}>Enable Emergency Alerts</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            Get instant notifications for critical emergencies and system alerts
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={requestPermission}
          style={{
            backgroundColor: 'white',
            color: '#dc2626',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Enable
        </button>
        <button
          onClick={() => setShowBanner(false)}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            padding: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <XMarkIcon width={20} height={20} />
        </button>
      </div>
    </div>
  );
}