// src/app/sysadmin/users/[id]/page.tsx - REFACTORED VERSION
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { UserIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon, ShieldCheckIcon as ShieldCheckIconOutline, CalendarIcon, ClockIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, KeyIcon, ChatBubbleLeftRightIcon, TruckIcon, Cog6ToothIcon, ChartBarIcon, ArrowPathIcon, EyeIcon, DocumentTextIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/sysadmin/components/AnimatedBackground';

// --- Interfaces (Unchanged) ---
interface User { _id: string; name: string; email: string; role: 'client' | 'customer_service' | 'route_admin' | 'company_admin' | 'system_admin'; phone?: string; department?: string; company?: string; permissions?: string[]; isActive: boolean; lastLogin?: string; createdAt: string; updatedAt: string; }
interface UserStatistics { userId: string; role: string; accountCreated: string; lastLogin?: string; isActive: boolean; totalLogins: number; totalActivities: number; recentActivities: number; lastActiveDate: string; averageSessionsPerDay: number; activityByCategory: Record<string, number>; tripsBooked?: number; completedTrips?: number; devicesManaged?: number; onlineDevices?: number; ticketsHandled?: number; usersManaged?: number; failedLoginAttempts: number; trends: { loginTrend: number; activityTrend: number; }; }
interface UserActivity { id: string; action: string; description: string; category: string; severity: string; timestamp: string; ipAddress?: string; userAgent?: string; metadata?: Record<string, unknown>; }
interface ActivityResponse { activities: UserActivity[]; pagination: { currentPage: number; totalPages: number; totalActivities: number; hasNext: boolean; hasPrev: boolean; }; summary: { totalActivities: number; categorySummary: Record<string, unknown>; availableActions: string[]; availableCategories: string[]; }; }

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();

  // --- State Management (Unchanged) ---
  const [userId, setUserId] = useState<string | null>(null);
  const [paramError, setParamError] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [fullActivityData, setFullActivityData] = useState<ActivityResponse | null>(null);
  const [activityPage, setActivityPage] = useState(1);
  const [activityCategory, setActivityCategory] = useState('all');
  const [activityAction, setActivityAction] = useState('all');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [fullActivityLoading, setFullActivityLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'details'>('overview');

  // --- Logic and Handlers (Unchanged) ---
  useEffect(() => { if (params && params.id) { const rawId = Array.isArray(params.id) ? params.id[0] : params.id; if (rawId === '[id]' || rawId === '%5Bid%5D') { setParamError('Invalid user ID parameter - received literal [id]'); return; } const objectIdPattern = /^[0-9a-fA-F]{24}$/; if (!objectIdPattern.test(rawId)) { setParamError(`Invalid user ID format: ${rawId}`); return; } setUserId(rawId); setParamError(''); } else { setParamError('No user ID provided in URL'); } }, [params]);
  const getToken = () => localStorage.getItem('token');
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => { const token = getToken(); if (!token) { router.push('/sysadmin/login'); return null; } try { const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers, }, }); if (!response.ok) { if (response.status === 401) { localStorage.removeItem('token'); router.push('/sysadmin/login'); return null; } let errorMessage = `API Error: ${response.status}`; try { const errorData = await response.json(); errorMessage = errorData.message || errorMessage; } catch { /* empty */ } throw new Error(errorMessage); } return await response.json(); } catch (error) { console.error('API call error:', error); return null; } }, [router]);
  useEffect(() => { if (!userId) return; const loadUserData = async () => { setLoading(true); setError(''); try { const userResponse = await apiCall(`/api/admin/users/${userId}`); if (userResponse) { setUser(userResponse); } else { setError('User not found or failed to load'); } } catch { setError('Failed to load user details'); } finally { setLoading(false); } }; loadUserData(); }, [userId, apiCall]);
  useEffect(() => { if (!userId) return; const loadUserStats = async () => { setStatsLoading(true); try { const statsResponse = await apiCall(`/api/admin/users/${userId}/stats`); if (statsResponse) { setUserStats(statsResponse); } } catch { /* empty */ } finally { setStatsLoading(false); } }; loadUserStats(); }, [userId, apiCall]);
  useEffect(() => { if (!userId) return; const loadUserActivity = async () => { setActivityLoading(true); try { const activityResponse = await apiCall(`/api/admin/users/${userId}/activity?limit=10`); if (activityResponse && activityResponse.activities) { setRecentActivity(activityResponse.activities); } } catch { /* empty */ } finally { setActivityLoading(false); } }; loadUserActivity(); }, [userId, apiCall]);
  const loadFullActivity = useCallback(async (page = 1, category = 'all', action = 'all') => { if (!userId) return; setFullActivityLoading(true); try { const params = new URLSearchParams({ page: page.toString(), limit: '20', category, action }); const activityResponse = await apiCall(`/api/admin/users/${userId}/activity?${params.toString()}`); if (activityResponse) { setFullActivityData(activityResponse); } else { setFullActivityData(null); } } catch { setFullActivityData(null); } finally { setFullActivityLoading(false); } }, [userId, apiCall]);
  useEffect(() => { if (activeTab === 'activity') { loadFullActivity(activityPage, activityCategory, activityAction); } }, [activeTab, activityPage, activityCategory, activityAction, loadFullActivity]);
  const getRoleIcon = (role: string) => { switch (role) { case 'client': return <UserIcon width={20} height={20} />; case 'customer_service': return <ChatBubbleLeftRightIcon width={20} height={20} />; case 'route_admin': return <TruckIcon width={20} height={20} />; case 'company_admin': return <BuildingOfficeIcon width={20} height={20} />; case 'system_admin': return <ShieldCheckIconOutline width={20} height={20} />; default: return <UserIcon width={20} height={20} />; } };
  const getRoleColor = (role: string) => { switch (role) { case 'client': return '#3b82f6'; case 'customer_service': return '#10b981'; case 'route_admin': return '#f59e0b'; case 'company_admin': return '#8b5cf6'; case 'system_admin': return '#ef4444'; default: return '#6b7280'; } };
  const getRoleLabel = (role: string) => { switch (role) { case 'client': return 'Client'; case 'customer_service': return 'Customer Service'; case 'route_admin': return 'Route Administrator'; case 'company_admin': return 'Company Administrator'; case 'system_admin': return 'System Administrator'; default: return 'Unknown'; } };
  const getActionIcon = (action: string) => { switch (action) { case 'login': return <CheckCircleIcon width={16} height={16} color="#10b981" />; case 'logout': return <XCircleIcon width={16} height={16} color="#6b7280" />; case 'profile_update': return <PencilIcon width={16} height={16} color="#3b82f6" />; case 'password_change': return <KeyIcon width={16} height={16} color="#f59e0b" />; case 'trip_booking': return <TruckIcon width={16} height={16} color="#06b6d4" />; case 'ticket_resolved': return <ChatBubbleLeftRightIcon width={16} height={16} color="#10b981" />; case 'device_configured': return <Cog6ToothIcon width={16} height={16} color="#8b5cf6" />; case 'user_created': case 'user_updated': case 'user_deleted': return <UserIcon width={16} height={16} color="#3b82f6" />; case 'device_created': case 'device_updated': case 'device_deleted': return <Cog6ToothIcon width={16} height={16} color="#f59e0b" />; case 'users_list_view': case 'devices_list_view': return <EyeIcon width={16} height={16} color="#94a3b8" />; default: return <ClockIcon width={16} height={16} color="#94a3b8" />; } };
  const getCategoryColor = (category: string) => { switch (category) { case 'auth': return '#3b82f6'; case 'profile': return '#10b981'; case 'device': return '#f59e0b'; case 'trip': return '#06b6d4'; case 'system': return '#ef4444'; default: return '#6b7280'; } };
  const getSeverityColor = (severity: string) => { switch (severity) { case 'critical': return '#ef4444'; case 'high': return '#f59e0b'; case 'medium': return '#3b82f6'; case 'low': return '#10b981'; default: return '#6b7280'; } };
  const handleToggleStatus = async () => { if (!user || !userId) return; setActionLoading('toggle'); try { await apiCall(`/api/admin/users/${userId}/toggle-status`, { method: 'PATCH' }); setUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null); } catch { /* empty */ } finally { setActionLoading(null); } };
  const handleDeleteUser = async () => { if (!userId) return; setActionLoading('delete'); try { await apiCall(`/api/admin/users/${userId}`, { method: 'DELETE' }); router.push('/sysadmin/users'); } catch { /* empty */ } finally { setActionLoading(null); setShowDeleteModal(false); } };
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString();
  const getTimeSince = (dateString: string) => { const now = new Date(); const past = new Date(dateString); const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60)); if (diffInMinutes < 1) return 'Just now'; if (diffInMinutes < 60) return `${diffInMinutes}m ago`; if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`; return `${Math.floor(diffInMinutes / 1440)}d ago`; };
  const getTrendIcon = (trend: number) => { if (trend > 0) return '↗️'; if (trend < 0) return '↘️'; return '➡️'; };
  const getTrendColor = (trend: number) => { if (trend > 0) return '#10b981'; if (trend < 0) return '#ef4444'; return '#6b7280'; };

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
    inputBg: 'rgba(249, 250, 251, 0.8)', 
    inputBorder: '1px solid rgba(209, 213, 219, 0.5)', 
    tableHeaderBg: 'rgba(249, 250, 251, 0.6)', 
    tableRowHover: 'rgba(249, 250, 251, 0.9)', 
    quickActionBg: 'rgba(249, 250, 251, 0.8)',
    navBg: 'rgba(249, 250, 251, 0.92)',
    buttonPrimaryBg: '#3b82f6',
    buttonSecondaryBg: '#6b7280',
    errorBorder: '1px solid rgba(239, 68, 68, 0.5)'
  };
  const darkTheme = { 
    mainBg: '#0f172a', 
    bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', 
    glassPanelBg: 'rgba(30, 41, 59, 0.8)', 
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', 
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', 
    textPrimary: '#f9fafb', 
    textSecondary: '#9ca3af', 
    textMuted: '#9ca3af', 
    inputBg: 'rgba(51, 65, 85, 0.8)', 
    inputBorder: '1px solid rgba(75, 85, 99, 0.5)', 
    tableHeaderBg: 'rgba(51, 65, 85, 0.9)', 
    tableRowHover: 'rgba(51, 65, 85, 0.9)', 
    quickActionBg: 'rgba(51, 65, 85, 0.8)',
    navBg: 'rgba(30, 41, 59, 0.92)',
    buttonPrimaryBg: '#3b82f6',
    buttonSecondaryBg: '#374151',
    errorBorder: '1px solid rgba(239, 68, 68, 0.5)'
  };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  const animationStyles = ` @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; } `;

  if (paramError || !userId || error || !user) {
    const message = paramError || error || 'User not found';
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, color: currentThemeStyles.textPrimary, flexDirection: 'column', gap: '1rem' }}>
        <ExclamationTriangleIcon width={48} height={48} color="#ef4444" />
        <div style={{ textAlign: 'center' }}><h2 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Error Loading User</h2><p>{message}</p></div>
        <Link href="/sysadmin/users" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none' }}>Back to Users</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, color: currentThemeStyles.textPrimary }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowPathIcon width={24} height={24} className="animate-spin" />Loading user details...</div>
        <style jsx>{animationStyles}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, position: 'relative', overflow: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <nav style={{ backgroundColor: currentThemeStyles.navBg, backdropFilter: 'blur(12px)', borderBottom: currentThemeStyles.glassPanelBorder, padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link href="/sysadmin/users" style={{ color: currentThemeStyles.textSecondary, textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ChevronLeftIcon width={16} height={16} /> Back to Users</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: getRoleColor(user.role) }}>{getRoleIcon(user.role)}</span>
              <div><h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0 }}>{user.name}</h1><p style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary, margin: 0 }}>{getRoleLabel(user.role)}</p></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
             <ThemeSwitcher />
            <button onClick={handleToggleStatus} disabled={actionLoading === 'toggle'} style={{ backgroundColor: user.isActive ? '#f59e0b' : '#10b981', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: actionLoading === 'toggle' ? 0.7 : 1 }}>{user.isActive ? <XCircleIcon width={16} height={16} /> : <CheckCircleIcon width={16} height={16} />}{actionLoading === 'toggle' ? 'Updating...' : user.isActive ? 'Deactivate' : 'Activate'}</button>
            <Link href={`/sysadmin/users/${userId}/edit`} style={{ backgroundColor: currentThemeStyles.buttonPrimaryBg, color: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PencilIcon width={16} height={16} />Edit</Link>
            {user.role !== 'system_admin' && (<button onClick={() => setShowDeleteModal(true)} style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrashIcon width={16} height={16} />Delete</button>)}
          </div>
        </div>
      </nav>

      <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${currentThemeStyles.inputBorder}`, position: 'sticky', top: 0, zIndex: 9 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: '2rem' }}>
          {[ { id: 'overview', label: 'Overview', icon: <EyeIcon width={16} height={16} /> }, { id: 'activity', label: 'Activity', icon: <ClockIcon width={16} height={16} /> }, { id: 'details', label: 'Details', icon: <DocumentTextIcon width={16} height={16} /> } ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as 'overview' | 'activity' | 'details')} style={{ backgroundColor: 'transparent', border: 'none', padding: '1rem 0', color: activeTab === tab.id ? '#3b82f6' : currentThemeStyles.textSecondary, borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>{tab.icon}{tab.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 5 }}>
        <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, border: `1px solid ${user.isActive ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`, marginBottom: '2rem', padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: user.isActive ? '#10b981' : '#ef4444' }}>{user.isActive ? <CheckCircleIcon width={32} height={32} /> : <XCircleIcon width={32} height={32} />}</span>
            <div style={{ flex: 1 }}><h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Account Status: {user.isActive ? 'Active' : 'Inactive'}</h2><p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0' }}>{user.isActive ? 'User can access the system' : 'User is blocked from accessing the system'}</p></div>
            {userStats && userStats.trends && (<div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><div style={{ textAlign: 'center' }}><div style={{ color: getTrendColor(userStats.trends.loginTrend), fontSize: '1.5rem', fontWeight: 'bold' }}>{getTrendIcon(userStats.trends.loginTrend)} {Math.abs(userStats.trends.loginTrend)}%</div><div style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>Login Trend</div></div><div style={{ textAlign: 'center' }}><div style={{ color: getTrendColor(userStats.trends.activityTrend), fontSize: '1.5rem', fontWeight: 'bold' }}>{getTrendIcon(userStats.trends.activityTrend)} {Math.abs(userStats.trends.activityTrend)}%</div><div style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>Activity Trend</div></div></div>)}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
              <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ChartBarIcon width={20} height={20} />Activity Statistics{statsLoading && <ArrowPathIcon width={16} height={16} className="animate-spin" />}</h2>
              {statsLoading ? (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: currentThemeStyles.textSecondary }}>Loading statistics...</div>) : userStats ? (<><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}><div style={{ backgroundColor: currentThemeStyles.inputBg, padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}><div style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{userStats.totalLogins.toLocaleString()}</div><div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Total Logins</div></div><div style={{ backgroundColor: currentThemeStyles.inputBg, padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}><div style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{userStats.totalActivities.toLocaleString()}</div><div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Total Activities</div></div>{userStats.devicesManaged && (<div style={{ backgroundColor: currentThemeStyles.inputBg, padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}><div style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{userStats.devicesManaged}</div><div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Devices Managed</div></div>)}{userStats.tripsBooked && (<div style={{ backgroundColor: currentThemeStyles.inputBg, padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}><div style={{ color: '#06b6d4', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{userStats.tripsBooked}</div><div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Trips Booked</div></div>)}{userStats.ticketsHandled && (<div style={{ backgroundColor: currentThemeStyles.inputBg, padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}><div style={{ color: '#8b5cf6', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{userStats.ticketsHandled}</div><div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Tickets Handled</div></div>)}<div style={{ backgroundColor: currentThemeStyles.inputBg, padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}><div style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{userStats.failedLoginAttempts}</div><div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Failed Logins</div></div></div><div style={{ backgroundColor: currentThemeStyles.inputBg, padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Last Activity</span><span style={{ color: currentThemeStyles.textPrimary, fontWeight: '500' }}>{getTimeSince(userStats.lastActiveDate)}</span></div></div></>) : (<div style={{ color: currentThemeStyles.textSecondary, textAlign: 'center' }}>Failed to load statistics</div>)}
            </div>
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
              <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ClockIcon width={20} height={20} />Recent Activity{activityLoading && <ArrowPathIcon width={16} height={16} className="animate-spin" />}</h2>
              {activityLoading ? (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: currentThemeStyles.textSecondary }}>Loading activity...</div>) : recentActivity.length > 0 ? (<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>{recentActivity.map((activity) => (<div key={activity.id} style={{ backgroundColor: currentThemeStyles.inputBg, padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>{getActionIcon(activity.action)}<div style={{ flex: 1 }}><div style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>{activity.description}</div><div style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>{getTimeSince(activity.timestamp)}{activity.ipAddress && ` • ${activity.ipAddress}`}</div></div><div style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', color: currentThemeStyles.textSecondary }}>{activity.category}</div></div>))}</div>) : (<div style={{ color: currentThemeStyles.textSecondary, textAlign: 'center' }}>No recent activity found</div>)}
              <div style={{ marginTop: '1rem' }}><button onClick={() => setActiveTab('activity')} style={{ color: '#3b82f6', backgroundColor: 'transparent', border: 'none', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}>View Full Activity Log →</button></div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: 0, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: `1px solid ${currentThemeStyles.inputBorder}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ClockIcon width={20} height={20} />Complete Activity Log{fullActivityLoading && <ArrowPathIcon width={16} height={16} className="animate-spin" />}</h2>
                {fullActivityData && (<div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>{fullActivityData.pagination.totalActivities} total activities</div>)}
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FunnelIcon width={16} height={16} color={currentThemeStyles.textSecondary} /><span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Filter:</span></div>
                <select value={activityCategory} onChange={(e) => { setActivityCategory(e.target.value); setActivityPage(1); }} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: `1px solid ${currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '0.875rem', outline: 'none' }}><option value="all">All Categories</option><option value="auth">Authentication</option><option value="profile">Profile</option><option value="device">Device</option><option value="trip">Trip</option><option value="system">System</option><option value="other">Other</option></select>
                <select value={activityAction} onChange={(e) => { setActivityAction(e.target.value); setActivityPage(1); }} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: `1px solid ${currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '0.875rem', outline: 'none' }}><option value="all">All Actions</option>{fullActivityData?.summary.availableActions.map((action) => (<option key={action} value={action}>{action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>))}</select>
                <button onClick={() => { setActivityCategory('all'); setActivityAction('all'); setActivityPage(1); }} style={{ backgroundColor: currentThemeStyles.quickActionBg, color: currentThemeStyles.textPrimary, padding: '0.5rem 0.75rem', border: `1px solid ${currentThemeStyles.inputBorder}`, borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>Clear Filters</button>
              </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {fullActivityLoading ? (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: currentThemeStyles.textSecondary }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowPathIcon width={20} height={20} className="animate-spin" />Loading activity log...</div></div>) : fullActivityData && fullActivityData.activities.length > 0 ? (<><div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>{fullActivityData.activities.map((activity, index) => (<div key={activity.id} style={{ backgroundColor: currentThemeStyles.inputBg, padding: '1.5rem', borderRadius: '0.5rem', border: `1px solid ${currentThemeStyles.inputBorder}`, position: 'relative' }}>{index < fullActivityData.activities.length - 1 && (<div style={{ position: 'absolute', left: '2rem', top: '3.5rem', bottom: '-1rem', width: '2px', backgroundColor: currentThemeStyles.inputBorder }} />)}<div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}><div style={{ backgroundColor: getCategoryColor(activity.category), padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '2.5rem', minHeight: '2.5rem', position: 'relative', zIndex: 1 }}>{getActionIcon(activity.action)}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}><div><h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1rem', fontWeight: '600', margin: 0, marginBottom: '0.25rem' }}>{activity.description}</h3><div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}><span>{formatDateTime(activity.timestamp)}</span><span>•</span><span>{getTimeSince(activity.timestamp)}</span>{activity.ipAddress && (<><span>•</span><span>{activity.ipAddress}</span></>)}</div></div><div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><span style={{ backgroundColor: getCategoryColor(activity.category), color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '500' }}>{activity.category}</span><span style={{ backgroundColor: getSeverityColor(activity.severity), color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '500' }}>{activity.severity}</span></div></div>{(activity.userAgent || activity.metadata) && (<div style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: '0.75rem', borderRadius: '0.375rem', marginTop: '0.75rem' }}>{activity.userAgent && (<div style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem', marginBottom: '0.25rem' }}><strong>User Agent:</strong> {activity.userAgent.length > 80 ? `${activity.userAgent.substring(0, 80)}...` : activity.userAgent}</div>)}{activity.metadata && Object.keys(activity.metadata).length > 0 && (<div style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}><strong>Additional Info:</strong> {JSON.stringify(activity.metadata)}</div>)}</div>)}</div></div></div>))}</div>{fullActivityData.pagination.totalPages > 1 && (<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: `1px solid ${currentThemeStyles.inputBorder}` }}><div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Showing {fullActivityData.activities.length} of {fullActivityData.pagination.totalActivities} activities (Page {fullActivityData.pagination.currentPage} of {fullActivityData.pagination.totalPages})</div><div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><button onClick={() => setActivityPage(prev => prev - 1)} disabled={!fullActivityData.pagination.hasPrev} style={{ backgroundColor: fullActivityData.pagination.hasPrev ? currentThemeStyles.quickActionBg : currentThemeStyles.inputBg, color: fullActivityData.pagination.hasPrev ? currentThemeStyles.textPrimary : currentThemeStyles.textMuted, padding: '0.5rem', border: `1px solid ${currentThemeStyles.inputBorder}`, borderRadius: '0.375rem', cursor: fullActivityData.pagination.hasPrev ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center' }}><ChevronLeftIcon width={16} height={16} /></button><span style={{ padding: '0.5rem 1rem', backgroundColor: currentThemeStyles.inputBg, borderRadius: '0.375rem', color: currentThemeStyles.textPrimary, fontSize: '0.875rem' }}>{fullActivityData.pagination.currentPage}</span><button onClick={() => setActivityPage(prev => prev + 1)} disabled={!fullActivityData.pagination.hasNext} style={{ backgroundColor: fullActivityData.pagination.hasNext ? currentThemeStyles.quickActionBg : currentThemeStyles.inputBg, color: fullActivityData.pagination.hasNext ? currentThemeStyles.textPrimary : currentThemeStyles.textMuted, padding: '0.5rem', border: `1px solid ${currentThemeStyles.inputBorder}`, borderRadius: '0.375rem', cursor: fullActivityData.pagination.hasNext ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center' }}><ChevronRightIcon width={16} height={16} /></button></div></div>)}</>) : (<div style={{ textAlign: 'center', padding: '2rem', color: currentThemeStyles.textSecondary }}><ClockIcon width={48} height={48} color={currentThemeStyles.textMuted} style={{ margin: '0 auto 1rem' }} /><h3 style={{ color: currentThemeStyles.textPrimary, marginBottom: '0.5rem' }}>No Activity Found</h3><p>No activities match the current filters or this user hasn&apos;t performed any activities yet.</p>{(activityCategory !== 'all' || activityAction !== 'all') && (<button onClick={() => { setActivityCategory('all'); setActivityAction('all'); setActivityPage(1); }} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', marginTop: '1rem' }}>Clear Filters</button>)}</div>)}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
            <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserIcon width={20} height={20} />User Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div><label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Full Name</label><span style={{ color: currentThemeStyles.textPrimary, fontSize: '1rem', fontWeight: '500' }}>{user.name}</span></div>
              <div><label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Email Address</label><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><EnvelopeIcon width={16} height={16} color={currentThemeStyles.textSecondary} /><span style={{ color: currentThemeStyles.textPrimary, fontSize: '1rem', fontWeight: '500' }}>{user.email}</span></div></div>
              {user.phone && (<div><label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Phone Number</label><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PhoneIcon width={16} height={16} color={currentThemeStyles.textSecondary} /><span style={{ color: currentThemeStyles.textPrimary, fontSize: '1rem', fontWeight: '500' }}>{user.phone}</span></div></div>)}
              <div><label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Role</label><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: getRoleColor(user.role) }}>{getRoleIcon(user.role)}</span><span style={{ color: getRoleColor(user.role), fontSize: '1rem', fontWeight: '500' }}>{getRoleLabel(user.role)}</span></div></div>
              {user.department && (<div><label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Department</label><span style={{ color: currentThemeStyles.textPrimary, fontSize: '1rem', fontWeight: '500' }}>{user.department}</span></div>)}
              {user.company && (<div><label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Company</label><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BuildingOfficeIcon width={16} height={16} color={currentThemeStyles.textSecondary} /><span style={{ color: currentThemeStyles.textPrimary, fontSize: '1rem', fontWeight: '500' }}>{user.company}</span></div></div>)}
              <div><label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Account Created</label><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CalendarIcon width={16} height={16} color={currentThemeStyles.textSecondary} /><span style={{ color: currentThemeStyles.textPrimary, fontSize: '1rem', fontWeight: '500' }}>{formatDate(user.createdAt)}</span></div></div>
              {user.lastLogin && (<div><label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Last Login</label><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ClockIcon width={16} height={16} color={currentThemeStyles.textSecondary} /><span style={{ color: currentThemeStyles.textPrimary, fontSize: '1rem', fontWeight: '500' }}>{formatDateTime(user.lastLogin)}</span></div></div>)}
            </div>
            {user.permissions && user.permissions.length > 0 && (<div style={{ marginTop: '2rem' }}><h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><KeyIcon width={20} height={20} />Permissions</h3><div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>{user.permissions.map((permission) => (<span key={permission} style={{ backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.875rem', border: `1px solid ${currentThemeStyles.inputBorder}` }}>{permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>))}</div></div>)}
          </div>
        )}

        {user.role === 'system_admin' && (
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, border: '1px solid rgba(239, 68, 68, 0.5)', marginTop: '2rem', padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><ExclamationTriangleIcon width={20} height={20} color="#ef4444" /><h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1rem', fontWeight: '600', margin: 0 }}>System Administrator Account</h3></div>
            <p style={{ color: currentThemeStyles.textSecondary, margin: 0, lineHeight: '1.5' }}>This is a system administrator account with full access to all system functions. Deletion and deactivation require special authorization and cannot be performed through this interface.</p>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, maxWidth: '500px', width: '90%' }}>
            <h3 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ExclamationTriangleIcon width={24} height={24} color="#ef4444" />Confirm Delete User</h3>
            <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '2rem', lineHeight: '1.5' }}>Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone and will permanently remove:</p>
            <ul style={{ color: currentThemeStyles.textSecondary, marginBottom: '2rem', paddingLeft: '1.5rem' }}><li>User account and profile information</li><li>All associated activity logs</li><li>Access permissions and role assignments</li>{user.role === 'client' && <li>Trip booking history</li>}{user.role === 'route_admin' && <li>Device management assignments</li>}</ul>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ backgroundColor: currentThemeStyles.quickActionBg, color: currentThemeStyles.textPrimary, padding: '0.5rem 1rem', border: `1px solid ${currentThemeStyles.inputBorder}`, borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteUser} disabled={actionLoading === 'delete'} style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', opacity: actionLoading === 'delete' ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{actionLoading === 'delete' && <ArrowPathIcon width={16} height={16} className="animate-spin" />}{actionLoading === 'delete' ? 'Deleting...' : 'Delete User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
