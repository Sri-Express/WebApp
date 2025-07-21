// src/app/components/RealTimeEmergencyClient.tsx
"use client";

import { useEffect, useState, useRef, useCallback, createContext, useContext } from 'react';
import { io, Socket } from 'socket.io-client';

// Defines the structure for the nested 'emergency' object.
export interface EmergencyDetails {
  _id: string;
  [key: string]: unknown; // Allows for other properties without using 'any'.
}

export interface EmergencyAlert {
  id: string;
  type: 'emergency_created' | 'emergency_resolved' | 'emergency_escalated' | 'broadcast' | 'critical_alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  // Replaced 'any' with the specific 'EmergencyDetails' interface.
  emergency?: EmergencyDetails;
  timestamp: Date;
  recipients: string[];
  // Replaced 'any' with a safer, more descriptive type.
  data?: Record<string, unknown>;
  read?: boolean;
}

export interface ConnectionStatus {
  connected: boolean;
  connectedUsers: number;
  lastHeartbeat?: Date;
  connectionError?: string;
}

// Defines the structure for emergency status updates.
export type EmergencyStatusUpdate = Record<string, unknown>;

interface RealTimeEmergencyClientProps {
  onEmergencyAlert?: (alert: EmergencyAlert) => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
  // Replaced 'any' with the specific 'EmergencyStatusUpdate' type.
  onEmergencyStatusUpdate?: (status: EmergencyStatusUpdate) => void;
  enableSound?: boolean;
  enablePushNotifications?: boolean;
  children?: React.ReactNode;
}

