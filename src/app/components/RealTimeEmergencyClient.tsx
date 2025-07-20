// src/app/components/RealTimeEmergencyClient.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface EmergencyAlert {
  id: string;
  type: 'emergency_created' | 'emergency_resolved' | 'emergency_escalated' | 'broadcast' | 'critical_alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  emergency?: any;
  timestamp: Date;
  recipients: string[];
  data?: any;
  read?: boolean;
}

export interface ConnectionStatus {
  connected: boolean;
  connectedUsers: number;
  lastHeartbeat?: Date;
  connectionError?: string;
}

interface RealTimeEmergencyClientProps {
  onEmergencyAlert?: (alert: EmergencyAlert) => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
  onEmergencyStatusUpdate?: (status: any) => void;
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
    if (!enableSound || !audioRef.current) return;

    try {
      // Different sounds for different priorities
      let frequency = 800; // Default frequency
      let duration = 500; // Default duration

      switch (priority) {
        case 'critical':
          frequency = 1000;
          duration = 1000;
          break;
        case 'high':
          frequency = 900;
          duration = 700;
          break;
        case 'medium':
          frequency = 800;
          duration = 500;
          break;
        case 'low':
          frequency = 700;
          duration = 300;
          break;
      }

      // Generate sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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

      // For critical alerts, play multiple beeps
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
      // Fallback to simple beep
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Alert');
        utterance.volume = 0.1;
        utterance.rate = 2;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [enableSound]);

  // Browser push notifications
  const showPushNotification = useCallback(async (alert: EmergencyAlert) => {
    if (!enablePushNotifications || !('Notification' in window)) return;

    try {
      // Request permission if not granted
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

        // Auto-close after a delay (except for critical alerts)
        if (alert.priority !== 'critical') {
          setTimeout(() => {
            notification.close();
          }, 10000);
        }

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          // Navigate to emergency page if needed
          if (alert.emergency?._id) {
            window.location.href = `/sysadmin/emergency`;
          }
          notification.close();
        };
      }
    } catch (error) {
      console.error('Error showing push notification:', error);
    }
  }, [enablePushNotifications]);

  // Page visibility detection for missed alerts
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No auth token found, skipping WebSocket connection');
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socketUrl = API_BASE_URL.replace(/^http/, 'ws');

    console.log('🔌 Connecting to emergency WebSocket:', socketUrl);

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to emergency alert system');
      setConnectionStatus(prev => ({
        ...prev,
        connected: true,
        connectionError: undefined
      }));
      
      // Clear reconnection timeout
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

    // Welcome message
    newSocket.on('connected', (data) => {
      console.log('📡 Welcome message:', data.message);
    });

    // Emergency alert handler
    newSocket.on('emergency_alert', (alert: EmergencyAlert) => {
      console.log('🚨 Emergency alert received:', alert);
      
      const alertWithTimestamp = {
        ...alert,
        timestamp: new Date(alert.timestamp),
        read: false
      };

      // Add to alerts list
      setAlerts(prev => [alertWithTimestamp, ...prev.slice(0, 99)]); // Keep last 100 alerts

      // Play sound
      playSound(alert.priority);

      // Show push notification
      showPushNotification(alertWithTimestamp);

      // Flash browser tab for critical alerts
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

      // Call callback
      if (onEmergencyAlert) {
        onEmergencyAlert(alertWithTimestamp);
      }
    });

    // Emergency status updates
    newSocket.on('emergency_status', (status) => {
      console.log('📊 Emergency status update:', status);
      if (onEmergencyStatusUpdate) {
        onEmergencyStatusUpdate(status);
      }
    });

    // Emergency resolved notification
    newSocket.on('emergency_resolved', (data) => {
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

      if (onEmergencyAlert) {
        onEmergencyAlert(resolvedAlert);
      }
    });

    // Dashboard stats update
    newSocket.on('update_dashboard_stats', (data) => {
      console.log('📈 Dashboard stats update triggered');
      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('refreshDashboard', { detail: data }));
    });

    // Heartbeat handler
    newSocket.on('heartbeat', (data) => {
      setConnectionStatus(prev => ({
        ...prev,
        connectedUsers: data.connectedUsers,
        lastHeartbeat: new Date(data.timestamp)
      }));

      // Reset heartbeat timeout
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
      
      heartbeatTimeoutRef.current = setTimeout(() => {
        console.warn('⚠️ Heartbeat timeout - connection may be unstable');
      }, 45000); // 45 seconds timeout
    });

    // Push notification request (for service worker integration)
    newSocket.on('push_notification_request', (data) => {
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

    // Ping/Pong for connection health
    newSocket.on('pong', (data) => {
      console.log('🏓 Pong received:', data.timestamp);
    });

    // Error handler
    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    setSocket(newSocket);

    // Send ping every 30 seconds to check connection
    const pingInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('ping');
      }
    }, 30000);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      clearInterval(pingInterval);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
      
      newSocket.disconnect();
    };
  }, []);

  // Update connection status callback
  useEffect(() => {
    if (onConnectionStatusChange) {
      onConnectionStatusChange(connectionStatus);
    }
  }, [connectionStatus, onConnectionStatusChange]);

  // Expose methods for external use
  const markAlertAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
    
    if (socket) {
      socket.emit('emergency_action', {
        action: 'mark_notification_read',
        notificationId: alertId
      });
    }
  }, [socket]);

  const subscribeToEmergency = useCallback((emergencyId: string) => {
    if (socket) {
      socket.emit('subscribe_emergency', emergencyId);
    }
  }, [socket]);

  const unsubscribeFromEmergency = useCallback((emergencyId: string) => {
    if (socket) {
      socket.emit('unsubscribe_emergency', emergencyId);
    }
  }, [socket]);

  const requestEmergencyStats = useCallback(() => {
    if (socket) {
      socket.emit('emergency_action', { action: 'request_emergency_stats' });
    }
  }, [socket]);

  // Provide context to children
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
      {/* Hidden audio element for sound effects */}
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      {/* Connection status indicator */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999,
        backgroundColor: connectionStatus.connected ? '#10b981' : '#ef4444',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: connectionStatus.connected ? 0.8 : 1,
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          animation: connectionStatus.connected ? 'pulse 2s infinite' : 'none'
        }} />
        {connectionStatus.connected ? (
          `🔴 LIVE (${connectionStatus.connectedUsers} users)`
        ) : (
          `❌ Disconnected${connectionStatus.connectionError ? `: ${connectionStatus.connectionError}` : ''}`
        )}
      </div>

      {/* Render children with context */}
      {children && (
        <EmergencyContext.Provider value={contextValue}>
          {children}
        </EmergencyContext.Provider>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}

// Create React Context for emergency data
import { createContext, useContext } from 'react';

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

// Additional hook for using emergency alerts
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