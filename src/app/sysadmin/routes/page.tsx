// src/app/sysadmin/routes/page.tsx - COMPLETE REFACTORED VERSION with Glass Morphism Styling
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TruckIcon,
  PlusIcon,
  UserPlusIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/sysadmin/components/AnimatedBackground';

interface Route {
  _id: string;
  routeId: string;
  name: string;
  startLocation: {
    name: string;
    address: string;
  };
  endLocation: {
    name: string;
    address: string;
  };
  distance: number;
  estimatedDuration: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'inactive' | 'maintenance';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    name: string;
    email: string;
  };
  rejectionReason?: string;
  operatorInfo: {
    fleetId: string;
    companyName: string;
    contactNumber: string;
  };
  vehicleInfo: {
    type: 'bus' | 'train';
    capacity: number;
    amenities: string[];
  };
  pricing: {
    basePrice: number;
    pricePerKm: number;
  };
  routeAdminId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  routeAdminAssignment?: {
    assignedAt: string;
    assignedBy: {
      name: string;
      email: string;
    };
    status: 'assigned' | 'unassigned';
  };
}

interface RouteStats {
  totalApplications: number;
  pendingRoutes: number;
  approvedRoutes: number;
  rejectedRoutes: number;
  activeRoutes: number;
  avgApprovalTime: number;
  routeAdminStats: {
    routesWithAdmin: number;
    routesWithoutAdmin: number;
    totalRouteAdmins: number;
  };
}

interface RouteAdmin {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  assignedRoute?: {
    _id: string;
    name: string;
    routeId: string;
  };
  hasAssignment: boolean;
}

