// src/app/fleet/vehicles/page.tsx - Fleet Vehicle Management (UPDATED - View Details + No Edit)
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TruckIcon,
  PlusIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  SignalIcon,
  Square3Stack3DIcon,
  TrashIcon,
  ClockIcon,
  MapPinIcon,
  WifiIcon,
  BatteryIcon
} from '@heroicons/react/24/outline';

interface Vehicle {
  _id: string;
  deviceId: string;
  vehicleNumber: string;
  vehicleType: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
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
  firmwareVersion: string;
  installDate: string;
  createdAt: string;
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
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Vehicle | null>(null);

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

  const handleDeleteVehicle = async (vehicleId: string) => {
    setDeleteLoading(vehicleId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }

      // Remove vehicle from state
      setVehicles(prev => prev.filter(v => v._id !== vehicleId));
      setShowDeleteModal(null);
      
      // Update stats
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total: prev.total - 1,
          online: vehicles.find(v => v._id === vehicleId)?.status === 'online' ? prev.online - 1 : prev.online,
          offline: vehicles.find(v => v._id === vehicleId)?.status === 'offline' ? prev.offline - 1 : prev.offline,
          maintenance: vehicles.find(v => v._id === vehicleId)?.status === 'maintenance' ? prev.maintenance - 1 : prev.maintenance
        } : null);
      }
    } catch (error) {
      console.error('Delete vehicle error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete vehicle');
    } finally {
      setDeleteLoading(null);
    }
  };

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

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '0.5rem'
                }}>
                  {/* Approval Status */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      color: getApprovalStatusColor(vehicle.approvalStatus),
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {vehicle.approvalStatus}
                    </span>
                  </div>
                  
                  {/* Operational Status */}
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
                  onClick={() => setSelectedVehicle(vehicle)}
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
                
                {/* Only show delete button for pending or rejected vehicles */}
                {vehicle.approvalStatus !== 'approved' && (
                  <button
                    onClick={() => setShowDeleteModal(vehicle)}
                    disabled={deleteLoading === vehicle._id}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      fontSize: '0.875rem',
                      cursor: deleteLoading === vehicle._id ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      opacity: deleteLoading === vehicle._id ? 0.7 : 1
                    }}
                  >
                    <TrashIcon width={16} height={16} />
                    {deleteLoading === vehicle._id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
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

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
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
              marginBottom: '2rem'
            }}>
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: 0
              }}>
                {selectedVehicle.vehicleNumber} Details
              </h3>
              <button
                onClick={() => setSelectedVehicle(null)}
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
              gap: '2rem'
            }}>
              {/* Vehicle Information */}
              <div>
                <h4 style={{ color: '#f1f5f9', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TruckIcon width={20} height={20} />
                  Vehicle Information
                </h4>
                <div style={{
                  backgroundColor: '#334155',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Vehicle Number:</span>
                    <span style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: '600' }}>{selectedVehicle.vehicleNumber}</span>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Vehicle Type:</span>
                    <span style={{ color: '#f1f5f9', textTransform: 'capitalize' }}>{selectedVehicle.vehicleType}</span>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Approval Status:</span>
                    <span style={{ 
                      color: getApprovalStatusColor(selectedVehicle.approvalStatus), 
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {selectedVehicle.approvalStatus}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Operational Status:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: getStatusColor(selectedVehicle.status) }}>
                        {getStatusIcon(selectedVehicle.status)}
                      </span>
                      <span style={{ color: getStatusColor(selectedVehicle.status), textTransform: 'capitalize', fontWeight: '600' }}>
                        {selectedVehicle.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Information */}
              <div>
                <h4 style={{ color: '#f1f5f9', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <WifiIcon width={20} height={20} />
                  Device Information
                </h4>
                <div style={{
                  backgroundColor: '#334155',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Device ID:</span>
                    <span style={{ color: '#f1f5f9', fontFamily: 'monospace' }}>{selectedVehicle.deviceId}</span>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Firmware Version:</span>
                    <span style={{ color: '#f1f5f9' }}>v{selectedVehicle.firmwareVersion}</span>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Install Date:</span>
                    <span style={{ color: '#f1f5f9' }}>{formatDateTime(selectedVehicle.installDate)}</span>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Registration Date:</span>
                    <span style={{ color: '#f1f5f9' }}>{formatDateTime(selectedVehicle.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div>
                <h4 style={{ color: '#f1f5f9', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <SignalIcon width={20} height={20} />
                  Current Status
                </h4>
                <div style={{
                  backgroundColor: '#334155',
                  padding: '1.5rem',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: getBatteryColor(selectedVehicle.batteryLevel), fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        {selectedVehicle.batteryLevel}%
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Battery</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        {selectedVehicle.signalStrength}/5
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Signal</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        {formatLastSeen(selectedVehicle.lastSeen)}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Last Seen</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 style={{ color: '#f1f5f9', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPinIcon width={20} height={20} />
                  Location
                </h4>
                <div style={{
                  backgroundColor: '#334155',
                  padding: '1.5rem',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Current Location:</span>
                    <p style={{ color: '#f1f5f9', margin: 0, marginBottom: '0.5rem' }}>
                      {selectedVehicle.location.address}
                    </p>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                      Coordinates: {selectedVehicle.location.latitude.toFixed(6)}, {selectedVehicle.location.longitude.toFixed(6)}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Last Updated:</span>
                    <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>{formatDateTime(selectedVehicle.location.lastUpdated)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            {selectedVehicle.alerts.count > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ color: '#f1f5f9', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ExclamationTriangleIcon width={20} height={20} color="#ef4444" />
                  Active Alerts ({selectedVehicle.alerts.count})
                </h4>
                <div style={{
                  backgroundColor: '#7f1d1d',
                  border: '1px solid #991b1b',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  {selectedVehicle.alerts.messages.map((message, index) => (
                    <div key={index} style={{ color: '#fecaca', marginBottom: '0.5rem' }}>
                      • {message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Note about editing */}
            {selectedVehicle.approvalStatus === 'approved' && (
              <div style={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginTop: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckCircleIcon width={16} height={16} color="#10b981" />
                  <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>Approved Vehicle</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
                  This vehicle has been approved by admin. Vehicle details cannot be modified. Contact admin for any changes needed.
                </p>
              </div>
            )}

            <div style={{
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => setSelectedVehicle(null)}
                style={{
                  backgroundColor: '#374151',
                  color: '#f9fafb',
                  padding: '0.75rem 1.5rem',
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{
              color: '#f1f5f9',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Delete Vehicle
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong>{showDeleteModal.vehicleNumber}</strong>? This action cannot be undone.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => setShowDeleteModal(null)}
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
                onClick={() => handleDeleteVehicle(showDeleteModal._id)}
                disabled={deleteLoading === showDeleteModal._id}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: deleteLoading === showDeleteModal._id ? 'not-allowed' : 'pointer',
                  opacity: deleteLoading === showDeleteModal._id ? 0.7 : 1
                }}
              >
                {deleteLoading === showDeleteModal._id ? 'Deleting...' : 'Delete Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}