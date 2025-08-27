// app/cs/chat/page.tsx - COMPLETE FIXED VERSION
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/cs/components/AnimatedBackground';
import { 
  ShieldCheckIcon, ChatBubbleOvalLeftEllipsisIcon, ClockIcon, ListBulletIcon, ChartBarIcon, 
  CheckBadgeIcon, PaperAirplaneIcon, UserCircleIcon, ArrowUturnLeftIcon, PowerIcon,
  CpuChipIcon, Cog6ToothIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';

// --- FIXED Data Interfaces ---
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
  messageId: string;
  sender: 'customer' | 'agent' | 'ai_bot' | 'system';
  senderId?: string;
  content: string;
  timestamp: string;
  isRead?: boolean;
  messageType?: string;
  aiGenerated?: boolean;
}

// FIXED: Enhanced interface to match backend
interface QueueStats {
  active: number;
  waiting: number;
  ended: number;
  total: number;
  resolved: number;
  resolutionRate: number;
  avgWaitTime: string;
  avgResolutionTime: string;
  satisfactionRate: string;
  avgRating: number;
  totalFeedback: number;
  positiveRatings: number;
  queueHealth: 'healthy' | 'moderate' | 'high-load';
  responseEfficiency: 'excellent' | 'good' | 'needs-improvement';
}

