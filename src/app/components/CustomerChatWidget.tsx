// components/CustomerChatWidget.tsx - Add this to your main dashboard
'use client';
import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: 'customer' | 'agent' | 'ai' | 'system';
  content: string;
  timestamp: string;
}

interface ChatWidgetProps {
  userId?: string;
  userName?: string;
  userEmail?: string;
}

export default function CustomerChatWidget({ userId, userName, userEmail }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startChat = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          customerId: userId,
          channel: 'web',
          initialMessage: 'Hello, I need help with my booking.'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChatSessionId(data.data.chat._id);
          setMessages(data.data.chat.messages || []);
          setConnected(true);
        }
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatSessionId) return;

    const tempMessage: Message = {
      id: Date.now().toString(),
      sender: 'customer',
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/chat/sessions/${chatSessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          content: newMessage,
          sender: 'customer'
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Message already added optimistically
        
        // Simulate AI/agent response after 2 seconds
        setTimeout(() => {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            content: 'Thank you for contacting Sri Express support! I\'m here to help you with your booking. Can you please provide me with your booking ID or tell me more about the issue you\'re experiencing?',
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, aiResponse]);
          setIsTyping(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }}
        >
          💬
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      height: '500px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            💬 Sri Express Support
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
            {connected ? '🟢 Connected' : '🔴 Not connected'}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        backgroundColor: '#f8fafc'
      }}>
        {!connected ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h4 style={{ color: '#374151', marginBottom: '12px' }}>
              👋 Welcome to Sri Express Support!
            </h4>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
              Get instant help with your bookings, payments, and travel questions.
            </p>
            <button
              onClick={startChat}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              🚀 Start Chat
            </button>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: message.sender === 'customer' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    backgroundColor: message.sender === 'customer' ? '#3b82f6' : 
                                   message.sender === 'ai' ? '#10b981' : 
                                   message.sender === 'system' ? '#6b7280' : '#e5e7eb',
                    color: message.sender === 'customer' || message.sender === 'ai' || message.sender === 'system' ? 'white' : '#374151',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}
                >
                  <div style={{
                    fontSize: '10px',
                    opacity: 0.8,
                    marginBottom: '4px'
                  }}>
                    {message.sender === 'customer' ? '👤 You' : 
                     message.sender === 'ai' ? '🤖 AI Assistant' : 
                     message.sender === 'agent' ? '👨‍💼 Agent' : '⚙️ System'} • {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                  {message.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{
                  backgroundColor: '#e5e7eb',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  🤖 AI is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      {connected && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                opacity: newMessage.trim() ? 1 : 0.5,
                fontSize: '14px'
              }}
            >
              📤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}