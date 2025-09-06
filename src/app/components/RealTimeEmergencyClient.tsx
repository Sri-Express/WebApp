// src/app/components/RealTimeEmergencyClient.tsx
// OPTIMIZED VERSION - Better performance, memory management, and reliability

"use client";

import { useEffect, useState, useRef, useCallback, createContext, useContext, useMemo } from 'react';
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
  reconnectAttempts?: number;
}

export type EmergencyStatusUpdate = Record<string, unknown>;

interface RealTimeEmergencyClientProps {
  onEmergencyAlert?: (alert: EmergencyAlert) => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
  onEmergencyStatusUpdate?: (status: EmergencyStatusUpdate) => void;
  enableSound?: boolean;
  enablePushNotifications?: boolean;
  children?: React.ReactNode;
  maxAlerts?: number;
  debugMode?: boolean;
}

// Audio context singleton to prevent memory leaks
class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private lastSoundTime = 0;
  private readonly SOUND_COOLDOWN = 1000; // 1 second cooldown between sounds

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private getAudioContext(): AudioContext | null {
    if (!this.audioContext) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return null;
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  playSound(priority: string): void {
    const now = Date.now();
    if (now - this.lastSoundTime < this.SOUND_COOLDOWN) return;
    
    this.lastSoundTime = now;
    const audioContext = this.getAudioContext();
    if (!audioContext) return;

    try {
      let frequency = 800;
      let duration = 500;

      switch (priority) {
        case 'critical': frequency = 1000; duration = 1000; break;
        case 'high': frequency = 900; duration = 700; break;
        case 'medium': frequency = 800; duration = 500; break;
        case 'low': frequency = 700; duration = 300; break;
      }

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

      // Critical alerts get a double beep
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
  }

  cleanup(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export default function RealTimeEmergencyClient({
  onEmergencyAlert,
  onConnectionStatusChange,
  onEmergencyStatusUpdate,
  enableSound = true,
  enablePushNotifications = true,
  children,
  maxAlerts = 100,
  debugMode = false
}: RealTimeEmergencyClientProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connectedUsers: 0,
    reconnectAttempts: 0
  });
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  
  // Optimized state management with refs for performance
  const [lastAlertsFetch, setLastAlertsFetch] = useState(0);
  const [isCurrentlyFetchingAlerts, setIsCurrentlyFetchingAlerts] = useState(false);
  const [fetchRetryCount, setFetchRetryCount] = useState(0);

  // With:
const [networkOnline, setNetworkOnline] = useState(true);

// Add right after:
useEffect(() => {
  if (typeof window !== 'undefined') {
    setNetworkOnline(navigator.onLine);
  }
}, []);

  // Refs for cleanup and performance
  const audioManager = useRef<AudioManager>(AudioManager.getInstance());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const alertsFetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundQueueRef = useRef<Set<string>>(new Set());
  const alertsCacheRef = useRef<Map<string, EmergencyAlert>>(new Map());

  // Debounced log function to prevent console spam
  const debouncedLog = useMemo(() => {
    const logs = new Map<string, number>();
    return (message: string, level: 'log' | 'warn' | 'error' = 'log') => {
      if (!debugMode && level === 'log') return;
      
      const now = Date.now();
      const lastLog = logs.get(message) || 0;
      if (now - lastLog > 5000) { // Only log same message every 5 seconds
        console[level](message);
        logs.set(message, now);
      }
    };
  }, [debugMode]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setNetworkOnline(true);
      debouncedLog('Network reconnected - attempting socket reconnection');
      if (socket && !socket.connected) {
        socket.connect();
      }
    };
    
    const handleOffline = () => {
      setNetworkOnline(false);
      debouncedLog('Network offline detected', 'warn');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [socket, debouncedLog]);

  // Visibility change handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsVisible(visible);
      
      if (visible && socket && !socket.connected && networkOnline) {
        debouncedLog('Page became visible - checking connection');
        socket.connect();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [socket, networkOnline, debouncedLog]);

  // Optimized sound playing with queue management
  const playSound = useCallback((priority: string) => {
    if (!enableSound) return;
    
    // Prevent sound spam
    if (soundQueueRef.current.has(priority)) return;
    soundQueueRef.current.add(priority);
    
    audioManager.current.playSound(priority);
    
    // Clear from queue after playing
    setTimeout(() => {
      soundQueueRef.current.delete(priority);
    }, priority === 'critical' ? 2000 : 1000);
  }, [enableSound]);

  // Enhanced push notifications with better error handling
  const showPushNotification = useCallback(async (alert: EmergencyAlert) => {
    if (!enablePushNotifications || !('Notification' in window) || !networkOnline) return;

    try {
      let permission = Notification.permission;
      
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted' && isVisible === false) {
        const notification = new Notification(alert.title, {
          body: alert.message,
          icon: '/emergency-icon.png',
          badge: '/emergency-badge.png',
          tag: alert.id,
          requireInteraction: alert.priority === 'critical',
          data: {
            emergencyId: alert.emergency?._id,
            priority: alert.priority,
            type: alert.type,
            timestamp: alert.timestamp
          }
        });

        // Auto-close non-critical notifications
        if (alert.priority !== 'critical') {
          setTimeout(() => notification.close(), 10000);
        }

        notification.onclick = () => {
          window.focus();
          notification.close();
          
          // Emit custom event for handling notification clicks
          window.dispatchEvent(new CustomEvent('emergencyNotificationClick', {
            detail: { alert }
          }));
        };

        notification.onerror = (error) => {
          debouncedLog(`Notification error: ${error}`, 'error');
        };
      }
    } catch (error) {
      debouncedLog(`Push notification error: ${error}`, 'error');
    }
  }, [enablePushNotifications, networkOnline, isVisible, debouncedLog]);

  // Rate-limited and cached alert fetching
  const fetchExistingAlerts = useCallback(async (forceRefresh = false) => {
    if (!networkOnline) {
      debouncedLog('Skipping alerts fetch - network offline', 'warn');
      return;
    }

    const now = Date.now();
    const MIN_FETCH_INTERVAL = 20000; // 20 seconds
    const MAX_RETRY_ATTEMPTS = 3;

    // Rate limiting with exponential backoff
    const backoffMultiplier = Math.pow(2, fetchRetryCount);
    const minInterval = MIN_FETCH_INTERVAL * backoffMultiplier;

    if (!forceRefresh && (now - lastAlertsFetch < minInterval)) {
      debouncedLog(`Skipping alerts fetch - rate limited (${minInterval}ms remaining)`);
      return;
    }

    if (isCurrentlyFetchingAlerts) {
      debouncedLog('Alerts fetch already in progress');
      return;
    }

    if (fetchRetryCount >= MAX_RETRY_ATTEMPTS && !forceRefresh) {
      debouncedLog(`Max retry attempts reached (${fetchRetryCount}), scheduling retry`, 'warn');
      
      if (alertsFetchTimeoutRef.current) {
        clearTimeout(alertsFetchTimeoutRef.current);
      }
      
      alertsFetchTimeoutRef.current = setTimeout(() => {
        setFetchRetryCount(0);
        fetchExistingAlerts(true);
      }, Math.min(300000, 30000 * backoffMultiplier)); // Max 5 minutes
      
      return;
    }

    setIsCurrentlyFetchingAlerts(true);
    setLastAlertsFetch(now);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        debouncedLog('No auth token for alerts fetch', 'warn');
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${API_BASE_URL}/api/admin/emergency/user-alerts?limit=${maxAlerts}`, {
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const alertsArray = Array.isArray(data.alerts) ? data.alerts : [];
        
        // Use cache to prevent duplicate processing
        const newAlerts: EmergencyAlert[] = [];
        alertsArray.forEach((alert: EmergencyAlert) => {
          if (!alertsCacheRef.current.has(alert.id)) {
            alertsCacheRef.current.set(alert.id, alert);
            newAlerts.push({
              ...alert,
              timestamp: new Date(alert.timestamp),
              read: alert.read || false
            });
          }
        });

        if (newAlerts.length > 0) {
          setAlerts(prev => {
            const combined = [...newAlerts, ...prev];
            const unique = combined.filter((alert, index, self) => 
              index === self.findIndex(a => a.id === alert.id)
            );
            return unique.slice(0, maxAlerts);
          });
          
          debouncedLog(`Loaded ${newAlerts.length} new alerts (${alertsArray.length} total from API)`);
        }

        setFetchRetryCount(0);
        
        if (alertsFetchTimeoutRef.current) {
          clearTimeout(alertsFetchTimeoutRef.current);
          alertsFetchTimeoutRef.current = null;
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('AbortError')) {
        debouncedLog('Alerts fetch timed out', 'warn');
      } else {
        debouncedLog(`Alerts fetch failed: ${errorMessage}`, 'error');
      }
      
      setFetchRetryCount(prev => prev + 1);
    } finally {
      setIsCurrentlyFetchingAlerts(false);
    }
  }, [networkOnline, lastAlertsFetch, isCurrentlyFetchingAlerts, fetchRetryCount, maxAlerts, debouncedLog]);

  // Enhanced WebSocket connection with improved authentication handling
  useEffect(() => {
    if (!networkOnline) {
      debouncedLog('Skipping WebSocket connection - network offline', 'warn');
      return;
    }

    // Enhanced token validation
    const token = localStorage.getItem('token');
    if (!token) {
      debouncedLog('No auth token - skipping WebSocket connection', 'warn');
      setConnectionStatus(prev => ({ 
        ...prev, 
        connected: false, 
        connectionError: 'No authentication token' 
      }));
      return;
    }

    // Validate token format (basic check)
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
    } catch (error) {
      debouncedLog('Invalid token format - clearing and redirecting', 'error');
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/sysadmin/login';
      }
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Better URL construction for WebSocket
    let socketUrl = API_BASE_URL;
    if (socketUrl.startsWith('http://')) {
      socketUrl = socketUrl.replace('http://', 'ws://');
    } else if (socketUrl.startsWith('https://')) {
      socketUrl = socketUrl.replace('https://', 'wss://');
    }
    
    debouncedLog(`Setting up emergency WebSocket to: ${socketUrl}`);
    
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 30000,
      randomizationFactor: 0.5,
      // Add these additional options for better connection handling
      upgrade: true,
      rememberUpgrade: true,
      forceNew: false
    });

    // Enhanced connection handlers
    newSocket.on('connect', () => {
      debouncedLog('✅ Emergency WebSocket connected successfully');
      setConnectionStatus(prev => ({ 
        ...prev, 
        connected: true, 
        connectionError: undefined,
        reconnectAttempts: 0
      }));
      
      // Emit a ready event to let server know client is ready
      newSocket.emit('client_ready', { 
        clientType: 'sysadmin_emergency',
        timestamp: new Date().toISOString()
      });
      
      // Fetch alerts only on first connection or after extended disconnect
      const timeSinceLastFetch = Date.now() - lastAlertsFetch;
      if (timeSinceLastFetch > 60000 || lastAlertsFetch === 0) {
        fetchExistingAlerts();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    newSocket.on('disconnect', (reason) => {
      debouncedLog(`⚠️ WebSocket disconnected: ${reason}`, 'warn');
      setConnectionStatus(prev => ({ 
        ...prev, 
        connected: false, 
        connectionError: reason 
      }));
      
      // Handle authentication errors
      if (reason === 'io server disconnect' || reason.includes('auth')) {
        debouncedLog('Authentication issue detected - redirecting to login', 'error');
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/sysadmin/login';
        }
      }
    });

    newSocket.on('connect_error', (error) => {
      debouncedLog(`❌ WebSocket connection error: ${error.message}`, 'error');
      setConnectionStatus(prev => ({ 
        ...prev, 
        connected: false, 
        connectionError: error.message,
        reconnectAttempts: (prev.reconnectAttempts || 0) + 1
      }));
      
      // Handle authentication errors
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        debouncedLog('Unauthorized - clearing token and redirecting', 'error');
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/sysadmin/login';
        }
      }
    });

    // Add authentication failure handler
    newSocket.on('auth_error', (error) => {
      debouncedLog(`🔒 Authentication error: ${error}`, 'error');
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/sysadmin/login';
      }
    });

    newSocket.on('reconnect_attempt', (attempt) => {
      debouncedLog(`Reconnection attempt ${attempt}`);
      setConnectionStatus(prev => ({ 
        ...prev, 
        reconnectAttempts: attempt
      }));
    });

    // Emergency alert handling
    newSocket.on('emergency_alert', (alert: EmergencyAlert) => {
      debouncedLog(`Emergency alert received: ${alert.title} (${alert.priority})`);
      
      const alertWithTimestamp: EmergencyAlert = { 
        ...alert, 
        timestamp: new Date(alert.timestamp), 
        read: false 
      };
      
      // Update cache and state
      alertsCacheRef.current.set(alert.id, alertWithTimestamp);
      setAlerts(prev => [alertWithTimestamp, ...prev.slice(0, maxAlerts - 1)]);
      
      // Audio and visual feedback
      playSound(alert.priority);
      showPushNotification(alertWithTimestamp);

      // Critical alert handling
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

      // Callback for parent component
      onEmergencyAlert?.(alertWithTimestamp);
    });

    // Status updates
    newSocket.on('emergency_status', (status: EmergencyStatusUpdate) => {
      debouncedLog('Emergency status update received');
      onEmergencyStatusUpdate?.(status);
    });

    // Emergency resolution
    newSocket.on('emergency_resolved', (data: { emergencyId: string; timestamp: string }) => {
      debouncedLog(`Emergency resolved: ${data.emergencyId}`);
      
      const resolvedAlert: EmergencyAlert = {
        id: `resolved_${data.emergencyId}_${Date.now()}`,
        type: 'emergency_resolved',
        title: 'Emergency Resolved',
        message: `Emergency ${data.emergencyId} has been resolved`,
        priority: 'medium',
        timestamp: new Date(data.timestamp),
        recipients: ['all'],
        read: false
      };
      
      alertsCacheRef.current.set(resolvedAlert.id, resolvedAlert);
      setAlerts(prev => [resolvedAlert, ...prev.slice(0, maxAlerts - 1)]);
      playSound('medium');
      onEmergencyAlert?.(resolvedAlert);
    });

    // Dashboard updates
    newSocket.on('update_dashboard_stats', (data: unknown) => {
      debouncedLog('Dashboard stats update received');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('refreshDashboard', { detail: data }));
      }
    });

    // Heartbeat handling with better timeout management
    newSocket.on('heartbeat', (data: { connectedUsers: number; timestamp: string }) => {
      setConnectionStatus(prev => ({ 
        ...prev, 
        connectedUsers: data.connectedUsers, 
        lastHeartbeat: new Date(data.timestamp) 
      }));
      
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
      
      heartbeatTimeoutRef.current = setTimeout(() => {
        debouncedLog('Heartbeat timeout - connection unstable', 'warn');
        if (newSocket.connected) {
          newSocket.emit('ping'); // Try to revive connection
        }
      }, 90000); // 90 seconds timeout
    });

    // Push notification requests
    newSocket.on('push_notification_request', (data: { tag: string; title: string; body: string; data?: Record<string, unknown> }) => {
      debouncedLog(`Push notification request: ${data.title}`);
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

    // Minimal pong logging
    newSocket.on('pong', (data: { timestamp: string }) => {
      if (debugMode) {
        debouncedLog(`Pong: ${data.timestamp}`);
      }
    });

    newSocket.on('error', (error: Error) => {
      debouncedLog(`Socket error: ${error.message}`, 'error');
    });

    setSocket(newSocket);

    // Optimized ping interval with connection health check
    const startPingInterval = () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      
      pingIntervalRef.current = setInterval(() => {
        if (newSocket.connected && networkOnline) {
          newSocket.emit('ping');
        } else if (!networkOnline) {
          debouncedLog('Skipping ping - network offline', 'warn');
        }
      }, 60000); // 60 seconds
    };

    startPingInterval();

    // Cleanup function
    return () => {
      debouncedLog('Cleaning up WebSocket connection');
      
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = null;
      }
      
      if (alertsFetchTimeoutRef.current) {
        clearTimeout(alertsFetchTimeoutRef.current);
        alertsFetchTimeoutRef.current = null;
      }

      newSocket.disconnect();
    };
  }, [networkOnline, debugMode]); // Minimal dependencies

  // Connection status change callback
  useEffect(() => {
    onConnectionStatusChange?.(connectionStatus);
  }, [connectionStatus, onConnectionStatusChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioManager.current.cleanup();
      alertsCacheRef.current.clear();
      soundQueueRef.current.clear();
    };
  }, []);

  // Memoized functions for better performance
  const markAlertAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
    
    // Update cache
    const cachedAlert = alertsCacheRef.current.get(alertId);
    if (cachedAlert) {
      alertsCacheRef.current.set(alertId, { ...cachedAlert, read: true });
    }
    
    // Notify server
    socket?.emit('emergency_action', { 
      action: 'mark_notification_read', 
      notificationId: alertId 
    });
  }, [socket]);

  const subscribeToEmergency = useCallback((emergencyId: string) => {
    if (socket?.connected) {
      socket.emit('subscribe_emergency', emergencyId);
      debouncedLog(`Subscribed to emergency: ${emergencyId}`);
    }
  }, [socket, debouncedLog]);

  const unsubscribeFromEmergency = useCallback((emergencyId: string) => {
    if (socket?.connected) {
      socket.emit('unsubscribe_emergency', emergencyId);
      debouncedLog(`Unsubscribed from emergency: ${emergencyId}`);
    }
  }, [socket, debouncedLog]);

  const requestEmergencyStats = useCallback(() => {
    if (socket?.connected) {
      socket.emit('emergency_action', { action: 'request_emergency_stats' });
      debouncedLog('Requested emergency stats');
    }
  }, [socket, debouncedLog]);

  // Force refresh function for manual refresh
  const forceRefresh = useCallback(() => {
    setFetchRetryCount(0);
    fetchExistingAlerts(true);
  }, [fetchExistingAlerts]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    connectionStatus,
    alerts,
    markAlertAsRead,
    subscribeToEmergency,
    unsubscribeFromEmergency,
    requestEmergencyStats,
    forceRefresh,
    socket,
    isLoading: isCurrentlyFetchingAlerts,
    networkOnline
  }), [
    connectionStatus,
    alerts,
    markAlertAsRead,
    subscribeToEmergency,
    unsubscribeFromEmergency,
    requestEmergencyStats,
    forceRefresh,
    socket,
    isCurrentlyFetchingAlerts,
    networkOnline
  ]);

  return (
    <>
      {/* Loading indicator */}
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
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          🔄 Loading alerts...
        </div>
      )}

      {/* Network status indicator */}
      {!networkOnline && (
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          backgroundColor: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          zIndex: 9999,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          ⚠️ Network Offline
        </div>
      )}

      {/* WebSocket connection status */}
      {networkOnline && !connectionStatus.connected && connectionStatus.reconnectAttempts && connectionStatus.reconnectAttempts > 0 && (
        <div style={{
          position: 'fixed',
          top: '140px',
          right: '20px',
          backgroundColor: 'rgba(245, 158, 11, 0.9)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          zIndex: 9999,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          🔄 Reconnecting... (Attempt {connectionStatus.reconnectAttempts})
        </div>
      )}

      {/* Context provider */}
      {children && (
        <EmergencyContext.Provider value={contextValue}>
          {children}
        </EmergencyContext.Provider>
      )}

      {/* Styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

// Enhanced context interface
interface EmergencyContextType {
  connectionStatus: ConnectionStatus;
  alerts: EmergencyAlert[];
  markAlertAsRead: (alertId: string) => void;
  subscribeToEmergency: (emergencyId: string) => void;
  unsubscribeFromEmergency: (emergencyId: string) => void;
  requestEmergencyStats: () => void;
  forceRefresh: () => void;
  socket: Socket | null;
  isLoading: boolean;
  networkOnline: boolean;
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
    connected: context.connectionStatus.connected,
    isLoading: context.isLoading,
    networkOnline: context.networkOnline,
    forceRefresh: context.forceRefresh,
    connectionStatus: context.connectionStatus
  };
};