export default function RealTimeEmergencyClient({
  onEmergencyAlert,
  onConnectionStatusChange,
  onEmergencyStatusUpdate,
  enableSound = true,
  enablePushNotifications = true,
  children
}: RealTimeEmergencyClientProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connectedUsers: 0
  });
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sound effects for different alert types
  const playSound = useCallback((priority: string) => {
    if (!enableSound) return;

    try {
      let frequency = 800;
      let duration = 500;

      switch (priority) {
        case 'critical': frequency = 1000; duration = 1000; break;
        case 'high': frequency = 900; duration = 700; break;
        case 'medium': frequency = 800; duration = 500; break;
        case 'low': frequency = 700; duration = 300; break;
      }

      // Safely checks for vendor-prefixed AudioContext without using 'any'.
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        console.warn('Web Audio API is not supported in this browser.');
        return;
      }
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);

      if (priority === 'critical') {
        setTimeout(() => {
          const oscillator2 = audioContext.createOscillator();
          const gainNode2 = audioContext.createGain();
          oscillator2.connect(gainNode2);
          gainNode2.connect(audioContext.destination);
          oscillator2.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator2.type = 'sine';
          gainNode2.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          oscillator2.start(audioContext.currentTime);
          oscillator2.stop(audioContext.currentTime + 0.5);
        }, 600);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [enableSound]);

  // Browser push notifications
  const showPushNotification = useCallback(async (alert: EmergencyAlert) => {
    if (!enablePushNotifications || !('Notification' in window)) return;

    try {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;
      }

      if (Notification.permission === 'granted') {
        const notification = new Notification(alert.title, {
          body: alert.message,
          icon: '/emergency-icon.png',
          badge: '/emergency-badge.png',
          tag: alert.id,
          requireInteraction: alert.priority === 'critical',
          timestamp: new Date(alert.timestamp).getTime(),
          data: {
            emergencyId: alert.emergency?._id,
            priority: alert.priority,
            type: alert.type
          }
        });

        if (alert.priority !== 'critical') {
          setTimeout(() => notification.close(), 10000);
        }

        notification.onclick = () => {
          window.focus();
          if (alert.emergency?._id) {
            window.location.href = `/notifications`;
          }
          notification.close();
        };
      }
    } catch (error) {
      console.error('Error showing push notification:', error);
    }
  }, [enablePushNotifications]);

  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchExistingAlerts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/admin/emergency/user-alerts`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const alertsArray = data.alerts || [];
        if (Array.isArray(alertsArray) && alertsArray.length > 0) {
          setAlerts(prev => {
            const merged = [...alertsArray, ...prev];
            const unique = merged.filter((alert, index, self) => index === self.findIndex(a => a.id === alert.id));
            return unique.slice(0, 100);
          });
        }
      } else {
        console.warn('Failed to fetch existing alerts:', response.status);
      }
    } catch (error) {
      console.error('Error fetching existing alerts:', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No auth token found, skipping WebSocket connection');
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socketUrl = API_BASE_URL.replace(/^http/, 'ws');
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to emergency alert system');
      setConnectionStatus(prev => ({ ...prev, connected: true, connectionError: undefined }));
      fetchExistingAlerts();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from emergency alert system:', reason);
      setConnectionStatus(prev => ({ ...prev, connected: false, connectionError: reason }));
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      setConnectionStatus(prev => ({ ...prev, connected: false, connectionError: error.message }));
    });

    newSocket.on('connected', (data: { message: string }) => {
      console.log('📡 Welcome message:', data.message);
    });

    newSocket.on('emergency_alert', (alert: EmergencyAlert) => {
      console.log('🚨 Emergency alert received:', alert);
      const alertWithTimestamp = { ...alert, timestamp: new Date(alert.timestamp), read: false };
      setAlerts(prev => [alertWithTimestamp, ...prev.slice(0, 99)]);
      playSound(alert.priority);
      showPushNotification(alertWithTimestamp);

      if (alert.priority === 'critical' && !isVisible) {
        let flashCount = 0;
        const originalTitle = document.title;
        const flashInterval = setInterval(() => {
          document.title = flashCount % 2 === 0 ? '🚨 CRITICAL EMERGENCY!' : originalTitle;
          flashCount++;
          if (flashCount >= 10 || isVisible) {
            clearInterval(flashInterval);
            document.title = originalTitle;
          }
        }, 1000);
      }
      onEmergencyAlert?.(alertWithTimestamp);
    });

    newSocket.on('emergency_status', (status: EmergencyStatusUpdate) => {
      console.log('📊 Emergency status update:', status);
      onEmergencyStatusUpdate?.(status);
    });

    newSocket.on('emergency_resolved', (data: { emergencyId: string; timestamp: string }) => {
      console.log('✅ Emergency resolved:', data.emergencyId);
      const resolvedAlert: EmergencyAlert = {
        id: `resolved_${data.emergencyId}`,
        type: 'emergency_resolved',
        title: 'Emergency Resolved',
        message: `Emergency ${data.emergencyId} has been resolved`,
        priority: 'medium',
        timestamp: new Date(data.timestamp),
        recipients: ['all'],
        read: false
      };
      setAlerts(prev => [resolvedAlert, ...prev.slice(0, 99)]);
      playSound('medium');
      onEmergencyAlert?.(resolvedAlert);
    });

    newSocket.on('update_dashboard_stats', (data: unknown) => {
      console.log('📈 Dashboard stats update triggered');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('refreshDashboard', { detail: data }));
      }
    });

    newSocket.on('heartbeat', (data: { connectedUsers: number; timestamp: string }) => {
      setConnectionStatus(prev => ({ ...prev, connectedUsers: data.connectedUsers, lastHeartbeat: new Date(data.timestamp) }));
      if (heartbeatTimeoutRef.current) clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = setTimeout(() => {
        console.warn('⚠️ Heartbeat timeout - connection may be unstable');
      }, 45000);
    });

    newSocket.on('push_notification_request', (data: any) => {
      console.log('🔔 Push notification request:', data);
      showPushNotification({
        id: data.tag,
        type: 'critical_alert',
        title: data.title,
        message: data.body,
        priority: 'critical',
        timestamp: new Date(),
        recipients: ['all'],
        data: data.data
      });
    });

    newSocket.on('pong', (data: { timestamp: string }) => {
      console.log('🏓 Pong received:', data.timestamp);
    });

    newSocket.on('error', (error: Error) => {
      console.error('❌ Socket error:', error);
    });

    setSocket(newSocket);

    const pingInterval = setInterval(() => {
      if (newSocket.connected) newSocket.emit('ping');
    }, 30000);

    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (heartbeatTimeoutRef.current) clearTimeout(heartbeatTimeoutRef.current);
      newSocket.disconnect();
    };
  }, [fetchExistingAlerts, playSound, showPushNotification, isVisible, onEmergencyAlert, onEmergencyStatusUpdate]);

  useEffect(() => {
    onConnectionStatusChange?.(connectionStatus);
  }, [connectionStatus, onConnectionStatusChange]);

  const markAlertAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => alert.id === alertId ? { ...alert, read: true } : alert));
    socket?.emit('emergency_action', { action: 'mark_notification_read', notificationId: alertId });
  }, [socket]);

  const subscribeToEmergency = useCallback((emergencyId: string) => {
    socket?.emit('subscribe_emergency', emergencyId);
  }, [socket]);

  const unsubscribeFromEmergency = useCallback((emergencyId: string) => {
    socket?.emit('unsubscribe_emergency', emergencyId);
  }, [socket]);

  const requestEmergencyStats = useCallback(() => {
    socket?.emit('emergency_action', { action: 'request_emergency_stats' });
  }, [socket]);

  const contextValue = {
    connectionStatus,
    alerts,
    markAlertAsRead,
    subscribeToEmergency,
    unsubscribeFromEmergency,
    requestEmergencyStats,
    socket
  };

  return (
    <>
      <audio ref={audioRef} style={{ display: 'none' }} />
      {children && (
        // This closing tag has been corrected.
        <EmergencyContext.Provider value={contextValue}>
          {children}
        </EmergencyContext.Provider>
      )}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}

// --- React Context and Hooks ---
interface EmergencyContextType {
  connectionStatus: ConnectionStatus;
  alerts: EmergencyAlert[];
  markAlertAsRead: (alertId: string) => void;
  subscribeToEmergency: (emergencyId: string) => void;
  unsubscribeFromEmergency: (emergencyId: string) => void;
  requestEmergencyStats: () => void;
  socket: Socket | null;
}

const EmergencyContext = createContext<EmergencyContextType | null>(null);

export const useEmergencyContext = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergencyContext must be used within RealTimeEmergencyClient');
  }
  return context;
};

export const useEmergencyAlerts = () => {
  const context = useEmergencyContext();
  return {
    alerts: context.alerts,
    unreadCount: context.alerts.filter(alert => !alert.read).length,
    criticalCount: context.alerts.filter(alert => alert.priority === 'critical' && !alert.read).length,
    markAsRead: context.markAlertAsRead,
    connected: context.connectionStatus.connected
  };
};