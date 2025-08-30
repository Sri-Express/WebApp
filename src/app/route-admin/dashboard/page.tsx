// src/app/route-admin/dashboard/page.tsx - Route Admin Dashboard
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapIcon,
  TruckIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Route {
  _id: string;
  routeId: string;
  name: string;
  startLocation: { name: string; address: string };
  endLocation: { name: string; address: string };
  distance: number;
  estimatedDuration: number;
  vehicleInfo: {
    type: string;
    capacity: number;
  };
  pricing: {
    basePrice: number;
    pricePerKm: number;
  };
}

interface Assignment {
  _id: string;
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
  status: string;
  assignedAt: string;
}

interface DashboardStats {
  assignedRoute: {
    name: string;
    routeId: string;
    distance: number;
    estimatedDuration: number;
  };
  vehicles: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  };
  fleets: {
    total: number;
    details: Array<{
      _id: string;
      companyName: string;
      vehicleCount: number;
      activeVehicles: number;
    }>;
  };
  performance: {
    totalTrips: number;
    totalRevenue: number;
    avgRating: number;
  };
}

export default function RouteAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [hasAssignedRoute, setHasAssignedRoute] = useState(false);
  const [assignedRoute, setAssignedRoute] = useState<Route | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }

      const data = await response.json();

      setHasAssignedRoute(data.hasAssignedRoute);
      if (data.hasAssignedRoute) {
        setAssignedRoute(data.assignedRoute);
        setAssignments(data.assignments || []);
        setStats(data.stats);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `LKR ${amount.toFixed(2)}`;
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        color: '#f1f5f9'
      }}>
        Loading dashboard...
      </div>
    );
  }

  if (!hasAssignedRoute || error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{
          backgroundColor: '#7c2d12',
          border: '1px solid #991b1b',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <ExclamationTriangleIcon width={48} height={48} color="#fed7a1" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: '#fed7a1', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            No Route Assigned
          </h2>
          <p style={{ color: '#fecaca', marginBottom: '1rem' }}>
            {error || 'You have not been assigned to manage any route yet.'}
          </p>
          <p style={{ color: '#fecaca', fontSize: '0.875rem' }}>
            Please contact the system administrator to have a route assigned to you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Welcome Header */}
      <div style={{
        backgroundColor: '#1e293b',
        padding: '2rem',
        borderRadius: '0.75rem',
        border: '1px solid #334155',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          color: '#f1f5f9',
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem'
        }}>
          Welcome to Route Administration
        </h1>
        <p style={{ color: '#94a3b8' }}>
          Managing route: <strong style={{ color: '#8b5cf6' }}>{assignedRoute?.name}</strong>
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Route Info */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <MapIcon width={32} height={32} color="#3b82f6" />
            <div>
              <h3 style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                {assignedRoute?.distance} km
              </h3>
              <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0' }}>Route Distance</p>
            </div>
          </div>
        </div>

        {/* Total Vehicles */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <TruckIcon width={32} height={32} color="#10b981" />
            <div>
              <h3 style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                {stats?.vehicles.total || 0}
              </h3>
              <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0' }}>Assigned Vehicles</p>
            </div>
          </div>
        </div>

        {/* Active Vehicles */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircleIcon width={32} height={32} color="#059669" />
            <div>
              <h3 style={{ color: '#059669', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                {stats?.vehicles.active || 0}
              </h3>
              <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0' }}>Active Vehicles</p>
            </div>
          </div>
        </div>

        {/* Fleet Count */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BuildingOfficeIcon width={32} height={32} color="#8b5cf6" />
            <div>
              <h3 style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                {stats?.fleets.total || 0}
              </h3>
              <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0' }}>Partner Fleets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Route Details & Recent Assignments */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Route Details */}
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
            Route Details
          </h2>

          {assignedRoute && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Route ID:</span>
                <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>{assignedRoute.routeId}</p>
              </div>

              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>From:</span>
                <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>{assignedRoute.startLocation.name}</p>
              </div>

              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>To:</span>
                <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>{assignedRoute.endLocation.name}</p>
              </div>

              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Duration:</span>
                <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>{formatDuration(assignedRoute.estimatedDuration)}</p>
              </div>

              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Vehicle Type:</span>
                <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0', textTransform: 'capitalize' }}>
                  {assignedRoute.vehicleInfo.type} ({assignedRoute.vehicleInfo.capacity} seats)
                </p>
              </div>

              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Base Price:</span>
                <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>
                  {formatCurrency(assignedRoute.pricing.basePrice)} + {formatCurrency(assignedRoute.pricing.pricePerKm)}/km
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Vehicle Assignments */}
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
            <TruckIcon width={20} height={20} />
            Recent Vehicle Assignments
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {assignments.length > 0 ? (
              assignments.slice(0, 5).map((assignment) => (
                <div key={assignment._id} style={{
                  backgroundColor: '#334155',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ color: '#f1f5f9', fontWeight: '500', margin: 0 }}>
                      {assignment.vehicleId.vehicleNumber}
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                      Fleet: {assignment.fleetId.companyName}
                    </p>
                  </div>
                  <div style={{
                    backgroundColor: assignment.vehicleId.status === 'online' ? '#059669' : '#6b7280',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {assignment.vehicleId.status}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
                No vehicles assigned yet
              </p>
            )}
          </div>

          {assignments.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <Link href="/route-admin/vehicles" style={{
                color: '#8b5cf6',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                View all assignments →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
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
          marginBottom: '1.5rem'
        }}>
          Quick Actions
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <Link href="/route-admin/vehicles" style={{
            backgroundColor: '#334155',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'background-color 0.2s ease-in-out'
          }}>
            <TruckIcon width={24} height={24} color="#10b981" />
            <div>
              <h3 style={{ color: '#f1f5f9', margin: 0, fontSize: '1rem' }}>Manage Vehicles</h3>
              <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                Assign or remove vehicles
              </p>
            </div>
          </Link>

          <Link href="/route-admin/analytics" style={{
            backgroundColor: '#334155',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'background-color 0.2s ease-in-out'
          }}>
            <ChartBarIcon width={24} height={24} color="#3b82f6" />
            <div>
              <h3 style={{ color: '#f1f5f9', margin: 0, fontSize: '1rem' }}>View Analytics</h3>
              <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                Route performance data
              </p>
            </div>
          </Link>

          <Link href="/route-admin/schedules" style={{
            backgroundColor: '#334155',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'background-color 0.2s ease-in-out'
          }}>
            <ClockIcon width={24} height={24} color="#f59e0b" />
            <div>
              <h3 style={{ color: '#f1f5f9', margin: 0, fontSize: '1rem' }}>Manage Schedules</h3>
              <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                Update route schedules
              </p>
            </div>
          </Link>

          <Link href="/route-admin/profile" style={{
            backgroundColor: '#334155',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'background-color 0.2s ease-in-out'
          }}>
            <UserIcon width={24} height={24} color="#8b5cf6" />
            <div>
              <h3 style={{ color: '#f1f5f9', margin: 0, fontSize: '1rem' }}>Profile Settings</h3>
              <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                Update your profile
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}