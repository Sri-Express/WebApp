// src/app/fleet/vehicles/page.tsx - Fleet Vehicle Management
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TruckIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  SignalIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';

interface Vehicle {
  _id: string;
  deviceId: string;
  vehicleNumber: string;
  vehicleType: string;
  status: 'online' | 'offline' | 'maintenance';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    lastUpdated: string;
  };
  batteryLevel: number;
  signalStrength: number;
  lastSeen: string;
  alerts: {
    count: number;
    messages: string[];
  };
}

interface VehicleStats {
  total: number;
  online: number;
  offline: number;
  maintenance: number;
}

export default function FleetVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/vehicles`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load vehicles');
        }

        const data = await response.json();
        setVehicles(data.vehicles || []);
        setStats(data.stats);
      } catch (error) {
        console.error('Load vehicles error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'offline': return '#6b7280';
      case 'maintenance': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircleIcon width={16} height={16} />;
      case 'offline': return <XCircleIcon width={16} height={16} />;
      case 'maintenance': return <CogIcon width={16} height={16} />;
      default: return <ExclamationTriangleIcon width={16} height={16} />;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return '#10b981';
    if (level > 20) return '#f59e0b';
    return '#ef4444';
  };

  const getSignalBars = (strength: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        style={{
          width: '3px',
          height: `${4 + i * 2}px`,
          backgroundColor: i < strength ? '#10b981' : '#374151',
          marginRight: '1px'
        }}
      />
    ));
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
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
        Loading vehicles...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#f1f5f9',
              margin: '0 0 0.5rem 0'
            }}>
              Vehicle Management
            </h1>
            <p style={{
              color: '#94a3b8',
              margin: 0
            }}>
              Monitor and manage your fleet vehicles
            </p>
          </div>
          
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
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#7f1d1d',
            border: '1px solid #991b1b',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            color: '#fecaca'
          }}>
            {error}
          </div>
        )}

        {/* Statistics */}
        {stats && (
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
                <TruckIcon width={32} height={32} color="#3b82f6" />
                <div>
                  <h3 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.total}
                  </h3>
                  <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Total Vehicles</p>
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
                    {stats.online}
                  </h3>
                  <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Online</p>
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
                <XCircleIcon width={32} height={32} color="#6b7280" />
                <div>
                  <h3 style={{ color: '#6b7280', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.offline}
                  </h3>
                  <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Offline</p>
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
                <CogIcon width={32} height={32} color="#f59e0b" />
                <div>
                  <h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.maintenance}
                  </h3>
                  <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Maintenance</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '1.5rem'
        }}>
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} style={{
              backgroundColor: '#1e293b',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #334155'
            }}>
              {/* Vehicle Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div>
                  <h3 style={{
                    color: '#f1f5f9',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {vehicle.vehicleNumber}
                  </h3>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    margin: 0,
                    textTransform: 'capitalize'
                  }}>
                    {vehicle.vehicleType}
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ color: getStatusColor(vehicle.status) }}>
                    {getStatusIcon(vehicle.status)}
                  </span>
                  <span style={{
                    color: getStatusColor(vehicle.status),
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {vehicle.status}
                  </span>
                </div>
              </div>

              {/* Vehicle Metrics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: '#334155',
                borderRadius: '0.5rem'
              }}>
                {/* Battery */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.25rem',
                    marginBottom: '0.5rem'
                  }}>
                    <Square3Stack3DIcon width={16} height={16} color={getBatteryColor(vehicle.batteryLevel)} />
                    <span style={{
                      color: getBatteryColor(vehicle.batteryLevel),
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {vehicle.batteryLevel}%
                    </span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Battery</div>
                </div>

                {/* Signal */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'end', gap: '1px' }}>
                      {getSignalBars(vehicle.signalStrength)}
                    </div>
                    <span style={{
                      color: '#f1f5f9',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {vehicle.signalStrength}/5
                    </span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Signal</div>
                </div>

                {/* Last Seen */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    color: '#f1f5f9',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    {formatLastSeen(vehicle.lastSeen)}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Last Seen</div>
                </div>
              </div>

              {/* Location */}
              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: vehicle.status === 'online' ? '#10b981' : '#6b7280'
                  }} />
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Current Location</span>
                </div>
                <p style={{ color: '#f1f5f9', fontSize: '0.875rem', margin: 0 }}>
                  {vehicle.location.address}
                </p>
              </div>

              {/* Alerts */}
              {vehicle.alerts.count > 0 && (
                <div style={{
                  backgroundColor: '#7f1d1d',
                  border: '1px solid #991b1b',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <ExclamationTriangleIcon width={16} height={16} color="#fca5a5" />
                    <span style={{ color: '#fca5a5', fontSize: '0.875rem', fontWeight: '600' }}>
                      {vehicle.alerts.count} Alert{vehicle.alerts.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {vehicle.alerts.messages.slice(0, 2).map((message, index) => (
                    <p key={index} style={{ color: '#fecaca', fontSize: '0.75rem', margin: '0.25rem 0' }}>
                      • {message}
                    </p>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
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
                  <EyeIcon width={16} height={16} />
                  View Details
                </button>
                
                <button
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
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
                  <PencilIcon width={16} height={16} />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {vehicles.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#1e293b',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <TruckIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5, color: '#94a3b8' }} />
            <h3 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>No vehicles found</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Add your first vehicle to start monitoring your fleet.
            </p>
            <Link
              href="/fleet/vehicles/add"
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <PlusIcon width={20} height={20} />
              Add Your First Vehicle
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}