// app/cs/chat/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function CSChat() {
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [agentStatus, setAgentStatus] = useState('available');
  const [typing, setTyping] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
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
    
    // Auto refresh every 5 seconds
    const interval = autoRefresh ? setInterval(() => fetchChatData(token), 5000) : null;
    return () => { if (interval) clearInterval(interval); };
  }, [autoRefresh]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatData = async (token: string) => {
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/cs/chat/sessions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/cs/chat/sessions/stats', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (sessionsRes.ok && statsRes.ok) {
        const [sessions, stats] = await Promise.all([sessionsRes.json(), statsRes.json()]);
        setChatSessions(sessions.sessions || []);
        setQueueStats(stats);
      } else {
        loadDemoData();
      }
    } catch (error) {
      console.error('Failed to fetch chat data:', error);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    const demoSessions = [
      { _id: '1', sessionId: 'CH001', customerName: 'Anjali Wickrama', status: 'active', assignedAgent: 'You', waitTime: 0, lastMessage: 'Can you help me with route information?', priority: 'normal', createdAt: new Date().toISOString() },
      { _id: '2', sessionId: 'CH002', customerName: 'Ranil Kumar', status: 'waiting', assignedAgent: null, waitTime: 3, lastMessage: 'My payment failed, need help', priority: 'high', createdAt: new Date(Date.now() - 180000).toISOString() },
      { _id: '3', sessionId: 'CH003', customerName: 'Priya De Silva', status: 'waiting', assignedAgent: null, waitTime: 7, lastMessage: 'Hello, I need to cancel my booking', priority: 'normal', createdAt: new Date(Date.now() - 420000).toISOString() },
      { _id: '4', sessionId: 'CH004', customerName: 'Kasun Perera', status: 'escalated', assignedAgent: 'Supervisor', waitTime: 15, lastMessage: 'This is urgent, I missed my bus!', priority: 'urgent', createdAt: new Date(Date.now() - 900000).toISOString() }
    ];

    const demoStats = {
      active: 1,
      waiting: 2,
      total: 4,
      avgWaitTime: '5.2 min',
      avgResponseTime: '45 sec',
      satisfactionRate: '94%'
    };

    setChatSessions(demoSessions);
    setQueueStats(demoStats);
  };

  const selectChat = async (chat: any) => {
    setSelectedChat(chat);
    const token = localStorage.getItem('cs_token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/cs/chat/sessions/${chat._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        loadDemoMessages(chat);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      loadDemoMessages(chat);
    }
    
    // Get AI suggestions
    getAiSuggestions(chat.lastMessage);
  };

  const loadDemoMessages = (chat: any) => {
    const demoMessages = [
      { _id: '1', sender: 'customer', message: chat.lastMessage, timestamp: new Date(Date.now() - 300000).toISOString() },
      { _id: '2', sender: 'ai', message: 'I understand you need help. Let me connect you with an agent.', timestamp: new Date(Date.now() - 290000).toISOString() },
      { _id: '3', sender: 'system', message: 'Agent joined the conversation', timestamp: new Date(Date.now() - 60000).toISOString() }
    ];
    setMessages(demoMessages);
  };

  const getAiSuggestions = async (lastMessage: string) => {
    const suggestions = [
      "Thank you for contacting Sri Express. How can I help you today?",
      "I understand your concern. Let me check that for you right away.",
      "I'd be happy to help you with your booking issue. Can you provide your booking ID?",
      "For payment issues, I'll need to verify a few details. Can you confirm your email address?",
      "Let me transfer you to our payment specialist who can better assist you."
    ];
    setAiSuggestions(suggestions);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const token = localStorage.getItem('cs_token');
    const messageData = {
      message: newMessage,
      sender: 'agent'
    };

    try {
      await fetch(`http://localhost:5000/api/cs/chat/sessions/${selectedChat._id}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }

    // Add message locally for demo
    const newMsg = {
      _id: Date.now().toString(),
      sender: 'agent',
      message: newMessage,
      timestamp: new Date().toISOString()
    };
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // Simulate customer response after 3 seconds
    setTimeout(() => {
      const responses = [
        "Thank you for your help!",
        "Yes, that worked perfectly.",
        "I still need more assistance with this.",
        "Can you provide more details?",
        "That resolves my issue. Thank you!"
      ];
      const customerResponse = {
        _id: (Date.now() + 1).toString(),
        sender: 'customer',
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, customerResponse]);
    }, 3000);
  };

  const assignChat = async (chatId: string) => {
    const token = localStorage.getItem('cs_token');
    try {
      await fetch(`http://localhost:5000/api/cs/chat/sessions/${chatId}/assign`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: 'current_agent' })
      });
      fetchChatData(token);
    } catch (error) {
      console.error('Failed to assign chat:', error);
      // Update locally for demo
      setChatSessions(prev => prev.map(chat => 
        chat._id === chatId ? {...chat, assignedAgent: 'You', status: 'active'} : chat
      ));
    }
  };

  const transferChat = async (chatId: string, targetAgent: string) => {
    const token = localStorage.getItem('cs_token');
    try {
      await fetch(`http://localhost:5000/api/cs/chat/sessions/${chatId}/transfer`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetAgent })
      });
      fetchChatData(token);
    } catch (error) {
      console.error('Failed to transfer chat:', error);
    }
  };

  const endChat = async (chatId: string) => {
    const token = localStorage.getItem('cs_token');
    try {
      await fetch(`http://localhost:5000/api/cs/chat/sessions/${chatId}/end`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'resolved' })
      });
      setSelectedChat(null);
      setMessages([]);
      fetchChatData(token);
    } catch (error) {
      console.error('Failed to end chat:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'normal': return '#007bff';
      case 'low': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#28a745';
      case 'waiting': return '#ffc107';
      case 'escalated': return '#dc3545';
      case 'ended': return '#6c757d';
      default: return '#6c757d';
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading chat dashboard...</div>;

  return (
    <div style={{ padding: '20px', height: 'calc(100vh - 40px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Live Chat Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div>
            <label>Status: </label>
            <select value={agentStatus} onChange={(e) => setAgentStatus(e.target.value)} style={{ padding: '5px' }}>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="away">Away</option>
            </select>
          </div>
          <button onClick={() => setAutoRefresh(!autoRefresh)} style={{ padding: '8px 16px', backgroundColor: autoRefresh ? '#28a745' : '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}>
            Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => router.push('/cs/dashboard')} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>Dashboard</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <div style={{ border: '1px solid #ddd', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>{queueStats?.active || 0}</div>
          <div>Active Chats</div>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffc107' }}>{queueStats?.waiting || 0}</div>
          <div>Waiting</div>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>{queueStats?.total || 0}</div>
          <div>Total Today</div>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#17a2b8' }}>{queueStats?.avgWaitTime || '0m'}</div>
          <div>Avg Wait</div>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>{queueStats?.avgResponseTime || '0s'}</div>
          <div>Avg Response</div>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>{queueStats?.satisfactionRate || '0%'}</div>
          <div>Satisfaction</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', height: 'calc(100% - 160px)' }}>
        {/* Chat Queue */}
        <div style={{ border: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '15px', borderBottom: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>
            <h3>Chat Queue</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {chatSessions.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No active chats</div>
            ) : (
              chatSessions.map(chat => (
                <div key={chat._id} onClick={() => selectChat(chat)} style={{ padding: '15px', borderBottom: '1px solid #eee', cursor: 'pointer', backgroundColor: selectedChat?._id === chat._id ? '#e3f2fd' : 'white' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = selectedChat?._id === chat._id ? '#e3f2fd' : '#f8f9fa'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = selectedChat?._id === chat._id ? '#e3f2fd' : 'white'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <strong>{chat.customerName}</strong>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <span style={{ padding: '2px 6px', borderRadius: '3px', color: 'white', backgroundColor: getPriorityColor(chat.priority), fontSize: '10px' }}>{chat.priority}</span>
                      <span style={{ padding: '2px 6px', borderRadius: '3px', color: 'white', backgroundColor: getStatusColor(chat.status), fontSize: '10px' }}>{chat.status}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                    {chat.sessionId} | Wait: {chat.waitTime}m | Agent: {chat.assignedAgent || 'Unassigned'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#333' }}>{chat.lastMessage}</div>
                  {chat.status === 'waiting' && (
                    <button onClick={(e) => { e.stopPropagation(); assignChat(chat._id); }} style={{ marginTop: '8px', padding: '4px 8px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Accept Chat</button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div style={{ border: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '15px', borderBottom: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{selectedChat.customerName}</strong> - {selectedChat.sessionId}
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Status: <span style={{ color: getStatusColor(selectedChat.status) }}>{selectedChat.status}</span> | 
                      Priority: <span style={{ color: getPriorityColor(selectedChat.priority) }}>{selectedChat.priority}</span>
                      {customerTyping && <span style={{ color: '#28a745' }}> | Customer is typing...</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => router.push(`/cs/customers/${selectedChat.customerId}`)} style={{ padding: '4px 8px', backgroundColor: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Profile</button>
                    <button onClick={() => transferChat(selectedChat._id, 'supervisor')} style={{ padding: '4px 8px', backgroundColor: '#ffc107', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Transfer</button>
                    <button onClick={() => endChat(selectedChat._id)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>End Chat</button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#fafafa' }}>
                {messages.map(message => (
                  <div key={message._id} style={{ marginBottom: '15px', display: 'flex', justifyContent: message.sender === 'agent' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '70%', padding: '10px', borderRadius: '10px', backgroundColor: message.sender === 'agent' ? '#007bff' : message.sender === 'ai' ? '#17a2b8' : message.sender === 'system' ? '#6c757d' : '#fff', color: message.sender === 'customer' ? '#333' : 'white', border: message.sender === 'customer' ? '1px solid #ddd' : 'none' }}>
                      <div style={{ fontSize: '10px', marginBottom: '5px', opacity: 0.8 }}>
                        {message.sender === 'agent' ? 'You' : message.sender === 'ai' ? 'AI Assistant' : message.sender === 'system' ? 'System' : selectedChat.customerName} - {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                      <div>{message.message}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div style={{ padding: '10px', borderTop: '1px solid #ddd', backgroundColor: '#e3f2fd' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>AI Suggestions:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                      <button key={index} onClick={() => setNewMessage(suggestion)} style={{ padding: '4px 8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontSize: '11px' }}>
                        {suggestion.substring(0, 50)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div style={{ padding: '15px', borderTop: '1px solid #ddd' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type your message..." style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                  <button onClick={sendMessage} disabled={!newMessage.trim()} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Send</button>
                </div>
                {typing && <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>You are typing...</div>}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              Select a chat from the queue to start conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}