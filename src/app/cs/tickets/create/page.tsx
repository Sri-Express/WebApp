// app/cs/tickets/create/page.tsx - STANDALONE VERSION (No external dependencies)
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      // Mock customers for demo
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
      const token = localStorage.getItem('cs_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create ticket: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        // Clear draft
        localStorage.removeItem('cs_ticket_draft');
        
        // Redirect to ticket details
        router.push(`/cs/tickets/${result.data.ticketId}`);
      } else {
        throw new Error(result.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      setError(error instanceof Error ? error.message : 'Failed to create ticket');
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
    <div style={{
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* CSS */}
      <style jsx>{`
        .hover-btn:hover {
          opacity: 0.8;
        }
        .dropdown-item:hover {
          background-color: #f1f5f9;
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
            ➕ Create New Ticket
          </h1>
          <p style={{
            color: '#64748b',
            margin: 0
          }}>
            Manually create a support ticket for customer assistance
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => router.push('/cs/tickets')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            className="hover-btn"
            disabled={creating}
          >
            ❌ Cancel
          </button>
          <button 
            onClick={clearDraft}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            className="hover-btn"
          >
            🗑️ Clear Draft
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#dc2626',
          borderRadius: '8px'
        }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Form */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Customer Information */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              👤 Customer Information
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ position: 'relative' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Customer Name / Search
                </label>
                <input
                  type="text"
                  value={customerSearch || formData.customerInfo.name}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    handleInputChange('customerInfo.name', e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="Search existing customer or enter new name"
                  required
                />
                
                {/* Customer Dropdown */}
                {showCustomerDropdown && existingCustomers.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    zIndex: 10,
                    width: '100%',
                    marginTop: '4px',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}>
                    {existingCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => selectCustomer(customer)}
                        className="dropdown-item"
                        style={{
                          padding: '12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f1f5f9'
                        }}
                      >
                        <div style={{ fontWeight: '500', color: '#1e293b' }}>{customer.name}</div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>{customer.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.customerInfo.email}
                  onChange={(e) => handleInputChange('customerInfo.email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="customer@example.com"
                  required
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.customerInfo.phone}
                  onChange={(e) => handleInputChange('customerInfo.phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="+94701234567"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Customer ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.customerInfo.customerId}
                  onChange={(e) => handleInputChange('customerInfo.customerId', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="CUST001"
                />
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              🎫 Ticket Details
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  placeholder="Detailed description of the customer's issue..."
                  required
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
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
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                    <option value="urgent">🚨 Urgent</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => handleInputChange('source', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
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
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Tags
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    placeholder="Add tags to categorize this ticket"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          fontSize: '14px',
                          borderRadius: '12px'
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          style={{
                            marginLeft: '8px',
                            color: '#1e40af',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button
              type="button"
              onClick={() => router.push('/cs/tickets')}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || loading}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '6px',
                cursor: creating || loading ? 'not-allowed' : 'pointer',
                opacity: creating || loading ? 0.5 : 1
              }}
            >
              {creating ? 'Creating Ticket...' : '✅ Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}