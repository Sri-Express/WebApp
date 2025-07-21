// app/cs/chat/page.tsx - STANDALONE VERSION (No external dependencies)
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ChatSession {
  _id: string;
  sessionId: string;
  customerInfo: {
    name: string;
    email: string;
    id?: string;
  };
  assignedAgent?: {
    id: string;
    name: string;
  };
  status: 'waiting' | 'active' | 'ended' | 'escalated';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channel: string;
  startedAt: string;
  messages: ChatMessage[];
  waitTime?: number;
  lastMessage?: string;
}

interface ChatMessage {
  _id: string;
  sender: 'customer' | 'agent' | 'ai' | 'system';
  message: string;
  timestamp: string;
  readBy?: string[];
}

interface QueueStats {
  active: number;
  waiting: number;
  ended: number;
  total: number;
  avgWaitTime: string;
  avgResponseTime: string;
  satisfactionRate: string;
}

export default function CSChat() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState('available');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      router.push('/cs/login');
      return;
    }
    fetchChatData(token);
    
    const interval = autoRefresh ? setInterval(() => fetchChatData(token), 5000) : null;
    return () => { if (interval) clearInterval(interval); };
  }, [autoRefresh, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatData = async (token: string) => {
    setError(null);
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/chat/sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/chat/sessions/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!sessionsRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch chat data');
      }

      const [sessionsData, statsData] = await Promise.all([
        sessionsRes.json(),
        statsRes.json()
      ]);

      if (sessionsData.success && statsData.success) {
setChatSessions(sessionsData.data.chats || sessionsData.data.sessions || []);
        setQueueStats(statsData.data || null);
      } else {
        throw new Error(sessionsData.message || statsData.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to fetch chat data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load chat data');
    } finally {
      setLoading(false);
    }
  };

  const selectChat = async (chat: ChatSession) => {
    setSelectedChat(chat);
    setMessages([]);
    const token = localStorage.getItem('cs_token');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/chat/sessions/${chat._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(data.data.messages || []);
        }
      } else {
        setError('Failed to load chat messages');
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to load chat messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const token = localStorage.getItem('cs_token');
    const messageData = {
      message: newMessage,
      sender: 'agent'
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/chat/sessions/${selectedChat._id}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newMsg: ChatMessage = {
            _id: data.data.messageId || Date.now().toString(),
            sender: 'agent',
            message: newMessage,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, newMsg]);
          setNewMessage('');
          fetchChatData(token);
        }
      } else {
        setError('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    }
  };

  const assignChat = async (chatId: string) => {
    const token = localStorage.getItem('cs_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/chat/sessions/${chatId}/assign`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ agentId: 'current_agent' })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          fetchChatData(token);
        }
      } else {
        setError('Failed to assign chat');
      }
    } catch (error) {
      console.error('Failed to assign chat:', error);
      setError('Failed to assign chat');
    }
  };

  const endChat = async (chatId: string) => {
    const token = localStorage.getItem('cs_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/chat/sessions/${chatId}/end`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'resolved' })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedChat(null);
          setMessages([]);
          fetchChatData(token);
        }
      } else {
        setError('Failed to end chat');
      }
    } catch (error) {
      console.error('Failed to end chat:', error);
      setError('Failed to end chat');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const calculateWaitTime = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    return diffMinutes;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'normal': return '#2563eb';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#16a34a';
      case 'waiting': return '#d97706';
      case 'escalated': return '#dc2626';
      case 'ended': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '18px' }}>Loading chat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .hover-chat:hover {
          background-color: #f1f5f9 !important;
        }
        .hover-btn:hover {
          opacity: 0.8;
        }
        .selected-chat {
          background-color: #dbeafe !important;
          border-left: 4px solid #3b82f6 !important;
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
            💬 Live Chat Dashboard
          </h1>
          <p style={{
            color: '#64748b',
            margin: 0
          }}>
            Manage customer conversations in real-time
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <label style={{
              fontSize: '14px',
              color: '#64748b'
            }}>
              Status:
            </label>
            <select 
              value={agentStatus} 
              onChange={(e) => setAgentStatus(e.target.value)}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="available">🟢 Available</option>
              <option value="busy">🟡 Busy</option>
              <option value="away">🔴 Away</option>
            </select>
          </div>
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: autoRefresh ? '#16a34a' : '#6b7280',
              color: 'white'
            }}
            className="hover-btn"
          >
            🔄 Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={() => router.push('/cs/dashboard')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            className="hover-btn"
          >
            📊 Dashboard
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          marginBottom: '16px',
          padding: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#dc2626',
          borderRadius: '8px'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>{error}</p>
          <button 
            onClick={() => setError(null)}
            style={{
              fontSize: '14px',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#16a34a'
          }}>
            {queueStats?.active || 0}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#64748b'
          }}>
            Active Chats
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#d97706'
          }}>
            {queueStats?.waiting || 0}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#64748b'
          }}>
            Waiting
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2563eb'
          }}>
            {queueStats?.total || 0}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#64748b'
          }}>
            Total Today
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#0891b2'
          }}>
            {queueStats?.avgWaitTime || '0m'}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#64748b'
          }}>
            Avg Wait
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#7c3aed'
          }}>
            {queueStats?.avgResponseTime || '0s'}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#64748b'
          }}>
            Avg Response
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#16a34a'
          }}>
            {queueStats?.satisfactionRate || '0%'}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#64748b'
          }}>
            Satisfaction
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '24px',
        height: 'calc(100vh - 400px)'
      }}>
        {/* Chat Queue */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              📋 Chat Queue
            </h3>
          </div>
          <div style={{
            flex: 1,
            overflowY: 'auto'
          }}>
            {chatSessions.length === 0 ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>💭</div>
                <div>No active chats</div>
              </div>
            ) : (
              chatSessions.map(chat => (
                <div 
                  key={chat._id} 
                  onClick={() => selectChat(chat)}
                  className={`hover-chat ${selectedChat?._id === chat._id ? 'selected-chat' : ''}`}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    backgroundColor: selectedChat?._id === chat._id ? '#dbeafe' : 'white',
                    borderLeft: selectedChat?._id === chat._id ? '4px solid #3b82f6' : '4px solid transparent'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <strong style={{ color: '#1e293b' }}>
                      {chat.customerInfo.name}
                    </strong>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span style={{
                        padding: '2px 6px',
                        fontSize: '10px',
                        borderRadius: '12px',
                        backgroundColor: getPriorityColor(chat.priority) + '20',
                        color: getPriorityColor(chat.priority)
                      }}>
                        {chat.priority}
                      </span>
                      <span style={{
                        padding: '2px 6px',
                        fontSize: '10px',
                        borderRadius: '12px',
                        backgroundColor: getStatusColor(chat.status) + '20',
                        color: getStatusColor(chat.status)
                      }}>
                        {chat.status}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    marginBottom: '8px'
                  }}>
                    🆔 {chat.sessionId} | ⏱️ Wait: {calculateWaitTime(chat.startedAt)}m | 
                    👤 Agent: {chat.assignedAgent?.name || 'Unassigned'}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {chat.lastMessage || 'No messages yet'}
                  </div>
                  {chat.status === 'waiting' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); assignChat(chat._id); }}
                      style={{
                        marginTop: '8px',
                        padding: '4px 8px',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        fontSize: '12px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✅ Accept Chat
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '16px',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1e293b',
                      margin: '0 0 4px 0'
                    }}>
                      💬 {selectedChat.customerInfo.name} - {selectedChat.sessionId}
                    </h3>
                    <div style={{
                      fontSize: '14px',
                      color: '#64748b'
                    }}>
                      Status: <span style={{
                        fontWeight: '600',
                        color: selectedChat.status === 'active' ? '#16a34a' : '#d97706'
                      }}>
                        {selectedChat.status}
                      </span> | 
                      Priority: <span style={{
                        fontWeight: '600',
                        color: selectedChat.priority === 'urgent' ? '#dc2626' : '#2563eb'
                      }}>
                        {selectedChat.priority}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => router.push(`/cs/customers/${selectedChat.customerInfo.id}`)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#0891b2',
                        color: 'white',
                        fontSize: '14px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      👤 Profile
                    </button>
                    <button 
                      onClick={() => endChat(selectedChat._id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        fontSize: '14px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ End Chat
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                backgroundColor: '#f8fafc'
              }}>
                {messages.map(message => (
                  <div 
                    key={message._id} 
                    style={{
                      marginBottom: '16px',
                      display: 'flex',
                      justifyContent: message.sender === 'agent' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: message.sender === 'agent' ? '#3b82f6' : 
                                     message.sender === 'ai' ? '#0891b2' : 
                                     message.sender === 'system' ? '#6b7280' : 
                                     'white',
                      color: message.sender === 'customer' ? '#374151' : 'white',
                      border: message.sender === 'customer' ? '1px solid #e2e8f0' : 'none'
                    }}>
                      <div style={{
                        fontSize: '10px',
                        marginBottom: '8px',
                        opacity: 0.8
                      }}>
                        {message.sender === 'agent' ? '👤 You' : 
                         message.sender === 'ai' ? '🤖 AI Assistant' : 
                         message.sender === 'system' ? '⚙️ System' : 
                         `👤 ${selectedChat.customerInfo.name}`} - {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                      <div>{message.message}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div style={{
                padding: '16px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '12px'
                }}>
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
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
                      padding: '8px 16px',
                      backgroundColor: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                      opacity: newMessage.trim() ? 1 : 0.5
                    }}
                  >
                    📤 Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
                <div style={{ fontSize: '18px' }}>
                  Select a chat from the queue to start conversation
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}