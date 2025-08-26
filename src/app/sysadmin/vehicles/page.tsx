// src/app/sysadmin/vehicles/page.tsx - Admin Vehicle Approval Management
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  CogIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

interface Vehicle {
  _id: string;
  deviceId: string;
  vehicleNumber: string;
  vehicleType: 'bus' | 'van' | 'minibus' | 'train';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  status: 'online' | 'offline' | 'maintenance';
  firmwareVersion: string;
  installDate: string;
  registrationDate: string;
  approvalDate?: string;
  rejectionDate?: string;
  rejectionReason?: string;
  fleetId?: {
    _id: string;
    companyName: string;
    registrationNumber: string;
    contactPerson: string;
    email: string;
  };
  approvedBy?: {
    name: string;
    email: string;
  };
  rejectedBy?: {
    name: string;
    email: string;
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
  totalVehicles: number;
  pendingApproval: number;
  approvedVehicles: number;
  rejectedVehicles: number;
  onlineVehicles: number;
  offlineVehicles: number;
  maintenanceVehicles: number;
  recentApplications: number;
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showApprovalModal, setShowApprovalModal] = useState<Vehicle | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState<Vehicle | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load vehicle data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Get vehicles
        const vehiclesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vehicles?approvalStatus=${filterStatus}`, {
          headers
        });
        
        if (!vehiclesResponse.ok) {
          throw new Error('Failed to fetch vehicles');
        }
        
        const vehiclesData = await vehiclesResponse.json();

        // Get vehicle statistics
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vehicles/stats`, {
          headers
        });
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const statsData = await statsResponse.json();

        setVehicles(vehiclesData.vehicles || []);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading vehicle data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load vehicle data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filterStatus]);

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
      case 'online': return <SignalIcon width={16} height={16} />;
      case 'offline': return <XCircleIcon width={16} height={16} />;
      case 'maintenance': return <CogIcon width={16} height={16} />;
      default: return <ExclamationTriangleIcon width={16} height={16} />;
    }
  };

  const handleApproveVehicle = async (vehicleId: string) => {
    setActionLoading(`approve-${vehicleId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vehicles/${vehicleId}/approve`, {
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
        throw new Error('Failed to approve vehicle');
      }

      // Update vehicle status in state
      setVehicles(prev => prev.map(vehicle => {
        if (vehicle._id === vehicleId) {
          return { 
            ...vehicle, 
            approvalStatus: 'approved',
            approvalDate: new Date().toISOString()
          };
        }
        return vehicle;
      }));
      
      setShowApprovalModal(null);
      setApprovalNotes('');
    } catch (error) {
      console.error(`Error approving vehicle ${vehicleId}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectVehicle = async (vehicleId: string, reason: string) => {
    setActionLoading(`reject-${vehicleId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vehicles/${vehicleId}/reject`, {
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
        throw new Error('Failed to reject vehicle');
      }

      // Update vehicle status in state
      setVehicles(prev => prev.map(vehicle => {
        if (vehicle._id === vehicleId) {
          return { 
            ...vehicle, 
            approvalStatus: 'rejected',
            rejectionReason: reason,
            rejectionDate: new Date().toISOString()
          };
        }
        return vehicle;
      }));
      
      setShowRejectionModal(null);
      setRejectionReason('');
    } catch (error) {
      console.error(`Error rejecting vehicle ${vehicleId}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedVehicles.length === 0) return;
    
    setActionLoading('bulk-approve');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vehicles/bulk-approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vehicleIds: selectedVehicles,
          notes: approvalNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to bulk approve vehicles');
      }

      // Update vehicles status in state
      setVehicles(prev => prev.map(vehicle => {
        if (selectedVehicles.includes(vehicle._id)) {
          return { 
            ...vehicle, 
            approvalStatus: 'approved',
            approvalDate: new Date().toISOString()
          };
        }
        return vehicle;
      }));
      
      setSelectedVehicles([]);
      setShowBulkActions(false);
      setApprovalNotes('');
    } catch (error) {
      console.error('Error bulk approving vehicles:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  const toggleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const selectAllPending = () => {
    const pendingIds = vehicles
      .filter(v => v.approvalStatus === 'pending')
      .map(v => v._id);
    setSelectedVehicles(pendingIds);
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
        <div>Loading vehicle management...</div>
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
              <TruckIcon width={24} height={24} color="#10b981" />
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f1f5f9',
                margin: 0
              }}>
                Vehicle Management
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
            
            {selectedVehicles.length > 0 && (
              <button
                onClick={() => setShowBulkActions(true)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Bulk Actions ({selectedVehicles.length})
              </button>
            )}
            
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
        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#7f1d1d',
            border: '1px solid #991b1b',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ExclamationTriangleIcon width={20} height={20} color="#fca5a5" />
            <span style={{ color: '#fecaca' }}>{error}</span>
          </div>
        )}
        {/* Vehicle Statistics */}
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
                  {stats?.pendingApproval || 0}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Pending Approval</p>
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
                  {stats?.approvedVehicles || 0}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Approved Vehicles</p>
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
              <SignalIcon width={32} height={32} color="#3b82f6" />
              <div>
                <h3 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats?.onlineVehicles || 0}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Online Now</p>
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
                  {stats?.rejectedVehicles || 0}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {vehicles.filter(v => v.approvalStatus === 'pending').length > 0 && (
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                  Quick Actions
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
                  {vehicles.filter(v => v.approvalStatus === 'pending').length} vehicles pending approval
                </p>
              </div>
              <button
                onClick={selectAllPending}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Select All Pending
              </button>
            </div>
          </div>
        )}

        {/* Vehicle Applications */}
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
            Vehicle Applications ({vehicles.length})
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '1.5rem'
          }}>
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} style={{
                backgroundColor: '#334155',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #475569',
                position: 'relative'
              }}>
                {/* Selection Checkbox for Pending Vehicles */}
                {vehicle.approvalStatus === 'pending' && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedVehicles.includes(vehicle._id)}
                      onChange={() => toggleVehicleSelection(vehicle._id)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: '#3b82f6'
                      }}
                    />
                  </div>
                )}

                {/* Vehicle Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                  marginLeft: vehicle.approvalStatus === 'pending' ? '2rem' : '0'
                }}>
                  <div style={{ flex: 1 }}>
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
                      margin: '0 0 0.5rem 0',
                      textTransform: 'capitalize'
                    }}>
                      {vehicle.vehicleType} • {vehicle.fleetId?.companyName || 'Fleet not assigned'}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ color: getApprovalStatusColor(vehicle.approvalStatus) }}>
                        {getApprovalStatusIcon(vehicle.approvalStatus)}
                      </span>
                      <span style={{
                        color: getApprovalStatusColor(vehicle.approvalStatus),
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {vehicle.approvalStatus}
                      </span>
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
                        fontSize: '0.75rem',
                        textTransform: 'capitalize'
                      }}>
                        {vehicle.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Details */}
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
                    <div style={{
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      marginBottom: '0.25rem'
                    }}>
                      Device ID
                    </div>
                    <div style={{
                      color: '#f1f5f9',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace'
                    }}>
                      {vehicle.deviceId}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      marginBottom: '0.25rem'
                    }}>
                      Firmware
                    </div>
                    <div style={{
                      color: '#f1f5f9',
                      fontSize: '0.875rem'
                    }}>
                      v{vehicle.firmwareVersion}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      marginBottom: '0.25rem'
                    }}>
                      Battery Level
                    </div>
                    <div style={{
                      color: vehicle.batteryLevel > 50 ? '#10b981' : vehicle.batteryLevel > 20 ? '#f59e0b' : '#ef4444',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {vehicle.batteryLevel}%
                    </div>
                  </div>

                  <div>
                    <div style={{
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      marginBottom: '0.25rem'
                    }}>
                      Last Seen
                    </div>
                    <div style={{
                      color: '#f1f5f9',
                      fontSize: '0.875rem'
                    }}>
                      {formatLastSeen(vehicle.lastSeen)}
                    </div>
                  </div>
                </div>

                {/* Fleet Information */}
                <div style={{
                  backgroundColor: '#1e293b',
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
                    <BuildingOfficeIcon width={16} height={16} color="#94a3b8" />
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Fleet Information</span>
                  </div>
                  <div style={{ color: '#f1f5f9', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    {vehicle.fleetId?.companyName || 'Fleet not assigned'}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    {vehicle.fleetId?.contactPerson || 'N/A'} • {vehicle.fleetId?.email || 'N/A'}
                  </div>
                </div>

                {/* Registration Date */}
                <div style={{
                  backgroundColor: '#1e293b',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Registered: </span>
                  <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                    {formatDateTime(vehicle.registrationDate)}
                  </span>
                  {vehicle.approvalDate && (
                    <>
                      <br />
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Approved: </span>
                      <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                        {formatDateTime(vehicle.approvalDate)}
                      </span>
                    </>
                  )}
                </div>

                {/* Rejection Reason */}
                {vehicle.rejectionReason && (
                  <div style={{
                    backgroundColor: '#7f1d1d',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    border: '1px solid #991b1b'
                  }}>
                    <span style={{ color: '#fca5a5', fontSize: '0.75rem' }}>Rejection Reason: </span>
                    <p style={{ color: '#fecaca', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
                      {vehicle.rejectionReason}
                    </p>
                  </div>
                )}

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
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {vehicle.approvalStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => setShowApprovalModal(vehicle)}
                        disabled={actionLoading === `approve-${vehicle._id}`}
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
                          opacity: actionLoading === `approve-${vehicle._id}` ? 0.7 : 1
                        }}
                      >
                        <CheckCircleIcon width={14} height={14} />
                        {actionLoading === `approve-${vehicle._id}` ? 'Approving...' : 'Approve'}
                      </button>
                      
                      <button
                        onClick={() => setShowRejectionModal(vehicle)}
                        disabled={actionLoading === `reject-${vehicle._id}`}
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
                          opacity: actionLoading === `reject-${vehicle._id}` ? 0.7 : 1
                        }}
                      >
                        <XCircleIcon width={14} height={14} />
                        {actionLoading === `reject-${vehicle._id}` ? 'Rejecting...' : 'Reject'}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setSelectedVehicle(vehicle)}
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

          {vehicles.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#94a3b8'
            }}>
              <TruckIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No vehicles found for the selected filter.</p>
            </div>
          )}
        </div>
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
                color: '#f1f5f9',
                fontSize: '1.25rem',
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

            {/* Detailed view content here */}
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <h4 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Vehicle Information</h4>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Device ID:</span>
                  <span style={{ color: '#f1f5f9', marginLeft: '0.5rem', fontFamily: 'monospace' }}>{selectedVehicle.deviceId}</span>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Type:</span>
                  <span style={{ color: '#f1f5f9', marginLeft: '0.5rem', textTransform: 'capitalize' }}>{selectedVehicle.vehicleType}</span>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Install Date:</span>
                  <span style={{ color: '#f1f5f9', marginLeft: '0.5rem' }}>{formatDateTime(selectedVehicle.installDate)}</span>
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
                onClick={() => setSelectedVehicle(null)}
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
              Approve Vehicle
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
              Are you sure you want to approve vehicle <strong>{showApprovalModal.vehicleNumber}</strong> from <strong>{showApprovalModal.fleetId?.companyName || 'unknown fleet'}</strong>?
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
                onClick={() => handleApproveVehicle(showApprovalModal._id)}
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
                {actionLoading === `approve-${showApprovalModal._id}` ? 'Approving...' : 'Approve Vehicle'}
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
              Reject Vehicle
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
              Please provide a reason for rejecting vehicle <strong>{showRejectionModal.vehicleNumber}</strong>:
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
                onClick={() => handleRejectVehicle(showRejectionModal._id, rejectionReason)}
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
                {actionLoading === `reject-${showRejectionModal._id}` ? 'Rejecting...' : 'Reject Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActions && (
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
              Bulk Vehicle Actions
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
              {selectedVehicles.length} vehicles selected for bulk action.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <button
                onClick={handleBulkApprove}
                disabled={actionLoading === 'bulk-approve'}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  flex: 1,
                  opacity: actionLoading === 'bulk-approve' ? 0.7 : 1
                }}
              >
                {actionLoading === 'bulk-approve' ? 'Approving...' : 'Approve All'}
              </button>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => {
                  setShowBulkActions(false);
                  setSelectedVehicles([]);
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}