'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Interfaces for type safety
interface ITicket {
  _id: string;
  ticketId: string;
  subject: string;
  customerInfo: { name: string; email: string; };
  assignedAgent?: { name: string; };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

interface IPagination {
  current: number;
  pages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function CSTickets() {
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [pagination, setPagination] = useState<IPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', page: '1' });
  const router = useRouter();

  const fetchTickets = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      params.append('limit', '15'); // 15 tickets per page

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setTickets(result.data.tickets);
        setPagination(result.data.pagination);
      } else {
        console.error('API Error:', result.message);
        setTickets([]);
        setPagination(null);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      router.push('/cs/login');
      return;
    }
    fetchTickets(token);
  }, [fetchTickets, router]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: '1' }));
  };
  
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage.toString() }));
  };

  const getPriorityPill = (priority: string) => {
    const styles = {
      'urgent': 'bg-red-100 text-red-800 border-red-300',
      'high': 'bg-orange-100 text-orange-800 border-orange-300',
      'medium': 'bg-blue-100 text-blue-800 border-blue-300',
      'low': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[priority] || styles['low']}`}>{priority}</span>;
  };

  const getStatusPill = (status: string) => {
    const styles = {
      'open': 'bg-red-100 text-red-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-200 text-gray-600'
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || styles['closed']}`}>{status.replace('_', ' ')}</span>;
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Ticket Queue</h1>
        <div>
          <button onClick={() => router.push('/cs/dashboard')} className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Dashboard</button>
          <button onClick={() => router.push('/cs/tickets/create')} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Create New Ticket
          </button>
        </div>
      </header>

      <div className="p-4 mb-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input type="text" name="search" placeholder="Search by ID, subject, customer..." value={filters.search} onChange={handleFilterChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select name="priority" value={filters.priority} onChange={handleFilterChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm dark:bg-gray-800">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              <th scope="col" className="px-6 py-3">Ticket ID</th>
              <th scope="col" className="px-6 py-3">Subject</th>
              <th scope="col" className="px-6 py-3">Customer</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Priority</th>
              <th scope="col" className="px-6 py-3">Assigned To</th>
              <th scope="col" className="px-6 py-3">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading tickets...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">No tickets match the current filters.</td></tr>
            ) : (
              tickets.map(ticket => (
                <tr key={ticket._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-blue-600 whitespace-nowrap dark:text-blue-500 hover:underline">
                    <Link href={`/cs/tickets/${ticket._id}`}>{ticket.ticketId}</Link>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-700 dark:text-white">{ticket.subject}</td>
                  <td className="px-6 py-4">{ticket.customerInfo.name}</td>
                  <td className="px-6 py-4">{getStatusPill(ticket.status)}</td>
                  <td className="px-6 py-4">{getPriorityPill(ticket.priority)}</td>
                  <td className="px-6 py-4">{ticket.assignedAgent?.name || <span className="italic text-gray-400">Unassigned</span>}</td>
                  <td className="px-6 py-4">{new Date(ticket.updatedAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-700 dark:text-gray-400">
            Showing page {pagination.current} of {pagination.pages} ({pagination.total} tickets)
          </span>
          <div className="inline-flex mt-2 xs:mt-0">
            <button onClick={() => handlePageChange(pagination.current - 1)} disabled={!pagination.hasPrev} className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900 disabled:bg-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              Prev
            </button>
            <button onClick={() => handlePageChange(pagination.current + 1)} disabled={!pagination.hasNext} className="px-4 py-2 text-sm font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:bg-gray-900 disabled:bg-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}