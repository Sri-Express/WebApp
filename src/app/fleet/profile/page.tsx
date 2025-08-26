// src/app/fleet/profile/page.tsx - Fleet Profile Management with Theme Integration (FIXED)
"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import AnimatedBackground from '@/app/fleet/components/AnimatedBackground';
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
  const { theme } = useTheme();
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
    alertBg: 'rgba(249, 250, 251, 0.6)'
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
    alertBg: 'rgba(51, 65, 85, 0.6)'
  };
  
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // Combined styles
  const combinedStyles = `
    @keyframes spin { 
      0% { transform: rotate(0deg); } 
      100% { transform: rotate(360deg); } 
    }
    
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in-down {
      animation: fadeInDown 0.8s ease-out forwards;
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.8s ease-out forwards;
    }
    
    .form-field:focus-within {
      transform: translateY(-1px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }
    
    .profile-card:hover {
      transform: translateY(-2px);
    }

    .animation-delay-100 { animation-delay: 0.1s; }
    .animation-delay-200 { animation-delay: 0.2s; }
    .animation-delay-300 { animation-delay: 0.3s; }
    .animation-delay-400 { animation-delay: 0.4s; }
    .animation-delay-500 { animation-delay: 0.5s; }
    .animation-delay-600 { animation-delay: 0.6s; }
    
    @media (max-width: 768px) {
      .profile-card {
        grid-template-columns: 1fr !important;
      }
      .main-grid {
        grid-template-columns: 1fr !important;
        gap: 1.5rem !important;
      }
    }
  `;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/fleet/profile`, {
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/fleet/profile`, {
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
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden'
      }}>
        <style jsx>{combinedStyles}</style>
        
        {/* Animated Background */}
        <AnimatedBackground currentThemeStyles={currentThemeStyles} />
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          color: currentThemeStyles.textPrimary,
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: `4px solid ${theme === 'dark' ? '#fef3c7' : '#fde68a'}`, 
              borderTop: '4px solid #F59E0B', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite', 
              margin: '0 auto 16px' 
            }}></div>
            <div style={{ 
              color: currentThemeStyles.textPrimary, 
              fontSize: '16px', 
              fontWeight: '600' 
            }}>
              Loading Profile...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!fleet) {
    return (
      <div style={{ 
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden'
      }}>
        {/* Animated Background */}
        <AnimatedBackground currentThemeStyles={currentThemeStyles} />
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          color: '#ef4444',
          position: 'relative',
          zIndex: 10
        }}>
          Fleet profile not found
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      <style jsx>{combinedStyles}</style>
      
      {/* Animated Background */}
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: theme === 'dark' 
          ? 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)'
          : 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)',
        backgroundSize: '40px 40px',
        opacity: 0.3,
        zIndex: 1
      }} />
      
      <div style={{
        position: 'relative',
        zIndex: 10,
        paddingTop: '2rem'
      }}>
        <div className="animate-fade-in-down" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem 2rem'
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
                color: currentThemeStyles.textPrimary,
                margin: '0 0 0.5rem 0',
                textShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                Fleet Profile
              </h1>
              <p style={{
                color: currentThemeStyles.textSecondary,
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
                      backgroundColor: currentThemeStyles.quickActionBg,
                      color: currentThemeStyles.textPrimary,
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: currentThemeStyles.quickActionBorder,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(12px)'
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
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
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
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
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
            <div className="animate-fade-in-down animation-delay-100" style={{
              backgroundColor: theme === 'dark' ? '#064e3b' : '#dcfce7',
              border: `1px solid ${theme === 'dark' ? '#059669' : '#16a34a'}`,
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '2rem',
              color: theme === 'dark' ? '#a7f3d0' : '#166534',
              backdropFilter: 'blur(12px)'
            }}>
              {success}
            </div>
          )}

          {error && (
            <div className="animate-fade-in-down animation-delay-100" style={{
              backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
              border: `1px solid ${theme === 'dark' ? '#991b1b' : '#f87171'}`,
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '2rem',
              color: theme === 'dark' ? '#fecaca' : '#dc2626',
              backdropFilter: 'blur(12px)'
            }}>
              {error}
            </div>
          )}

          <div className="animate-fade-in-up animation-delay-200 main-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: '2rem'
          }}>
            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Company Information */}
              <div className="profile-card animation-delay-300" style={{
                backgroundColor: currentThemeStyles.glassPanelBg,
                padding: '2rem',
                borderRadius: '1rem',
                border: currentThemeStyles.glassPanelBorder,
                boxShadow: currentThemeStyles.glassPanelShadow,
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s ease'
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
                  <BuildingOfficeIcon width={20} height={20} />
                  Company Information
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem'
                }}>
                  <div className="form-field" style={{ transition: 'all 0.2s ease' }}>
                    <label style={{
                      display: 'block',
                      color: currentThemeStyles.textSecondary,
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem',
                      fontWeight: '600'
                    }}>
                      Company Name
                    </label>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: currentThemeStyles.alertBg,
                      borderRadius: '0.5rem',
                      color: currentThemeStyles.textPrimary,
                      border: currentThemeStyles.quickActionBorder,
                      backdropFilter: 'blur(8px)'
                    }}>
                      {fleet.companyName}
                    </div>
                  </div>

                  <div className="form-field" style={{ transition: 'all 0.2s ease' }}>
                    <label style={{
                      display: 'block',
                      color: currentThemeStyles.textSecondary,
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem',
                      fontWeight: '600'
                    }}>
                      Registration Number
                    </label>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: currentThemeStyles.alertBg,
                      borderRadius: '0.5rem',
                      color: currentThemeStyles.textPrimary,
                      border: currentThemeStyles.quickActionBorder,
                      backdropFilter: 'blur(8px)'
                    }}>
                      {fleet.registrationNumber}
                    </div>
                  </div>

                  <div className="form-field" style={{ transition: 'all 0.2s ease' }}>
                    <label style={{
                      display: 'block',
                      color: currentThemeStyles.textSecondary,
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem',
                      fontWeight: '600'
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
                          backgroundColor: currentThemeStyles.alertBg,
                          border: currentThemeStyles.quickActionBorder,
                          borderRadius: '0.5rem',
                          color: currentThemeStyles.textPrimary,
                          backdropFilter: 'blur(8px)',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s ease',
                          boxSizing: 'border-box'
                        }}
                      />
                    ) : (
                      <div style={{
                        padding: '0.75rem',
                        backgroundColor: currentThemeStyles.alertBg,
                        borderRadius: '0.5rem',
                        color: currentThemeStyles.textPrimary,
                        border: currentThemeStyles.quickActionBorder,
                        backdropFilter: 'blur(8px)'
                      }}>
                        {fleet.contactPerson}
                      </div>
                    )}
                  </div>

                  <div className="form-field" style={{ transition: 'all 0.2s ease' }}>
                    <label style={{
                      display: 'block',
                      color: currentThemeStyles.textSecondary,
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem',
                      fontWeight: '600'
                    }}>
                      Email
                    </label>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: currentThemeStyles.alertBg,
                      borderRadius: '0.5rem',
                      color: currentThemeStyles.textPrimary,
                      border: currentThemeStyles.quickActionBorder,
                      backdropFilter: 'blur(8px)'
                    }}>
                      {fleet.email}
                    </div>
                  </div>

                  <div className="form-field" style={{ transition: 'all 0.2s ease' }}>
                    <label style={{
                      display: 'block',
                      color: currentThemeStyles.textSecondary,
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem',
                      fontWeight: '600'
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
                          backgroundColor: currentThemeStyles.alertBg,
                          border: currentThemeStyles.quickActionBorder,
                          borderRadius: '0.5rem',
                          color: currentThemeStyles.textPrimary,
                          backdropFilter: 'blur(8px)',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s ease',
                          boxSizing: 'border-box'
                        }}
                      />
                    ) : (
                      <div style={{
                        padding: '0.75rem',
                        backgroundColor: currentThemeStyles.alertBg,
                        borderRadius: '0.5rem',
                        color: currentThemeStyles.textPrimary,
                        border: currentThemeStyles.quickActionBorder,
                        backdropFilter: 'blur(8px)'
                      }}>
                        {fleet.phone}
                      </div>
                    )}
                  </div>

                  <div className="form-field" style={{ gridColumn: '1 / -1', transition: 'all 0.2s ease' }}>
                    <label style={{
                      display: 'block',
                      color: currentThemeStyles.textSecondary,
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem',
                      fontWeight: '600'
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
                          backgroundColor: currentThemeStyles.alertBg,
                          border: currentThemeStyles.quickActionBorder,
                          borderRadius: '0.5rem',
                          color: currentThemeStyles.textPrimary,
                          resize: 'vertical',
                          backdropFilter: 'blur(8px)',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s ease',
                          boxSizing: 'border-box'
                        }}
                      />
                    ) : (
                      <div style={{
                        padding: '0.75rem',
                        backgroundColor: currentThemeStyles.alertBg,
                        borderRadius: '0.5rem',
                        color: currentThemeStyles.textPrimary,
                        border: currentThemeStyles.quickActionBorder,
                        backdropFilter: 'blur(8px)'
                      }}>
                        {fleet.address}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Operating Routes */}
              <div className="profile-card animation-delay-400" style={{
                backgroundColor: currentThemeStyles.glassPanelBg,
                padding: '2rem',
                borderRadius: '1rem',
                border: currentThemeStyles.glassPanelBorder,
                boxShadow: currentThemeStyles.glassPanelShadow,
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s ease'
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
                  <MapPinIcon width={20} height={20} />
                  Operating Routes
                </h2>

                {editing ? (
                  <div className="form-field" style={{ transition: 'all 0.2s ease' }}>
                    <label style={{
                      display: 'block',
                      color: currentThemeStyles.textSecondary,
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem',
                      fontWeight: '600'
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
                        backgroundColor: currentThemeStyles.alertBg,
                        border: currentThemeStyles.quickActionBorder,
                        borderRadius: '0.5rem',
                        color: currentThemeStyles.textPrimary,
                        resize: 'vertical',
                        backdropFilter: 'blur(8px)',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box'
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
                    {fleet.operatingRoutes && fleet.operatingRoutes.length > 0 ? fleet.operatingRoutes.map((route, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: currentThemeStyles.alertBg,
                          color: currentThemeStyles.textPrimary,
                          padding: '0.5rem 1rem',
                          borderRadius: '1rem',
                          fontSize: '0.875rem',
                          border: currentThemeStyles.quickActionBorder,
                          backdropFilter: 'blur(8px)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {route}
                      </span>
                    )) : (
                      <div style={{
                        color: currentThemeStyles.textMuted,
                        fontSize: '0.875rem',
                        fontStyle: 'italic'
                      }}>
                        No routes configured
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Fleet Status */}
              <div className="profile-card animation-delay-500" style={{
                backgroundColor: currentThemeStyles.glassPanelBg,
                padding: '2rem',
                borderRadius: '1rem',
                border: currentThemeStyles.glassPanelBorder,
                boxShadow: currentThemeStyles.glassPanelShadow,
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s ease'
              }}>
                <h3 style={{
                  color: currentThemeStyles.textPrimary,
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
                  backgroundColor: currentThemeStyles.alertBg,
                  borderRadius: '0.5rem',
                  border: currentThemeStyles.quickActionBorder,
                  backdropFilter: 'blur(8px)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Compliance Score</span>
                    <span style={{
                      color: getComplianceColor(fleet.complianceScore),
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}>
                      {fleet.complianceScore}%
                    </span>
                  </div>
                  <div style={{
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#f1f5f9',
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
              <div className="profile-card animation-delay-600" style={{
                backgroundColor: currentThemeStyles.glassPanelBg,
                padding: '2rem',
                borderRadius: '1rem',
                border: currentThemeStyles.glassPanelBorder,
                boxShadow: currentThemeStyles.glassPanelShadow,
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s ease'
              }}>
                <h3 style={{
                  color: currentThemeStyles.textPrimary,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  Fleet Statistics
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Total Vehicles:</span>
                    <span style={{ color: currentThemeStyles.textPrimary, fontWeight: '600' }}>{fleet.totalVehicles}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Active Vehicles:</span>
                    <span style={{ color: '#10b981', fontWeight: '600' }}>{fleet.activeVehicles}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Operating Routes:</span>
                    <span style={{ color: currentThemeStyles.textPrimary, fontWeight: '600' }}>{fleet.operatingRoutes ? fleet.operatingRoutes.length : 0}</span>
                  </div>
                </div>
              </div>

              {/* Document Status */}
              <div className="profile-card" style={{
                backgroundColor: currentThemeStyles.glassPanelBg,
                padding: '2rem',
                borderRadius: '1rem',
                border: currentThemeStyles.glassPanelBorder,
                boxShadow: currentThemeStyles.glassPanelShadow,
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s ease'
              }}>
                <h3 style={{
                  color: currentThemeStyles.textPrimary,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  Document Status
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {fleet.documents && Object.entries(fleet.documents).map(([doc, status]) => (
                    <div key={doc} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', textTransform: 'capitalize' }}>
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
    </div>
  );
}