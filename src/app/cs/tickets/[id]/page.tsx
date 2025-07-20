'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Interfaces for type safety
interface ITimelineEntry {
  _id: string;
  action: string;
  agent?: { name: string; };
  timestamp: string;
  note?: string;
}

interface ITicketDetails {
  _id: string;
  ticketId: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  customerInfo: { name: string; email: string; };
  assignedAgent?: { name: string; };
  timeline: ITimelineEntry[];
  createdAt: string;
}

export default function TicketDetails() {
  const [ticket, setTicket] = useState<ITicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const fetchTicketDetails = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setTicket(result.data.ticket);
      } else {
        console.error('API Error:', result.message);
      }
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      router.push('/cs/login');
      return;
    }
    fetchTicketDetails(token);
  }, [fetchTicketDetails, router]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const token = localStorage.getItem('cs_token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets/${ticketId}/notes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote })
      });
      if (response.ok) {
        setNewNote('');
        fetchTicketDetails(token); // Re-fetch to update timeline
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading ticket details...</div>;
  if (!ticket) return <div className="p-8 text-center text-red-500">Ticket not found.</div>;

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <header className="flex items-center justify-between pb-6 mb-6 border-b border-gray-300 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ticket: {ticket.ticketId}</h1>
          <p className="text-gray-600 dark:text-gray-400">{ticket.subject}</p>
        </div>
        <button onClick={() => router.push('/cs/tickets')} className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700">
          Back to Queue
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content: Description & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold">Timeline</h3>
            <div className="space-y-4">
              {ticket.timeline.map(entry => (
                <div key={entry._id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="flex-grow w-px bg-gray-300"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {entry.action.replace('_', ' ')} by {entry.agent?.name || 'System'}
                    </p>
                    {entry.note && <p className="p-2 mt-1 text-sm bg-gray-100 rounded-md dark:bg-gray-700">{entry.note}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Details & Actions */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold">Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Status:</strong> {ticket.status}</p>
              <p><strong>Priority:</strong> {ticket.priority}</p>
              <p><strong>Category:</strong> {ticket.category}</p>
              <p><strong>Agent:</strong> {ticket.assignedAgent?.name || 'Unassigned'}</p>
              <p><strong>Customer:</strong> {ticket.customerInfo.name} ({ticket.customerInfo.email})</p>
              <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold">Add Note</h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Add an internal note or customer reply..."
            />
            <button onClick={handleAddNote} className="w-full px-4 py-2 mt-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Add Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}