// components/CSNotifications.tsx
'use client';
import { useEffect, useState } from 'react';

// The 'WebSocketMessage' interface was removed as it was not being used.

interface Notification {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  // Changed 'any' to 'Record<string, unknown>' for better type safety.
  data: Record<string, unknown>;
}

export function CSNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // For now, we'll simulate notifications without WebSocket
  // You can replace this with actual WebSocket integration later
  useEffect(() => {
    // Simulate receiving notifications
    const simulateNotification = () => {
      const mockNotifications = [
        { type: 'new_ticket', message: 'New urgent ticket created', data: { priority: 'urgent' } },
        { type: 'new_chat', message: 'New chat request from customer', data: { customerName: 'John Doe' } },
        { type: 'ticket_update', message: 'Ticket status updated', data: { ticketId: 'TKT001' } }
      ];

      const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
      
      const notification: Notification = {
        id: Date.now(),
        type: randomNotification.type,
        message: randomNotification.message,
        timestamp: new Date().toISOString(),
        data: randomNotification.data
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    // Simulate notifications every 30 seconds (for demo)
    const interval = setInterval(simulateNotification, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-blue-600 text-white p-3 rounded-lg shadow-lg max-w-sm animate-slide-in transform transition-all duration-300 ease-in-out"
        >
          <div className="text-sm font-medium">{notification.message}</div>
          <div className="text-xs opacity-75">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}