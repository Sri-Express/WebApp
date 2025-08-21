// src/app/sysadmin/users/create/page.tsx - REFACTORED VERSION
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UserPlusIcon, EyeIcon, EyeSlashIcon, UserIcon, ShieldCheckIcon, PhoneIcon,
  ChatBubbleLeftRightIcon, BuildingOfficeIcon, EnvelopeIcon, KeyIcon, ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/sysadmin/components/AnimatedBackground';

// --- Interfaces (Unchanged) ---
interface CreateUserForm {
  name: string; email: string; password: string; confirmPassword: string;
  role: 'client' | 'customer_service' | 'route_admin' | 'company_admin' | 'system_admin';
  phone?: string; department?: string; company?: string; permissions: string[];
  isActive: boolean; sendWelcomeEmail: boolean;
}

export default function CreateUserPage() {
  const router = useRouter();
  const { theme } = useTheme();
  
  // --- State Management (Unchanged) ---
  const [formData, setFormData] = useState<CreateUserForm>({ name: '', email: '', password: '', confirmPassword: '', role: 'client', phone: '', department: '', company: '', permissions: [], isActive: true, sendWelcomeEmail: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Logic and Handlers (Unchanged) ---
  const getToken = () => localStorage.getItem('token');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { const { name, value, type } = e.target; if (type === 'checkbox') { const checked = (e.target as HTMLInputElement).checked; setFormData(prev => ({ ...prev, [name]: checked })); } else { setFormData(prev => ({ ...prev, [name]: value })); } if (errors[name]) { setErrors(prev => ({ ...prev, [name]: '' })); } };
  const handlePermissionChange = (permission: string, checked: boolean) => { setFormData(prev => ({ ...prev, permissions: checked ? [...prev.permissions, permission] : prev.permissions.filter(p => p !== permission) })); };
  const validateForm = () => { const newErrors: Record<string, string> = {}; if (!formData.name.trim()) newErrors.name = 'Name is required'; if (!formData.email.trim()) newErrors.email = 'Email is required'; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address'; if (!formData.password) newErrors.password = 'Password is required'; else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'; if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm the password'; else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'; if (formData.role === 'company_admin' && !formData.company?.trim()) newErrors.company = 'Company name is required for company administrators'; if (formData.role === 'customer_service' && !formData.department?.trim()) newErrors.department = 'Department is required for customer service agents'; setErrors(newErrors); return Object.keys(newErrors).length === 0; };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!validateForm()) return; setLoading(true); try { const token = getToken(); if (!token) { router.push('/sysadmin/login'); return; } const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ ...formData }) }); if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to create user'); } router.push('/sysadmin/users'); } catch (error) { console.error('Error creating user:', error); setErrors({ submit: error instanceof Error ? error.message : 'Failed to create user' }); } finally { setLoading(false); } };
  const getRoleIcon = (role: string) => { switch (role) { case 'client': return <UserIcon width={20} height={20} />; case 'customer_service': return <ChatBubbleLeftRightIcon width={20} height={20} />; case 'route_admin': return <PhoneIcon width={20} height={20} />; case 'company_admin': return <BuildingOfficeIcon width={20} height={20} />; case 'system_admin': return <ShieldCheckIcon width={20} height={20} />; default: return <UserIcon width={20} height={20} />; } };
  const getRoleDescription = (role: string) => { switch (role) { case 'client': return 'Can register, track buses, and book tickets'; case 'customer_service': return 'Handles customer inquiries and support tickets'; case 'route_admin': return 'Manages routes, schedules, and confirms departures'; case 'company_admin': return 'Manages company fleet and private transport'; case 'system_admin': return 'Full system access and administration'; default: return ''; } };
  const getAvailablePermissions = () => { const basePermissions = ['read_users', 'write_users', 'read_routes', 'write_routes', 'read_vehicles', 'write_vehicles', 'read_analytics', 'write_analytics']; const rolePermissions = { 'client': ['read_routes', 'read_vehicles'], 'customer_service': ['read_users', 'read_routes', 'read_vehicles'], 'route_admin': ['read_routes', 'write_routes', 'read_vehicles', 'write_vehicles'], 'company_admin': ['read_users', 'write_users', 'read_vehicles', 'write_vehicles'], 'system_admin': basePermissions }; return rolePermissions[formData.role as keyof typeof rolePermissions] || []; };

  // --- Theme and Style Definitions ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', inputBg: 'rgba(249, 250, 251, 0.8)', inputBorder: '1px solid rgba(209, 213, 219, 0.5)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', inputBg: 'rgba(51, 65, 85, 0.8)', inputBorder: '1px solid rgba(75, 85, 99, 0.5)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/sysadmin/users" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ChevronLeftIcon width={16} height={16} /> Back to Users</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserPlusIcon width={24} height={24} color="#3b82f6" /><h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>Create New User</h1></div>
          </div>
          <ThemeSwitcher />
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 10 }}>
        <form onSubmit={handleSubmit}>
          {errors.submit && (<div style={{ backgroundColor: '#991b1b', color: '#fecaca', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid #dc2626' }}>{errors.submit}</div>)}
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '0.75rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', marginBottom: '2rem' }}>
            <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Basic Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textSecondary, fontWeight: '600', marginBottom: '0.5rem' }}>Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${errors.name ? '#dc2626' : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="Enter full name" />
                {errors.name && (<p style={{ color: '#fecaca', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.name}</p>)}
              </div>
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textSecondary, fontWeight: '600', marginBottom: '0.5rem' }}>Email Address *</label>
                <div style={{ position: 'relative' }}><EnvelopeIcon width={20} height={20} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} /><input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.5rem', border: `1px solid ${errors.email ? '#dc2626' : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="user@example.com" /></div>
                {errors.email && (<p style={{ color: '#fecaca', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.email}</p>)}
              </div>
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textSecondary, fontWeight: '600', marginBottom: '0.5rem' }}>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="+94 77 123 4567" />
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '0.75rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', marginBottom: '2rem' }}>
            <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Password</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textSecondary, fontWeight: '600', marginBottom: '0.5rem' }}>Password *</label>
                <div style={{ position: 'relative' }}><KeyIcon width={20} height={20} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} /><input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 3rem 0.875rem 3rem', borderRadius: '0.5rem', border: `1px solid ${errors.password ? '#dc2626' : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="••••••••" /><button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>{showPassword ? <EyeSlashIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}</button></div>
                {errors.password && (<p style={{ color: '#fecaca', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.password}</p>)}
              </div>
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textSecondary, fontWeight: '600', marginBottom: '0.5rem' }}>Confirm Password *</label>
                <div style={{ position: 'relative' }}><KeyIcon width={20} height={20} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} /><input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 3rem 0.875rem 3rem', borderRadius: '0.5rem', border: `1px solid ${errors.confirmPassword ? '#dc2626' : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="••••••••" /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>{showConfirmPassword ? <EyeSlashIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}</button></div>
                {errors.confirmPassword && (<p style={{ color: '#fecaca', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.confirmPassword}</p>)}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '0.75rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', marginBottom: '2rem' }}>
            <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Role & Permissions</h2>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', color: currentThemeStyles.textSecondary, fontWeight: '600', marginBottom: '0.5rem' }}>User Role *</label>
              <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }}><option value="client">Client</option><option value="customer_service">Customer Service</option><option value="route_admin">Route Administrator</option><option value="company_admin">Company Administrator</option><option value="system_admin">System Administrator</option></select>
              <div style={{ backgroundColor: currentThemeStyles.inputBg, padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#3b82f6' }}>{getRoleIcon(formData.role)}</span><span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>{getRoleDescription(formData.role)}</span></div>
            </div>
            {formData.role === 'customer_service' && (<div style={{ marginBottom: '1.5rem' }}><label style={{ display: 'block', color: currentThemeStyles.textSecondary, fontWeight: '600', marginBottom: '0.5rem' }}>Department *</label><input type="text" name="department" value={formData.department} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${errors.department ? '#dc2626' : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="e.g., Customer Support" />{errors.department && (<p style={{ color: '#fecaca', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.department}</p>)}</div>)}
            {formData.role === 'company_admin' && (<div style={{ marginBottom: '1.5rem' }}><label style={{ display: 'block', color: currentThemeStyles.textSecondary, fontWeight: '600', marginBottom: '0.5rem' }}>Company Name *</label><input type="text" name="company" value={formData.company} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${errors.company ? '#dc2626' : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="e.g., ABC Transport Company" />{errors.company && (<p style={{ color: '#fecaca', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.company}</p>)}</div>)}
            <div>
              <label style={{ display: 'block', color: currentThemeStyles.textSecondary, fontWeight: '600', marginBottom: '0.5rem' }}>Permissions</label>
              <div style={{ backgroundColor: currentThemeStyles.inputBg, padding: '1rem', borderRadius: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>{getAvailablePermissions().map((permission) => (<label key={permission} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentThemeStyles.textPrimary, fontSize: '0.875rem', cursor: 'pointer' }}><input type="checkbox" checked={formData.permissions.includes(permission)} onChange={(e) => handlePermissionChange(permission, e.target.checked)} style={{ accentColor: '#3b82f6' }} />{permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>))}</div>
            </div>
          </div>

          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '0.75rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', marginBottom: '2rem' }}>
            <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Settings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentThemeStyles.textPrimary, cursor: 'pointer' }}><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ accentColor: '#3b82f6' }} />Active user (can login immediately)</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentThemeStyles.textPrimary, cursor: 'pointer' }}><input type="checkbox" name="sendWelcomeEmail" checked={formData.sendWelcomeEmail} onChange={handleChange} style={{ accentColor: '#3b82f6' }} />Send welcome email with login instructions</label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Link href="/sysadmin/users" style={{ backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, padding: '0.875rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500', border: `1px solid ${currentThemeStyles.inputBorder}` }}>Cancel</Link>
            <button type="submit" disabled={loading} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.875rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: '500', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? 'Creating User...' : 'Create User'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