export default function AdminRoutesPage() {
  const { theme } = useTheme();
  
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stats, setStats] = useState<RouteStats | null>(null);
  const [routeAdmins, setRouteAdmins] = useState<RouteAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRouteAdmin, setFilterRouteAdmin] = useState<string>('all');
  const [showApprovalModal, setShowApprovalModal] = useState<Route | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState<Route | null>(null);
  const [showRouteAdminModal, setShowRouteAdminModal] = useState<Route | null>(null);
  const [showCreateRouteAdminModal, setShowCreateRouteAdminModal] = useState(false);
  const [selectedRouteAdminId, setSelectedRouteAdminId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [newRouteAdmin, setNewRouteAdmin] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    routeId: ''
  });

  // Theme and Style Definitions
  const lightTheme = {
    mainBg: '#fffbeb',
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
    textPrimary: '#1f2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    quickActionBg: 'rgba(249, 250, 251, 0.8)',
    quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)',
    alertBg: 'rgba(249, 250, 251, 0.6)',
    inputBg: 'rgba(255, 255, 255, 0.8)',
    inputBorder: '1px solid rgba(209, 213, 219, 0.6)'
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
    quickActionBg: 'rgba(51, 65, 85, 0.8)',
    quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)',
    alertBg: 'rgba(51, 65, 85, 0.6)',
    inputBg: 'rgba(51, 65, 85, 0.8)',
    inputBorder: '1px solid rgba(75, 85, 99, 0.5)'
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // Animation styles
  const animationStyles = `
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    @keyframes light-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } }
    @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 5px rgba(251, 191, 36, 0.5); } 50% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.8); } }
  `;

  // Load route data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const params = new URLSearchParams();
        if (filterStatus !== 'all') params.append('approvalStatus', filterStatus);
        if (filterRouteAdmin !== 'all') params.append('hasRouteAdmin', filterRouteAdmin);

        const routesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/routes?${params}`, {
          headers
        });
        
        if (!routesResponse.ok) {
          throw new Error('Failed to fetch routes');
        }
        
        const routesData = await routesResponse.json();

        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/routes/stats`, {
          headers
        });
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const statsData = await statsResponse.json();

        const routeAdminsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/route-admins`, {
          headers
        });
        
        if (routeAdminsResponse.ok) {
          const routeAdminsData = await routeAdminsResponse.json();
          setRouteAdmins(routeAdminsData.routeAdmins || []);
        }

        setRoutes(routesData.routes || []);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading route data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filterStatus, filterRouteAdmin]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      // Auto refresh logic would go here
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon width={20} height={20} />;
      case 'pending': return <ClockIcon width={20} height={20} />;
      case 'rejected': return <XCircleIcon width={20} height={20} />;
      default: return <ClockIcon width={20} height={20} />;
    }
  };

  const handleApproveRoute = async (routeId: string) => {
    setActionLoading(`approve-${routeId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/routes/${routeId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: approvalNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve route');
      }

      setRoutes(prev => prev.map(route => {
        if (route._id === routeId) {
          return { 
            ...route, 
            approvalStatus: 'approved',
            reviewedAt: new Date().toISOString()
          };
        }
        return route;
      }));
      
      setShowApprovalModal(null);
      setApprovalNotes('');
    } catch (error) {
      console.error(`Error approving route ${routeId}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRoute = async (routeId: string, reason: string) => {
    setActionLoading(`reject-${routeId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/routes/${routeId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject route');
      }

      setRoutes(prev => prev.map(route => {
        if (route._id === routeId) {
          return { 
            ...route, 
            approvalStatus: 'rejected',
            rejectionReason: reason,
            reviewedAt: new Date().toISOString()
          };
        }
        return route;
      }));
      
      setShowRejectionModal(null);
      setRejectionReason('');
    } catch (error) {
      console.error(`Error rejecting route ${routeId}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignRouteAdmin = async (routeId: string, routeAdminId: string) => {
    setActionLoading(`assign-admin-${routeId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/routes/${routeId}/assign-admin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          routeAdminId: routeAdminId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign route admin');
      }

      const result = await response.json();

      setRoutes(prev => prev.map(route => {
        if (route._id === routeId) {
          const routeAdmin = routeAdmins.find(ra => ra._id === routeAdminId);
          return { 
            ...route, 
            routeAdminId: routeAdmin ? {
              _id: routeAdmin._id,
              name: routeAdmin.name,
              email: routeAdmin.email,
              phone: routeAdmin.phone
            } : undefined,
            routeAdminAssignment: {
              assignedAt: new Date().toISOString(),
              assignedBy: {
                name: 'Current Admin',
                email: 'admin@sriexpress.com'
              },
              status: 'assigned'
            }
          };
        }
        return route;
      }));

      setRouteAdmins(prev => prev.map(admin => {
        if (admin._id === routeAdminId) {
          const route = routes.find(r => r._id === routeId);
          return {
            ...admin,
            hasAssignment: true,
            assignedRoute: route ? {
              _id: route._id,
              name: route.name,
              routeId: route.routeId
            } : undefined
          };
        }
        return admin;
      }));
      
      setShowRouteAdminModal(null);
      setSelectedRouteAdminId('');
    } catch (error) {
      console.error(`Error assigning route admin:`, error);
      alert(error instanceof Error ? error.message : 'Failed to assign route admin');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveRouteAdmin = async (routeId: string) => {
    setActionLoading(`remove-admin-${routeId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/routes/${routeId}/remove-admin`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'Unassigned by system admin'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to remove route admin');
      }

      setRoutes(prev => prev.map(route => {
        if (route._id === routeId) {
          const previousAdminId = route.routeAdminId?._id;
          
          if (previousAdminId) {
            setRouteAdmins(prevAdmins => prevAdmins.map(admin => {
              if (admin._id === previousAdminId) {
                return {
                  ...admin,
                  hasAssignment: false,
                  assignedRoute: undefined
                };
              }
              return admin;
            }));
          }
          
          return { 
            ...route, 
            routeAdminId: undefined,
            routeAdminAssignment: {
              ...route.routeAdminAssignment!,
              status: 'unassigned'
            }
          };
        }
        return route;
      }));
      
    } catch (error) {
      console.error(`Error removing route admin:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateRouteAdmin = async () => {
    setActionLoading('create-route-admin');
    
    try {
      const token = localStorage.getItem('token');
      
      const endpoint = newRouteAdmin.routeId 
        ? '/api/admin/users/route-admin-with-assignment'
        : '/api/admin/users/route-admin';
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRouteAdmin)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create route admin');
      }

      const result = await response.json();

      setRouteAdmins(prev => [...prev, {
        _id: result.routeAdmin._id,
        name: result.routeAdmin.name,
        email: result.routeAdmin.email,
        phone: result.routeAdmin.phone,
        hasAssignment: !!result.assignment,
        assignedRoute: result.assignment?.route
      }]);

      if (result.assignment) {
        setRoutes(prev => prev.map(route => {
          if (route._id === newRouteAdmin.routeId) {
            return {
              ...route,
              routeAdminId: {
                _id: result.routeAdmin._id,
                name: result.routeAdmin.name,
                email: result.routeAdmin.email,
                phone: result.routeAdmin.phone
              },
              routeAdminAssignment: {
                assignedAt: result.assignment.assignedAt,
                assignedBy: result.assignment.assignedBy,
                status: 'assigned'
              }
            };
          }
          return route;
        }));
      }

      setShowCreateRouteAdminModal(false);
      setNewRouteAdmin({
        name: '',
        email: '',
        password: '',
        phone: '',
        routeId: ''
      });
    } catch (error) {
      console.error('Error creating route admin:', error);
      alert(error instanceof Error ? error.message : 'Failed to create route admin');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toFixed(2)}`;
  };

  const getAvailableRouteAdmins = () => {
    return routeAdmins.filter(admin => !admin.hasAssignment);
  };

  const hasRouteAdmin = (route: Route) => {
    return route.routeAdminId && route.routeAdminAssignment?.status === 'assigned';
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading route management...</p>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      {/* Navigation */}
      <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/sysadmin/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ← Dashboard
            </Link>
            <ShieldCheckIcon width={32} height={32} color="#dc2626" />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 4px 8px rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapIcon width={24} height={24} color="#f59e0b" />
                Route Management
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Manage route applications & assignments</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ThemeSwitcher />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} style={{ accentColor: '#3b82f6' }} />
              Auto Refresh
            </label>
            
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select value={filterRouteAdmin} onChange={(e) => setFilterRouteAdmin(e.target.value)} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
              <option value="all">All Routes</option>
              <option value="assigned">With Route Admin</option>
              <option value="unassigned">Without Route Admin</option>
            </select>
            
            <button onClick={() => setShowCreateRouteAdminModal(true)} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlusIcon width={16} height={16} />
              Create Route Admin
            </button>
            
            <Link href="/sysadmin/routes/add" style={{ textDecoration: 'none' }}>
              <button style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusIcon width={16} height={16} />
                Create Route
              </button>
            </Link>
            
            <button onClick={() => window.location.reload()} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
              Refresh
            </button>
            
            <div style={{ position: 'relative' }}>
              <BellIcon width={20} height={20} color="#F59E0B" />
              {stats?.pendingRoutes && stats.pendingRoutes > 0 && (
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', backgroundColor: '#ef4444', borderRadius: '50%', fontSize: '0.625rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stats.pendingRoutes}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div style={{ width: '100%', minHeight: 'calc(100vh - 100px)', padding: '2rem', position: 'relative', zIndex: 10 }}>
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
          
          {/* Route Statistics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {stats && [
              { label: 'Pending Routes', value: stats.pendingRoutes, icon: ClockIcon, color: '#f59e0b', desc: 'Awaiting approval' },
              { label: 'Approved Routes', value: stats.approvedRoutes, icon: CheckCircleIcon, color: '#10b981', desc: 'Ready for operation' },
              { label: 'Active Routes', value: stats.activeRoutes, icon: MapIcon, color: '#06b6d4', desc: 'Currently operating' },
              { label: 'Rejected Routes', value: stats.rejectedRoutes, icon: XCircleIcon, color: '#ef4444', desc: 'Application denied' },
              { label: 'Routes with Admin', value: stats.routeAdminStats?.routesWithAdmin || 0, icon: UserIcon, color: '#8b5cf6', desc: 'Assigned administrators' },
              { label: 'Total Route Admins', value: stats.routeAdminStats?.totalRouteAdmins || 0, icon: UsersIcon, color: '#10b981', desc: 'Available administrators' }
            ].map((metric, index) => (
              <div key={metric.label} style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, animation: `fade-in-up 0.8s ease-out ${index * 0.1}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <metric.icon width={32} height={32} color={metric.color} />
                  <div>
                    <h3 style={{ color: metric.color, fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{metric.value}</h3>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>{metric.label}</p>
                    <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>{metric.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Route Applications */}
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
            <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapIcon width={24} height={24} color="#F59E0B" />
              Route Applications ({routes.length})
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem' }}>
              {routes.map((route, index) => (
                <div key={route._id} style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: '1.5rem', borderRadius: '0.75rem', border: currentThemeStyles.quickActionBorder, transition: 'all 0.3s ease', animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both` }}>
                  
                  {/* Route Header with expand/collapse */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', cursor: 'pointer' }} onClick={() => setExpandedRoute(expandedRoute === route._id ? null : route._id)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {expandedRoute === route._id ? 
                          <ChevronDownIcon width={16} height={16} color="#94a3b8" /> :
                          <ChevronRightIcon width={16} height={16} color="#94a3b8" />
                        }
                        <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
                          {route.name}
                        </h3>
                      </div>
                      <p style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', margin: 0 }}>
                        {route.startLocation.name} → {route.endLocation.name}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                      <span style={{ color: getApprovalStatusColor(route.approvalStatus) }}>
                        {getApprovalStatusIcon(route.approvalStatus)}
                      </span>
                      <span style={{ color: getApprovalStatusColor(route.approvalStatus), fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize' }}>
                        {route.approvalStatus}
                      </span>
                    </div>
                  </div>

                  {/* Route admin status indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem', backgroundColor: hasRouteAdmin(route) ? 'rgba(5, 150, 105, 0.2)' : 'rgba(124, 45, 18, 0.2)', borderRadius: '0.5rem', border: hasRouteAdmin(route) ? '1px solid rgba(5, 150, 105, 0.3)' : '1px solid rgba(124, 45, 18, 0.3)' }}>
                    <UserIcon width={16} height={16} color={hasRouteAdmin(route) ? '#059669' : '#dc2626'} />
                    {hasRouteAdmin(route) ? (
                      <div>
                        <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: '500' }}>
                          Route Admin: {route.routeAdminId?.name}
                        </span>
                        <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>
                          Assigned {formatDateTime(route.routeAdminAssignment?.assignedAt || '')}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem' }}>
                        No Route Admin Assigned
                      </span>
                    )}
                  </div>

                  {/* Expanded route details */}
                  {expandedRoute === route._id && (
                    <div className="animate-fade-in-down">
                      {/* Route Info */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', padding: '1rem', backgroundColor: currentThemeStyles.alertBg, borderRadius: '0.5rem', border: currentThemeStyles.glassPanelBorder }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <BuildingOfficeIcon width={16} height={16} color="#94a3b8" />
                            <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>Fleet</span>
                          </div>
                          <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: '600' }}>
                            {route.operatorInfo.companyName}
                          </span>
                        </div>
                        
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <TruckIcon width={16} height={16} color="#94a3b8" />
                            <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>Vehicle</span>
                          </div>
                          <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: '600' }}>
                            {route.vehicleInfo.type} ({route.vehicleInfo.capacity} seats)
                          </span>
                        </div>
                        
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <MapIcon width={16} height={16} color="#94a3b8" />
                            <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>Distance</span>
                          </div>
                          <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem' }}>
                            {route.distance} km
                          </span>
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <CurrencyDollarIcon width={16} height={16} color="#94a3b8" />
                            <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>Base Price</span>
                          </div>
                          <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem' }}>
                            {formatCurrency(route.pricing.basePrice)}
                          </span>
                        </div>
                      </div>

                      {/* Submission Date */}
                      <div style={{ backgroundColor: currentThemeStyles.alertBg, padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', border: currentThemeStyles.glassPanelBorder }}>
                        <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>Submitted: </span>
                        <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem' }}>
                          {formatDateTime(route.submittedAt)}
                        </span>
                        {route.reviewedAt && (
                          <>
                            <br />
                            <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>Reviewed: </span>
                            <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem' }}>
                              {formatDateTime(route.reviewedAt)}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Rejection Reason */}
                      {route.rejectionReason && (
                        <div style={{ backgroundColor: 'rgba(127, 29, 29, 0.3)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid rgba(153, 27, 27, 0.5)' }}>
                          <span style={{ color: '#fca5a5', fontSize: '0.75rem' }}>Rejection Reason: </span>
                          <p style={{ color: '#fecaca', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
                            {route.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {route.approvalStatus === 'pending' && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setShowApprovalModal(route); }} disabled={actionLoading === `approve-${route._id}`} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: actionLoading === `approve-${route._id}` ? 0.7 : 1 }}>
                          <CheckCircleIcon width={14} height={14} />
                          {actionLoading === `approve-${route._id}` ? 'Approving...' : 'Approve'}
                        </button>
                        
                        <button onClick={(e) => { e.stopPropagation(); setShowRejectionModal(route); }} disabled={actionLoading === `reject-${route._id}`} style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: actionLoading === `reject-${route._id}` ? 0.7 : 1 }}>
                          <XCircleIcon width={14} height={14} />
                          {actionLoading === `reject-${route._id}` ? 'Rejecting...' : 'Reject'}
                        </button>
                      </>
                    )}

                    {route.approvalStatus === 'approved' && (
                      <>
                        {hasRouteAdmin(route) ? (
                          <button onClick={(e) => { e.stopPropagation(); handleRemoveRouteAdmin(route._id); }} disabled={actionLoading === `remove-admin-${route._id}`} style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: actionLoading === `remove-admin-${route._id}` ? 0.7 : 1 }}>
                            <UserIcon width={14} height={14} />
                            {actionLoading === `remove-admin-${route._id}` ? 'Removing...' : 'Remove Admin'}
                          </button>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); setShowRouteAdminModal(route); }} disabled={getAvailableRouteAdmins().length === 0} style={{ backgroundColor: getAvailableRouteAdmins().length === 0 ? '#6b7280' : '#8b5cf6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', fontSize: '0.875rem', cursor: getAvailableRouteAdmins().length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <UserPlusIcon width={14} height={14} />
                            Assign Admin
                          </button>
                        )}
                      </>
                    )}

                    <button onClick={(e) => { e.stopPropagation(); setSelectedRoute(route); }} style={{ backgroundColor: currentThemeStyles.quickActionBg, color: currentThemeStyles.textPrimary, padding: '0.5rem 1rem', borderRadius: '0.5rem', border: currentThemeStyles.quickActionBorder, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <EyeIcon width={14} height={14} />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {routes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: currentThemeStyles.textSecondary }}>
                <MapIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} color={currentThemeStyles.textSecondary} />
                <p>No route applications found for the selected filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Route Details Modal */}
      {selectedRoute && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', maxWidth: '800px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                {selectedRoute.name} - Route Details
              </h3>
              <button onClick={() => setSelectedRoute(null)} style={{ backgroundColor: 'transparent', color: currentThemeStyles.textSecondary, border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <h4 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>Route Information</h4>
                <div style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: currentThemeStyles.quickActionBorder }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Route ID:</span>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>{selectedRoute.routeId}</p>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Start Address:</span>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>{selectedRoute.startLocation.address}</p>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>End Address:</span>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>{selectedRoute.endLocation.address}</p>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Duration:</span>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>{formatDuration(selectedRoute.estimatedDuration)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>Operator & Pricing</h4>
                <div style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: currentThemeStyles.quickActionBorder }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Contact:</span>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>{selectedRoute.operatorInfo.contactNumber}</p>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Price per KM:</span>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>{formatCurrency(selectedRoute.pricing.pricePerKm)}</p>
                  </div>
                  <div>
                    <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Amenities:</span>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>
                      {selectedRoute.vehicleInfo.amenities.length > 0 
                        ? selectedRoute.vehicleInfo.amenities.join(', ')
                        : 'None specified'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {hasRouteAdmin(selectedRoute) && (
              <div style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem', border: currentThemeStyles.quickActionBorder }}>
                <h4 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>Route Administrator</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: 0, fontWeight: '600' }}>
                      {selectedRoute.routeAdminId?.name}
                    </p>
                    <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0', fontSize: '0.875rem' }}>
                      {selectedRoute.routeAdminId?.email}
                    </p>
                    <p style={{ color: currentThemeStyles.textSecondary, margin: 0, fontSize: '0.75rem' }}>
                      Assigned: {formatDateTime(selectedRoute.routeAdminAssignment?.assignedAt || '')}
                    </p>
                  </div>
                  <div style={{ backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '600' }}>
                    ASSIGNED
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setSelectedRoute(null)} style={{ backgroundColor: currentThemeStyles.quickActionBg, color: currentThemeStyles.textPrimary, padding: '0.5rem 1rem', border: currentThemeStyles.quickActionBorder, borderRadius: '0.5rem', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, backdropFilter: 'blur(8px)' }}>
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Approve Route Application
            </h3>
            <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1rem' }}>
              Are you sure you want to approve the route <strong>{showApprovalModal.name}</strong>?
            </p>
            <textarea value={approvalNotes} onChange={(e) => setApprovalNotes(e.target.value)} placeholder="Optional notes (visible to fleet operator)..." style={{ width: '100%', height: '80px', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', padding: '0.75rem', color: currentThemeStyles.textPrimary, resize: 'vertical', marginBottom: '1.5rem' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => { setShowApprovalModal(null); setApprovalNotes(''); }} style={{ backgroundColor: currentThemeStyles.quickActionBg, color: currentThemeStyles.textPrimary, padding: '0.5rem 1rem', border: currentThemeStyles.quickActionBorder, borderRadius: '0.5rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => handleApproveRoute(showApprovalModal._id)} disabled={actionLoading === `approve-${showApprovalModal._id}`} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', opacity: actionLoading === `approve-${showApprovalModal._id}` ? 0.7 : 1 }}>
                {actionLoading === `approve-${showApprovalModal._id}` ? 'Approving...' : 'Approve Route'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, backdropFilter: 'blur(8px)' }}>
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Reject Route Application
            </h3>
            <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1rem' }}>
              Please provide a reason for rejecting <strong>{showRejectionModal.name}</strong>:
            </p>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter rejection reason..." style={{ width: '100%', height: '100px', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', padding: '0.75rem', color: currentThemeStyles.textPrimary, resize: 'vertical', marginBottom: '1.5rem' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => { setShowRejectionModal(null); setRejectionReason(''); }} style={{ backgroundColor: currentThemeStyles.quickActionBg, color: currentThemeStyles.textPrimary, padding: '0.5rem 1rem', border: currentThemeStyles.quickActionBorder, borderRadius: '0.5rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => handleRejectRoute(showRejectionModal._id, rejectionReason)} disabled={!rejectionReason.trim() || actionLoading === `reject-${showRejectionModal._id}`} style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: !rejectionReason.trim() ? 'not-allowed' : 'pointer', opacity: (!rejectionReason.trim() || actionLoading === `reject-${showRejectionModal._id}`) ? 0.7 : 1 }}>
                {actionLoading === `reject-${showRejectionModal._id}` ? 'Rejecting...' : 'Reject Route'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route Admin Assignment Modal */}
      {showRouteAdminModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, backdropFilter: 'blur(8px)' }}>
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Assign Route Admin
            </h3>
            <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1rem' }}>
              Select a route admin to manage <strong>{showRouteAdminModal.name}</strong>:
            </p>
            
            <select value={selectedRouteAdminId} onChange={(e) => setSelectedRouteAdminId(e.target.value)} style={{ width: '100%', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', padding: '0.75rem', color: currentThemeStyles.textPrimary, marginBottom: '1.5rem' }}>
              <option value="">Select Route Admin</option>
              {getAvailableRouteAdmins().map((admin) => (
                <option key={admin._id} value={admin._id}>
                  {admin.name} ({admin.email})
                </option>
              ))}
            </select>

            {getAvailableRouteAdmins().length === 0 && (
              <div style={{ backgroundColor: 'rgba(124, 45, 18, 0.2)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid rgba(124, 45, 18, 0.3)' }}>
                <p style={{ color: currentThemeStyles.textPrimary, margin: 0, fontSize: '0.875rem' }}>
                  No available route admins. All route admins are currently assigned to routes.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => { setShowRouteAdminModal(null); setSelectedRouteAdminId(''); }} style={{ backgroundColor: currentThemeStyles.quickActionBg, color: currentThemeStyles.textPrimary, padding: '0.5rem 1rem', border: currentThemeStyles.quickActionBorder, borderRadius: '0.5rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => handleAssignRouteAdmin(showRouteAdminModal._id, selectedRouteAdminId)} disabled={!selectedRouteAdminId || actionLoading === `assign-admin-${showRouteAdminModal._id}`} style={{ backgroundColor: !selectedRouteAdminId ? '#6b7280' : '#8b5cf6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: !selectedRouteAdminId ? 'not-allowed' : 'pointer', opacity: actionLoading === `assign-admin-${showRouteAdminModal._id}` ? 0.7 : 1 }}>
                {actionLoading === `assign-admin-${showRouteAdminModal._id}` ? 'Assigning...' : 'Assign Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Route Admin Modal */}
      {showCreateRouteAdminModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, backdropFilter: 'blur(8px)' }}>
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Create Route Admin
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                Full Name *
              </label>
              <input type="text" value={newRouteAdmin.name} onChange={(e) => setNewRouteAdmin(prev => ({ ...prev, name: e.target.value }))} style={{ width: '100%', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', padding: '0.75rem', color: currentThemeStyles.textPrimary }} placeholder="Enter full name" />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                Email Address *
              </label>
              <input type="email" value={newRouteAdmin.email} onChange={(e) => setNewRouteAdmin(prev => ({ ...prev, email: e.target.value }))} style={{ width: '100%', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', padding: '0.75rem', color: currentThemeStyles.textPrimary }} placeholder="Enter email address" />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                Password *
              </label>
              <input type="password" value={newRouteAdmin.password} onChange={(e) => setNewRouteAdmin(prev => ({ ...prev, password: e.target.value }))} style={{ width: '100%', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', padding: '0.75rem', color: currentThemeStyles.textPrimary }} placeholder="Enter password" />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                Phone Number
              </label>
              <input type="text" value={newRouteAdmin.phone} onChange={(e) => setNewRouteAdmin(prev => ({ ...prev, phone: e.target.value }))} style={{ width: '100%', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', padding: '0.75rem', color: currentThemeStyles.textPrimary }} placeholder="Enter phone number" />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                Assign to Route (Optional)
              </label>
              <select value={newRouteAdmin.routeId} onChange={(e) => setNewRouteAdmin(prev => ({ ...prev, routeId: e.target.value }))} style={{ width: '100%', backgroundColor: currentThemeStyles.inputBg, border: currentThemeStyles.inputBorder, borderRadius: '0.5rem', padding: '0.75rem', color: currentThemeStyles.textPrimary }}>
                <option value="">No assignment (create admin only)</option>
                {routes
                  .filter(route => route.approvalStatus === 'approved' && !hasRouteAdmin(route))
                  .map((route) => (
                    <option key={route._id} value={route._id}>
                      {route.name} ({route.routeId})
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => { setShowCreateRouteAdminModal(false); setNewRouteAdmin({ name: '', email: '', password: '', phone: '', routeId: '' }); }} style={{ backgroundColor: currentThemeStyles.quickActionBg, color: currentThemeStyles.textPrimary, padding: '0.5rem 1rem', border: currentThemeStyles.quickActionBorder, borderRadius: '0.5rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleCreateRouteAdmin} disabled={!newRouteAdmin.name || !newRouteAdmin.email || !newRouteAdmin.password || actionLoading === 'create-route-admin'} style={{ backgroundColor: (!newRouteAdmin.name || !newRouteAdmin.email || !newRouteAdmin.password) ? '#6b7280' : '#8b5cf6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: (!newRouteAdmin.name || !newRouteAdmin.email || !newRouteAdmin.password) ? 'not-allowed' : 'pointer', opacity: actionLoading === 'create-route-admin' ? 0.7 : 1 }}>
                {actionLoading === 'create-route-admin' ? 'Creating...' : 'Create Route Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}