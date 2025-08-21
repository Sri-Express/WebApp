// app/cs/tickets/create/page.tsx - REFACTORED VERSION
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/cs/components/AnimatedBackground'; // IMPORT THE NEW COMPONENT
import { ArrowLeftIcon, UserCircleIcon, TicketIcon, PlusIcon, TrashIcon, CheckIcon, ExclamationTriangleIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

// --- Interfaces (Unchanged) ---
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

interface SearchedCustomer {
    id: string;
    name: string;
    email: string;
    phone: string;
}

// --- Constants (Unchanged) ---
const CATEGORIES = ['booking_issue', 'payment_problem', 'route_information', 'schedule_inquiry', 'refund_request', 'account_support', 'technical_issue', 'complaint', 'suggestion', 'other'];
const CATEGORY_LABELS: Record<string, string> = { booking_issue: 'Booking Issue', payment_problem: 'Payment Problem', route_information: 'Route Information', schedule_inquiry: 'Schedule Inquiry', refund_request: 'Refund Request', account_support: 'Account Support', technical_issue: 'Technical Issue', complaint: 'Complaint', suggestion: 'Suggestion', other: 'Other' };

export default function CreateTicket() {
  const router = useRouter();
  const { theme } = useTheme();

  // --- State Management (Unchanged) ---
  const [formData, setFormData] = useState<TicketData>({ subject: '', description: '', category: '', priority: 'medium', customerInfo: { name: '', email: '', phone: '', customerId: '' }, source: 'manual', tags: [] });
  const [tagInput, setTagInput] = useState('');
  const [existingCustomers, setExistingCustomers] = useState<SearchedCustomer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Logic and Handlers (Unchanged) ---
  useEffect(() => {
    const draftKey = 'cs_ticket_draft';
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...draft }));
        if (draft.customerInfo?.name) {
          setCustomerSearch(draft.customerInfo.name);
        }
      } catch (err) { console.error('Failed to load draft:', err); }
    }
  }, []);

  useEffect(() => {
    const saveDraft = () => {
      localStorage.setItem('cs_ticket_draft', JSON.stringify(formData));
    };
    const handler = setTimeout(saveDraft, 500);
    return () => clearTimeout(handler);
  }, [formData]);

  const searchCustomers = useCallback(async (query: string) => {
    try {
      const mockCustomers: SearchedCustomer[] = [
        { id: '1', name: 'Anjali Wickrama', email: 'anjali@example.com', phone: '+94701234567' },
        { id: '2', name: 'Ranil Kumar', email: 'ranil@example.com', phone: '+94709876543' },
        { id: '3', name: 'Priya De Silva', email: 'priya@example.com', phone: '+94715555555' }
      ];
      const filtered = mockCustomers.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase()));
      setExistingCustomers(filtered);
      setShowCustomerDropdown(filtered.length > 0);
    } catch (err) { console.error('Failed to search customers:', err); }
  }, []);

  useEffect(() => {
    if (customerSearch.length > 2) {
      const handler = setTimeout(() => searchCustomers(customerSearch), 300);
      return () => clearTimeout(handler);
    } else {
      setExistingCustomers([]);
      setShowCustomerDropdown(false);
    }
  }, [customerSearch, searchCustomers]);

  const selectCustomer = (customer: SearchedCustomer) => {
    setFormData(prev => ({ ...prev, customerInfo: { name: customer.name, email: customer.email, phone: customer.phone, customerId: customer.id } }));
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('customerInfo.')) {
      const customerField = field.split('.')[1] as keyof CustomerInfo;
      setFormData(prev => ({
        ...prev,
        customerInfo: { ...prev.customerInfo, [customerField]: value },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field as keyof Omit<TicketData, 'customerInfo' | 'tags' | 'attachments'>]: value,
      }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    if (!formData.subject.trim() || !formData.description.trim() || !formData.customerInfo.name.trim() || !formData.customerInfo.email.trim() || !formData.category) {
      setError('Please fill all required fields: Subject, Description, Customer Name, Email, and Category.');
      setCreating(false);
      return;
    }
    try {
      const token = localStorage.getItem('cs_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cs/tickets`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!response.ok) throw new Error(`Failed to create ticket: ${response.statusText}`);
      const result = await response.json();
      if (result.success) {
        localStorage.removeItem('cs_ticket_draft');
        router.push(`/cs/tickets/${result.data._id}`);
      } else {
        throw new Error(result.message || 'Failed to create ticket');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setCreating(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('cs_ticket_draft');
    setFormData({ subject: '', description: '', category: '', priority: 'medium', customerInfo: { name: '', email: '', phone: '', customerId: '' }, source: 'manual', tags: [] });
    setCustomerSearch('');
    setTagInput('');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('cs_token');
    router.push('/cs/login');
  };

  // --- Theme & Style Definitions ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', inputBg: 'rgba(249, 250, 251, 0.8)', inputBorder: '1px solid rgba(209, 213, 219, 0.5)', tableHeaderBg: 'rgba(249, 250, 251, 0.6)', tableRowHover: 'rgba(249, 250, 251, 0.9)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', inputBg: 'rgba(51, 65, 85, 0.8)', inputBorder: '1px solid rgba(75, 85, 99, 0.5)', tableHeaderBg: 'rgba(51, 65, 85, 0.6)', tableRowHover: 'rgba(51, 65, 85, 0.9)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
  
  // --- Animation styles for UI elements (cleaned up) ---
  const animationStyles = `
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `;

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflowX: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style jsx>{animationStyles}</style>
      
      {/* --- Use the Animated Background Component --- */}
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      {/* --- Navigation Bar --- */}
      <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <TicketIcon width={32} height={32} color="#3b82f6" />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
                <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span> E<span style={{ color: '#DC2626' }}>x</span>press Support
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Customer Service Ticket Queue</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ThemeSwitcher />
            <button onClick={() => router.push('/cs/dashboard')} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Squares2X2Icon width={16} height={16}/> Dashboard</button>
            <button onClick={handleLogout} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main style={{ width: '100%', minHeight: 'calc(100vh - 90px)', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem', position: 'relative', zIndex: 5 }}>
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Header */}
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0, textShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.5)' : 'none' }}>Create New Ticket</h2>
              <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0', fontSize: '1rem' }}>Manually create a support ticket for customer assistance.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={clearDraft} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600', color: currentThemeStyles.textPrimary, backgroundColor: currentThemeStyles.glassPanelBg, border: currentThemeStyles.glassPanelBorder, borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrashIcon width={20} height={20}/> Clear Draft</button>
            </div>
          </header>

          {/* Error Display */}
          {error && (
            <div style={{ backgroundColor: 'rgba(254, 226, 226, 0.8)', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem', color: '#b91c1c', backdropFilter: 'blur(5px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ExclamationTriangleIcon width={20} height={20} /><strong>Error:</strong> {error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Customer Information */}
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><UserCircleIcon width={28} height={28} /> Customer Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>Customer Name / Search</label>
                  <input type="text" value={customerSearch} onChange={(e) => { setCustomerSearch(e.target.value); handleInputChange('customerInfo.name', e.target.value); }} style={{ width: '100%', padding: '0.75rem', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', fontSize: '1rem', color: currentThemeStyles.textPrimary }} placeholder="Search or enter new name" required />
                  {showCustomerDropdown && existingCustomers.length > 0 && (
                    <div style={{ position: 'absolute', zIndex: 10, width: '100%', marginTop: '0.5rem', backgroundColor: currentThemeStyles.glassPanelBg, border: currentThemeStyles.glassPanelBorder, borderRadius: '0.5rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(10px)', overflow: 'hidden' }}>
                      {existingCustomers.map((customer) => (
                        <div key={customer.id} onClick={() => selectCustomer(customer)} style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: `1px solid ${currentThemeStyles.inputBorder}` }} onMouseOver={e => e.currentTarget.style.backgroundColor = currentThemeStyles.tableRowHover} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <div style={{ fontWeight: '600', color: currentThemeStyles.textPrimary }}>{customer.name}</div>
                          <div style={{ fontSize: '0.875rem', color: currentThemeStyles.textMuted }}>{customer.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>Email Address</label>
                  <input type="email" value={formData.customerInfo.email} onChange={(e) => handleInputChange('customerInfo.email', e.target.value)} style={{ width: '100%', padding: '0.75rem', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', fontSize: '1rem', color: currentThemeStyles.textPrimary }} placeholder="customer@example.com" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>Phone (Optional)</label>
                  <input type="tel" value={formData.customerInfo.phone} onChange={(e) => handleInputChange('customerInfo.phone', e.target.value)} style={{ width: '100%', padding: '0.75rem', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', fontSize: '1rem', color: currentThemeStyles.textPrimary }} placeholder="+94701234567" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>Customer ID (Optional)</label>
                  <input type="text" value={formData.customerInfo.customerId} onChange={(e) => handleInputChange('customerInfo.customerId', e.target.value)} style={{ width: '100%', padding: '0.75rem', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', fontSize: '1rem', color: currentThemeStyles.textPrimary }} placeholder="CUST001" />
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><TicketIcon width={28} height={28} /> Ticket Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>Subject</label>
                  <input type="text" value={formData.subject} onChange={(e) => handleInputChange('subject', e.target.value)} style={{ width: '100%', padding: '0.75rem', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', fontSize: '1rem', color: currentThemeStyles.textPrimary }} placeholder="Brief description of the issue" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>Description</label>
                  <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={6} style={{ width: '100%', padding: '0.75rem', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', fontSize: '1rem', color: currentThemeStyles.textPrimary, resize: 'vertical' }} placeholder="Detailed description of the customer's issue..." required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>Category</label>
                    <select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} style={{ width: '100%', padding: '0.75rem', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', fontSize: '1rem', color: currentThemeStyles.textPrimary }} required>
                      <option value="">Select Category</option>
                      {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>Priority</label>
                    <select value={formData.priority} onChange={(e) => handleInputChange('priority', e.target.value as TicketData['priority'])} style={{ width: '100%', padding: '0.75rem', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', fontSize: '1rem', color: currentThemeStyles.textPrimary }}>
                      <option value="low">🟢 Low</option><option value="medium">🟡 Medium</option><option value="high">🔴 High</option><option value="urgent">🚨 Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>Source</label>
                    <select value={formData.source} onChange={(e) => handleInputChange('source', e.target.value as TicketData['source'])} style={{ width: '100%', padding: '0.75rem', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', fontSize: '1rem', color: currentThemeStyles.textPrimary }}>
                      <option value="manual">Manual Entry</option><option value="email">Email</option><option value="phone">Phone</option><option value="chat">Chat</option><option value="web">Web Form</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: currentThemeStyles.textSecondary, marginBottom: '0.5rem' }}>Tags</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} style={{ flex: 1, padding: '0.75rem', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', fontSize: '1rem', color: currentThemeStyles.textPrimary }} placeholder="Add tags..." />
                    <button type="button" onClick={addTag} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600', color: 'white', backgroundColor: '#3b82f6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PlusIcon width={20} height={20}/> Add</button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {formData.tags.map((tag) => (
                        <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', fontSize: '0.875rem', fontWeight: '600', borderRadius: '9999px' }}>
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} style={{ marginLeft: '0.5rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" onClick={() => router.push('/cs/tickets')} disabled={creating} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600', color: currentThemeStyles.textPrimary, backgroundColor: currentThemeStyles.glassPanelBg, border: currentThemeStyles.glassPanelBorder, borderRadius: '0.5rem', cursor: 'pointer', opacity: creating ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowLeftIcon width={20} height={20}/> Back to Queue</button>
              <button type="submit" disabled={creating} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600', color: 'white', backgroundColor: '#16a34a', border: 'none', borderRadius: '0.5rem', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {creating ? <div style={{ width: '20px', height: '20px', border: '2px solid #f3f4f6', borderTop: '2px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : <CheckIcon width={20} height={20}/>}
                {creating ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
