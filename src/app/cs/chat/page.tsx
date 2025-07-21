// app/cs/chat/page.tsx - STYLED VERSION with ORIGINAL LOGIC
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext'; // Assuming this path is correct
import ThemeSwitcher from '@/app/components/ThemeSwitcher'; // Assuming this path is correct
import { 
  ShieldCheckIcon, ChatBubbleOvalLeftEllipsisIcon, ClockIcon, ListBulletIcon, ChartBarIcon, 
  CheckBadgeIcon, PaperAirplaneIcon, UserCircleIcon, ArrowUturnLeftIcon, PowerIcon,
  CpuChipIcon, Cog6ToothIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// --- Data Interfaces (Unchanged) ---
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

// --- Main Component ---
export default function CSChat() {
  const router = useRouter();
  const { theme } = useTheme();
  
  // --- State Management (Original Logic) ---
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

  // --- Theme and Style Definitions ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', quickActionBg: 'rgba(249, 250, 251, 0.8)', quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', alertBg: 'rgba(249, 250, 251, 0.6)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', quickActionBg: 'rgba(51, 65, 85, 0.8)', quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', alertBg: 'rgba(51, 65, 85, 0.6)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const animationStyles = ` @keyframes road-marking { 0% { transform: translateX(-200%); } 100% { transform: translateX(500%); } } .animate-road-marking { animation: road-marking 10s linear infinite; } @keyframes car-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(100vw); } } .animate-car-right { animation: car-right 15s linear infinite; } @keyframes car-left { 0% { transform: translateX(100vw) scaleX(-1); } 100% { transform: translateX(-200px) scaleX(-1); } } .animate-car-left { animation: car-left 16s linear infinite; } @keyframes light-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } } .animate-light-blink { animation: light-blink 1s infinite; } @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; } @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; } @keyframes trainMove { from { left: 100%; } to { left: -300px; } } @keyframes slight-bounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-1px); } } .animate-slight-bounce { animation: slight-bounce 2s ease-in-out infinite; } @keyframes steam { 0% { opacity: 0.8; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-20px) scale(2.5); } } .animate-steam { animation: steam 2s ease-out infinite; } @keyframes wheels { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } } .animate-wheels { animation: wheels 2s linear infinite; } .animation-delay-100 { animation-delay: 0.1s; } .animation-delay-200 { animation-delay: 0.2s; } .animation-delay-300 { animation-delay: 0.3s; } .animation-delay-400 { animation-delay: 0.4s; } .animation-delay-500 { animation-delay: 0.5s; } .animation-delay-600 { animation-delay: 0.6s; } .animation-delay-700 { animation-delay: 0.7s; } .animation-delay-800 { animation-delay: 0.8s; } .animation-delay-1000 { animation-delay: 1s; } .animation-delay-1200 { animation-delay: 1.2s; } .animation-delay-1500 { animation-delay: 1.5s; } .animation-delay-2000 { animation-delay: 2s; } .animation-delay-2500 { animation-delay: 2.5s; } .animation-delay-3000 { animation-delay: 3s; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .chat-item:hover { background-color: ${theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(243, 244, 246, 0.7)'} !important; } `;

  // --- Data Fetching and Actions (Original Logic - Unchanged) ---
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
    if (!token) return; // Added safety check
    
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
    if (!token) return; // Added safety check
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
    if (!token) return; // Added safety check
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
    if (!token) return; // Added safety check
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

  // --- Loading State ---
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

  // --- Main Render ---
  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style jsx>{animationStyles}</style>
      
      {/* Animated Background */}
      <div style={{ position: 'absolute', inset: 0, background: currentThemeStyles.bgGradient, zIndex: 0 }}>
        {/* ... [The entire animated background SVG/div structure from the other files goes here] ... */}
        <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', backgroundColor: '#1f2937', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', zIndex: 2 }}></div><div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', zIndex: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: '100%', height: '5px', background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 30px, transparent 30px, transparent 60px)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}></div></div><div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', overflow: 'hidden', zIndex: 3 }}><div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: '8px', display: 'flex', transform: 'translateY(-50%)' }}><div className="animate-road-marking" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '10%' }}></div><div className="animate-road-marking animation-delay-200" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '30%' }}></div><div className="animate-road-marking animation-delay-500" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '50%' }}></div><div className="animate-road-marking animation-delay-700" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '70%' }}></div></div><div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: '8px', display: 'flex', transform: 'translateY(-50%)' }}><div className="animate-road-marking animation-delay-300" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '20%' }}></div><div className="animate-road-marking animation-delay-400" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '40%' }}></div><div className="animate-road-marking animation-delay-600" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '60%' }}></div><div className="animate-road-marking animation-delay-800" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '80%' }}></div></div></div>
        <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '80px', backgroundColor: '#1f2937', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)', zIndex: 2 }}></div><div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '80px', zIndex: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: '100%', height: '4px', background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 20px, transparent 20px, transparent 40px)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}></div></div>
        <div style={{ position: 'absolute', top: '85%', left: 0, right: 0, height: '50px', background: 'linear-gradient(to bottom, #4b5563 0%, #374151 100%)', boxShadow: '0 5px 10px -3px rgba(0, 0, 0, 0.3)', zIndex: 2 }}></div><div style={{ position: 'absolute', top: '85%', left: 0, right: 0, height: '50px', overflow: 'visible', zIndex: 3 }}><div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: '6px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', zIndex: 4 }}></div><div style={{ position: 'absolute', top: '65%', left: 0, right: 0, height: '6px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', zIndex: 4 }}></div><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', display: 'flex', gap: '15px', zIndex: 3 }}>{Array(30).fill(0).map((_, i) => (<div key={i} style={{ width: '20px', height: '100%', background: 'linear-gradient(to bottom, #92400e 0%, #7c2d12 70%, #713f12 100%)', marginLeft: `${i * 30}px`, boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.5)', border: '1px solid #78350f' }}></div>))}</div></div>
        <div className="animate-slight-bounce" style={{ position: 'absolute', top: '85%', marginTop: '-15px', left: '100%', height: '70px', width: '300px', zIndex: 6, pointerEvents: 'none', display: 'flex', animation: 'trainMove 15s linear infinite', filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.2))' }}><div style={{ display: 'flex', width: '100%', height: '100%' }}><div style={{ position: 'relative', width: '110px', height: '60px', marginRight: '5px' }}><div style={{ position: 'absolute', bottom: '12px', left: '8px', width: '85%', height: '30px', background: 'linear-gradient(to bottom, #b91c1c 0%, #9f1239 60%, #7f1d1d 100%)', borderRadius: '8px 5px 5px 5px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', border: '1px solid #7f1d1d' }}></div><div style={{ position: 'absolute', bottom: '42px', right: '10px', width: '60px', height: '30px', background: 'linear-gradient(to bottom, #7f1d1d 0%, #681e1e 100%)', borderRadius: '6px 6px 0 0', border: '1px solid #601414', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}></div><div style={{ position: 'absolute', bottom: '72px', right: '8px', width: '65px', height: '5px', background: '#4c1d95', borderRadius: '2px', boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)' }}></div><div style={{ position: 'absolute', bottom: '5px', left: '0', width: '15px', height: '18px', background: 'linear-gradient(135deg, #9f1239 0%, #7f1d1d 100%)', clipPath: 'polygon(0 0, 100% 0, 100% 35%, 50% 100%, 0 35%)', borderRadius: '2px' }}></div><div style={{ position: 'absolute', bottom: '15px', left: '3px', width: '10px', height: '4px', backgroundColor: '#64748b', borderRadius: '1px', border: '1px solid #475569' }}></div><div style={{ position: 'absolute', top: '3px', left: '40px', padding: '3px 5px', backgroundColor: '#fef3c7', borderRadius: '3px', border: '1px solid #7f1d1d', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)', fontSize: '9px', fontWeight: 'bold', color: '#7f1d1d', whiteSpace: 'nowrap', fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif", zIndex: 10, transform: 'rotate(-2deg)' }}>දුම්රිය සේවය</div><div style={{ position: 'absolute', bottom: '42px', left: '22px', width: '14px', height: '18px', background: 'linear-gradient(to bottom, #27272a 0%, #18181b 100%)', borderRadius: '4px 4px 0 0', border: '1px solid #111', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}><div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '16px', height: '4px', background: 'linear-gradient(to bottom, #cbd5e1 0%, #94a3b8 100%)', borderRadius: '4px 4px 0 0', border: '1px solid #64748b' }}></div><div className="animate-steam" style={{ position: 'absolute', top: '-15px', left: '-2px', width: '18px', height: '15px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.9 }}></div><div className="animate-steam animation-delay-200" style={{ position: 'absolute', top: '-12px', left: '4px', width: '16px', height: '14px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.85 }}></div><div className="animate-steam animation-delay-400" style={{ position: 'absolute', top: '-18px', left: '2px', width: '20px', height: '18px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.9 }}></div><div className="animate-steam animation-delay-600" style={{ position: 'absolute', top: '-14px', left: '-4px', width: '17px', height: '15px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.8 }}></div><div className="animate-steam animation-delay-800" style={{ position: 'absolute', top: '-22px', left: '1px', width: '22px', height: '20px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.7 }}></div></div><div style={{ position: 'absolute', bottom: '42px', left: '45px', width: '8px', height: '10px', background: 'linear-gradient(to bottom, #fbbf24 0%, #d97706 100%)', borderRadius: '4px 4px 8px 8px', border: '1px solid #b45309' }}></div><div style={{ position: 'absolute', bottom: '42px', left: '60px', width: '6px', height: '8px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', borderRadius: '3px 3px 0 0', border: '1px solid #475569' }}></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', left: '15px', width: '24px', height: '24px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #cbd5e1 10deg, #cbd5e1 15deg, transparent 15deg, transparent 55deg, #cbd5e1 55deg, #cbd5e1 60deg, transparent 60deg, transparent 100deg, #cbd5e1 100deg, #cbd5e1 105deg, transparent 105deg, transparent 145deg, #cbd5e1 145deg, #cbd5e1 150deg, transparent 150deg, transparent 190deg, #cbd5e1 190deg, #cbd5e1 195deg, transparent 195deg, transparent 235deg, #cbd5e1 235deg, #cbd5e1 240deg, transparent 240deg, transparent 280deg, #cbd5e1 280deg, #cbd5e1 285deg, transparent 285deg, transparent 325deg, #cbd5e1 325deg, #cbd5e1 330deg, transparent 330deg)', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 4px)', left: 'calc(50% - 4px)', width: '8px', height: '8px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '25px', width: '24px', height: '24px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #cbd5e1 10deg, #cbd5e1 15deg, transparent 15deg, transparent 55deg, #cbd5e1 55deg, #cbd5e1 60deg, transparent 60deg, transparent 100deg, #cbd5e1 100deg, #cbd5e1 105deg, transparent 105deg, transparent 145deg, #cbd5e1 145deg, #cbd5e1 150deg, transparent 150deg, transparent 190deg, #cbd5e1 190deg, #cbd5e1 195deg, transparent 195deg, transparent 235deg, #cbd5e1 235deg, #cbd5e1 240deg, transparent 240deg, transparent 280deg, #cbd5e1 280deg, #cbd5e1 285deg, transparent 285deg, transparent 325deg, #cbd5e1 325deg, #cbd5e1 330deg, transparent 330deg)', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 4px)', left: 'calc(50% - 4px)', width: '8px', height: '8px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '60px', width: '24px', height: '24px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #cbd5e1 10deg, #cbd5e1 15deg, transparent 15deg, transparent 55deg, #cbd5e1 55deg, #cbd5e1 60deg, transparent 60deg, transparent 100deg, #cbd5e1 100deg, #cbd5e1 105deg, transparent 105deg, transparent 145deg, #cbd5e1 145deg, #cbd5e1 150deg, transparent 150deg, transparent 190deg, #cbd5e1 190deg, #cbd5e1 195deg, transparent 195deg, transparent 235deg, #cbd5e1 235deg, #cbd5e1 240deg, transparent 240deg, transparent 280deg, #cbd5e1 280deg, #cbd5e1 285deg, transparent 285deg, transparent 325deg, #cbd5e1 325deg, #cbd5e1 330deg, transparent 330deg)', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 4px)', left: 'calc(50% - 4px)', width: '8px', height: '8px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div style={{ position: 'absolute', bottom: '24px', left: '22px', width: '30px', height: '8px', backgroundColor: '#64748b', borderRadius: '4px', border: '1px solid #475569', zIndex: 3 }}></div><div style={{ position: 'absolute', bottom: '47px', right: '15px', width: '15px', height: '12px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '2px solid #7f1d1d', boxShadow: 'inset 0 0 4px rgba(255, 255, 255, 0.5)' }}></div><div style={{ position: 'absolute', bottom: '47px', right: '40px', width: '15px', height: '12px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '2px solid #7f1d1d', boxShadow: 'inset 0 0 4px rgba(255, 255, 255, 0.5)' }}></div><div className="animate-light-blink" style={{ position: 'absolute', bottom: '22px', left: '3px', width: '10px', height: '10px', background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', boxShadow: '0 0 15px #fcd34d, 0 0 5px #fef3c7', border: '1px solid #b45309' }}></div></div><div style={{ position: 'relative', width: '90px', height: '40px', marginTop: '15px', marginRight: '5px' }}><div style={{ position: 'absolute', bottom: '5px', width: '100%', height: '28px', background: 'linear-gradient(to bottom, #dc2626 0%, #be123c 60%, #9f1239 100%)', borderRadius: '4px', boxSizing: 'border-box', border: '1px solid #881337', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}><div style={{ position: 'absolute', top: '18px', left: '0', width: '100%', height: '3px', backgroundColor: '#fbbf24', opacity: 0.8 }}></div></div><div style={{ position: 'absolute', bottom: '33px', left: '2px', width: '96%', height: '4px', background: 'linear-gradient(to bottom, #7f1d1d 0%, #881337 100%)', borderRadius: '40% 40% 0 0 / 100% 100% 0 0', boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)' }}></div><div style={{ position: 'absolute', top: '5px', left: '10px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #881337', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div style={{ position: 'absolute', top: '5px', left: '35px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #881337', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div style={{ position: 'absolute', top: '5px', left: '60px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #881337', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', left: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div></div><div style={{ position: 'relative', width: '90px', height: '40px', marginTop: '15px' }}><div style={{ position: 'absolute', bottom: '5px', width: '100%', height: '28px', background: 'linear-gradient(to bottom, #c026d3 0%, #a21caf 60%, #86198f 100%)', borderRadius: '4px', boxSizing: 'border-box', border: '1px solid #701a75', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}><div style={{ position: 'absolute', top: '18px', left: '0', width: '100%', height: '3px', backgroundColor: '#fbbf24', opacity: 0.8 }}></div></div><div style={{ position: 'absolute', bottom: '33px', left: '2px', width: '96%', height: '4px', background: 'linear-gradient(to bottom, #701a75 0%, #86198f 100%)', borderRadius: '40% 40% 0 0 / 100% 100% 0 0', boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)' }}></div><div style={{ position: 'absolute', top: '5px', left: '10px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #701a75', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div style={{ position: 'absolute', top: '5px', left: '35px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #701a75', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div style={{ position: 'absolute', top: '5px', left: '60px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #701a75', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div className="animate-light-blink animation-delay-500" style={{ position: 'absolute', bottom: '15px', right: '3px', width: '6px', height: '6px', background: 'radial-gradient(circle, #fef3c7 0%, #f87171 100%)', borderRadius: '50%', boxShadow: '0 0 8px #f87171', border: '1px solid #7f1d1d' }}></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', left: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div style={{ position: 'absolute', bottom: '15px', left: '-8px', width: '10px', height: '4px', backgroundColor: '#64748b', borderRadius: '1px', zIndex: 1 }}></div></div></div></div>
        <div className="animate-car-left animation-delay-1000" style={{ position: 'absolute', top: '15%', marginTop: '10px', right: '-150px', width: '150px', height: '70px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><div style={{ position: 'absolute', bottom: 0, right: 0, width: '50px', height: '45px', background: 'linear-gradient(to bottom, #059669 0%, #047857 70%, #065f46 100%)', borderRadius: '3px 8px 3px 3px', border: '1px solid #064e3b', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.2), inset -2px 0 6px rgba(255, 255, 255, 0.3)' }}></div><div style={{ position: 'absolute', bottom: 0, left: 0, width: '100px', height: '40px', background: 'linear-gradient(to bottom, #f3f4f6 0%, #e5e7eb 70%, #d1d5db 100%)', borderRadius: '3px', border: '1px solid #9ca3af', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.1)' }}></div><div style={{ position: 'absolute', top: '8px', right: '5px', width: '35px', height: '20px', background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '3px', border: '2px solid #047857', boxShadow: 'inset 0 0 8px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', top: '3px', left: '5px', width: '20px', height: '2px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', top: '15px', right: '8px', width: '15px', height: '15px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '2px', border: '2px solid #047857' }}><div style={{ position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)', width: '6px', height: '8px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '3px 3px 0 0' }}></div></div><div style={{ position: 'absolute', top: '10px', left: '40px', width: '30px', height: '15px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #047857', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '6px', fontWeight: 'bold', color: '#047857', fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif" }}>බෙදාහැරීම්</div></div><div style={{ position: 'absolute', bottom: '8px', right: '3px', width: '8px', height: '6px', background: 'linear-gradient(to left, #fef3c7 0%, #fcd34d 100%)', borderRadius: '30%', border: '1px solid #064e3b', boxShadow: '0 0 8px rgba(252, 211, 77, 0.7)' }}><div style={{ position: 'absolute', top: '1px', right: '1px', width: '3px', height: '3px', background: 'radial-gradient(circle, #fef9c3 0%, #fef3c7 100%)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', bottom: '15px', right: '3px', width: '8px', height: '12px', background: 'linear-gradient(to bottom, #374151 0%, #1f2937 100%)', borderRadius: '2px' }}><div style={{ position: 'absolute', top: '2px', left: '1px', right: '1px', height: '1px', backgroundColor: '#6b7280' }}></div><div style={{ position: 'absolute', top: '5px', left: '1px', right: '1px', height: '1px', backgroundColor: '#6b7280' }}></div><div style={{ position: 'absolute', top: '8px', left: '1px', right: '1px', height: '1px', backgroundColor: '#6b7280' }}></div></div><div className="animate-light-blink animation-delay-300" style={{ position: 'absolute', bottom: '20px', right: '5px', width: '5px', height: '5px', background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #064e3b', boxShadow: '0 0 6px rgba(252, 211, 77, 0.6)' }}></div><div className="animate-light-blink animation-delay-700" style={{ position: 'absolute', bottom: '18px', left: '5px', width: '10px', height: '6px', background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', borderRadius: '2px', border: '1px solid #064e3b', boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)' }}></div><div style={{ position: 'absolute', bottom: '-8px', right: '15px', width: '20px', height: '20px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '-8px', left: '15px', width: '20px', height: '20px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)', width: '25px', height: '8px', backgroundColor: 'white', borderRadius: '2px', border: '1px solid #047857', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '4px', fontWeight: 'bold', color: '#1f2937' }}>DL-9876</div></div><div style={{ position: 'absolute', bottom: '5px', left: '5px', width: '6px', height: '3px', background: 'linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%)', borderRadius: '2px 0 0 2px', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)' }}></div><div style={{ position: 'absolute', bottom: '5px', left: '-8px', width: '8px', height: '8px', background: 'radial-gradient(circle, rgba(209, 213, 219, 0.8) 0%, rgba(209, 213, 219, 0) 70%)', borderRadius: '50%', opacity: 0.6, animation: 'steam 1.2s ease-out infinite' }}></div></div></div>
        <div className="animate-car-right animation-delay-2500" style={{ position: 'absolute', top: '15%', marginTop: '15px', left: '-140px', width: '140px', height: '65px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><div style={{ position: 'absolute', bottom: 0, width: '100%', height: '40px', background: 'linear-gradient(to bottom, #f97316 0%, #ea580c 70%, #c2410c 100%)', borderRadius: '10px 12px 6px 6px', border: '1px solid #9a3412', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.2), inset 2px 0 6px rgba(255, 255, 255, 0.3)' }}></div><div style={{ position: 'absolute', bottom: '5px', left: '0', width: '35px', height: '35px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', borderRadius: '10px 4px 0 6px', boxShadow: 'inset 1px 1px 5px rgba(255, 255, 255, 0.4)' }}></div><div style={{ position: 'absolute', top: '8px', left: '40px', right: '8px', height: '25px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '4px', border: '2px solid #c2410c', boxShadow: 'inset 0 0 8px rgba(255, 255, 255, 0.6)', overflow: 'hidden' }}><div style={{ display: 'flex', height: '100%', width: '100%' }}>{[...Array(4)].map((_, i) => (<div key={i} style={{ flex: '1', height: '100%', borderRight: i < 3 ? '2px solid #c2410c' : 'none', position: 'relative' }}>{i % 2 === 1 && (<div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '6px', height: '8px', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '3px 3px 0 0' }}></div>)}</div>))}</div></div><div style={{ position: 'absolute', top: '8px', left: '8px', width: '25px', height: '25px', background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '4px', border: '2px solid #c2410c', boxShadow: 'inset 0 0 6px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', top: '3px', left: '3px', width: '15px', height: '2px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', top: '35px', left: '50%', transform: 'translateX(-50%)', width: '40px', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #c2410c', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '4px', fontWeight: 'bold', color: '#c2410c' }}>SCHOOL BUS</div></div><div style={{ position: 'absolute', bottom: '25px', left: '18px', width: '8px', height: '10px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '4px 4px 0 0' }}><div style={{ position: 'absolute', top: '2px', left: '1px', width: '2px', height: '1px', backgroundColor: '#f8fafc', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: '2px', right: '1px', width: '2px', height: '1px', backgroundColor: '#f8fafc', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', bottom: '8px', left: '3px', width: '8px', height: '6px', background: 'linear-gradient(to right, #fef3c7 0%, #fcd34d 100%)', borderRadius: '40%', border: '1px solid #9a3412', boxShadow: '0 0 8px rgba(252, 211, 77, 0.7)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', width: '3px', height: '3px', background: 'radial-gradient(circle, #fef9c3 0%, #fef3c7 100%)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', bottom: '20px', left: '40px', width: '15px', height: '8px', background: 'linear-gradient(to bottom, #dc2626 0%, #b91c1c 100%)', borderRadius: '2px', border: '1px solid #7f1d1d' }}><div style={{ position: 'absolute', top: '1px', left: '2px', fontSize: '3px', fontWeight: 'bold', color: 'white' }}>STOP</div></div><div style={{ position: 'absolute', bottom: '-7px', left: '18px', width: '18px', height: '18px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '-7px', right: '18px', width: '18px', height: '18px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '22px', height: '6px', backgroundColor: 'white', borderRadius: '2px', border: '1px solid #c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '3px', fontWeight: 'bold', color: '#1f2937' }}>SCH-321</div></div><div style={{ position: 'absolute', bottom: '4px', right: '8px', width: '5px', height: '3px', background: 'linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%)', borderRadius: '0 2px 2px 0', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)' }}></div><div className="animate-light-blink animation-delay-100" style={{ position: 'absolute', top: '3px', left: '5px', width: '6px', height: '6px', background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%', border: '1px solid #9a3412', boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}></div><div className="animate-light-blink animation-delay-600" style={{ position: 'absolute', top: '3px', right: '5px', width: '6px', height: '6px', background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%', border: '1px solid #9a3412', boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}></div></div></div>
        <div className="animate-car-left animation-delay-2000" style={{ position: 'absolute', top: '60%', marginTop: '15px', right: '-100px', width: '100px', height: '45px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><div style={{ position: 'absolute', bottom: 0, width: '100%', height: '25px', background: 'linear-gradient(to bottom, #dc2626 0%, #b91c1c 70%, #991b1b 100%)', borderRadius: '15px 10px 5px 5px', border: '1px solid #7f1d1d', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.2), inset -2px 0 6px rgba(255, 255, 255, 0.3)' }}></div><div style={{ position: 'absolute', bottom: '25px', left: '15px', right: '20px', height: '15px', background: 'linear-gradient(to bottom, #7f1d1d 0%, #991b1b 100%)', borderRadius: '8px 8px 0 0', border: '1px solid #7f1d1d', borderBottom: 'none' }}></div><div style={{ position: 'absolute', top: '8px', right: '10px', width: '20px', height: '12px', background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '3px', border: '1px solid #7f1d1d', boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', top: '2px', left: '3px', width: '12px', height: '1px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', top: '8px', left: '25px', right: '35px', height: '12px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '3px 0 0 0', border: '1px solid #7f1d1d', boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', bottom: '2px', left: '8px', width: '5px', height: '6px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '2px 2px 0 0' }}></div><div style={{ position: 'absolute', bottom: '2px', right: '8px', width: '5px', height: '6px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '2px 2px 0 0' }}></div></div><div style={{ position: 'absolute', bottom: '8px', right: '5px', width: '8px', height: '5px', background: 'linear-gradient(to left, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #7f1d1d', boxShadow: '0 0 8px rgba(252, 211, 77, 0.6)' }}><div style={{ position: 'absolute', top: '1px', right: '1px', width: '3px', height: '2px', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', bottom: '6px', right: '-15px', width: '20px', height: '10px', background: 'linear-gradient(to right, rgba(252, 211, 77, 0.2) 0%, rgba(252, 211, 77, 0) 100%)', borderRadius: '50%', transform: 'scaleX(2)' }}></div><div className="animate-light-blink animation-delay-400" style={{ position: 'absolute', bottom: '15px', right: '8px', width: '4px', height: '4px', background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #7f1d1d', boxShadow: '0 0 6px rgba(252, 211, 77, 0.6)' }}></div><div className="animate-light-blink animation-delay-500" style={{ position: 'absolute', bottom: '8px', left: '5px', width: '6px', height: '4px', background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', borderRadius: '2px', border: '1px solid #7f1d1d', boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)' }}></div><div style={{ position: 'absolute', bottom: '-5px', right: '20px', width: '16px', height: '16px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '-5px', left: '20px', width: '16px', height: '16px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '6px', backgroundColor: 'white', borderRadius: '2px', border: '1px solid #7f1d1d', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '3px', fontWeight: 'bold', color: '#1f2937' }}>CAR-456</div></div><div style={{ position: 'absolute', bottom: '3px', left: '8px', width: '5px', height: '2px', background: 'linear-gradient(to right, #9ca3af 0%, #6b7280 100%)', borderRadius: '1px 0 0 1px', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)' }}></div><div style={{ position: 'absolute', bottom: '3px', left: '5px', width: '6px', height: '6px', background: 'radial-gradient(circle, rgba(209, 213, 219, 0.8) 0%, rgba(209, 213, 219, 0) 70%)', borderRadius: '50%', opacity: 0.6, animation: 'steam 1s ease-out infinite' }}></div></div></div>
        <div className="animate-car-right animation-delay-1500" style={{ position: 'absolute', top: '60%', marginTop: '40px', left: '-60px', width: '60px', height: '35px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><div style={{ position: 'absolute', bottom: '8px', left: '15px', width: '30px', height: '3px', background: 'linear-gradient(to bottom, #059669 0%, #047857 100%)', borderRadius: '2px', transform: 'rotate(10deg)', transformOrigin: 'left center' }}></div><div style={{ position: 'absolute', bottom: '12px', left: '20px', width: '20px', height: '3px', background: 'linear-gradient(to bottom, #059669 0%, #047857 100%)', borderRadius: '2px', transform: 'rotate(-20deg)', transformOrigin: 'left center' }}></div><div style={{ position: 'absolute', bottom: '18px', left: '22px', width: '8px', height: '3px', background: 'linear-gradient(to bottom, #1f2937 0%, #111827 100%)', borderRadius: '2px' }}></div><div style={{ position: 'absolute', bottom: '20px', right: '15px', width: '10px', height: '2px', background: 'linear-gradient(to bottom, #6b7280 0%, #4b5563 100%)', borderRadius: '1px' }}></div><div style={{ position: 'absolute', bottom: '22px', right: '18px', width: '2px', height: '8px', background: 'linear-gradient(to bottom, #6b7280 0%, #4b5563 100%)', borderRadius: '1px' }}></div><div style={{ position: 'absolute', bottom: '0', right: '10px', width: '16px', height: '16px', backgroundColor: '#0f172a', borderRadius: '50%', border: '2px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, transparent 40%, #cbd5e1 40%, #cbd5e1 45%, transparent 45%), conic-gradient(#cbd5e1 0deg, #cbd5e1 10deg, transparent 10deg, transparent 80deg, #cbd5e1 80deg, #cbd5e1 90deg, transparent 90deg, transparent 170deg, #cbd5e1 170deg, #cbd5e1 180deg, transparent 180deg, transparent 260deg, #cbd5e1 260deg, #cbd5e1 270deg, transparent 270deg, transparent 350deg, #cbd5e1 350deg, #cbd5e1 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '0', left: '8px', width: '16px', height: '16px', backgroundColor: '#0f172a', borderRadius: '50%', border: '2px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, transparent 40%, #cbd5e1 40%, #cbd5e1 45%, transparent 45%), conic-gradient(#cbd5e1 0deg, #cbd5e1 10deg, transparent 10deg, transparent 80deg, #cbd5e1 80deg, #cbd5e1 90deg, transparent 90deg, transparent 170deg, #cbd5e1 170deg, #cbd5e1 180deg, transparent 180deg, transparent 260deg, #cbd5e1 260deg, #cbd5e1 270deg, transparent 270deg, transparent 350deg, #cbd5e1 350deg, #cbd5e1 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '16px', left: '18px', width: '8px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '4px 4px 0 0' }}><div style={{ position: 'absolute', top: '-6px', left: '1px', width: '6px', height: '6px', background: 'linear-gradient(to bottom, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%' }}><div style={{ position: 'absolute', top: '2px', left: '1px', width: '1px', height: '1px', backgroundColor: '#111827', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: '2px', right: '1px', width: '1px', height: '1px', backgroundColor: '#111827', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', top: '2px', right: '-6px', width: '8px', height: '2px', backgroundColor: '#3b82f6', borderRadius: '1px', transform: 'rotate(-15deg)' }}></div></div><div style={{ position: 'absolute', bottom: '12px', right: '8px', width: '4px', height: '3px', background: 'linear-gradient(to left, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #047857', boxShadow: '0 0 6px rgba(252, 211, 77, 0.6)' }}></div><div className="animate-light-blink animation-delay-800" style={{ position: 'absolute', bottom: '8px', left: '5px', width: '3px', height: '2px', background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', borderRadius: '1px', border: '1px solid #047857', boxShadow: '0 0 4px rgba(239, 68, 68, 0.6)' }}></div></div></div>
        <div className="animate-car-left animation-delay-3000" style={{ position: 'absolute', top: '60%', marginTop: '5px', right: '-90px', width: '90px', height: '40px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><div style={{ position: 'absolute', bottom: 0, width: '100%', height: '28px', background: 'linear-gradient(to bottom, #7c3aed 0%, #6d28d9 70%, #5b21b6 100%)', borderRadius: '8px 10px 4px 4px', border: '1px solid #581c87', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.2), inset -2px 0 6px rgba(255, 255, 255, 0.3)' }}></div><div style={{ position: 'absolute', top: '5px', right: '5px', width: '20px', height: '12px', background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '3px', border: '1px solid #581c87', boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', top: '2px', left: '3px', width: '12px', height: '1px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', top: '5px', left: '25px', right: '30px', height: '12px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '3px 0 0 0', border: '1px solid #581c87', boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', bottom: '2px', left: '6px', width: '4px', height: '6px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '2px 2px 0 0' }}></div><div style={{ position: 'absolute', bottom: '2px', right: '6px', width: '4px', height: '6px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '2px 2px 0 0' }}></div></div><div style={{ position: 'absolute', bottom: '18px', right: '15px', width: '6px', height: '8px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '3px 3px 0 0' }}></div><div style={{ position: 'absolute', bottom: '8px', right: '3px', width: '6px', height: '4px', background: 'linear-gradient(to left, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #581c87', boxShadow: '0 0 6px rgba(252, 211, 77, 0.6)' }}><div style={{ position: 'absolute', top: '1px', right: '1px', width: '2px', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%' }}></div></div><div className="animate-light-blink animation-delay-300" style={{ position: 'absolute', bottom: '14px', right: '6px', width: '4px', height: '4px', background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #581c87', boxShadow: '0 0 5px rgba(252, 211, 77, 0.6)' }}></div><div className="animate-light-blink animation-delay-600" style={{ position: 'absolute', bottom: '8px', left: '3px', width: '5px', height: '3px', background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', borderRadius: '2px', border: '1px solid #581c87', boxShadow: '0 0 5px rgba(239, 68, 68, 0.6)' }}></div><div style={{ position: 'absolute', top: '18px', left: '50%', transform: 'translateX(-50%)', width: '25px', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #581c87', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '3px', fontWeight: 'bold', color: '#581c87', fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif" }}>පවුල</div></div><div style={{ position: 'absolute', bottom: '-5px', right: '15px', width: '14px', height: '14px', backgroundColor: '#0f172a', borderRadius: '50%', border: '2px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '-5px', left: '15px', width: '14px', height: '14px', backgroundColor: '#0f172a', borderRadius: '50%', border: '2px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '18px', height: '5px', backgroundColor: 'white', borderRadius: '1px', border: '1px solid #581c87', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '3px', fontWeight: 'bold', color: '#1f2937' }}>VAN-789</div></div><div style={{ position: 'absolute', bottom: '3px', left: '5px', width: '4px', height: '2px', background: 'linear-gradient(to right, #9ca3af 0%, #6b7280 100%)', borderRadius: '1px 0 0 1px', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)' }}></div><div style={{ position: 'absolute', bottom: '3px', left: '2px', width: '5px', height: '5px', background: 'radial-gradient(circle, rgba(209, 213, 219, 0.8) 0%, rgba(209, 213, 219, 0) 70%)', borderRadius: '50%', opacity: 0.6, animation: 'steam 0.9s ease-out infinite' }}></div></div></div>
        <div className="animate-car-left animation-delay-1200" style={{ position: 'absolute', top: '15%', marginTop: '25px', right: '-110px', width: '110px', height: '55px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><div style={{ position: 'absolute', bottom: 0, width: '100%', height: '35px', background: 'linear-gradient(to bottom, #1e40af 0%, #1d4ed8 70%, #1e3a8a 100%)', borderRadius: '8px 12px 5px 5px', border: '1px solid #1e3a8a', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.2), inset -2px 0 6px rgba(255, 255, 255, 0.3)' }}></div><div style={{ position: 'absolute', bottom: '35px', left: '15px', right: '5px', height: '15px', background: 'linear-gradient(to bottom, #1e3a8a 0%, #1e40af 100%)', borderRadius: '5px 8px 0 0', border: '1px solid #1e3a8a', borderBottom: 'none' }}></div><div style={{ position: 'absolute', top: '8px', right: '5px', width: '25px', height: '15px', background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '3px', border: '1px solid #1e3a8a', boxShadow: 'inset 0 0 6px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', top: '2px', left: '3px', width: '15px', height: '2px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', top: '8px', left: '35px', right: '35px', height: '15px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '3px 0 0 0', border: '1px solid #1e3a8a', boxShadow: 'inset 0 0 6px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', bottom: '3px', left: '8px', width: '6px', height: '8px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '3px 3px 0 0' }}></div><div style={{ position: 'absolute', bottom: '3px', right: '8px', width: '6px', height: '8px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '3px 3px 0 0' }}></div></div><div style={{ position: 'absolute', bottom: '8px', left: '40px', width: '25px', height: '25px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.6) 0%, rgba(147, 197, 253, 0.6) 100%)', borderRadius: '3px', border: '2px solid #1e3a8a', boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.4)' }}><div style={{ position: 'absolute', top: '12px', right: '2px', width: '3px', height: '5px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', borderRadius: '2px', border: '1px solid #475569' }}></div></div><div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '35px', height: '10px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #1e3a8a', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '5px', fontWeight: 'bold', color: '#1e3a8a', fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif" }}>ශ්‍රී සේවා</div></div><div style={{ position: 'absolute', bottom: '10px', right: '3px', width: '8px', height: '6px', background: 'linear-gradient(to left, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #1e3a8a', boxShadow: '0 0 8px rgba(252, 211, 77, 0.6)' }}><div style={{ position: 'absolute', top: '1px', right: '1px', width: '3px', height: '2px', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', bottom: '8px', right: '-20px', width: '25px', height: '12px', background: 'linear-gradient(to right, rgba(252, 211, 77, 0.2) 0%, rgba(252, 211, 77, 0) 100%)', borderRadius: '50%', transform: 'scaleX(2)' }}></div><div className="animate-light-blink animation-delay-200" style={{ position: 'absolute', bottom: '18px', right: '8px', width: '5px', height: '5px', background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #1e3a8a', boxShadow: '0 0 6px rgba(252, 211, 77, 0.6)' }}></div><div className="animate-light-blink animation-delay-400" style={{ position: 'absolute', bottom: '10px', left: '5px', width: '6px', height: '4px', background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', borderRadius: '2px', border: '1px solid #1e3a8a', boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)' }}></div><div style={{ position: 'absolute', bottom: '-6px', right: '20px', width: '18px', height: '18px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '-6px', left: '20px', width: '18px', height: '18px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '22px', height: '6px', backgroundColor: 'white', borderRadius: '2px', border: '1px solid #1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '3px', fontWeight: 'bold', color: '#1f2937' }}>VN-7890</div></div><div style={{ position: 'absolute', bottom: '4px', left: '8px', width: '6px', height: '3px', background: 'linear-gradient(to right, #9ca3af 0%, #6b7280 100%)', borderRadius: '1px 0 0 1px', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)' }}></div><div style={{ position: 'absolute', bottom: '4px', left: '3px', width: '7px', height: '7px', background: 'radial-gradient(circle, rgba(209, 213, 219, 0.8) 0%, rgba(209, 213, 219, 0) 70%)', borderRadius: '50%', opacity: 0.6, animation: 'steam 1.1s ease-out infinite' }}></div></div></div>
      </div>

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
              <button onClick={() => { localStorage.removeItem('cs_token'); router.push('/cs/login'); }} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PowerIcon width={16} /> Logout
              </button>
            </div>
          </div>
        </nav>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '1.5rem', overflow: 'hidden' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem' }}>
            {[
              { label: 'Active Chats', value: queueStats?.active || 0, icon: ChatBubbleOvalLeftEllipsisIcon, color: '#22c55e' },
              { label: 'Waiting in Queue', value: queueStats?.waiting || 0, icon: ClockIcon, color: '#f59e0b' },
              { label: 'Total Today', value: queueStats?.total || 0, icon: ListBulletIcon, color: '#3b82f6' },
              { label: 'Avg Wait Time', value: queueStats?.avgWaitTime || '0m', icon: ChartBarIcon, color: '#8b5cf6' },
              { label: 'Satisfaction', value: queueStats?.satisfactionRate || '0%', icon: CheckBadgeIcon, color: '#14b8a6' },
            ].map((metric, index) => (
              <div key={metric.label} style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <metric.icon width={24} height={24} color={metric.color} />
                  <div>
                    <h3 style={{ color: metric.color, fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>{metric.value}</h3>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0', fontWeight: '500', fontSize: '0.875rem' }}>{metric.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                      <span style={{ padding: '0.125rem 0.5rem', fontSize: '0.7rem', fontWeight: '600', borderRadius: '999px', backgroundColor: getPriorityColor(chat.priority) + '30', color: getPriorityColor(chat.priority) }}>{chat.priority}</span>
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
                      <div key={message._id} style={{ marginBottom: '1rem', display: 'flex', justifyContent: message.sender === 'agent' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '75%', padding: '0.75rem 1rem', borderRadius: '1rem', backgroundColor: message.sender === 'agent' ? '#3b82f6' : message.sender === 'ai' ? '#14b8a6' : message.sender === 'system' ? currentThemeStyles.textSecondary : currentThemeStyles.alertBg, color: message.sender === 'customer' ? currentThemeStyles.textPrimary : 'white', border: message.sender === 'customer' ? currentThemeStyles.quickActionBorder : 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                          <div style={{ fontSize: '0.7rem', marginBottom: '0.25rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {message.sender === 'agent' ? <UserCircleIcon width={12}/> : message.sender === 'ai' ? <CpuChipIcon width={12}/> : message.sender === 'system' ? <Cog6ToothIcon width={12}/> : <UserCircleIcon width={12}/>}
                            {message.sender === 'agent' ? 'You' : message.sender === 'ai' ? 'AI Assistant' : message.sender === 'system' ? 'System' : selectedChat.customerInfo.name}
                            <span style={{ marginLeft: '0.5rem' }}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div style={{ lineHeight: 1.5 }}>{message.message}</div>
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
                  <div>
                    <ChatBubbleOvalLeftEllipsisIcon width={64} height={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem' }}>Select a chat to begin</h3>
                    <p>Your conversations will appear here.</p>
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