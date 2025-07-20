// app/cs/chat/page.tsx - Complete Backend Integration
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
  const [typing, setTyping] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      router.push('/cs/login');
      return;
    }
    fetchChatData(token);
    
    // Auto refresh every 5 seconds when enabled
    const interval = autoRefresh ? setInterval(() => fetchChatData(token), 5000) : null;
    return () => { if (interval) clearInterval(interval); };
  }, [autoRefresh, router]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat sessions and stats from backend
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
        setChatSessions(sessionsData.data.sessions || []);
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

  // Select chat and load messages
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
          // Get AI suggestions based on latest customer message
          const lastCustomerMessage = data.data.messages
            ?.filter((msg: ChatMessage) => msg.sender === 'customer')
            ?.pop()?.message;
          if (lastCustomerMessage) {
            getAiSuggestions(lastCustomerMessage);
          }
        }
      } else {
        setError('Failed to load chat messages');
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to load chat messages');
    }
  };

  // Get AI suggestions for responses
  const getAiSuggestions = async (customerMessage: string) => {
    const token = localStorage.getItem('cs_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/ai/suggestions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: customerMessage })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAiSuggestions(data.data.suggestions || []);
        }
      }
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      // Provide fallback suggestions
      setAiSuggestions([
        "Thank you for contacting Sri Express. How can I help you today?",
        "I understand your concern. Let me check that for you right away.",
        "I'd be happy to help you with your issue. Can you provide more details?"
      ]);
    }
  };

  // Send message
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
          // Add message to local state
          const newMsg: ChatMessage = {
            _id: data.data.messageId || Date.now().toString(),
            sender: 'agent',
            message: newMessage,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, newMsg]);
          setNewMessage('');
          
          // Refresh chat data to get updated session info
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

  // Assign chat to current agent
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

  // Transfer chat to another agent
  const transferChat = async (chatId: string, targetAgent: string) => {
    const token = localStorage.getItem('cs_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/chat/sessions/${chatId}/transfer`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetAgent })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          fetchChatData(token);
          if (selectedChat?._id === chatId) {
            setSelectedChat(null);
            setMessages([]);
          }
        }
      } else {
        setError('Failed to transfer chat');
      }
    } catch (error) {
      console.error('Failed to transfer chat:', error);
      setError('Failed to transfer chat');
    }
  };

  // End chat session
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
          setAiSuggestions([]);
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

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'waiting': return 'bg-yellow-500';
      case 'escalated': return 'bg-red-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateWaitTime = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    return diffMinutes;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading chat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Live Chat Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Status:</label>
            <select 
              value={agentStatus} 
              onChange={(e) => setAgentStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="away">Away</option>
            </select>
          </div>
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}
          >
            Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={() => router.push('/cs/dashboard')}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">{queueStats?.active || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Chats</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-yellow-600">{queueStats?.waiting || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Waiting</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{queueStats?.total || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Today</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-cyan-600">{queueStats?.avgWaitTime || '0m'}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Wait</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{queueStats?.avgResponseTime || '0s'}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">{queueStats?.satisfactionRate || '0%'}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
        {/* Chat Queue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Chat Queue</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chatSessions.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No active chats
              </div>
            ) : (
              chatSessions.map(chat => (
                <div 
                  key={chat._id} 
                  onClick={() => selectChat(chat)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedChat?._id === chat._id ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <strong className="text-gray-800 dark:text-white">{chat.customerInfo.name}</strong>
                    <div className="flex gap-1">
                      <span className={`px-2 py-1 text-xs text-white rounded-full ${getPriorityColor(chat.priority)}`}>
                        {chat.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs text-white rounded-full ${getStatusColor(chat.status)}`}>
                        {chat.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {chat.sessionId} | Wait: {calculateWaitTime(chat.startedAt)}m | 
                    Agent: {chat.assignedAgent?.name || 'Unassigned'}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {chat.lastMessage || 'No messages yet'}
                  </div>
                  {chat.status === 'waiting' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); assignChat(chat._id); }}
                      className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      Accept Chat
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {selectedChat.customerInfo.name} - {selectedChat.sessionId}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Status: <span className={`font-semibold ${selectedChat.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedChat.status}
                      </span> | 
                      Priority: <span className={`font-semibold ${selectedChat.priority === 'urgent' ? 'text-red-600' : 'text-blue-600'}`}>
                        {selectedChat.priority}
                      </span>
                      {customerTyping && <span className="text-green-600"> | Customer is typing...</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => router.push(`/cs/customers/${selectedChat.customerInfo.id}`)}
                      className="px-3 py-1 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700"
                    >
                      Profile
                    </button>
                    <button 
                      onClick={() => transferChat(selectedChat._id, 'supervisor')}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                    >
                      Transfer
                    </button>
                    <button 
                      onClick={() => endChat(selectedChat._id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      End Chat
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                {messages.map(message => (
                  <div 
                    key={message._id} 
                    className={`mb-4 flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender === 'agent' ? 'bg-blue-600 text-white' : 
                      message.sender === 'ai' ? 'bg-cyan-600 text-white' : 
                      message.sender === 'system' ? 'bg-gray-600 text-white' : 
                      'bg-white border border-gray-200 text-gray-800'
                    }`}>
                      <div className="text-xs mb-2 opacity-80">
                        {message.sender === 'agent' ? 'You' : 
                         message.sender === 'ai' ? 'AI Assistant' : 
                         message.sender === 'system' ? 'System' : 
                         selectedChat.customerInfo.name} - {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                      <div>{message.message}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900">
                  <div className="text-sm font-semibold mb-2 text-blue-800 dark:text-blue-200">AI Suggestions:</div>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                      <button 
                        key={index}
                        onClick={() => setNewMessage(suggestion)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700"
                      >
                        {suggestion.substring(0, 40)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
                {typing && (
                  <div className="text-sm text-gray-500 mt-2">You are typing...</div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <div className="text-lg">Select a chat from the queue to start conversation</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}