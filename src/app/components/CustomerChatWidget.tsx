// REPLACE your CustomerChatWidget.tsx with this complete version
'use client';
import { useState, useEffect, useRef } from 'react';

interface Message {
  messageId: string;
  sender: 'customer' | 'agent' | 'ai_bot' | 'system';
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface ChatSession {
  _id: string;
  sessionId: string;
  status: 'waiting' | 'active' | 'ended' | 'transferred';
  messages: Message[];
  customerInfo: {
    name: string;
    email: string;
  };
  assignedAgent?: {
    name: string;
  };
}

interface CustomerChatWidgetProps {
  userId?: string;
  userName?: string;
  userEmail?: string;
}

export default function CustomerChatWidget({ userId, userName, userEmail }: CustomerChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages when chat is active
  useEffect(() => {
    if (!chatSession) return;

    const pollMessages = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cs/chat/sessions/${chatSession._id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.chat) {
            setMessages(data.data.chat.messages || []);
            setChatSession(prev => prev ? { ...prev, ...data.data.chat } : null);
          }
        }
      } catch (error) {
        console.error('Failed to poll messages:', error);
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [chatSession]);

  const startChat = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cs/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: userId || 'anonymous-' + Date.now(),
          channel: 'web',
          initialMessage: 'Hello! I need help with my booking.'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Chat started:', data);
        if (data.data?.chat) {
          setChatSession(data.data.chat);
          setMessages(data.data.chat.messages || []);
        }
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to start chat: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Chat start error:', error);
      setError(error instanceof Error ? error.message : 'Failed to start chat');
    } finally {
      setIsConnecting(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatSession || isConnecting) return;

    const tempMessage: Message = {
      messageId: 'temp-' + Date.now(),
      sender: 'customer',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // Optimistically add message
    setMessages(prev => [...prev, tempMessage]);
    const messageToSend = newMessage;
    setNewMessage('');
    setIsConnecting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cs/chat/sessions/${chatSession._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageToSend,
          sender: 'customer'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Message sent:', data);
        // Remove temp message and refresh from server
        setTimeout(() => {
          fetchMessages();
        }, 500);
      } else {
        // Remove temp message on error
        setMessages(prev => prev.filter(m => m.messageId !== tempMessage.messageId));
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      setError('Failed to send message');
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.messageId !== tempMessage.messageId));
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchMessages = async () => {
    if (!chatSession) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cs/chat/sessions/${chatSession._id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.chat) {
          setMessages(data.data.chat.messages || []);
          setChatSession(prev => prev ? { ...prev, ...data.data.chat } : null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusDisplay = () => {
    if (!chatSession) return '🔴 Not connected';
    switch (chatSession.status) {
      case 'waiting': return '🟡 Waiting for agent...';
      case 'active': return `🟢 Connected${chatSession.assignedAgent ? ` to ${chatSession.assignedAgent.name}` : ''}`;
      case 'ended': return '⚪ Chat ended';
      default: return '🔴 Unknown status';
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
      overflow: 'hidden',
      border: '1px solid #e5e7eb'
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
            {getStatusDisplay()}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
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
        {!chatSession ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h4 style={{ color: '#374151', marginBottom: '12px' }}>
              👋 Welcome to Sri Express Support!
            </h4>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
              Get instant help with your bookings, payments, and travel questions.
            </p>
            <button
              onClick={startChat}
              disabled={isConnecting}
              style={{
                backgroundColor: isConnecting ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: isConnecting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              {isConnecting ? '🔄 Starting...' : '🚀 Start Chat'}
            </button>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.messageId}
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
                                   message.sender === 'agent' ? '#10b981' : 
                                   message.sender === 'ai_bot' ? '#0891b2' : '#6b7280',
                    color: 'white',
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
                     message.sender === 'agent' ? `👨‍💼 ${chatSession.assignedAgent?.name || 'Agent'}` : 
                     message.sender === 'ai_bot' ? '🤖 AI Assistant' : '⚙️ System'} • {new Date(message.timestamp).toLocaleTimeString()}
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
                  💭 Agent is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '8px 12px',
            borderRadius: '6px',
            marginTop: '8px',
            fontSize: '14px'
          }}>
            {error}
            <button 
              onClick={() => setError(null)}
              style={{
                float: 'right',
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Input Area */}
      {chatSession && (
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
              disabled={isConnecting || chatSession.status === 'ended'}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                opacity: chatSession.status === 'ended' ? 0.5 : 1
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isConnecting || chatSession.status === 'ended'}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: (!newMessage.trim() || isConnecting || chatSession.status === 'ended') ? 'not-allowed' : 'pointer',
                opacity: (!newMessage.trim() || isConnecting || chatSession.status === 'ended') ? 0.5 : 1,
                fontSize: '14px'
              }}
            >
              {isConnecting ? '⏳' : '📤'}
            </button>
          </div>
          {chatSession.status === 'ended' && (
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '12px',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              This chat has ended. Start a new chat if you need more help.
            </p>
          )}
        </div>
      )}
    </div>
  );
}