// src/app/sysadmin/users/[id]/edit/page.tsx - REFACTORED VERSION
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  UserIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/sysadmin/components/AnimatedBackground';

// --- Interfaces (Unchanged) ---
interface EditUserForm {
  name: string;
  email: string;
  role: 'client' | 'customer_service' | 'route_admin' | 'company_admin' | 'system_admin';
  phone?: string;
  department?: string;
  company?: string;
  permissions: string[];
  isActive: boolean;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { theme } = useTheme();

  // --- State Management (Unchanged) ---
  const [formData, setFormData] = useState<EditUserForm | null>(null);
  const [originalData, setOriginalData] = useState<EditUserForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- Logic and Handlers (Unchanged) ---
  const getToken = () => localStorage.getItem('token');
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => { const token = getToken(); if (!token) { router.push('/sysadmin/login'); return null; } try { const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers, }, }); if (!response.ok) { if (response.status === 401) { localStorage.removeItem('token'); router.push('/sysadmin/login'); return null; } throw new Error(`API Error: ${response.status}`); } return await response.json(); } catch (error) { console.error('API call error:', error); return null; } }, [router]);
  useEffect(() => { const loadUserData = async () => { setLoading(true); try { const userResponse = await apiCall(`/api/admin/users/${userId}`); if (userResponse) { const userData: EditUserForm = { name: userResponse.name, email: userResponse.email, role: userResponse.role, phone: userResponse.phone || '', department: userResponse.department || '', company: userResponse.company || '', permissions: userResponse.permissions || [], isActive: userResponse.isActive }; setFormData(userData); setOriginalData(userData); } } catch (error) { console.error('Error loading user:', error); setErrors({ submit: 'Failed to load user data' }); } finally { setLoading(false); } }; if (userId) { loadUserData(); } }, [userId, apiCall]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { if (!formData) return; const { name, value, type } = e.target; setFormData(prev => prev ? ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }) : null); if (errors[name]) { setErrors(prev => ({ ...prev, [name]: '' })); } };
  const handlePermissionChange = (permission: string, checked: boolean) => { if (!formData) return; setFormData(prev => prev ? ({ ...prev, permissions: checked ? [...prev.permissions, permission] : prev.permissions.filter(p => p !== permission) }) : null); };
  const validateForm = () => { if (!formData) return false; const newErrors: Record<string, string> = {}; if (!formData.name.trim()) newErrors.name = 'Name is required'; if (!formData.email.trim()) newErrors.email = 'Email is required'; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address'; if (formData.role === 'company_admin' && !formData.company?.trim()) newErrors.company = 'Company name is required for company administrators'; if (formData.role === 'customer_service' && !formData.department?.trim()) newErrors.department = 'Department is required for customer service agents'; setErrors(newErrors); return Object.keys(newErrors).length === 0; };
  const hasChanges = () => { if (!formData || !originalData) return false; return JSON.stringify(formData) !== JSON.stringify(originalData); };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!formData || !validateForm()) return; setSaving(true); try { const response = await apiCall(`/api/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(formData), }); if (response) router.push(`/sysadmin/users/${userId}`); } catch (error) { console.error('Error updating user:', error); setErrors({ submit: error instanceof Error ? error.message : 'Failed to update user' }); } finally { setSaving(false); } };
  const getRoleIcon = (role: string) => { switch (role) { case 'client': return <UserIcon width={20} height={20} />; case 'customer_service': return <ChatBubbleLeftRightIcon width={20} height={20} />; case 'route_admin': return <TruckIcon width={20} height={20} />; case 'company_admin': return <BuildingOfficeIcon width={20} height={20} />; case 'system_admin': return <ShieldCheckIcon width={20} height={20} />; default: return <UserIcon width={20} height={20} />; } };
  const getRoleColor = (role: string) => { switch (role) { case 'client': return '#3b82f6'; case 'customer_service': return '#10b981'; case 'route_admin': return '#f59e0b'; case 'company_admin': return '#8b5cf6'; case 'system_admin': return '#ef4444'; default: return '#6b7280'; } };
  const getRoleDescription = (role: string) => { switch (role) { case 'client': return 'Can register, track buses, and book tickets'; case 'customer_service': return 'Handles customer inquiries and support tickets'; case 'route_admin': return 'Manages routes, schedules, and confirms departures'; case 'company_admin': return 'Manages company fleet and private transport'; case 'system_admin': return 'Full system access and administration'; default: return ''; } };
  const getAvailablePermissions = () => { if (!formData) return []; const basePermissions = ['read_users', 'write_users', 'read_routes', 'write_routes', 'read_vehicles', 'write_vehicles', 'read_analytics', 'write_analytics']; const rolePermissions = { 'client': ['read_routes', 'read_vehicles'], 'customer_service': ['read_users', 'read_routes', 'read_vehicles'], 'route_admin': ['read_routes', 'write_routes', 'read_vehicles', 'write_vehicles'], 'company_admin': ['read_users', 'write_users', 'read_vehicles', 'write_vehicles'], 'system_admin': basePermissions }; return rolePermissions[formData.role as keyof typeof rolePermissions] || []; };

  // --- Theme and Style Definitions ---
  const lightTheme = {
    mainBg: '#fffbeb',
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
    textPrimary: '#1f2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    navBg: 'rgba(255, 255, 255, 0.85)',
    navBorder: '1px solid rgba(251, 191, 36, 0.3)',
    inputBg: '#fefce8',
    inputBorder: '#fde68a',
    inputFocusBorder: '#f59e0b',
    inputErrorBorder: '#ef4444',
    buttonPrimaryBg: '#f59e0b',
    buttonPrimaryText: '#ffffff',
    buttonSecondaryBg: '#d1d5db',
    buttonSecondaryText: '#1f2937',
    errorBg: '#fef2f2',
    errorText: '#991b1b',
    errorBorder: '#ef4444',
  };

  const darkTheme = {
    mainBg: '#0f172a',
    bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    navBg: 'rgba(30, 41, 59, 0.92)',
    navBorder: '1px solid rgba(251, 191, 36, 0.3)',
    inputBg: '#334155',
    inputBorder: '#475569',
    inputFocusBorder: '#f59e0b',
    inputErrorBorder: '#dc2626',
    buttonPrimaryBg: '#f59e0b',
    buttonPrimaryText: '#ffffff',
    buttonSecondaryBg: '#374151',
    buttonSecondaryText: '#f9fafb',
    errorBg: '#991b1b',
    errorText: '#fecaca',
    errorBorder: '#dc2626',
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  if (loading) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading user data...</p>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!formData) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '3rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, textAlign: 'center', color: currentThemeStyles.textPrimary, display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <ExclamationTriangleIcon width={48} height={48} color="#ef4444" />
          <div>User not found or failed to load.</div>
          <Link href="/sysadmin/users" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none' }}>Back to Users</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <nav style={{ 
        backgroundColor: currentThemeStyles.navBg, 
        backdropFilter: 'blur(12px)', 
        borderBottom: currentThemeStyles.navBorder, 
        padding: '1rem 0', 
        position: 'sticky', 
        top: 0, 
        zIndex: 10 
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href={`/sysadmin/users/${userId}`} style={{ color: currentThemeStyles.textSecondary, textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ChevronLeftIcon width={16} height={16} /> Back to User
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PencilIcon width={24} height={24} color="#f59e0b" />
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0 }}>
                  Edit User: {formData.name}
                </h1>
                <p style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary, margin: 0 }}>
                  {formData.email}
                </p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {hasChanges() && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
                <ExclamationTriangleIcon width={16} height={16} />
                <span style={{ fontSize: '0.875rem' }}>Unsaved changes</span>
              </div>
            )}
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '900px', width: '100%' }}>
          <form onSubmit={handleSubmit}>
            {errors.submit && (<div style={{ backgroundColor: currentThemeStyles.errorBg, color: currentThemeStyles.errorText, padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', border: `1px solid ${currentThemeStyles.errorBorder}` }}>{errors.submit}</div>)}

            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', marginBottom: '2rem' }}>
              <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Basic Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${errors.name ? currentThemeStyles.errorBorder : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="Enter full name" />
                  {errors.name && <p style={{ color: currentThemeStyles.errorText, fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.name}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <EnvelopeIcon width={20} height={20} color={currentThemeStyles.textSecondary} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.5rem', border: `1px solid ${errors.email ? currentThemeStyles.errorBorder : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="user@example.com" />
                  </div>
                  {errors.email && <p style={{ color: currentThemeStyles.errorText, fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.email}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <PhoneIcon width={20} height={20} color={currentThemeStyles.textSecondary} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.5rem', border: `1px solid ${currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="+94 77 123 4567" />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', marginBottom: '2rem' }}>
              <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Role & Permissions</h2>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>User Role *</label>
                <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: getRoleColor(formData.role), fontSize: '1rem', boxSizing: 'border-box', outline: 'none', fontWeight: '600' }}>
                  <option value="client">👤 Client</option>
                  <option value="customer_service">💬 Customer Service</option>
                  <option value="route_admin">🚌 Route Administrator</option>
                  <option value="company_admin">🏢 Company Administrator</option>
                  <option value="system_admin">🔧 System Administrator</option>
                </select>
                <div style={{ backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: getRoleColor(formData.role) }}>{getRoleIcon(formData.role)}</span>
                  <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>{getRoleDescription(formData.role)}</span>
                </div>
              </div>
              {formData.role === 'customer_service' && (<div style={{ marginBottom: '1.5rem' }}><label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Department *</label><input type="text" name="department" value={formData.department} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${errors.department ? currentThemeStyles.errorBorder : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="e.g., Customer Support" />{errors.department && <p style={{ color: currentThemeStyles.errorText, fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.department}</p>}</div>)}
              {formData.role === 'company_admin' && (<div style={{ marginBottom: '1.5rem' }}><label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Company Name *</label><div style={{ position: 'relative' }}><BuildingOfficeIcon width={20} height={20} color={currentThemeStyles.textSecondary} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} /><input type="text" name="company" value={formData.company} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.5rem', border: `1px solid ${errors.company ? currentThemeStyles.errorBorder : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="e.g., ABC Transport Company" /></div>{errors.company && <p style={{ color: currentThemeStyles.errorText, fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.company}</p>}</div>)}
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Permissions</label>
                <div style={{ backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {getAvailablePermissions().map((permission) => (<label key={permission} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentThemeStyles.textPrimary, fontSize: '0.875rem', cursor: 'pointer' }}><input type="checkbox" checked={formData.permissions.includes(permission)} onChange={(e) => handlePermissionChange(permission, e.target.checked)} style={{ accentColor: '#3b82f6' }} />{permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>))}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', marginBottom: '2rem' }}>
              <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Account Settings</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentThemeStyles.textPrimary, cursor: 'pointer' }}>
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ accentColor: '#3b82f6' }} />
                  <div><div style={{ fontWeight: '500' }}>Active Account</div><div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>User can login and access the system</div></div>
                </label>
                {!formData.isActive && (<div style={{ backgroundColor: currentThemeStyles.errorBg, padding: '1rem', borderRadius: '0.5rem', border: `1px solid ${currentThemeStyles.errorBorder}` }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentThemeStyles.errorText }}><ExclamationTriangleIcon width={16} height={16} /><span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Account Deactivated</span></div><p style={{ color: currentThemeStyles.errorText, fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>This user will not be able to login or access any system features until reactivated.</p></div>)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Link href={`/sysadmin/users/${userId}`} style={{ backgroundColor: currentThemeStyles.buttonSecondaryBg, color: currentThemeStyles.buttonSecondaryText, padding: '0.875rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500' }}>Cancel</Link>
              <button type="submit" disabled={saving || !hasChanges()} style={{ backgroundColor: hasChanges() ? currentThemeStyles.buttonPrimaryBg : currentThemeStyles.textMuted, color: currentThemeStyles.buttonPrimaryText, padding: '0.875rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: '500', cursor: hasChanges() ? 'pointer' : 'not-allowed', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{saving ? 'Saving Changes...' : 'Save Changes'}{hasChanges() && <CheckCircleIcon width={20} height={20} />}</button>
            </div>

            {formData.role === 'system_admin' && (
              <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', border: '1px solid #ef4444', marginTop: '2rem', backdropFilter: 'blur(12px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><ExclamationTriangleIcon width={20} height={20} color="#ef4444" /><h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1rem', fontWeight: '600', margin: 0 }}>System Administrator Role</h3></div>
                <p style={{ color: currentThemeStyles.textSecondary, margin: 0, lineHeight: '1.5' }}>
                  You are editing a system administrator account. This role has full access to all system functions and should only be assigned to trusted personnel. Changes to system administrator accounts are logged and monitored.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
