// src/app/fleet/profile/page.tsx - Fleet Profile Management
"use client";

import { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Fleet {
  _id: string;
  companyName: string;
  registrationNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  totalVehicles: number;
  activeVehicles: number;
  operatingRoutes: string[];
  complianceScore: number;
  applicationDate: string;
  approvalDate?: string;
  documents: {
    businessLicense: boolean;
    insuranceCertificate: boolean;
    vehicleRegistrations: boolean;
    driverLicenses: boolean;
  };
  operationalInfo?: {
    yearsInOperation: number;
    averageFleetAge: number;
    maintenanceSchedule: string;
    safetyRating?: number;
  };
}

export default function FleetProfilePage() {
  const [fleet, setFleet] = useState<Fleet | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    contactPerson: '',
    phone: '',
    address: '',
    operatingRoutes: [] as string[],
    operationalInfo: {
      yearsInOperation: 0,
      averageFleetAge: 0,
      maintenanceSchedule: 'monthly',
      safetyRating: 5
    }
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load fleet profile');
        }

        const data = await response.json();
        setFleet(data.fleet);
        
        // Initialize form data
        setFormData({
          contactPerson: data.fleet.contactPerson || '',
          phone: data.fleet.phone || '',
          address: data.fleet.address || '',
          operatingRoutes: data.fleet.operatingRoutes || [],
          operationalInfo: {
            yearsInOperation: data.fleet.operationalInfo?.yearsInOperation || 0,
            averageFleetAge: data.fleet.operationalInfo?.averageFleetAge || 0,
            maintenanceSchedule: data.fleet.operationalInfo?.maintenanceSchedule || 'monthly',
            safetyRating: data.fleet.operationalInfo?.safetyRating || 5
          }
        });
      } catch (error) {
        console.error('Load profile error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('operationalInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        operationalInfo: {
          ...prev.operationalInfo,
          [field]: field === 'maintenanceSchedule' ? value : Number(value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRoutesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const routes = e.target.value.split('\n').filter(route => route.trim());
    setFormData(prev => ({
      ...prev,
      operatingRoutes: routes
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setFleet(data.fleet);
      setEditing(false);
      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'suspended': return '#6b7280';
      default: return '#6b7280';
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
        Loading profile...
      </div>
    );
  }

  if (!fleet) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#ef4444'
      }}>
        Fleet profile not found
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <div style={{
        maxWidth: '1200px',
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
              Fleet Profile
            </h1>
            <p style={{
              color: '#94a3b8',
              margin: 0
            }}>
              Manage your company information and settings
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    backgroundColor: '#374151',
                    color: '#f9fafb',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <XMarkIcon width={16} height={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontSize: '0.875rem',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <CheckCircleIcon width={16} height={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <PencilIcon width={16} height={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div style={{
            backgroundColor: '#064e3b',
            border: '1px solid #059669',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            color: '#a7f3d0'
          }}>
            {success}
          </div>
        )}

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

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '2rem'
        }}>
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Company Information */}
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
                Company Information
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    Company Name
                  </label>
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#334155',
                    borderRadius: '0.5rem',
                    color: '#f1f5f9'
                  }}>
                    {fleet.companyName}
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    Registration Number
                  </label>
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#334155',
                    borderRadius: '0.5rem',
                    color: '#f1f5f9'
                  }}>
                    {fleet.registrationNumber}
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    Contact Person
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#334155',
                        border: '1px solid #475569',
                        borderRadius: '0.5rem',
                        color: '#f1f5f9'
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#334155',
                      borderRadius: '0.5rem',
                      color: '#f1f5f9'
                    }}>
                      {fleet.contactPerson}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    Email
                  </label>
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#334155',
                    borderRadius: '0.5rem',
                    color: '#f1f5f9'
                  }}>
                    {fleet.email}
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    Phone
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#334155',
                        border: '1px solid #475569',
                        borderRadius: '0.5rem',
                        color: '#f1f5f9'
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#334155',
                      borderRadius: '0.5rem',
                      color: '#f1f5f9'
                    }}>
                      {fleet.phone}
                    </div>
                  )}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    Address
                  </label>
                  {editing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#334155',
                        border: '1px solid #475569',
                        borderRadius: '0.5rem',
                        color: '#f1f5f9',
                        resize: 'vertical'
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#334155',
                      borderRadius: '0.5rem',
                      color: '#f1f5f9'
                    }}>
                      {fleet.address}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Operating Routes */}
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
                <MapPinIcon width={20} height={20} />
                Operating Routes
              </h2>

              {editing ? (
                <div>
                  <label style={{
                    display: 'block',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    Routes (one per line)
                  </label>
                  <textarea
                    value={formData.operatingRoutes.join('\n')}
                    onChange={handleRoutesChange}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#334155',
                      border: '1px solid #475569',
                      borderRadius: '0.5rem',
                      color: '#f1f5f9',
                      resize: 'vertical'
                    }}
                    placeholder="Colombo - Kandy&#10;Colombo - Galle&#10;Kandy - Jaffna"
                  />
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {fleet.operatingRoutes.map((route, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: '#334155',
                        color: '#f1f5f9',
                        padding: '0.5rem 1rem',
                        borderRadius: '1rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      {route}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Fleet Status */}
            <div style={{
              backgroundColor: '#1e293b',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #334155'
            }}>
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1rem',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                Fleet Status
              </h3>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(fleet.status)
                }} />
                <span style={{
                  color: getStatusColor(fleet.status),
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {fleet.status}
                </span>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: '#334155',
                borderRadius: '0.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Compliance Score</span>
                  <span style={{
                    color: getComplianceColor(fleet.complianceScore),
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    {fleet.complianceScore}%
                  </span>
                </div>
                <div style={{
                  backgroundColor: '#1e293b',
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
            </div>

            {/* Fleet Statistics */}
            <div style={{
              backgroundColor: '#1e293b',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #334155'
            }}>
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1rem',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                Fleet Statistics
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Vehicles:</span>
                  <span style={{ color: '#f1f5f9', fontWeight: '600' }}>{fleet.totalVehicles}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Active Vehicles:</span>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>{fleet.activeVehicles}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Operating Routes:</span>
                  <span style={{ color: '#f1f5f9', fontWeight: '600' }}>{fleet.operatingRoutes.length}</span>
                </div>
              </div>
            </div>

            {/* Document Status */}
            <div style={{
              backgroundColor: '#1e293b',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #334155'
            }}>
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1rem',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                Document Status
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(fleet.documents).map(([doc, status]) => (
                  <div key={doc} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                      {doc.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span style={{
                      color: status ? '#10b981' : '#ef4444',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {status ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}