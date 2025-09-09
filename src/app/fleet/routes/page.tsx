// src/app/fleet/routes/page.tsx - Fleet Route Assignment Management (UPDATED FOR ROUTE ADMIN SUPPORT)
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapIcon,
  TruckIcon,
  PlusIcon,
  MinusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import AnimatedBackground from '@/app/fleet/components/AnimatedBackground';

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
  vehicleInfo: {
    type: 'bus' | 'train';
    capacity: number;
    amenities: string[];
  };
  pricing: {
    basePrice: number;
    pricePerKm: number;
  };
  assignedVehicles?: number; // Count of assigned vehicles
}

interface Vehicle {
  _id: string;
  vehicleNumber: string;
  vehicleType: string;
  status: 'online' | 'offline' | 'maintenance';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  fleetId: {
    _id: string;
    companyName: string;
    contactNumber: string;
  };
  assignedRoutes?: string[];
}

interface RouteAssignment {
  _id: string;
  routeId: {
    _id: string;
    name: string;
    routeId: string;
    startLocation: { name: string };
    endLocation: { name: string };
  };
  vehicleId: {
    _id: string;
    vehicleNumber: string;
    vehicleType: string;
    status: string;
  };
  fleetId: {
    _id: string;
    companyName: string;
    contactNumber: string;
  };
  assignedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
}

// NEW: User role type
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'customer_service' | 'route_admin' | 'company_admin' | 'system_admin';
}

