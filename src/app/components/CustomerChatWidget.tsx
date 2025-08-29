// src/components/CustomerChatWidget.tsx - Enhanced with Satisfaction Rating
'use client';
import { useState, useEffect, useRef } from 'react';

// --- Interfaces (Enhanced) ---
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
  feedback?: {
    rating: number;
    comment?: string;
    submittedAt: string;
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
  
  // Rating states
  const [showRating, setShowRating] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Monitor chat status for rating prompt
  useEffect(() => {
    if (chatSession?.status === 'ended' && !ratingSubmitted && !chatSession.feedback) {
      setShowRating(true);
    }
    // FIXED: Added 'chatSession.feedback' to the dependency array to resolve the ESLint warning.
  }, [chatSession?.status, ratingSubmitted, chatSession?.feedback]);

  useEffect(() => {
    if (!chatSession || !isOpen) return;

    const pollMessages = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cs/chat/sessions/${chatSession._id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.chat) {
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
    } catch (error) {
      console.error('Send message error:', error);
      setError('Failed to send message');
      setMessages(prev => prev.filter(m => m.messageId !== tempMessage.messageId));
    } finally {
      setIsConnecting(false);
    }
  };

  const submitRating = async () => {
    if (!selectedRating || !chatSession) return;

    setIsSubmittingRating(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cs/chat/sessions/${chatSession._id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedRating,
          comment: ratingComment.trim()
        })
      });

      if (response.ok) {
        setRatingSubmitted(true);
        setShowRating(false);
        setChatSession(prev => prev ? {
          ...prev,
          feedback: {
            rating: selectedRating,
            comment: ratingComment.trim(),
            submittedAt: new Date().toISOString()
          }
        } : null);
      } else {
        throw new Error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Rating submission error:', error);
      setError('Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
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

  const getRatingEmoji = (rating: number) => {
    switch (rating) {
      case 1: return '😞';
      case 2: return '🙁';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😄';
      default: return '⭐';
    }
  };

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
    .rating-star {
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 1.5rem;
    }
    .rating-star:hover {
      transform: scale(1.1);
    }
  `;

  if (!isOpen) {
    return (
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
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
      
      {/* Header */}
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

      {/* Messages Area */}
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
            
            {/* Chat ended message with rating prompt */}
            {chatSession.status === 'ended' && ratingSubmitted && (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#6ee7b7',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🙏</div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Thanks for your feedback!</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  You rated this conversation {getRatingEmoji(chatSession.feedback?.rating || 0)} {chatSession.feedback?.rating}/5
                </div>
              </div>
            )}
            
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

      {/* Input Area */}
      {chatSession && chatSession.status !== 'ended' && (
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
              disabled={isConnecting}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: '#f1f5f9',
                transition: 'all 0.2s ease'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isConnecting}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: (!newMessage.trim() || isConnecting) ? 'not-allowed' : 'pointer',
                opacity: (!newMessage.trim() || isConnecting) ? 0.5 : 1,
                fontSize: '16px',
                transition: 'all 0.2s ease'
              }}
            >
              {isConnecting ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRating && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          borderRadius: '16px'
        }}>
          <div style={{
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '320px',
            width: '100%',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#f1f5f9' }}>
              Rate Your Experience
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#9ca3af' }}>
              How satisfied are you with our support?
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              {[1, 2, 3, 4, 5].map(rating => (
                <span
                  key={rating}
                  className="rating-star"
                  onClick={() => setSelectedRating(rating)}
                  style={{
                    color: rating <= selectedRating ? '#fbbf24' : '#6b7280'
                  }}
                >
                  {getRatingEmoji(rating)}
                </span>
              ))}
            </div>
            
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Tell us more about your experience (optional)"
              style={{
                width: '100%',
                height: '60px',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: '#f1f5f9',
                fontSize: '14px',
                resize: 'none',
                marginBottom: '16px'
              }}
            />
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowRating(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#9ca3af',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Skip
              </button>
              <button
                onClick={submitRating}
                disabled={!selectedRating || isSubmittingRating}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedRating ? 'rgba(59, 130, 246, 0.8)' : 'rgba(75, 85, 99, 0.8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: selectedRating ? 'pointer' : 'not-allowed',
                  fontWeight: '600'
                }}
              >
                {isSubmittingRating ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
