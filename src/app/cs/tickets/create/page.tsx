// app/cs/tickets/create/page.tsx - Complete Ticket Creation
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CSAuthGuard } from '../../../components/CSAuthGuard';
import { useCSApi } from '../../../hooks/useCSApi';

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  customerId?: string;
}

interface TicketData {
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customerInfo: CustomerInfo;
  source: 'email' | 'phone' | 'chat' | 'manual' | 'web';
  tags: string[];
  attachments?: string[];
}

const CATEGORIES = [
  'booking_issue',
  'payment_problem', 
  'route_information',
  'schedule_inquiry',
  'refund_request',
  'account_support',
  'technical_issue',
  'complaint',
  'suggestion',
  'other'
];

const CATEGORY_LABELS = {
  booking_issue: 'Booking Issue',
  payment_problem: 'Payment Problem',
  route_information: 'Route Information',
  schedule_inquiry: 'Schedule Inquiry', 
  refund_request: 'Refund Request',
  account_support: 'Account Support',
  technical_issue: 'Technical Issue',
  complaint: 'Complaint',
  suggestion: 'Suggestion',
  other: 'Other'
};

export default function CreateTicket() {
  const [formData, setFormData] = useState<TicketData>({
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      customerId: ''
    },
    source: 'manual',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');
  const [existingCustomers, setExistingCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [creating, setCreating] = useState(false);
  const { loading, error, setError, executeWithErrorHandling, csApi } = useCSApi();
  const router = useRouter();

  // Auto-save draft to localStorage
  useEffect(() => {
    const draftKey = 'cs_ticket_draft';
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...draft }));
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }

    const saveDraft = () => {
      localStorage.setItem(draftKey, JSON.stringify(formData));
    };

    const interval = setInterval(saveDraft, 30000); // Save every 30 seconds
    return () => clearInterval(interval);
  }, [formData]);

  // Search existing customers
  useEffect(() => {
    if (customerSearch.length > 2) {
      searchCustomers(customerSearch);
    } else {
      setExistingCustomers([]);
      setShowCustomerDropdown(false);
    }
  }, [customerSearch]);

  const searchCustomers = async (query: string) => {
    try {
      // This would call a customer search endpoint
      // For now, we'll simulate with local search
      const mockCustomers = [
        { id: '1', name: 'Anjali Wickrama', email: 'anjali@example.com', phone: '+94701234567' },
        { id: '2', name: 'Ranil Kumar', email: 'ranil@example.com', phone: '+94709876543' },
        { id: '3', name: 'Priya De Silva', email: 'priya@example.com', phone: '+94715555555' }
      ];
      
      const filtered = mockCustomers.filter(customer => 
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.email.toLowerCase().includes(query.toLowerCase())
      );
      
      setExistingCustomers(filtered);
      setShowCustomerDropdown(filtered.length > 0);
    } catch (error) {
      console.error('Failed to search customers:', error);
    }
  };

  const selectCustomer = (customer: any) => {
    setFormData(prev => ({
      ...prev,
      customerInfo: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        customerId: customer.id
      }
    }));
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('customerInfo.')) {
      const customerField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        customerInfo: {
          ...prev.customerInfo,
          [customerField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    // Validation
    if (!formData.subject.trim()) {
      setError('Subject is required');
      setCreating(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      setCreating(false);
      return;
    }

    if (!formData.customerInfo.name.trim() || !formData.customerInfo.email.trim()) {
      setError('Customer name and email are required');
      setCreating(false);
      return;
    }

    if (!formData.category) {
      setError('Category is required');
      setCreating(false);
      return;
    }

    try {
      const result = await executeWithErrorHandling(() => csApi.createTicket(formData));
      
      // Clear draft
      localStorage.removeItem('cs_ticket_draft');
      
      // Redirect to ticket details
      router.push(`/cs/tickets/${result.ticketId}`);
    } catch (error) {
      console.error('Failed to create ticket:', error);
    } finally {
      setCreating(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('cs_ticket_draft');
    setFormData({
      subject: '',
      description: '',
      category: '',
      priority: 'medium',
      customerInfo: {
        name: '',
        email: '',
        phone: '',
        customerId: ''
      },
      source: 'manual',
      tags: []
    });
    setTagInput('');
  };

  return (
    <CSAuthGuard>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Create New Ticket</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manually create a support ticket for customer assistance
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => router.push('/cs/tickets')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            >
              Cancel
            </button>
            <button 
              onClick={clearDraft}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            >
              Clear Draft
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Customer Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Customer Name / Search
                  </label>
                  <input
                    type="text"
                    value={customerSearch || formData.customerInfo.name}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      handleInputChange('customerInfo.name', e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Search existing customer or enter new name"
                    required
                  />
                  
                  {/* Customer Dropdown */}
                  {showCustomerDropdown && existingCustomers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg dark:bg-gray-700 dark:border-gray-600">
                      {existingCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          onClick={() => selectCustomer(customer)}
                          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="font-medium text-gray-800 dark:text-white">{customer.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.customerInfo.email}
                    onChange={(e) => handleInputChange('customerInfo.email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="customer@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.customerInfo.phone}
                    onChange={(e) => handleInputChange('customerInfo.phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="+94701234567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Customer ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.customerInfo.customerId}
                    onChange={(e) => handleInputChange('customerInfo.customerId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="CUST001"
                  />
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Ticket Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Detailed description of the customer's issue..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Source
                    </label>
                    <select
                      value={formData.source}
                      onChange={(e) => handleInputChange('source', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="manual">Manual Entry</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="chat">Chat</option>
                      <option value="web">Web Form</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Add tags to categorize this ticket"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-900 dark:text-blue-200"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/cs/tickets')}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || loading}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating Ticket...' : 'Create Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </CSAuthGuard>
  );
}