// src/app/sysadmin/users/page.tsx - REFACTORED VERSION
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UsersIcon, PlusIcon, MagnifyingGlassIcon, UserIcon, ShieldCheckIcon as ShieldCheckIconOutline, PhoneIcon, ChatBubbleLeftRightIcon, BuildingOfficeIcon, PencilIcon, TrashIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/sysadmin/components/AnimatedBackground'; // IMPORT THE NEW COMPONENT

// --- Interfaces (Unchanged) ---
interface User { _id: string; name: string; email: string; role: 'client' | 'customer_service' | 'route_admin' | 'company_admin' | 'system_admin'; phone?: string; department?: string; company?: string; isActive: boolean; createdAt: string; lastLogin?: string; permissions?: string[]; }
interface UserStats { totalUsers: number; activeUsers: number; inactiveUsers: number; recentRegistrations: number; byRole: Record<string, number>; }

export default function SystemAdminUsersPage() {
  const router = useRouter();
  const { theme } = useTheme();

  // --- State Management (Unchanged) ---
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleting, setDeleting] = useState(false);

  // --- Logic and Handlers (Unchanged) ---
  const getToken = () => localStorage.getItem('token');
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => { const token = getToken(); if (!token) { router.push('/sysadmin/login'); return null; } try { const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers, }, }); if (!response.ok) { if (response.status === 401) { localStorage.removeItem('token'); router.push('/sysadmin/login'); return null; } throw new Error(`API Error: ${response.status}`); } return await response.json(); } catch (error) { console.error('API call error:', error); return null; } }, [router]);
  const loadUsers = useCallback(async (page = 1, search = '', role = 'all', status = 'all') => { setLoading(true); try { const params = new URLSearchParams({ page: page.toString(), limit: '10', sortBy: 'createdAt', sortOrder: 'desc' }); if (search) params.append('search', search); if (role !== 'all') params.append('role', role); if (status !== 'all') params.append('isActive', status === 'active' ? 'true' : 'false'); const usersResponse = await apiCall(`/api/admin/users?${params.toString()}`); const statsResponse = await apiCall('/api/admin/users/stats'); if (usersResponse && statsResponse) { setUsers(usersResponse.users || []); setPagination(usersResponse.pagination || { currentPage: 1, totalPages: 1, totalUsers: 0, hasNext: false, hasPrev: false }); setStats(statsResponse); } } catch (error) { console.error('Error loading users:', error); alert('Failed to load users. Please try again.'); } finally { setLoading(false); } }, [apiCall]);
  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { const timeoutId = setTimeout(() => { loadUsers(1, searchTerm, filterRole, filterStatus); setCurrentPage(1); }, 500); return () => clearTimeout(timeoutId); }, [searchTerm, filterRole, filterStatus, loadUsers]);
  const handlePageChange = (page: number) => { setCurrentPage(page); loadUsers(page, searchTerm, filterRole, filterStatus); };
  const handleDeleteUser = async (userId: string) => { if (!userId) return; setDeleting(true); try { const response = await apiCall(`/api/admin/users/${userId}`, { method: 'DELETE' }); if (response) { await loadUsers(currentPage, searchTerm, filterRole, filterStatus); setShowDeleteModal(false); setUserToDelete(null); alert('User deleted successfully'); } else { alert('Failed to delete user'); } } catch (error) { console.error('Error deleting user:', error); alert('Failed to delete user'); } finally { setDeleting(false); } };
  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => { try { const response = await apiCall(`/api/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify({ isActive: !currentStatus }) }); if (response) { await loadUsers(currentPage, searchTerm, filterRole, filterStatus); alert(`User status updated successfully`); } else { alert('Failed to update user status'); } } catch (error) { console.error('Error toggling user status:', error); alert('Failed to update user status'); } };
  const handleBulkAction = async (action: string) => { if (selectedUsers.length === 0) { alert('Please select users first'); return; } try { if (action === 'delete') { const confirmed = confirm(`Are you sure you want to delete ${selectedUsers.length} users?`); if (confirmed) { for (const userId of selectedUsers) { await apiCall(`/api/admin/users/${userId}`, { method: 'DELETE' }); } setSelectedUsers([]); await loadUsers(currentPage, searchTerm, filterRole, filterStatus); alert('Users deleted successfully'); } } else if (action === 'activate' || action === 'deactivate') { for (const userId of selectedUsers) { await apiCall(`/api/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify({ isActive: action === 'activate' }) }); } setSelectedUsers([]); await loadUsers(currentPage, searchTerm, filterRole, filterStatus); alert(`Users ${action}d successfully`); } } catch (error) { console.error('Bulk action error:', error); alert('Failed to perform bulk action'); } };
  const getRoleIcon = (role: string) => { switch (role) { case 'client': return <UserIcon width={20} height={20} />; case 'customer_service': return <ChatBubbleLeftRightIcon width={20} height={20} />; case 'route_admin': return <PhoneIcon width={20} height={20} />; case 'company_admin': return <BuildingOfficeIcon width={20} height={20} />; case 'system_admin': return <ShieldCheckIconOutline width={20} height={20} />; default: return <UserIcon width={20} height={20} />; } };
  const getRoleColor = (role: string) => { switch (role) { case 'client': return '#3b82f6'; case 'customer_service': return '#10b981'; case 'route_admin': return '#f59e0b'; case 'company_admin': return '#8b5cf6'; case 'system_admin': return '#ef4444'; default: return '#6b7280'; } };
  const getRoleLabel = (role: string) => { switch (role) { case 'client': return 'Client'; case 'customer_service': return 'Customer Service'; case 'route_admin': return 'Route Admin'; case 'company_admin': return 'Company Admin'; case 'system_admin': return 'System Admin'; default: return 'Unknown'; } };
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString();
  const handleSelectUser = (userId: string) => { setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]); };
  const handleSelectAll = () => { if (selectedUsers.length === users.length) { setSelectedUsers([]); } else { setSelectedUsers(users.map(user => user._id)); } };

  // --- Theme and Style Definitions ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', inputBg: 'rgba(249, 250, 251, 0.8)', inputBorder: '1px solid rgba(209, 213, 219, 0.5)', tableHeaderBg: 'rgba(249, 250, 251, 0.6)', tableRowHover: 'rgba(249, 250, 251, 0.9)', quickActionBg: 'rgba(249, 250, 251, 0.8)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', inputBg: 'rgba(51, 65, 85, 0.8)', inputBorder: '1px solid rgba(75, 85, 99, 0.5)', tableHeaderBg: 'rgba(51, 65, 85, 0.9)', tableRowHover: 'rgba(51, 65, 85, 0.9)', quickActionBg: 'rgba(51, 65, 85, 0.8)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  const animationStyles = `
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `;

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: currentThemeStyles.textPrimary, position: 'relative', zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowPathIcon width={24} height={24} className="animate-spin" />Loading users...
          </div>
        </div>
      ) : (
        <>
          <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.75rem, 2vw, 1.5rem)', minWidth: '200px' }}>
                <Link href="/sysadmin/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ChevronLeftIcon width={16} height={16} /> <span className="hidden sm:inline">Dashboard</span></Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UsersIcon width={24} height={24} color="#3b82f6" style={{ minWidth: '20px', width: 'clamp(20px, 4vw, 24px)', height: 'clamp(20px, 4vw, 24px)' }} /><h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>User Management</h1></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)', flexWrap: 'wrap' }}>
                <ThemeSwitcher />
                <Link href="/sysadmin/users/create" style={{ backgroundColor: '#3b82f6', color: 'white', padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)', borderRadius: '0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}><PlusIcon width={20} height={20} style={{ minWidth: '16px', width: 'clamp(16px, 3vw, 20px)', height: 'clamp(16px, 3vw, 20px)' }} /><span className="hidden sm:inline">Create User</span><span className="sm:hidden">+</span></Link>
              </div>
            </div>
          </nav>

          <div style={{ maxWidth: '1600px', margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 2.5vw, 1.5rem)', position: 'relative', zIndex: 10 }}>
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: 'clamp(1rem, 3vw, 1.5rem)', marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
                <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}><h3 style={{ color: '#3b82f6', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 'bold', margin: 0 }}>{stats.totalUsers.toLocaleString()}</h3><p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>Total Users</p></div>
                <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}><h3 style={{ color: '#10b981', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 'bold', margin: 0 }}>{stats.activeUsers.toLocaleString()}</h3><p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>Active Users</p></div>
                <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}><h3 style={{ color: '#f59e0b', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 'bold', margin: 0 }}>{(stats.byRole?.client || 0).toLocaleString()}</h3><p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>Clients</p></div>
                <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}><h3 style={{ color: '#8b5cf6', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 'bold', margin: 0 }}>{stats.recentRegistrations.toLocaleString()}</h3><p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>Recent (30 days)</p></div>
              </div>
            )}

            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(0.75rem, 2vw, 1rem)', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ position: 'relative', flex: '1 1 250px', minWidth: '200px' }}><MagnifyingGlassIcon width={20} height={20} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: 'clamp(16px, 3vw, 20px)', height: 'clamp(16px, 3vw, 20px)' }} /><input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: 'clamp(0.5rem, 2vw, 0.75rem) 1rem clamp(0.5rem, 2vw, 0.75rem) clamp(2.5rem, 6vw, 3rem)', borderRadius: '0.5rem', border: currentThemeStyles.inputBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', boxSizing: 'border-box', outline: 'none' }} /></div>
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)', borderRadius: '0.5rem', border: currentThemeStyles.inputBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', outline: 'none', minWidth: '120px' }}><option value="all">All Roles</option><option value="client">Client</option><option value="customer_service">Customer Service</option><option value="route_admin">Route Admin</option><option value="company_admin">Company Admin</option><option value="system_admin">System Admin</option></select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)', borderRadius: '0.5rem', border: currentThemeStyles.inputBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', outline: 'none', minWidth: '120px' }}><option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
              </div>
              {selectedUsers.length > 0 && (<div style={{ display: 'flex', gap: 'clamp(0.375rem, 1.5vw, 0.5rem)', alignItems: 'center', flexWrap: 'wrap', marginTop: '1rem' }}><span style={{ color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>{selectedUsers.length} selected</span><button onClick={() => handleBulkAction('activate')} style={{ backgroundColor: '#10b981', color: 'white', padding: 'clamp(0.375rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Activate</button><button onClick={() => handleBulkAction('deactivate')} style={{ backgroundColor: '#f59e0b', color: 'white', padding: 'clamp(0.375rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Deactivate</button><button onClick={() => handleBulkAction('delete')} style={{ backgroundColor: '#ef4444', color: 'white', padding: 'clamp(0.375rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Delete</button></div>)}
            </div>

            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: 0, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ backgroundColor: currentThemeStyles.tableHeaderBg, borderBottom: `1px solid ${currentThemeStyles.inputBorder}` }}><th style={{ padding: 'clamp(0.75rem, 2vw, 1rem)', textAlign: 'left', color: currentThemeStyles.textPrimary, fontWeight: '600', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', minWidth: '40px' }}><input type="checkbox" checked={selectedUsers.length === users.length && users.length > 0} onChange={handleSelectAll} style={{ accentColor: '#3b82f6' }} /></th><th style={{ padding: 'clamp(0.75rem, 2vw, 1rem)', textAlign: 'left', color: currentThemeStyles.textPrimary, fontWeight: '600', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', minWidth: '200px' }}>User</th><th style={{ padding: 'clamp(0.75rem, 2vw, 1rem)', textAlign: 'left', color: currentThemeStyles.textPrimary, fontWeight: '600', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', minWidth: '120px' }}>Role</th><th style={{ padding: 'clamp(0.75rem, 2vw, 1rem)', textAlign: 'left', color: currentThemeStyles.textPrimary, fontWeight: '600', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', minWidth: '80px' }}>Status</th><th style={{ padding: 'clamp(0.75rem, 2vw, 1rem)', textAlign: 'left', color: currentThemeStyles.textPrimary, fontWeight: '600', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', minWidth: '100px' }} className="hidden md:table-cell">Created</th><th style={{ padding: 'clamp(0.75rem, 2vw, 1rem)', textAlign: 'left', color: currentThemeStyles.textPrimary, fontWeight: '600', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', minWidth: '150px' }} className="hidden lg:table-cell">Last Login</th><th style={{ padding: 'clamp(0.75rem, 2vw, 1rem)', textAlign: 'left', color: currentThemeStyles.textPrimary, fontWeight: '600', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', minWidth: '100px' }}>Actions</th></tr></thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user._id} style={{ borderBottom: index < users.length - 1 ? `1px solid ${currentThemeStyles.inputBorder}` : 'none', backgroundColor: selectedUsers.includes(user._id) ? 'rgba(59, 130, 246, 0.2)' : 'transparent' }}>
                        <td style={{ padding: 'clamp(0.75rem, 2vw, 1rem)' }}><input type="checkbox" checked={selectedUsers.includes(user._id)} onChange={() => handleSelectUser(user._id)} style={{ accentColor: '#3b82f6' }} /></td>
                        <td style={{ padding: 'clamp(0.75rem, 2vw, 1rem)' }}><div><div style={{ color: currentThemeStyles.textPrimary, fontWeight: '500', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>{user.name}</div><div style={{ color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', wordBreak: 'break-all' }}>{user.email}</div>{user.company && (<div style={{ color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)' }}>{user.company}</div>)}</div></td>
                        <td style={{ padding: 'clamp(0.75rem, 2vw, 1rem)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}><span style={{ color: getRoleColor(user.role) }}>{getRoleIcon(user.role)}</span><span style={{ color: getRoleColor(user.role), fontWeight: '500', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', lineHeight: '1.2' }}>{getRoleLabel(user.role)}</span></div></td>
                        <td style={{ padding: 'clamp(0.75rem, 2vw, 1rem)' }}><button onClick={() => handleToggleUserStatus(user._id, user.isActive)} style={{ backgroundColor: user.isActive ? '#10b981' : '#6b7280', color: 'white', padding: 'clamp(0.25rem, 1vw, 0.25rem) clamp(0.5rem, 2vw, 0.75rem)', borderRadius: '0.25rem', fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)', fontWeight: '500', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>{user.isActive ? 'Active' : 'Inactive'}</button></td>
                        <td style={{ padding: 'clamp(0.75rem, 2vw, 1rem)', color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', whiteSpace: 'nowrap' }} className="hidden md:table-cell">{formatDate(user.createdAt)}</td>
                        <td style={{ padding: 'clamp(0.75rem, 2vw, 1rem)', color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', whiteSpace: 'nowrap' }} className="hidden lg:table-cell">{user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}</td>
                        <td style={{ padding: 'clamp(0.75rem, 2vw, 1rem)' }}><div style={{ display: 'flex', gap: 'clamp(0.25rem, 1vw, 0.5rem)', flexWrap: 'wrap' }}><Link href={`/sysadmin/users/${user._id}`} style={{ color: '#3b82f6', textDecoration: 'none', padding: '0.25rem', display: 'flex', alignItems: 'center' }}><EyeIcon width={16} height={16} style={{ minWidth: '14px', width: 'clamp(14px, 3vw, 16px)', height: 'clamp(14px, 3vw, 16px)' }} /></Link><Link href={`/sysadmin/users/${user._id}/edit`} style={{ color: '#f59e0b', textDecoration: 'none', padding: '0.25rem', display: 'flex', alignItems: 'center' }}><PencilIcon width={16} height={16} style={{ minWidth: '14px', width: 'clamp(14px, 3vw, 16px)', height: 'clamp(14px, 3vw, 16px)' }} /></Link><button onClick={() => { setUserToDelete(user._id); setShowDeleteModal(true); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}><TrashIcon width={16} height={16} style={{ minWidth: '14px', width: 'clamp(14px, 3vw, 16px)', height: 'clamp(14px, 3vw, 16px)' }} /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'clamp(1.5rem, 3vw, 2rem)', color: currentThemeStyles.textSecondary, flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Showing {users.length} of {pagination.totalUsers} users (Page {pagination.currentPage} of {pagination.totalPages})</div>
              <div style={{ display: 'flex', gap: 'clamp(0.375rem, 1.5vw, 0.5rem)', alignItems: 'center' }}>
                <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrev} style={{ backgroundColor: pagination.hasPrev ? currentThemeStyles.inputBg : currentThemeStyles.quickActionBg, color: pagination.hasPrev ? currentThemeStyles.textPrimary : currentThemeStyles.textMuted, padding: 'clamp(0.375rem, 1.5vw, 0.5rem)', border: currentThemeStyles.inputBorder, borderRadius: '0.375rem', cursor: pagination.hasPrev ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center' }}><ChevronLeftIcon width={16} height={16} style={{ width: 'clamp(14px, 3vw, 16px)', height: 'clamp(14px, 3vw, 16px)' }} /></button>
                <span style={{ padding: 'clamp(0.375rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)', backgroundColor: currentThemeStyles.inputBg, borderRadius: '0.375rem', color: currentThemeStyles.textPrimary, fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>{pagination.currentPage}</span>
                <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNext} style={{ backgroundColor: pagination.hasNext ? currentThemeStyles.inputBg : currentThemeStyles.quickActionBg, color: pagination.hasNext ? currentThemeStyles.textPrimary : currentThemeStyles.textMuted, padding: 'clamp(0.375rem, 1.5vw, 0.5rem)', border: currentThemeStyles.inputBorder, borderRadius: '0.375rem', cursor: pagination.hasNext ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center' }}><ChevronRightIcon width={16} height={16} style={{ width: 'clamp(14px, 3vw, 16px)', height: 'clamp(14px, 3vw, 16px)' }} /></button>
              </div>
            </div>
          </div>
        </>
      )}

      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, maxWidth: '400px', width: '90%', margin: '1rem' }}>
            <h3 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem', fontSize: 'clamp(1.125rem, 3vw, 1.25rem)' }}>Confirm Deletion</h3>
            <p style={{ color: currentThemeStyles.textSecondary, marginBottom: 'clamp(1.5rem, 3vw, 2rem)', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', lineHeight: '1.5' }}>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 'clamp(0.75rem, 2vw, 1rem)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button onClick={() => setShowDeleteModal(false)} disabled={deleting} style={{ backgroundColor: currentThemeStyles.quickActionBg, color: currentThemeStyles.textPrimary, padding: 'clamp(0.5rem, 2vw, 0.5rem) clamp(1rem, 3vw, 1rem)', border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1, fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>Cancel</button>
              <button onClick={() => userToDelete && handleDeleteUser(userToDelete)} disabled={deleting} style={{ backgroundColor: '#ef4444', color: 'white', padding: 'clamp(0.5rem, 2vw, 0.5rem) clamp(1rem, 3vw, 1rem)', border: 'none', borderRadius: '0.5rem', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>{deleting && <ArrowPathIcon width={16} height={16} className="animate-spin" style={{ width: 'clamp(14px, 3vw, 16px)', height: 'clamp(14px, 3vw, 16px)' }} />}{deleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
