'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const fetchTicketDetails = useCallback(async () => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      router.push('/cs/login');
      return;
    }
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
  }, [ticketId, router]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const token = localStorage.getItem('cs_token');
    if (!token) return;

    setIsSubmittingNote(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets/${ticketId}/notes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote })
      });
      if (response.ok) {
        setNewNote('');
        await fetchTicketDetails(); // Re-fetch to update timeline
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsSubmittingNote(false);
    }
  };
  
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    const token = localStorage.getItem('cs_token');
    if (!token || !ticket) return;

    // Optimistically update the UI
    setTicket({ ...ticket, status: newStatus });

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      await fetchTicketDetails(); // Re-fetch for consistency
    } catch (error) {
      console.error('Failed to update status:', error);
      // Revert optimistic update on failure
      fetchTicketDetails();
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading ticket details...</div>;
  if (!ticket) return <div className="p-8 text-center text-red-500">Ticket not found.</div>;

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Ticket: {ticket.ticketId}</h1>
          <p className="text-gray-500 dark:text-gray-400">{ticket.subject}</p>
        </div>
        <Link href="/cs/tickets" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
          Back to Queue
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Description</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Add a Note</h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Add an internal note or a reply to the customer..."
            />
            <button onClick={handleAddNote} disabled={isSubmittingNote} className="w-full px-4 py-2 mt-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
              {isSubmittingNote ? 'Submitting...' : 'Add Note'}
            </button>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Timeline</h3>
            <div className="space-y-6">
              {ticket.timeline.slice().reverse().map(entry => (
                <div key={entry._id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <div className="flex-grow w-px bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                  <div className="pb-6">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {entry.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} by {entry.agent?.name || 'System'}
                    </p>
                    {entry.note && <p className="p-3 mt-1 text-sm bg-gray-100 rounded-md dark:bg-gray-700 dark:text-gray-300">{entry.note}</p>}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Ticket Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="font-semibold text-gray-500">Status</label>
                <select value={ticket.status} onChange={handleStatusChange} className="w-full p-2 mt-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <p><strong className="text-gray-500">Priority:</strong> {ticket.priority}</p>
              <p><strong className="text-gray-500">Category:</strong> {ticket.category}</p>
              <p><strong className="text-gray-500">Agent:</strong> {ticket.assignedAgent?.name || 'Unassigned'}</p>
              <p><strong className="text-gray-500">Customer:</strong> {ticket.customerInfo.name}</p>
              <p><strong className="text-gray-500">Email:</strong> {ticket.customerInfo.email}</p>
              <p><strong className="text-gray-500">Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}