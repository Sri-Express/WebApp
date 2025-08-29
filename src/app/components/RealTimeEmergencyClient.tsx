// src/app/components/RealTimeEmergencyClient.tsx

// FIXED VERSION - Add proper rate limiting and prevent excessive API calls
"use client";

import { useEffect, useState, useRef, useCallback, createContext, useContext } from 'react';
import { io, Socket } from 'socket.io-client';

// Interfaces remain the same...
export interface EmergencyDetails {
  _id: string;
  [key: string]: unknown;
}

export interface EmergencyAlert {
  id: string;
  type: 'emergency_created' | 'emergency_resolved' | 'emergency_escalated' | 'broadcast' | 'critical_alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  emergency?: EmergencyDetails;
  timestamp: Date;
  recipients: string[];
  data?: Record<string, unknown>;
  read?: boolean;
}

export interface ConnectionStatus {
  connected: boolean;
  connectedUsers: number;
  lastHeartbeat?: Date;
  connectionError?: string;
}

export type EmergencyStatusUpdate = Record<string, unknown>;

interface PushNotificationRequestData {
  tag: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface RealTimeEmergencyClientProps {
  onEmergencyAlert?: (alert: EmergencyAlert) => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
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
  
  // CRITICAL FIX: Add rate limiting for API calls
  const [lastAlertsFetch, setLastAlertsFetch] = useState(0);
  const [isCurrentlyFetchingAlerts, setIsCurrentlyFetchingAlerts] = useState(false);
  const [alertsFetchAttempts, setAlertsFetchAttempts] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const alertsFetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
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

  // CRITICAL FIX: Rate-limited alert fetching with exponential backoff
  const fetchExistingAlerts = useCallback(async (isRetry = false) => {
    const now = Date.now();
    const MIN_FETCH_INTERVAL = isRetry ? 30000 : 15000; // 15s normal, 30s retry
    const MAX_FETCH_ATTEMPTS = 3;

    // Rate limiting
    if (now - lastAlertsFetch < MIN_FETCH_INTERVAL) {
      console.log('⏰ Skipping alerts fetch - too recent');
      return;
    }

    // Prevent concurrent fetches
    if (isCurrentlyFetchingAlerts) {
      console.log('🔄 Skipping alerts fetch - already in progress');
      return;
    }

    // Exponential backoff after multiple failures
    if (alertsFetchAttempts >= MAX_FETCH_ATTEMPTS && !isRetry) {
      console.log(`❌ Maximum fetch attempts reached (${alertsFetchAttempts}), backing off`);
      
      // Schedule retry with exponential backoff
      const backoffDelay = Math.min(60000, 5000 * Math.pow(2, alertsFetchAttempts - MAX_FETCH_ATTEMPTS));
      alertsFetchTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Retrying alerts fetch after backoff');
        fetchExistingAlerts(true);
      }, backoffDelay);
      return;
    }

    setIsCurrentlyFetchingAlerts(true);
    setLastAlertsFetch(now);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No auth token found for alerts fetch');
        setIsCurrentlyFetchingAlerts(false);
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('📡 Fetching existing alerts...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${API_BASE_URL}/api/admin/emergency/user-alerts`, {
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const alertsArray = data.alerts || [];
        
        if (Array.isArray(alertsArray) && alertsArray.length > 0) {
          setAlerts(prev => {
            const merged = [...alertsArray, ...prev];
            const unique = merged.filter((alert, index, self) => 
              index === self.findIndex(a => a.id === alert.id)
            );
            return unique.slice(0, 100);
          });
          console.log(`✅ Loaded ${alertsArray.length} existing alerts`);
        } else {
          console.log('📭 No existing alerts found');
        }

        // Reset failure counter on success
        setAlertsFetchAttempts(0);
        
        // Clear any pending retry timeout
        if (alertsFetchTimeoutRef.current) {
          clearTimeout(alertsFetchTimeoutRef.current);
          alertsFetchTimeoutRef.current = null;
        }
      } else {
        console.warn(`⚠️ Failed to fetch alerts: HTTP ${response.status}`);
        setAlertsFetchAttempts(prev => prev + 1);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⏱️ Alerts fetch timed out');
      } else {
        console.error('❌ Error fetching existing alerts:', error);
      }
      setAlertsFetchAttempts(prev => prev + 1);
    } finally {
      setIsCurrentlyFetchingAlerts(false);
    }
  }, [lastAlertsFetch, isCurrentlyFetchingAlerts, alertsFetchAttempts]);

  // FIXED: WebSocket connection with proper error handling and rate limiting
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No auth token found, skipping WebSocket connection');
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socketUrl = API_BASE_URL.replace(/^http/, 'ws');
    
    console.log('🔌 Initializing WebSocket connection...');
    
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 2000, // Increased from 1000ms
      reconnectionAttempts: 5,
      reconnectionDelayMax: 10000, // Max delay between reconnections
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to emergency alert system');
      setConnectionStatus(prev => ({ 
        ...prev, 
        connected: true, 
        connectionError: undefined 
      }));
      
      // FIXED: Only fetch alerts on first connection or after long disconnect
      const timeSinceLastFetch = Date.now() - lastAlertsFetch;
      if (timeSinceLastFetch > 60000) { // Only if more than 1 minute since last fetch
        console.log('🔄 Fetching alerts after connection (rate limited)');
        fetchExistingAlerts();
      } else {
        console.log('⏰ Skipping alerts fetch - recent fetch detected');
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from emergency alert system:', reason);
      setConnectionStatus(prev => ({ 
        ...prev, 
        connected: false, 
        connectionError: reason 
      }));
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      setConnectionStatus(prev => ({ 
        ...prev, 
        connected: false, 
        connectionError: error.message 
      }));
    });

    newSocket.on('connected', (data: { message: string }) => {
      console.log('📡 Welcome message:', data.message);
    });

    newSocket.on('emergency_alert', (alert: EmergencyAlert) => {
      console.log('🚨 Emergency alert received:', alert.title);
      const alertWithTimestamp = { 
        ...alert, 
        timestamp: new Date(alert.timestamp), 
        read: false 
      };
      
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

    // FIXED: Less aggressive heartbeat handling
    newSocket.on('heartbeat', (data: { connectedUsers: number; timestamp: string }) => {
      setConnectionStatus(prev => ({ 
        ...prev, 
        connectedUsers: data.connectedUsers, 
        lastHeartbeat: new Date(data.timestamp) 
      }));
      
      if (heartbeatTimeoutRef.current) clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = setTimeout(() => {
        console.warn('⚠️ Heartbeat timeout - connection may be unstable');
      }, 60000); // Increased timeout to 60 seconds
    });

    newSocket.on('push_notification_request', (data: PushNotificationRequestData) => {
      console.log('🔔 Push notification request:', data.title);
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
      // Reduced log frequency for pong messages
      if (Math.random() < 0.1) { // Only log 10% of pong messages
        console.log('🏓 Pong received:', data.timestamp);
      }
    });

    newSocket.on('error', (error: Error) => {
      console.error('❌ Socket error:', error);
    });

    setSocket(newSocket);

    // FIXED: Less aggressive ping interval
    const pingInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('ping');
      }
    }, 45000); // Increased from 30 seconds to 45 seconds

    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (heartbeatTimeoutRef.current) clearTimeout(heartbeatTimeoutRef.current);
      if (alertsFetchTimeoutRef.current) clearTimeout(alertsFetchTimeoutRef.current);
      newSocket.disconnect();
    };
  }, []); // FIXED: Empty dependency array to prevent recreation

  useEffect(() => {
    onConnectionStatusChange?.(connectionStatus);
  }, [connectionStatus, onConnectionStatusChange]);

  const markAlertAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
    socket?.emit('emergency_action', { 
      action: 'mark_notification_read', 
      notificationId: alertId 
    });
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
      {isCurrentlyFetchingAlerts && (
        <div style={{
          position: 'fixed',
          top: '60px',
          right: '20px',
          backgroundColor: 'rgba(59, 130, 246, 0.9)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          zIndex: 9999,
          backdropFilter: 'blur(8px)'
        }}>
          🔄 Loading alerts...
        </div>
      )}
      {children && (
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

// Context and hooks remain the same...
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