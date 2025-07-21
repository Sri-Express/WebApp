// src/components/CustomerChatWidget.tsx (or your path)
'use client';
import { useState, useEffect, useRef } from 'react';

// --- Interfaces (Unchanged) ---
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
    name:string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Logic and Functions (Largely Unchanged) ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!chatSession || !isOpen) return;

    const pollMessages = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cs/chat/sessions/${chatSession._id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.chat) {
            // Only update if there are new messages to prevent re-renders
            if (JSON.stringify(messages) !== JSON.stringify(data.data.chat.messages)) {
              setMessages(data.data.chat.messages || []);
            }
            setChatSession(prev => prev ? { ...prev, ...data.data.chat } : null);
          }
        }
      } catch (error) {
        console.error('Failed to poll messages:', error);
      }
    };

    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [chatSession, isOpen, messages]);

  const startChat = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cs/chat/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: userId || 'anonymous-' + Date.now(),
          channel: 'web',
          initialMessage: 'Hello! I need help with my booking.',
          customerInfo: { name: userName || 'Guest', email: userEmail || 'not-provided' }
        })
      });

      if (response.ok) {
        const data = await response.json();
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

    setMessages(prev => [...prev, tempMessage]);
    const messageToSend = newMessage;
    setNewMessage('');
    setIsConnecting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cs/chat/sessions/${chatSession._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageToSend, sender: 'customer' })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      // The polling will handle updating the message list, removing the temp message
    } catch (error) {
      console.error('Send message error:', error);
      setError('Failed to send message');
      setMessages(prev => prev.filter(m => m.messageId !== tempMessage.messageId));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusDisplay = () => {
    if (!chatSession) return { text: 'Not Connected', color: '#f87171' };
    switch (chatSession.status) {
      case 'waiting': return { text: 'Waiting for agent...', color: '#facc15' };
      case 'active': return { text: `Connected to ${chatSession.assignedAgent?.name || 'Agent'}`, color: '#4ade80' };
      case 'ended': return { text: 'Chat ended', color: '#9ca3af' };
      default: return { text: 'Unknown Status', color: '#9ca3af' };
    }
  };

  // ✅ STYLE: Added a style tag for pseudo-elements like scrollbars and focus rings
  const customStyles = `
    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }
    .chat-messages::-webkit-scrollbar-track {
      background: transparent;
    }
    .chat-messages::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      border: 3px solid transparent;
    }
    .chat-input:focus {
      border-color: rgba(59, 130, 246, 0.8) !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3) !important;
      outline: none;
    }
  `;

  if (!isOpen) {
    return (
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
        {/* ✅ STYLE: Glassy chat bubble button */}
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
      width: '370px',
      height: 'clamp(500px, 80vh, 600px)',
      // ✅ STYLE: Main glass container
      backgroundColor: 'rgba(30, 41, 59, 0.75)',
      backdropFilter: 'blur(16px)',
      borderRadius: '16px',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.35)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#f1f5f9',
      fontFamily: 'sans-serif'
    }}>
      <style>{customStyles}</style>
      {/* ✅ STYLE: Glassy Header */}
      <div style={{
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        flexShrink: 0
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            Sri Express Support
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusDisplay().color, transition: 'background-color 0.3s' }}></span>
            <span style={{ opacity: 0.8 }}>{getStatusDisplay().text}</span>
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '18px', cursor: 'pointer', padding: '4px' }}
        >
          ✕
        </button>
      </div>

      {/* ✅ STYLE: Transparent Messages Area */}
      <div className="chat-messages" style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {!chatSession ? (
          <div style={{ textAlign: 'center', padding: '20px', margin: 'auto', color: '#d1d5db' }}>
            <h4 style={{ color: '#f1f5f9', marginBottom: '12px', fontSize: '1.1rem' }}>
              👋 Welcome to Sri Express!
            </h4>
            <p style={{ fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
              Get instant help with your bookings, payments, and travel questions.
            </p>
            <button
              onClick={startChat}
              disabled={isConnecting}
              style={{
                backgroundColor: isConnecting ? 'rgba(75, 85, 99, 0.8)' : 'rgba(16, 185, 129, 0.8)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: isConnecting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}
            >
              {isConnecting ? 'Connecting...' : '🚀 Start Chat'}
            </button>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.messageId}
                style={{
                  display: 'flex',
                  justifyContent: message.sender === 'customer' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  // ✅ STYLE: Glassy message bubbles
                  backgroundColor: message.sender === 'customer' ? 'rgba(59, 130, 246, 0.8)' : 
                                   message.sender === 'agent' ? 'rgba(16, 185, 129, 0.7)' : 
                                   message.sender === 'ai_bot' ? 'rgba(8, 145, 178, 0.7)' : 'rgba(107, 114, 128, 0.7)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', fontWeight: 600 }}>
                    {message.sender === 'customer' ? 'You' : 
                     message.sender === 'agent' ? `👨‍💼 ${chatSession.assignedAgent?.name || 'Agent'}` : 
                     message.sender === 'ai_bot' ? '🤖 AI Assistant' : '⚙️ System'}
                  </div>
                  {message.content}
                  <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '5px', textAlign: 'right' }}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}

        {error && (
          <div style={{
            backgroundColor: 'rgba(220, 38, 38, 0.7)',
            color: '#fecaca',
            padding: '8px 12px',
            borderRadius: '6px',
            marginTop: '8px',
            fontSize: '14px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* ✅ STYLE: Glassy Input Area */}
      {chatSession && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="chat-input"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isConnecting || chatSession.status === 'ended'}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: '#f1f5f9',
                transition: 'all 0.2s ease',
                opacity: chatSession.status === 'ended' ? 0.5 : 1
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isConnecting || chatSession.status === 'ended'}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: (!newMessage.trim() || isConnecting || chatSession.status === 'ended') ? 'not-allowed' : 'pointer',
                opacity: (!newMessage.trim() || isConnecting || chatSession.status === 'ended') ? 0.5 : 1,
                fontSize: '16px',
                transition: 'all 0.2s ease'
              }}
            >
              {isConnecting ? '⏳' : '➤'}
            </button>
          </div>
          {chatSession.status === 'ended' && (
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
              This chat has ended.
            </p>
          )}
        </div>
      )}
    </div>
  );
}