export default function CSChat() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState('available');
  const [autoRefresh] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Theme styles
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', quickActionBg: 'rgba(249, 250, 251, 0.8)', quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', alertBg: 'rgba(249, 250, 251, 0.6)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', quickActionBg: 'rgba(51, 65, 85, 0.8)', quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', alertBg: 'rgba(51, 65, 85, 0.6)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
  
  const animationStyles = `
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .chat-item:hover { background-color: ${theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(243, 244, 246, 0.7)'} !important; }
  `;

  // Message polling for active chat
  useEffect(() => {
    if (!selectedChat) return;
    
    const token = localStorage.getItem('cs_token');
    if (!token) return;

    const pollMessages = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/chat/sessions/${selectedChat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.chat) {
            const newMessages = data.data.chat.messages || [];
            if (JSON.stringify(messages) !== JSON.stringify(newMessages)) {
              setMessages(newMessages);
            }
          }
        }
      } catch (error) {
        console.error('Failed to poll messages:', error);
      }
    };

    const interval = setInterval(pollMessages, 2000);
    return () => clearInterval(interval);
  }, [selectedChat, messages]);

  // Main data fetching
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

      console.log('Sessions Data:', sessionsData);
      console.log('Stats Data:', statsData);

      if (sessionsData.success && statsData.success) {
        setChatSessions(sessionsData.data.sessions || sessionsData.data.chats || []);
        setQueueStats(statsData.data || null);
      } else {
        throw new Error(sessionsData.message || statsData.message || 'Unknown error');
      }
    } catch (fetchError) {
      console.error('Failed to fetch chat data:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load chat data');
    } finally {
      setLoading(false);
    }
  };

  const selectChat = async (chat: ChatSession) => {
    setSelectedChat(chat);
    setMessages([]);
    const token = localStorage.getItem('cs_token');
    if (!token) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/chat/sessions/${chat._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.chat) {
          setMessages(data.data.chat.messages || []);
        }
      } else {
        setError('Failed to load chat messages');
      }
    } catch (fetchError) {
      console.error('Failed to fetch messages:', fetchError);
      setError('Failed to load chat messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const token = localStorage.getItem('cs_token');
    if (!token) return;
    
    const messageData = {
      content: newMessage,
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
            messageId: data.data.messageId || Date.now().toString(),
            sender: 'agent',
            content: newMessage,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, newMsg]);
          setNewMessage('');
          fetchChatData(token);
        }
      } else {
        setError('Failed to send message');
      }
    } catch (sendError) {
      console.error('Failed to send message:', sendError);
      setError('Failed to send message');
    }
  };

  const assignChat = async (chatId: string) => {
    const token = localStorage.getItem('cs_token');
    if (!token) return;
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
    } catch (assignError) {
      console.error('Failed to assign chat:', assignError);
      setError('Failed to assign chat');
    }
  };

  const endChat = async (chatId: string) => {
    const token = localStorage.getItem('cs_token');
    if (!token) return;
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
    } catch (endError) {
      console.error('Failed to end chat:', endError);
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
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'normal': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'waiting': return '#f59e0b';
      case 'escalated': return '#ef4444';
      case 'ended': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading Chat Dashboard...</p>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style jsx>{animationStyles}</style>
      
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100vh', padding: '0 1.5rem 1.5rem 1.5rem' }}>
        {/* Navigation */}
        <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', margin: '0 -1.5rem' }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ShieldCheckIcon width={32} height={32} color="#dc2626" />
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}><span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express</h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Customer Support Center</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <ThemeSwitcher />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: currentThemeStyles.quickActionBg, padding: '0.25rem 0.75rem', borderRadius: '999px', border: currentThemeStyles.quickActionBorder }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: agentStatus === 'available' ? '#22c55e' : agentStatus === 'busy' ? '#f59e0b' : '#ef4444' }}></span>
                <select value={agentStatus} onChange={(e) => setAgentStatus(e.target.value)} style={{ background: 'none', border: 'none', color: currentThemeStyles.textPrimary, fontSize: '0.875rem', outline: 'none' }}>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="away">Away</option>
                </select>
              </div>
              <span style={{ color: '#94a3b8' }}>Support Agent</span>
              <button onClick={() => router.push('/cs/dashboard')} style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChartBarIcon width={16} /> Dashboard
              </button>
              <button onClick={() => { localStorage.removeItem('cs_token'); router.push('/cs/login'); }} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PowerIcon width={16} /> Logout
              </button>
            </div>
          </div>
        </nav>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '1.5rem', overflow: 'hidden' }}>
          {/* FIXED: Enhanced Metrics Dashboard - Always 8 Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Active Chats', value: queueStats?.active || 0, icon: ChatBubbleOvalLeftEllipsisIcon, color: '#22c55e' },
              { label: 'In Queue', value: queueStats?.waiting || 0, icon: ClockIcon, color: '#f59e0b' },
              { label: 'Resolved Today', value: queueStats?.resolved || 0, icon: CheckCircleIcon, color: '#3b82f6' },
              { label: 'Total Today', value: queueStats?.total || 0, icon: ListBulletIcon, color: '#8b5cf6' },
              { label: 'Resolution Rate', value: `${queueStats?.resolutionRate || 0}%`, icon: ChartBarIcon, color: '#06b6d4' },
              { label: 'Avg Wait', value: queueStats?.avgWaitTime || '0m', icon: ClockIcon, color: '#f97316' },
              { label: 'Avg Resolution', value: queueStats?.avgResolutionTime || '0m', icon: ChartBarIcon, color: '#84cc16' },
              { label: 'Satisfaction', value: queueStats?.satisfactionRate || '0%', icon: CheckBadgeIcon, color: queueStats?.responseEfficiency === 'excellent' ? '#10b981' : queueStats?.responseEfficiency === 'good' ? '#f59e0b' : '#ef4444' },
            ].map((metric, index) => (
              <div key={metric.label} style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <metric.icon width={20} height={20} color={metric.color} />
                  <div>
                    <h3 style={{ color: metric.color, fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{metric.value}</h3>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0', fontWeight: '500', fontSize: '0.8rem' }}>{metric.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '1rem', borderRadius: '0.75rem', fontWeight: 500 }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Main Chat Interface */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '3fr 7fr', gap: '1.5rem', minHeight: 0 }}>
            {/* Chat Queue */}
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '1rem', borderBottom: currentThemeStyles.quickActionBorder, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ListBulletIcon width={24} height={24} color={currentThemeStyles.textPrimary} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0 }}>Chat Queue</h3>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                {chatSessions.filter(c => c.status !== 'ended').length > 0 ? chatSessions.filter(c => c.status !== 'ended').map(chat => (
                  <div key={chat._id} onClick={() => selectChat(chat)} className="chat-item" style={{ padding: '1rem', margin: '0.5rem', borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: selectedChat?._id === chat._id ? 'rgba(59, 130, 246, 0.2)' : 'transparent', borderLeft: `4px solid ${selectedChat?._id === chat._id ? '#3b82f6' : 'transparent'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ color: currentThemeStyles.textPrimary }}>{chat.customerInfo.name}</strong>
                      <span style={{ padding: '0.125rem 0.5rem', fontSize: '0.7rem', fontWeight: '600', borderRadius: '999px', backgroundColor: getPriorityColor(chat.priority || 'normal') + '30', color: getPriorityColor(chat.priority || 'normal') }}>{chat.priority || 'normal'}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: currentThemeStyles.textSecondary, margin: '0 0 0.5rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.lastMessage || 'New chat session started...'}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: currentThemeStyles.textMuted }}>
                      <span>Wait: {calculateWaitTime(chat.startedAt)}m</span>
                      <span style={{ padding: '0.125rem 0.5rem', borderRadius: '999px', backgroundColor: getStatusColor(chat.status) + '30', color: getStatusColor(chat.status) }}>{chat.status}</span>
                    </div>
                    {chat.status === 'waiting' && (
                      <button onClick={(e) => { e.stopPropagation(); assignChat(chat._id); }} style={{ marginTop: '0.75rem', width: '100%', padding: '0.5rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>Accept Chat</button>
                    )}
                  </div>
                )) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: currentThemeStyles.textSecondary, textAlign: 'center', padding: '1rem' }}>
                    <CheckBadgeIcon width={48} height={48} color="#22c55e" />
                    <p style={{ marginTop: '1rem', fontWeight: '500' }}>Queue is empty!</p>
                    <p style={{ fontSize: '0.875rem' }}>No customers are currently waiting.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Interface */}
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {selectedChat ? (
                <>
                  <div style={{ padding: '1rem', borderBottom: currentThemeStyles.quickActionBorder, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0 }}>{selectedChat.customerInfo.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0' }}>{selectedChat.customerInfo.email}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => router.push(`/cs/customers/${selectedChat.customerInfo.id}`)} style={{ padding: '0.5rem 1rem', backgroundColor: currentThemeStyles.quickActionBg, color: currentThemeStyles.textPrimary, border: currentThemeStyles.quickActionBorder, borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserCircleIcon width={16}/> Profile</button>
                      <button onClick={() => endChat(selectedChat._id)} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowUturnLeftIcon width={16}/> End Chat</button>
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: currentThemeStyles.quickActionBg }}>
                    {messages.map(message => (
                      <div key={message.messageId} style={{ marginBottom: '1rem', display: 'flex', justifyContent: message.sender === 'agent' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '75%', padding: '0.75rem 1rem', borderRadius: '1rem', backgroundColor: message.sender === 'agent' ? '#3b82f6' : message.sender === 'ai_bot' ? '#14b8a6' : message.sender === 'system' ? currentThemeStyles.textSecondary : currentThemeStyles.alertBg, color: message.sender === 'customer' ? currentThemeStyles.textPrimary : 'white', border: message.sender === 'customer' ? currentThemeStyles.quickActionBorder : 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                          <div style={{ fontSize: '0.7rem', marginBottom: '0.25rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {message.sender === 'agent' ? <UserCircleIcon width={12}/> : message.sender === 'ai_bot' ? <CpuChipIcon width={12}/> : message.sender === 'system' ? <Cog6ToothIcon width={12}/> : <UserCircleIcon width={12}/>}
                            {message.sender === 'agent' ? 'You' : message.sender === 'ai_bot' ? 'AI Assistant' : message.sender === 'system' ? 'System' : selectedChat.customerInfo.name}
                            <span style={{ marginLeft: '0.5rem' }}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div style={{ lineHeight: 1.5 }}>{message.content}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <div style={{ padding: '1rem', borderTop: currentThemeStyles.quickActionBorder }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type your message..." style={{ flex: 1, padding: '0.75rem 1rem', border: currentThemeStyles.quickActionBorder, borderRadius: '0.75rem', fontSize: '1rem', backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary, outline: 'none' }} />
                      <button onClick={sendMessage} disabled={!newMessage.trim()} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '0.75rem', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', opacity: newMessage.trim() ? 1 : 0.6, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                        <PaperAirplaneIcon width={20} /> Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentThemeStyles.textSecondary, textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <ChatBubbleOvalLeftEllipsisIcon width={64} height={64} style={{ marginBottom: '1rem', opacity: 0.5, display: 'block', margin: '0 auto 1rem auto' }} />
                    <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>Select a chat to begin</h3>
                    <p style={{ margin: 0 }}>Your conversations will appear here.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}