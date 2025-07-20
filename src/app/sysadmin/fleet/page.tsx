// src/app/sysadmin/fleet/page.tsx - UPDATED VERSION
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
  PhoneIcon,
  EnvelopeIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

// UPDATE 4: Interface updated to use _id
interface FleetCompany {
  _id: string; // Changed from 'id' to '_id' to match backend
  companyName: string;
  registrationNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  applicationDate: string;
  approvalDate?: string;
  totalVehicles: number;
  activeVehicles: number;
  operatingRoutes: string[];
  documents: {
    businessLicense: boolean;
    insuranceCertificate: boolean;
    vehicleRegistrations: boolean;
    driverLicenses: boolean;
  };
  complianceScore: number;
  lastInspection?: string;
  notes?: string;
}

interface FleetStats {
  totalApplications: number;
  pendingApprovals: number;
  approvedFleets: number;
  rejectedApplications: number;
  activeVehicles: number;
  totalVehicles: number;
  complianceIssues: number;
}

export default function FleetManagementPage() {
  const [fleets, setFleets] = useState<FleetCompany[]>([]);
  const [stats, setStats] = useState<FleetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedFleet, setSelectedFleet] = useState<FleetCompany | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showApprovalModal, setShowApprovalModal] = useState<FleetCompany | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState<FleetCompany | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // UPDATE 1: Replaced useEffect to fetch data from API
  // Load fleet data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Get fleet applications
        const fleetsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/fleet`, {
          headers
        });
        
        if (!fleetsResponse.ok) {
          throw new Error('Failed to fetch fleets');
        }
        
        const fleetsData = await fleetsResponse.json();

        // Get fleet statistics
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/fleet/stats`, {
          headers
        });
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const statsData = await statsResponse.json();

        setFleets(fleetsData.fleets || []);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading fleet data:', error);
        // You can add toast notification here
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      case 'suspended':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon width={20} height={20} />;
      case 'pending':
        return <ClockIcon width={20} height={20} />;
      case 'rejected':
        return <XCircleIcon width={20} height={20} />;
      case 'suspended':
        return <ExclamationTriangleIcon width={20} height={20} />;
      default:
        return <ClockIcon width={20} height={20} />;
    }
  };

  // UPDATE 2: Replaced handleApproveFleet function
  const handleApproveFleet = async (fleetId: string) => {
    setActionLoading(`approve-${fleetId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/fleet/${fleetId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: 'Approved via admin panel'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve fleet');
      }

      const data = await response.json();
      
      // Update fleet status in state
      setFleets(prev => prev.map(fleet => {
        // UPDATE 5: Use _id
        if (fleet._id === fleetId) {
          return { 
            ...fleet, 
            status: 'approved',
            approvalDate: new Date().toISOString()
          };
        }
        return fleet;
      }));
      
      setShowApprovalModal(null);
      // You can add success toast here
    } catch (error) {
      console.error(`Error approving fleet ${fleetId}:`, error);
      // You can add error toast here
    } finally {
      setActionLoading(null);
    }
  };

  // UPDATE 3: Replaced handleRejectFleet function
  const handleRejectFleet = async (fleetId: string, reason: string) => {
    setActionLoading(`reject-${fleetId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/fleet/${fleetId}/reject`, {
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
        throw new Error('Failed to reject fleet');
      }

      const data = await response.json();
      
      // Update fleet status in state
      setFleets(prev => prev.map(fleet => {
        // UPDATE 5: Use _id
        if (fleet._id === fleetId) {
          return { 
            ...fleet, 
            status: 'rejected',
            notes: reason
          };
        }
        return fleet;
      }));
      
      setShowRejectionModal(null);
      setRejectionReason('');
      // You can add success toast here
    } catch (error) {
      console.error(`Error rejecting fleet ${fleetId}:`, error);
      // You can add error toast here
    } finally {
      setActionLoading(null);
    }
  };

  const filteredFleets = fleets.filter(fleet => 
    filterStatus === 'all' || fleet.status === filterStatus
  );

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
        <div>Loading fleet management...</div>
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
              <TruckIcon width={24} height={24} color="#f59e0b" />
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f1f5f9',
                margin: 0
              }}>
                Fleet Management
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
              <option value="suspended">Suspended</option>
            </select>
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
        {/* Fleet Statistics */}
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
                  {stats?.pendingApprovals}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Pending Approvals</p>
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
                  {stats?.approvedFleets}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Approved Fleets</p>
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
              <TruckIcon width={32} height={32} color="#06b6d4" />
              <div>
                <h3 style={{ color: '#06b6d4', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats?.activeVehicles}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Active Vehicles</p>
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
              <ExclamationTriangleIcon width={32} height={32} color="#ef4444" />
              <div>
                <h3 style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats?.complianceIssues}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Compliance Issues</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Applications */}
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
            <BuildingOfficeIcon width={20} height={20} />
            Fleet Applications ({filteredFleets.length})
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* UPDATE 5: Use _id for key */}
            {filteredFleets.map((fleet) => (
              <div key={fleet._id} style={{
                backgroundColor: '#334155',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #475569'
              }}>
                {/* Fleet Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      color: '#f1f5f9',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {fleet.companyName}
                    </h3>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      {fleet.registrationNumber}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginLeft: '1rem'
                  }}>
                    <span style={{ color: getStatusColor(fleet.status) }}>
                      {getStatusIcon(fleet.status)}
                    </span>
                    <span style={{
                      color: getStatusColor(fleet.status),
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {fleet.status}
                    </span>
                  </div>
                </div>

                {/* Fleet Info */}
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
                      <UsersIcon width={16} height={16} color="#94a3b8" />
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Contact Person</span>
                    </div>
                    <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>
                      {fleet.contactPerson}
                    </span>
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <TruckIcon width={16} height={16} color="#94a3b8" />
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Vehicles</span>
                    </div>
                    <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>
                      {fleet.activeVehicles}/{fleet.totalVehicles}
                    </span>
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <PhoneIcon width={16} height={16} color="#94a3b8" />
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Phone</span>
                    </div>
                    <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                      {fleet.phone}
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <EnvelopeIcon width={16} height={16} color="#94a3b8" />
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Email</span>
                    </div>
                    <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                      {fleet.email}
                    </span>
                  </div>
                </div>

                {/* Compliance Score */}
                <div style={{
                  backgroundColor: '#1e293b',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Compliance Score</span>
                    <span style={{
                      color: getComplianceColor(fleet.complianceScore),
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}>
                      {fleet.complianceScore}%
                    </span>
                  </div>
                  <div style={{
                    backgroundColor: '#334155',
                    borderRadius: '0.5rem',
                    height: '6px',
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

                {/* Application Date */}
                <div style={{
                  backgroundColor: '#1e293b',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Applied: </span>
                  <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                    {formatDateTime(fleet.applicationDate)}
                  </span>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {fleet.status === 'pending' && (
                    <>
                      {/* UPDATE 5: Use _id */}
                      <button
                        onClick={() => setShowApprovalModal(fleet)}
                        disabled={actionLoading === `approve-${fleet._id}`}
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
                          opacity: actionLoading === `approve-${fleet._id}` ? 0.7 : 1
                        }}
                      >
                        <CheckCircleIcon width={14} height={14} />
                        {actionLoading === `approve-${fleet._id}` ? 'Approving...' : 'Approve'}
                      </button>
                      
                      <button
                        onClick={() => setShowRejectionModal(fleet)}
                        disabled={actionLoading === `reject-${fleet._id}`}
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
                          opacity: actionLoading === `reject-${fleet._id}` ? 0.7 : 1
                        }}
                      >
                        <XCircleIcon width={14} height={14} />
                        {actionLoading === `reject-${fleet._id}` ? 'Rejecting...' : 'Reject'}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setSelectedFleet(fleet)}
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

          {filteredFleets.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#94a3b8'
            }}>
              <TruckIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No fleet applications found for the selected filter.</p>
            </div>
          )}
        </div>

        {/* Status Notice */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155',
          marginTop: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <InformationCircleIcon width={20} height={20} color="#3b82f6" />
            <h3 style={{
              color: '#f1f5f9',
              fontSize: '1rem',
              fontWeight: '600',
              margin: 0
            }}>
              Fleet Management System
            </h3>
          </div>
          <p style={{
            color: '#94a3b8',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Fleet management system allows you to review and approve transport company applications. 
            Each application is thoroughly reviewed for compliance with safety standards, documentation, 
            and operational requirements before approval.
          </p>
        </div>
      </div>

      {/* Fleet Details Modal */}
      {selectedFleet && (
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
                {selectedFleet.companyName} - Details
              </h3>
              <button
                onClick={() => setSelectedFleet(null)}
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
                <h4 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Company Information</h4>
                <div style={{
                  backgroundColor: '#334155',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Registration Number:</span>
                    <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>{selectedFleet.registrationNumber}</p>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Address:</span>
                    <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>{selectedFleet.address}</p>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Operating Routes:</span>
                    <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>
                      {selectedFleet.operatingRoutes.join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Documentation Status</h4>
                <div style={{
                  backgroundColor: '#334155',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  {Object.entries(selectedFleet.documents).map(([doc, status]) => (
                    <div key={doc} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ color: '#f1f5f9', textTransform: 'capitalize' }}>
                        {doc.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span style={{
                        color: status ? '#10b981' : '#ef4444',
                        fontWeight: '600'
                      }}>
                        {status ? '✓ Complete' : '✗ Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {selectedFleet.notes && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>Notes</h4>
                <div style={{
                  backgroundColor: '#334155',
                  padding: '1rem',
                  borderRadius: '0.5rem'
                }}>
                  <p style={{ color: '#f1f5f9', margin: 0 }}>{selectedFleet.notes}</p>
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
                onClick={() => setSelectedFleet(null)}
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
              Approve Fleet Application
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Are you sure you want to approve the application for <strong>{showApprovalModal.companyName}</strong>?
              This will allow them to start operations on the platform.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => setShowApprovalModal(null)}
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
              {/* UPDATE 5: Use _id */}
              <button
                onClick={() => handleApproveFleet(showApprovalModal._id)}
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
                {actionLoading === `approve-${showApprovalModal._id}` ? 'Approving...' : 'Approve'}
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
              Reject Fleet Application
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
              Please provide a reason for rejecting <strong>{showRejectionModal.companyName}</strong>'s application:
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
              {/* UPDATE 5: Use _id */}
              <button
                onClick={() => handleRejectFleet(showRejectionModal._id, rejectionReason)}
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
                {actionLoading === `reject-${showRejectionModal._id}` ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}