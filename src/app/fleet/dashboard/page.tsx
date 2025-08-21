// src/app/fleet/dashboard/page.tsx - Fleet Manager Dashboard
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface FleetStats {
  fleetStatus: string;
  complianceScore: number;
  totalVehicles: number;
  activeVehicles: number;
  operatingRoutes: number;
  totalRoutes: number;
  onlineVehicles: number;
  maintenanceVehicles: number;
}

interface Fleet {
  _id: string;
  companyName: string;
  status: string;
  complianceScore: number;
  totalVehicles: number;
  activeVehicles: number;
}

interface DashboardData {
  fleet: Fleet;
  stats: FleetStats;
  routes: any[];
  vehicles: any[];
  alerts: any[];
}

export default function FleetDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/fleet/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load dashboard');
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Dashboard error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'suspended': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon width={20} height={20} />;
      case 'pending': return <ClockIcon width={20} height={20} />;
      case 'rejected': return <ExclamationTriangleIcon width={20} height={20} />;
      case 'suspended': return <ExclamationTriangleIcon width={20} height={20} />;
      default: return <ClockIcon width={20} height={20} />;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
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
        Loading fleet dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#ef4444'
      }}>
        Error: {error}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9'
      }}>
        No fleet data found
      </div>
    );
  }

  const { fleet, stats } = dashboardData;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#f1f5f9',
                margin: '0 0 0.5rem 0'
              }}>
                {fleet.companyName}
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ color: getStatusColor(fleet.status) }}>
                  {getStatusIcon(fleet.status)}
                </span>
                <span style={{
                  color: getStatusColor(fleet.status),
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  Fleet Status: {fleet.status}
                </span>
              </div>
            </div>

            {fleet.status === 'approved' && (
              <Link
                href="/fleet/vehicles/add"
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                <PlusIcon width={20} height={20} />
                Add Vehicle
              </Link>
            )}
          </div>

          {/* Fleet Status Alert */}
          {fleet.status !== 'approved' && (
            <div style={{
              backgroundColor: fleet.status === 'pending' ? '#92400e' : '#7f1d1d',
              border: `1px solid ${fleet.status === 'pending' ? '#b45309' : '#991b1b'}`,
              borderRadius: '0.5rem',
              padding: '1rem',
              marginTop: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <ExclamationTriangleIcon width={20} height={20} color="#fbbf24" />
                <span style={{ color: '#fbbf24', fontWeight: '600' }}>
                  {fleet.status === 'pending' ? 'Application Under Review' : 'Fleet Suspended'}
                </span>
              </div>
              <p style={{ color: '#fcd34d', margin: 0, fontSize: '0.875rem' }}>
                {fleet.status === 'pending' 
                  ? 'Your fleet application is currently being reviewed by our team. You will be notified once approved.'
                  : 'Your fleet has been suspended. Please contact support for more information.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Statistics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Compliance Score */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Compliance Score</span>
                <span style={{
                  color: getComplianceColor(fleet.complianceScore),
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {fleet.complianceScore}%
                </span>
              </div>
              <div style={{
                backgroundColor: '#334155',
                borderRadius: '0.5rem',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: getComplianceColor(fleet.complianceScore),
                  height: '100%',
                  width: `${fleet.complianceScore}%`,
                  borderRadius: '0.5rem',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>
              {fleet.complianceScore >= 90 ? 'Excellent compliance' : 
               fleet.complianceScore >= 70 ? 'Good compliance' : 
               'Needs improvement'}
            </p>
          </div>

          {/* Total Vehicles */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <TruckIcon width={32} height={32} color="#3b82f6" />
              <div>
                <h3 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats.totalVehicles}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Total Vehicles</p>
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
              <CheckCircleIcon width={32} height={32} color="#10b981" />
              <div>
                <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats.activeVehicles}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Active Vehicles</p>
              </div>
            </div>
          </div>

          {/* Online Vehicles */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'white'
                }} />
              </div>
              <div>
                <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats.onlineVehicles}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Online Now</p>
              </div>
            </div>
          </div>

          {/* Routes */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <MapIcon width={32} height={32} color="#f59e0b" />
              <div>
                <h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats.totalRoutes}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Active Routes</p>
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CogIcon width={32} height={32} color="#ef4444" />
              <div>
                <h3 style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats.maintenanceVehicles}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>In Maintenance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '2rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155',
          marginBottom: '2rem'
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
            <Link href="/fleet/vehicles" style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <TruckIcon width={24} height={24} />
              Manage Vehicles
            </Link>

            <Link href="/fleet/routes" style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <MapIcon width={24} height={24} />
              View Routes
            </Link>

            <Link href="/fleet/analytics" style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ChartBarIcon width={24} height={24} />
              View Analytics
            </Link>

            <Link href="/fleet/profile" style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CogIcon width={24} height={24} />
              Update Profile
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
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
            Fleet Overview
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Fleet Status Summary */}
            <div style={{
              backgroundColor: '#334155',
              padding: '1.5rem',
              borderRadius: '0.5rem'
            }}>
              <h3 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Fleet Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Company Status:</span>
                  <span style={{ color: getStatusColor(fleet.status), textTransform: 'capitalize' }}>
                    {fleet.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Vehicle Utilization:</span>
                  <span style={{ color: '#f1f5f9' }}>
                    {Math.round((stats.activeVehicles / stats.totalVehicles) * 100)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Online Vehicles:</span>
                  <span style={{ color: '#10b981' }}>
                    {stats.onlineVehicles}/{stats.totalVehicles}
                  </span>
                </div>
              </div>
            </div>

            {/* Alerts & Notifications */}
            <div style={{
              backgroundColor: '#334155',
              padding: '1.5rem',
              borderRadius: '0.5rem'
            }}>
              <h3 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Alerts & Notifications</h3>
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>
                No active alerts
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}