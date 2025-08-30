// src/app/sysadmin/routes/page.tsx - Admin Route Management with Route Admin Assignment Support
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
  ChevronRightIcon
} from '@heroicons/react/24/outline';

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
  // NEW: Route admin fields
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
  // NEW: Route admin stats
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

  // New route admin form
  const [newRouteAdmin, setNewRouteAdmin] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    routeId: ''
  });

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

        // Build query parameters
        const params = new URLSearchParams();
        if (filterStatus !== 'all') params.append('approvalStatus', filterStatus);
        if (filterRouteAdmin !== 'all') params.append('hasRouteAdmin', filterRouteAdmin);

        // Get route applications
        const routesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/routes?${params}`, {
          headers
        });
        
        if (!routesResponse.ok) {
          throw new Error('Failed to fetch routes');
        }
        
        const routesData = await routesResponse.json();

        // Get route statistics
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/routes/stats`, {
          headers
        });
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const statsData = await statsResponse.json();

        // Get route admins
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

      // Update route status in state
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

      // Update route status in state
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

  // NEW: Route admin assignment functions
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

      // Update route in state
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

      // Update route admins list
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

      // Update route in state
      setRoutes(prev => prev.map(route => {
        if (route._id === routeId) {
          const previousAdminId = route.routeAdminId?._id;
          
          // Update route admins list
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

      // Add new route admin to list
      setRouteAdmins(prev => [...prev, {
        _id: result.routeAdmin._id,
        name: result.routeAdmin.name,
        email: result.routeAdmin.email,
        phone: result.routeAdmin.phone,
        hasAssignment: !!result.assignment,
        assignedRoute: result.assignment?.route
      }]);

      // Update route if assignment was made
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9'
      }}>
        <div>Loading route management...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Link href="/sysadmin/dashboard" style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}>
              ← Dashboard
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <MapIcon width={24} height={24} color="#f59e0b" />
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f1f5f9',
                margin: 0
              }}>
                Route Management
              </h1>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                backgroundColor: '#374151',
                color: '#f9fafb',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* NEW: Route admin filter */}
            <select
              value={filterRouteAdmin}
              onChange={(e) => setFilterRouteAdmin(e.target.value)}
              style={{
                backgroundColor: '#374151',
                color: '#f9fafb',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Routes</option>
              <option value="assigned">With Route Admin</option>
              <option value="unassigned">Without Route Admin</option>
            </select>
            
            {/* NEW: Create route admin button */}
            <button
              onClick={() => setShowCreateRouteAdminModal(true)}
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <UserPlusIcon width={16} height={16} />
              Create Route Admin
            </button>
            
            <Link href="/sysadmin/routes/add">
              <button style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none'
              }}>
                <PlusIcon width={16} height={16} />
                Create Route
              </button>
            </Link>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Route Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ClockIcon width={32} height={32} color="#f59e0b" />
              <div>
                <h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats?.pendingRoutes || 0}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Pending Routes</p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckCircleIcon width={32} height={32} color="#10b981" />
              <div>
                <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats?.approvedRoutes || 0}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Approved Routes</p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <MapIcon width={32} height={32} color="#06b6d4" />
              <div>
                <h3 style={{ color: '#06b6d4', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats?.activeRoutes || 0}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Active Routes</p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <XCircleIcon width={32} height={32} color="#ef4444" />
              <div>
                <h3 style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats?.rejectedRoutes || 0}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Rejected Routes</p>
              </div>
            </div>
          </div>

          {/* NEW: Route admin statistics */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <UserIcon width={32} height={32} color="#8b5cf6" />
              <div>
                <h3 style={{ color: '#8b5cf6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats?.routeAdminStats?.routesWithAdmin || 0}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Routes with Admin</p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <UsersIcon width={32} height={32} color="#10b981" />
              <div>
                <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats?.routeAdminStats?.totalRouteAdmins || 0}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Total Route Admins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Route Applications */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '2rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155'
        }}>
          <h2 style={{
            color: '#f1f5f9',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <MapIcon width={20} height={20} />
            Route Applications ({routes.length})
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '1.5rem'
          }}>
            {routes.map((route) => (
              <div key={route._id} style={{
                backgroundColor: '#334155',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #475569'
              }}>
                {/* Route Header with expand/collapse */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                  cursor: 'pointer'
                }}
                onClick={() => setExpandedRoute(expandedRoute === route._id ? null : route._id)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {expandedRoute === route._id ? 
                        <ChevronDownIcon width={16} height={16} color="#94a3b8" /> :
                        <ChevronRightIcon width={16} height={16} color="#94a3b8" />
                      }
                      <h3 style={{
                        color: '#f1f5f9',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        margin: 0
                      }}>
                        {route.name}
                      </h3>
                    </div>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      {route.startLocation.name} → {route.endLocation.name}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginLeft: '1rem'
                  }}>
                    <span style={{ color: getApprovalStatusColor(route.approvalStatus) }}>
                      {getApprovalStatusIcon(route.approvalStatus)}
                    </span>
                    <span style={{
                      color: getApprovalStatusColor(route.approvalStatus),
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {route.approvalStatus}
                    </span>
                  </div>
                </div>

                {/* NEW: Route admin status indicator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: hasRouteAdmin(route) ? '#059669' : '#7c2d12',
                  borderRadius: '0.5rem'
                }}>
                  <UserIcon width={16} height={16} color="#fff" />
                  {hasRouteAdmin(route) ? (
                    <div>
                      <span style={{ color: '#fff', fontSize: '0.875rem', fontWeight: '500' }}>
                        Route Admin: {route.routeAdminId?.name}
                      </span>
                      <div style={{ color: '#d1fae5', fontSize: '0.75rem' }}>
                        Assigned {formatDateTime(route.routeAdminAssignment?.assignedAt || '')}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: '#fff', fontSize: '0.875rem' }}>
                      No Route Admin Assigned
                    </span>
                  )}
                </div>

                {/* Expanded route details */}
                {expandedRoute === route._id && (
                  <>
                    {/* Route Info */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '1rem',
                      padding: '1rem',
                      backgroundColor: '#1e293b',
                      borderRadius: '0.5rem'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <BuildingOfficeIcon width={16} height={16} color="#94a3b8" />
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Fleet</span>
                        </div>
                        <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>
                          {route.operatorInfo.companyName}
                        </span>
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <TruckIcon width={16} height={16} color="#94a3b8" />
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Vehicle</span>
                        </div>
                        <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>
                          {route.vehicleInfo.type} ({route.vehicleInfo.capacity} seats)
                        </span>
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <MapIcon width={16} height={16} color="#94a3b8" />
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Distance</span>
                        </div>
                        <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                          {route.distance} km
                        </span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <CurrencyDollarIcon width={16} height={16} color="#94a3b8" />
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Base Price</span>
                        </div>
                        <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                          {formatCurrency(route.pricing.basePrice)}
                        </span>
                      </div>
                    </div>

                    {/* Submission Date */}
                    <div style={{
                      backgroundColor: '#1e293b',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Submitted: </span>
                      <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                        {formatDateTime(route.submittedAt)}
                      </span>
                      {route.reviewedAt && (
                        <>
                          <br />
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Reviewed: </span>
                          <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                            {formatDateTime(route.reviewedAt)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Rejection Reason */}
                    {route.rejectionReason && (
                      <div style={{
                        backgroundColor: '#7f1d1d',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem',
                        border: '1px solid #991b1b'
                      }}>
                        <span style={{ color: '#fca5a5', fontSize: '0.75rem' }}>Rejection Reason: </span>
                        <p style={{ color: '#fecaca', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
                          {route.rejectionReason}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {route.approvalStatus === 'pending' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowApprovalModal(route);
                        }}
                        disabled={actionLoading === `approve-${route._id}`}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          opacity: actionLoading === `approve-${route._id}` ? 0.7 : 1
                        }}
                      >
                        <CheckCircleIcon width={14} height={14} />
                        {actionLoading === `approve-${route._id}` ? 'Approving...' : 'Approve'}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRejectionModal(route);
                        }}
                        disabled={actionLoading === `reject-${route._id}`}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          opacity: actionLoading === `reject-${route._id}` ? 0.7 : 1
                        }}
                      >
                        <XCircleIcon width={14} height={14} />
                        {actionLoading === `reject-${route._id}` ? 'Rejecting...' : 'Reject'}
                      </button>
                    </>
                  )}

                  {/* NEW: Route admin management buttons */}
                  {route.approvalStatus === 'approved' && (
                    <>
                      {hasRouteAdmin(route) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveRouteAdmin(route._id);
                          }}
                          disabled={actionLoading === `remove-admin-${route._id}`}
                          style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: actionLoading === `remove-admin-${route._id}` ? 0.7 : 1
                          }}
                        >
                          <UserIcon width={14} height={14} />
                          {actionLoading === `remove-admin-${route._id}` ? 'Removing...' : 'Remove Admin'}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowRouteAdminModal(route);
                          }}
                          disabled={getAvailableRouteAdmins().length === 0}
                          style={{
                            backgroundColor: getAvailableRouteAdmins().length === 0 ? '#6b7280' : '#8b5cf6',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            fontSize: '0.875rem',
                            cursor: getAvailableRouteAdmins().length === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <UserPlusIcon width={14} height={14} />
                          Assign Admin
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRoute(route);
                    }}
                    style={{
                      backgroundColor: '#374151',
                      color: '#f9fafb',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <EyeIcon width={14} height={14} />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {routes.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#94a3b8'
            }}>
              <MapIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No route applications found for the selected filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Route Details Modal */}
      {selectedRoute && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                margin: 0
              }}>
                {selectedRoute.name} - Route Details
              </h3>
              <button
                onClick={() => setSelectedRoute(null)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem'
            }}>
              <div>
                <h4 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Route Information</h4>
                <div style={{
                  backgroundColor: '#334155',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Route ID:</span>
                    <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>{selectedRoute.routeId}</p>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Start Address:</span>
                    <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>{selectedRoute.startLocation.address}</p>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>End Address:</span>
                    <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>{selectedRoute.endLocation.address}</p>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Duration:</span>
                    <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>{formatDuration(selectedRoute.estimatedDuration)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Operator & Pricing</h4>
                <div style={{
                  backgroundColor: '#334155',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Contact:</span>
                    <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>{selectedRoute.operatorInfo.contactNumber}</p>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Price per KM:</span>
                    <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>{formatCurrency(selectedRoute.pricing.pricePerKm)}</p>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Amenities:</span>
                    <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>
                      {selectedRoute.vehicleInfo.amenities.length > 0 
                        ? selectedRoute.vehicleInfo.amenities.join(', ')
                        : 'None specified'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW: Route admin section */}
            {hasRouteAdmin(selectedRoute) && (
              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginTop: '1rem'
              }}>
                <h4 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Route Administrator</h4>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ color: '#f1f5f9', margin: 0, fontWeight: '600' }}>
                      {selectedRoute.routeAdminId?.name}
                    </p>
                    <p style={{ color: '#94a3b8', margin: '0.25rem 0', fontSize: '0.875rem' }}>
                      {selectedRoute.routeAdminId?.email}
                    </p>
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.75rem' }}>
                      Assigned: {formatDateTime(selectedRoute.routeAdminAssignment?.assignedAt || '')}
                    </p>
                  </div>
                  <div style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    ASSIGNED
                  </div>
                </div>
              </div>
            )}

            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => setSelectedRoute(null)}
                style={{
                  backgroundColor: '#374151',
                  color: '#f9fafb',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{
              color: '#f1f5f9',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Approve Route Application
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
              Are you sure you want to approve the route <strong>{showApprovalModal.name}</strong>?
            </p>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Optional notes (visible to fleet operator)..."
              style={{
                width: '100%',
                height: '80px',
                backgroundColor: '#334155',
                border: '1px solid #475569',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                color: '#f1f5f9',
                resize: 'vertical',
                marginBottom: '1.5rem'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => {
                  setShowApprovalModal(null);
                  setApprovalNotes('');
                }}
                style={{
                  backgroundColor: '#374151',
                  color: '#f9fafb',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveRoute(showApprovalModal._id)}
                disabled={actionLoading === `approve-${showApprovalModal._id}`}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  opacity: actionLoading === `approve-${showApprovalModal._id}` ? 0.7 : 1
                }}
              >
                {actionLoading === `approve-${showApprovalModal._id}` ? 'Approving...' : 'Approve Route'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{
              color: '#f1f5f9',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Reject Route Application
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
              Please provide a reason for rejecting <strong>{showRejectionModal.name}</strong>:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              style={{
                width: '100%',
                height: '100px',
                backgroundColor: '#334155',
                border: '1px solid #475569',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                color: '#f1f5f9',
                resize: 'vertical',
                marginBottom: '1.5rem'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => {
                  setShowRejectionModal(null);
                  setRejectionReason('');
                }}
                style={{
                  backgroundColor: '#374151',
                  color: '#f9fafb',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectRoute(showRejectionModal._id, rejectionReason)}
                disabled={!rejectionReason.trim() || actionLoading === `reject-${showRejectionModal._id}`}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: !rejectionReason.trim() ? 'not-allowed' : 'pointer',
                  opacity: (!rejectionReason.trim() || actionLoading === `reject-${showRejectionModal._id}`) ? 0.7 : 1
                }}
              >
                {actionLoading === `reject-${showRejectionModal._id}` ? 'Rejecting...' : 'Reject Route'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Route Admin Assignment Modal */}
      {showRouteAdminModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{
              color: '#f1f5f9',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Assign Route Admin
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
              Select a route admin to manage <strong>{showRouteAdminModal.name}</strong>:
            </p>
            
            <select
              value={selectedRouteAdminId}
              onChange={(e) => setSelectedRouteAdminId(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#334155',
                border: '1px solid #475569',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                color: '#f1f5f9',
                marginBottom: '1.5rem'
              }}
            >
              <option value="">Select Route Admin</option>
              {getAvailableRouteAdmins().map((admin) => (
                <option key={admin._id} value={admin._id}>
                  {admin.name} ({admin.email})
                </option>
              ))}
            </select>

            {getAvailableRouteAdmins().length === 0 && (
              <div style={{
                backgroundColor: '#7c2d12',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <p style={{ color: '#fed7a1', margin: 0, fontSize: '0.875rem' }}>
                  No available route admins. All route admins are currently assigned to routes.
                </p>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => {
                  setShowRouteAdminModal(null);
                  setSelectedRouteAdminId('');
                }}
                style={{
                  backgroundColor: '#374151',
                  color: '#f9fafb',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignRouteAdmin(showRouteAdminModal._id, selectedRouteAdminId)}
                disabled={!selectedRouteAdminId || actionLoading === `assign-admin-${showRouteAdminModal._id}`}
                style={{
                  backgroundColor: !selectedRouteAdminId ? '#6b7280' : '#8b5cf6',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: !selectedRouteAdminId ? 'not-allowed' : 'pointer',
                  opacity: actionLoading === `assign-admin-${showRouteAdminModal._id}` ? 0.7 : 1
                }}
              >
                {actionLoading === `assign-admin-${showRouteAdminModal._id}` ? 'Assigning...' : 'Assign Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Create Route Admin Modal */}
      {showCreateRouteAdminModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{
              color: '#f1f5f9',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Create Route Admin
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                value={newRouteAdmin.name}
                onChange={(e) => setNewRouteAdmin(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#f1f5f9'
                }}
                placeholder="Enter full name"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                Email Address *
              </label>
              <input
                type="email"
                value={newRouteAdmin.email}
                onChange={(e) => setNewRouteAdmin(prev => ({ ...prev, email: e.target.value }))}
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#f1f5f9'
                }}
                placeholder="Enter email address"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                Password *
              </label>
              <input
                type="password"
                value={newRouteAdmin.password}
                onChange={(e) => setNewRouteAdmin(prev => ({ ...prev, password: e.target.value }))}
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#f1f5f9'
                }}
                placeholder="Enter password"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                Phone Number
              </label>
              <input
                type="text"
                value={newRouteAdmin.phone}
                onChange={(e) => setNewRouteAdmin(prev => ({ ...prev, phone: e.target.value }))}
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#f1f5f9'
                }}
                placeholder="Enter phone number"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                Assign to Route (Optional)
              </label>
              <select
                value={newRouteAdmin.routeId}
                onChange={(e) => setNewRouteAdmin(prev => ({ ...prev, routeId: e.target.value }))}
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#f1f5f9'
                }}
              >
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

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => {
                  setShowCreateRouteAdminModal(false);
                  setNewRouteAdmin({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    routeId: ''
                  });
                }}
                style={{
                  backgroundColor: '#374151',
                  color: '#f9fafb',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRouteAdmin}
                disabled={!newRouteAdmin.name || !newRouteAdmin.email || !newRouteAdmin.password || actionLoading === 'create-route-admin'}
                style={{
                  backgroundColor: (!newRouteAdmin.name || !newRouteAdmin.email || !newRouteAdmin.password) ? '#6b7280' : '#8b5cf6',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: (!newRouteAdmin.name || !newRouteAdmin.email || !newRouteAdmin.password) ? 'not-allowed' : 'pointer',
                  opacity: actionLoading === 'create-route-admin' ? 0.7 : 1
                }}
              >
                {actionLoading === 'create-route-admin' ? 'Creating...' : 'Create Route Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}