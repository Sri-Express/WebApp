// hooks/useCSWebSocket.ts
import { useEffect, useRef, useState } from 'react';

// Define specific data types for different message types
interface NewChatData {
  sessionId: string;
  userId: string;
  priority?: string;
}

interface NewTicketData {
  ticketId: string;
  priority: string;
  subject?: string;
  userId?: string;
}

interface ChatMessageData {
  sessionId: string;
  message: string;
  senderId: string;
  senderType: 'user' | 'agent';
}

interface TicketUpdateData {
  ticketId: string;
  status: string;
  updatedBy: string;
  notes?: string;
}

interface AgentStatusData {
  agentId: string;
  status: 'online' | 'offline' | 'busy';
  timestamp: string;
}

// Union type for all possible message data
type WebSocketMessageData = 
  | NewChatData 
  | NewTicketData 
  | ChatMessageData 
  | TicketUpdateData 
  | AgentStatusData;

interface WebSocketMessage {
  type: 'new_chat' | 'new_ticket' | 'chat_message' | 'ticket_update' | 'agent_status';
  data: WebSocketMessageData;
  timestamp: string;
}

// Type for outgoing messages
interface OutgoingMessage {
  type: string;
  data: Record<string, unknown>;
  timestamp?: string;
}

export function useCSWebSocket() {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (!token) return;

    // For now, we'll simulate WebSocket connection
    // Replace this with actual WebSocket implementation when your backend supports it
    const simulateConnection = () => {
      setConnected(true);
      console.log('CS WebSocket simulated connection');

      // Simulate periodic messages
      const interval = setInterval(() => {
        const mockMessages: WebSocketMessage[] = [
          {
            type: 'new_ticket',
            data: { ticketId: 'TKT' + Date.now(), priority: 'medium' } as NewTicketData,
            timestamp: new Date().toISOString()
          },
          {
            type: 'chat_message',
            data: { 
              sessionId: 'CH' + Date.now(), 
              message: 'Hello!', 
              senderId: 'user123',
              senderType: 'user'
            } as ChatMessageData,
            timestamp: new Date().toISOString()
          }
        ];

        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        setLastMessage(randomMessage);
      }, 60000); // Every minute

      return () => {
        clearInterval(interval);
        setConnected(false);
        console.log('CS WebSocket simulated disconnection');
      };
    };

    const cleanup = simulateConnection();

    // Uncomment this when you have actual WebSocket support:
    /*
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
    const ws = new WebSocket(`${wsUrl}/cs?token=${token}`);
    
    ws.onopen = () => {
      setConnected(true);
      console.log('CS WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('CS WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('CS WebSocket error:', error);
      setConnected(false);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
    */

    return cleanup;
  }, []);

  const sendMessage = (message: OutgoingMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      // Simulate sending message
      console.log('Simulated WebSocket send:', message);
    }
  };

  return {
    connected,
    lastMessage,
    sendMessage
  };
}