export default function FleetRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assignments, setAssignments] = useState<RouteAssignment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<Route | null>(null);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);

  // Theme styles matching admin dashboard
  const currentThemeStyles = {
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
    alertBg: 'rgba(51, 65, 85, 0.6)'
  };

  // Get current user info
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        }
      } catch (error) {
        console.error('Error getting user info:', error);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // NEW: Different API endpoints based on user role
        if (user.role === 'route_admin') {
          // Route admins use the route admin API
          await loadRouteAdminData(headers);
        } else {
          // Fleet managers use the fleet API
          await loadFleetData(headers);
        }
      } catch (error) {
        console.error('Load data error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // NEW: Load data for route admin
  const loadRouteAdminData = async (headers: any) => {
    // Get route admin dashboard
    const dashboardResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/dashboard`, {
      headers
    });
    
    if (!dashboardResponse.ok) {
      throw new Error('Failed to load route admin dashboard');
    }
    const dashboardData = await dashboardResponse.json();

    if (!dashboardData.hasAssignedRoute) {
      setError('No route has been assigned to you. Please contact system administrator.');
      return;
    }

    // Set route admin's assigned route
    setRoutes([dashboardData.assignedRoute]);

    // Get available vehicles from all fleets
    const vehiclesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/available-vehicles`, {
      headers
    });
    
    if (vehiclesResponse.ok) {
      const vehiclesData = await vehiclesResponse.json();
      // Flatten vehicles from all fleets
      const allVehicles = vehiclesData.availableFleets?.reduce((acc: Vehicle[], fleetData: any) => {
        return acc.concat(fleetData.vehicles.map((vehicle: any) => ({
          ...vehicle,
          fleetId: fleetData.fleet
        })));
      }, []) || [];
      setVehicles(allVehicles);
    }

    // Get current route assignments
    const assignmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/assignments`, {
      headers
    });
    
    if (assignmentsResponse.ok) {
      const assignmentsData = await assignmentsResponse.json();
      setAssignments(assignmentsData.assignments || []);
    }
  };

  // Original: Load data for fleet manager
  const loadFleetData = async (headers: any) => {
    // Load available routes (admin-created, approved routes)
    const routesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/routes/available`, {
      headers
    });
    
    if (!routesResponse.ok) {
      throw new Error('Failed to load available routes');
    }
    const routesData = await routesResponse.json();

    // Load approved vehicles for assignment
    const vehiclesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/vehicles`, {
      headers
    });
    
    if (!vehiclesResponse.ok) {
      throw new Error('Failed to load vehicles');
    }
    const vehiclesData = await vehiclesResponse.json();

    // Load current route assignments
    const assignmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/route-assignments`, {
      headers
    });
    
    if (!assignmentsResponse.ok) {
      throw new Error('Failed to load assignments');
    }
    const assignmentsData = await assignmentsResponse.json();

    setRoutes(routesData.routes || []);
    setVehicles(vehiclesData.vehicles?.filter((v: Vehicle) => v.approvalStatus === 'approved') || []);
    setAssignments(assignmentsData.assignments || []);
  };

  const getRouteAssignments = (routeId: string) => {
    // For route admins, show all assignments for approval
    if (user?.role === 'route_admin') {
      return assignments.filter(a => a.routeId._id === routeId && a.status !== 'rejected');
    }
    // For fleet managers, show only approved/active assignments
    return assignments.filter(a => a.routeId._id === routeId && (a.status === 'approved' || a.status === 'active'));
  };

  const getPendingAssignments = (routeId: string) => {
    return assignments.filter(a => a.routeId._id === routeId && a.status === 'pending');
  };

  const getAvailableVehiclesForRoute = (route: Route) => {
    return vehicles.filter(v => 
      v.approvalStatus === 'approved' && 
      v.vehicleType === route.vehicleInfo.type && 
      v.status !== 'maintenance'
    );
  };

  const handleAssignVehicles = async (routeId: string, vehicleIds: string[]) => {
    setActionLoading(`assign-${routeId}`);
    
    try {
      const token = localStorage.getItem('token');
      
      // NEW: Different endpoints based on user role
      const endpoint = user?.role === 'route_admin' 
        ? '/api/route-admin/assign-vehicles'
        : '/api/fleet/route-assignments';

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          routeId,
          vehicleIds
        })
      });

      if (!response.ok) {
        throw new Error('Failed to assign vehicles');
      }

      const result = await response.json();

      // Update assignments state
      // Fleet manager assignments start as 'pending', Route admin assignments start as 'approved'
      const newAssignments = result.assignments.map((assignment: any) => ({
        ...assignment,
        status: user?.role === 'route_admin' ? 'approved' : 'pending'
      }));
      setAssignments(prev => [...prev, ...newAssignments]);
      setShowAssignModal(null);
      setSelectedVehicleIds([]);
    } catch (error) {
      console.error('Assign vehicles error:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign vehicles');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnassignVehicle = async (routeId: string, vehicleId: string, assignmentId?: string) => {
    setActionLoading(`unassign-${vehicleId}`);
    
    try {
      const token = localStorage.getItem('token');
      
      // NEW: Different endpoints based on user role
      let endpoint;
      if (user?.role === 'route_admin') {
        endpoint = `/api/route-admin/assignments/${assignmentId || 'unknown'}`;
      } else {
        endpoint = `/api/fleet/route-assignments/${routeId}/${vehicleId}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to unassign vehicle');
      }

      setAssignments(prev => 
        prev.filter(a => !(a.routeId._id === routeId && a.vehicleId._id === vehicleId))
      );
    } catch (error) {
      console.error('Unassign vehicle error:', error);
      setError(error instanceof Error ? error.message : 'Failed to unassign vehicle');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveAssignment = async (assignmentId: string) => {
    setActionLoading(`approve-${assignmentId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/assignments/${assignmentId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve assignment');
      }

      setAssignments(prev => 
        prev.map(a => a._id === assignmentId ? { ...a, status: 'approved' } : a)
      );
    } catch (error) {
      console.error('Approve assignment error:', error);
      setError(error instanceof Error ? error.message : 'Failed to approve assignment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAssignment = async (assignmentId: string) => {
    setActionLoading(`reject-${assignmentId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/assignments/${assignmentId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject assignment');
      }

      setAssignments(prev => 
        prev.map(a => a._id === assignmentId ? { ...a, status: 'rejected' } : a)
      );
    } catch (error) {
      console.error('Reject assignment error:', error);
      setError(error instanceof Error ? error.message : 'Failed to reject assignment');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number) => `LKR ${amount.toFixed(2)}`;
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getPageTitle = () => {
    if (user?.role === 'route_admin') {
      return 'Route Management';
    }
    return 'Route Assignments';
  };

  const getPageDescription = () => {
    if (user?.role === 'route_admin') {
      return 'Manage your assigned route and assign vehicles from multiple fleets';
    }
    return 'Assign your approved vehicles to available routes';
  };

  const getVehicleCountDescription = () => {
    if (user?.role === 'route_admin') {
      return 'Available Vehicles (All Fleets)';
    }
    return 'Approved Vehicles';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: currentThemeStyles.mainBg,
        color: currentThemeStyles.textPrimary
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #374151', 
            borderTop: '4px solid #10b981', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite', 
            margin: '0 auto 1rem' 
          }}></div>
          Loading routes and vehicles...
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const approvedVehicles = vehicles.filter(v => v.approvalStatus === 'approved');

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: currentThemeStyles.mainBg, 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />
      
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          backgroundColor: currentThemeStyles.glassPanelBg,
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: currentThemeStyles.glassPanelShadow,
          backdropFilter: 'blur(12px)',
          border: currentThemeStyles.glassPanelBorder
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <MapIcon width={32} height={32} color="#10b981" />
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: currentThemeStyles.textPrimary,
                margin: 0
              }}>
                {getPageTitle()}
              </h1>
              {/* NEW: Role indicator */}
              <div style={{
                backgroundColor: user?.role === 'route_admin' ? '#8b5cf6' : '#10b981',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                marginLeft: '0.5rem'
              }}>
                {user?.role === 'route_admin' ? 'Route Admin' : 'Fleet Manager'}
              </div>
            </div>
            <p style={{
              color: currentThemeStyles.textSecondary,
              margin: 0,
              fontSize: '1rem'
            }}>
              {getPageDescription()}
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}>
            {user?.role !== 'route_admin' && (
              <Link href="/fleet/vehicles" style={{
                backgroundColor: '#374151',
                color: '#f9fafb',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}>
                <TruckIcon width={20} height={20} />
                Manage Vehicles
              </Link>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(127, 29, 29, 0.8)',
            border: '1px solid #991b1b',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backdropFilter: 'blur(12px)'
          }}>
            <ExclamationTriangleIcon width={20} height={20} color="#fca5a5" />
            <span style={{ color: '#fecaca' }}>{error}</span>
          </div>
        )}

        {/* Fleet Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <MapIcon width={32} height={32} color="#3b82f6" />
              <div>
                <h3 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {routes.length}
                </h3>
                <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0' }}>
                  {user?.role === 'route_admin' ? 'Assigned Route' : 'Available Routes'}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckCircleIcon width={32} height={32} color="#10b981" />
              <div>
                <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {approvedVehicles.length}
                </h3>
                <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0' }}>
                  {getVehicleCountDescription()}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <TruckIcon width={32} height={32} color="#f59e0b" />
              <div>
                <h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {user?.role === 'route_admin' 
                    ? assignments.filter(a => a.status === 'pending').length
                    : assignments.filter(a => a.status === 'approved' || a.status === 'active').length
                  }
                </h3>
                <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0' }}>
                  {user?.role === 'route_admin' ? 'Pending Approvals' : 'Approved Assignments'}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <BuildingOfficeIcon width={32} height={32} color="#8b5cf6" />
              <div>
                <h3 style={{ color: '#8b5cf6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {vehicles.filter(v => v.status === 'online').length}
                </h3>
                <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0' }}>Vehicles Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Information Box for Route Admin */}
        {user?.role === 'route_admin' && approvedVehicles.length === 0 && (
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            border: currentThemeStyles.glassPanelBorder,
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <UserIcon width={24} height={24} color="#8b5cf6" />
              <h3 style={{ color: '#8b5cf6', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                No Vehicles Available for Assignment
              </h3>
            </div>
            <p style={{ color: currentThemeStyles.textSecondary, margin: '0 0 1rem 0' }}>
              As a Route Admin, you can assign vehicles from ANY approved fleet to your route. Currently, there are no available vehicles that match your route's requirements.
            </p>
            <ul style={{ color: currentThemeStyles.textSecondary, margin: 0, paddingLeft: '1.5rem' }}>
              <li>All compatible vehicles may already be assigned to other routes</li>
              <li>Fleet operators need to add more vehicles of type: {routes[0]?.vehicleInfo?.type}</li>
              <li>Vehicles need admin approval before they can be assigned</li>
            </ul>
          </div>
        )}

        {/* Information Box for Fleet Manager */}
        {user?.role !== 'route_admin' && approvedVehicles.length === 0 && (
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            border: currentThemeStyles.glassPanelBorder,
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <InformationCircleIcon width={24} height={24} color="#3b82f6" />
              <h3 style={{ color: '#3b82f6', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                No Approved Vehicles Available
              </h3>
            </div>
            <p style={{ color: currentThemeStyles.textSecondary, margin: '0 0 1rem 0' }}>
              You need approved vehicles before you can assign them to routes. Make sure you have:
            </p>
            <ul style={{ color: currentThemeStyles.textSecondary, margin: 0, paddingLeft: '1.5rem' }}>
              <li>Added vehicles to your fleet</li>
              <li>Received admin approval for your vehicles</li>
              <li>Vehicles are in working condition (not in maintenance)</li>
            </ul>
            <div style={{ marginTop: '1rem' }}>
              <Link href="/fleet/vehicles/add" style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}>
                <PlusIcon width={16} height={16} />
                Add Vehicle
              </Link>
            </div>
          </div>
        )}

        {/* Available Routes */}
        <div style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          padding: '2rem',
          borderRadius: '0.75rem',
          border: currentThemeStyles.glassPanelBorder,
          boxShadow: currentThemeStyles.glassPanelShadow,
          backdropFilter: 'blur(12px)'
        }}>
          <h2 style={{
            color: currentThemeStyles.textPrimary,
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <MapIcon width={20} height={20} />
            {user?.role === 'route_admin' ? `Your Assigned Route (${routes.length})` : `Available Routes (${routes.length})`}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '1.5rem'
          }}>
            {routes.map((route) => {
              const routeAssignments = getRouteAssignments(route._id);
              const assignedVehicles = routeAssignments.map(a => a.vehicleId);
              const availableVehicles = getAvailableVehiclesForRoute(route);
              
              return (
                <div key={route._id} style={{
                  backgroundColor: 'rgba(51, 65, 85, 0.8)',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  backdropFilter: 'blur(8px)'
                }}>
                  {/* Route Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        color: currentThemeStyles.textPrimary,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        margin: '0 0 0.5rem 0'
                      }}>
                        {route.name}
                      </h3>
                      <p style={{
                        color: currentThemeStyles.textSecondary,
                        fontSize: '0.875rem',
                        margin: 0
                      }}>
                        {route.startLocation.name} → {route.endLocation.name}
                      </p>
                    </div>
                    
                    <div style={{
                      backgroundColor: route.vehicleInfo.type === 'bus' ? '#10b981' : '#6b7280',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      marginLeft: '1rem'
                    }}>
                      {route.vehicleInfo.type}
                    </div>
                  </div>

                  {/* NEW: Route admin indicator */}
                  {user?.role === 'route_admin' && (
                    <div style={{
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <UserIcon width={16} height={16} />
                      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                        You are the Route Administrator for this route
                      </span>
                    </div>
                  )}

                  {/* Route Details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1rem',
                    padding: '1rem',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    borderRadius: '0.5rem',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        color: currentThemeStyles.textPrimary,
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '0.25rem'
                      }}>
                        {route.distance} km
                      </div>
                      <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>Distance</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        color: currentThemeStyles.textPrimary,
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '0.25rem'
                      }}>
                        {formatDuration(route.estimatedDuration)}
                      </div>
                      <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>Duration</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        color: currentThemeStyles.textPrimary,
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '0.25rem'
                      }}>
                        {route.vehicleInfo.capacity} seats
                      </div>
                      <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>Capacity</div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>Base Price: </span>
                        <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: '600' }}>
                          {formatCurrency(route.pricing.basePrice)}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>Per KM: </span>
                        <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: '600' }}>
                          {formatCurrency(route.pricing.pricePerKm)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Vehicles */}
                  <div style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: assignedVehicles.length > 0 ? '1rem' : 0
                    }}>
                      <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem', fontWeight: '500' }}>
                        Assigned Vehicles ({assignedVehicles.length})
                      </span>
                    </div>
                    
                    {assignedVehicles.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {routeAssignments.map((assignment) => {
                          const vehicle = assignment.vehicleId;
                          const getStatusColor = (status: string) => {
                            switch (status) {
                              case 'pending': return '#f59e0b';
                              case 'approved': return '#10b981';
                              case 'active': return '#3b82f6';
                              case 'rejected': return '#ef4444';
                              default: return '#6b7280';
                            }
                          };
                          
                          const getStatusText = (status: string) => {
                            switch (status) {
                              case 'pending': return 'Pending Approval';
                              case 'approved': return 'Approved';
                              case 'active': return 'Active';
                              case 'rejected': return 'Rejected';
                              default: return status;
                            }
                          };

                          return (
                            <div key={assignment._id} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              backgroundColor: 'rgba(51, 65, 85, 0.8)',
                              padding: '0.75rem',
                              borderRadius: '0.5rem',
                              backdropFilter: 'blur(8px)',
                              border: assignment.status === 'pending' ? '1px solid #f59e0b' : 'none'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                <div style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: vehicle.status === 'online' ? '#10b981' : '#6b7280'
                                }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: '500' }}>
                                    {vehicle.vehicleNumber}
                                  </div>
                                  {/* Show fleet info for route admin */}
                                  {user?.role === 'route_admin' && assignment?.fleetId && (
                                    <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>
                                      Fleet: {assignment.fleetId.companyName}
                                    </div>
                                  )}
                                  <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>
                                    Vehicle: {vehicle.status} | Assignment: <span style={{ color: getStatusColor(assignment.status) }}>
                                      {getStatusText(assignment.status)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                {/* Route Admin approval buttons */}
                                {user?.role === 'route_admin' && assignment.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveAssignment(assignment._id)}
                                      disabled={actionLoading === `approve-${assignment._id}`}
                                      style={{
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        padding: '0.25rem 0.5rem',
                                        border: 'none',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        opacity: actionLoading === `approve-${assignment._id}` ? 0.7 : 1
                                      }}
                                    >
                                      <CheckCircleIcon width={12} height={12} />
                                      {actionLoading === `approve-${assignment._id}` ? 'Approving...' : 'Approve'}
                                    </button>
                                    <button
                                      onClick={() => handleRejectAssignment(assignment._id)}
                                      disabled={actionLoading === `reject-${assignment._id}`}
                                      style={{
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        padding: '0.25rem 0.5rem',
                                        border: 'none',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        opacity: actionLoading === `reject-${assignment._id}` ? 0.7 : 1
                                      }}
                                    >
                                      <MinusIcon width={12} height={12} />
                                      {actionLoading === `reject-${assignment._id}` ? 'Rejecting...' : 'Reject'}
                                    </button>
                                  </>
                                )}
                                
                                {/* Remove button for approved assignments */}
                                {(assignment.status === 'approved' || assignment.status === 'active') && (
                                  <button
                                    onClick={() => handleUnassignVehicle(route._id, vehicle._id, assignment._id)}
                                    disabled={actionLoading === `unassign-${vehicle._id}`}
                                    style={{
                                      backgroundColor: '#ef4444',
                                      color: 'white',
                                      padding: '0.25rem 0.5rem',
                                      border: 'none',
                                      borderRadius: '0.25rem',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      opacity: actionLoading === `unassign-${vehicle._id}` ? 0.7 : 1
                                    }}
                                  >
                                    <MinusIcon width={12} height={12} />
                                    {actionLoading === `unassign-${vehicle._id}` ? 'Removing...' : 'Remove'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0, textAlign: 'center' }}>
                        No vehicles assigned to this route
                      </p>
                    )}
                  </div>

                  {/* Amenities */}
                  {route.vehicleInfo.amenities.length > 0 && (
                    <div style={{
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      backdropFilter: 'blur(8px)'
                    }}>
                      <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>
                        Required Amenities:
                      </span>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        {route.vehicleInfo.amenities.map((amenity, index) => (
                          <span key={index} style={{
                            backgroundColor: 'rgba(51, 65, 85, 0.8)',
                            color: currentThemeStyles.textPrimary,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            backdropFilter: 'blur(8px)'
                          }}>
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={() => setSelectedRoute(route)}
                      style={{
                        backgroundColor: '#374151',
                        color: '#f9fafb',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flex: 1
                      }}
                    >
                      <InformationCircleIcon width={16} height={16} />
                      View Details
                    </button>
                    
                    {availableVehicles.length > 0 && (
                      <button
                        onClick={() => {
                          setShowAssignModal(route);
                          setSelectedVehicleIds([]);
                        }}
                        disabled={actionLoading === `assign-${route._id}`}
                        style={{
                          backgroundColor: actionLoading === `assign-${route._id}` ? '#4b5563' : '#10b981',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          border: 'none',
                          fontSize: '0.875rem',
                          cursor: actionLoading === `assign-${route._id}` ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flex: 1
                        }}
                      >
                        <PlusIcon width={16} height={16} />
                        {actionLoading === `assign-${route._id}` ? 'Assigning...' : 'Assign Vehicles'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {routes.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: currentThemeStyles.textSecondary
            }}>
              <MapIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              {user?.role === 'route_admin' ? (
                <>
                  <h3 style={{ color: currentThemeStyles.textPrimary, marginBottom: '0.5rem' }}>No Route Assigned</h3>
                  <p>You have not been assigned to manage any route yet.</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
                    Please contact the system administrator to have a route assigned to you.
                  </p>
                </>
              ) : (
                <>
                  <h3 style={{ color: currentThemeStyles.textPrimary, marginBottom: '0.5rem' }}>No Routes Available</h3>
                  <p>No approved routes are available for vehicle assignment at this time.</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
                    Routes are created by system administrators. Please contact admin if you need new routes.
                  </p>
                </>
              )}
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
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '2rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)',
            maxWidth: '600px',
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
                color: currentThemeStyles.textPrimary,
                fontSize: '1.25rem',
                fontWeight: 'bold',
                margin: 0
              }}>
                {selectedRoute.name}
              </h3>
              <button
                onClick={() => setSelectedRoute(null)}
                style={{
                  backgroundColor: 'transparent',
                  color: currentThemeStyles.textSecondary,
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
              gridTemplateColumns: '1fr',
              gap: '1.5rem'
            }}>
              <div style={{
                backgroundColor: 'rgba(51, 65, 85, 0.6)',
                padding: '1rem',
                borderRadius: '0.5rem',
                backdropFilter: 'blur(8px)'
              }}>
                <h4 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>Route Information</h4>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Route ID:</span>
                  <span style={{ color: currentThemeStyles.textPrimary, marginLeft: '0.5rem' }}>{selectedRoute.routeId}</span>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Start:</span>
                  <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                    {selectedRoute.startLocation.address}
                  </p>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>End:</span>
                  <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                    {selectedRoute.endLocation.address}
                  </p>
                </div>
              </div>
            </div>

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

      {/* Assign Vehicles Modal */}
      {showAssignModal && (
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
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '2rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Assign Vehicles to {showAssignModal.name}
            </h3>
            
            {/* NEW: Different messaging for route admin */}
            {user?.role === 'route_admin' && (
              <div style={{
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid #8b5cf6',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                marginBottom: '1rem'
              }}>
                <p style={{ color: '#c4b5fd', fontSize: '0.875rem', margin: 0 }}>
                  As Route Admin, you can assign vehicles from any approved fleet to your route.
                </p>
              </div>
            )}
            
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              marginBottom: '1.5rem'
            }}>
              {getAvailableVehiclesForRoute(showAssignModal)
                .filter(v => !getRouteAssignments(showAssignModal._id).some(a => a.vehicleId._id === v._id))
                .map((vehicle) => (
                <label key={vehicle._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(51, 65, 85, 0.6)',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedVehicleIds.includes(vehicle._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVehicleIds(prev => [...prev, vehicle._id]);
                      } else {
                        setSelectedVehicleIds(prev => prev.filter(id => id !== vehicle._id));
                      }
                    }}
                    style={{ accentColor: '#10b981' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: currentThemeStyles.textPrimary, fontWeight: '500' }}>
                      {vehicle.vehicleNumber}
                    </div>
                    <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>
                      {vehicle.vehicleType} • {vehicle.status}
                      {/* NEW: Show fleet info for route admin */}
                      {user?.role === 'route_admin' && vehicle.fleetId && (
                        <span> • Fleet: {vehicle.fleetId.companyName}</span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: vehicle.status === 'online' ? '#10b981' : '#6b7280'
                  }} />
                </label>
              ))}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => {
                  setShowAssignModal(null);
                  setSelectedVehicleIds([]);
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
                onClick={() => handleAssignVehicles(showAssignModal._id, selectedVehicleIds)}
                disabled={selectedVehicleIds.length === 0 || actionLoading === `assign-${showAssignModal._id}`}
                style={{
                  backgroundColor: selectedVehicleIds.length === 0 ? '#4b5563' : '#10b981',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: selectedVehicleIds.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: actionLoading === `assign-${showAssignModal._id}` ? 0.7 : 1
                }}
              >
                {actionLoading === `assign-${showAssignModal._id}` ? 'Assigning...' : `Assign ${selectedVehicleIds.length} Vehicle${selectedVehicleIds.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}