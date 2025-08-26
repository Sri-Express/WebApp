// src/app/fleet/vehicles/add/page.tsx - Add New Vehicle (UPDATED WITH ANIMATED BACKGROUND)
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  TruckIcon,
  PlusIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import AnimatedBackground from '@/app/fleet/components/AnimatedBackground';

interface VehicleFormData {
  vehicleNumber: string;
  vehicleType: string;
  firmwareVersion: string;
  installDate: string;
}

export default function AddVehiclePage() {
  const [formData, setFormData] = useState<VehicleFormData>({
    vehicleNumber: '',
    vehicleType: 'bus',
    firmwareVersion: '1.0.0',
    installDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

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

  const vehicleTypes = [
    { value: 'bus', label: 'Bus' },
    { value: 'van', label: 'Van' },
    { value: 'minibus', label: 'Minibus' },
    { value: 'train', label: 'Train' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.vehicleNumber.trim()) {
      setError('Vehicle number is required');
      return false;
    }
    
    if (!formData.vehicleType) {
      setError('Vehicle type is required');
      return false;
    }

    if (!formData.firmwareVersion.trim()) {
      setError('Firmware version is required');
      return false;
    }

    if (!formData.installDate) {
      setError('Install date is required');
      return false;
    }

    // Validate vehicle number format (simple validation)
    if (!/^[A-Z0-9-]+$/i.test(formData.vehicleNumber)) {
      setError('Vehicle number can only contain letters, numbers, and hyphens');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/vehicles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add vehicle');
      }

      setSuccess('Vehicle added successfully!');
      
      // Reset form
      setFormData({
        vehicleNumber: '',
        vehicleType: 'bus',
        firmwareVersion: '1.0.0',
        installDate: new Date().toISOString().split('T')[0]
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/fleet/vehicles');
      }, 2000);
    } catch (error) {
      console.error('Add vehicle error:', error);
      setError(error instanceof Error ? error.message : 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: currentThemeStyles.mainBg, 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />
      
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '2rem',
          backgroundColor: currentThemeStyles.glassPanelBg,
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: currentThemeStyles.glassPanelShadow,
          backdropFilter: 'blur(12px)',
          border: currentThemeStyles.glassPanelBorder
        }}>
          <Link
            href="/fleet/vehicles"
            style={{
              color: currentThemeStyles.textSecondary,
              textDecoration: 'none',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}
          >
            <ArrowLeftIcon width={16} height={16} />
            Back to Vehicles
          </Link>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            <TruckIcon width={28} height={28} color="#10b981" />
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: currentThemeStyles.textPrimary,
              margin: 0
            }}>
              Add New Vehicle
            </h1>
          </div>
          <p style={{
            color: currentThemeStyles.textSecondary,
            margin: 0
          }}>
            Register a new vehicle in your fleet for monitoring and management
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            backgroundColor: 'rgba(6, 78, 59, 0.8)',
            border: '1px solid #059669',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backdropFilter: 'blur(12px)'
          }}>
            <CheckCircleIcon width={20} height={20} color="#a7f3d0" />
            <span style={{ color: '#a7f3d0' }}>{success}</span>
          </div>
        )}

        {/* Error Message */}
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
            <ExclamationCircleIcon width={20} height={20} color="#fca5a5" />
            <span style={{ color: '#fecaca' }}>{error}</span>
          </div>
        )}

        {/* Form */}
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
            <PlusIcon width={20} height={20} />
            Vehicle Information
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {/* Vehicle Number */}
              <div>
                <label style={{
                  display: 'block',
                  color: currentThemeStyles.textPrimary,
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Vehicle Number *
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., BUS-001, VAN-123"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    backgroundColor: 'rgba(51, 65, 85, 0.6)',
                    color: currentThemeStyles.textPrimary,
                    fontSize: '0.875rem',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <p style={{
                  color: currentThemeStyles.textSecondary,
                  fontSize: '0.75rem',
                  margin: '0.5rem 0 0 0'
                }}>
                  Unique identifier for the vehicle (letters, numbers, and hyphens only)
                </p>
              </div>

              {/* Vehicle Type */}
              <div>
                <label style={{
                  display: 'block',
                  color: currentThemeStyles.textPrimary,
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Vehicle Type *
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    backgroundColor: 'rgba(51, 65, 85, 0.6)',
                    color: currentThemeStyles.textPrimary,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  {vehicleTypes.map(type => (
                    <option key={type.value} value={type.value} style={{ backgroundColor: '#1e293b' }}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p style={{
                  color: currentThemeStyles.textSecondary,
                  fontSize: '0.75rem',
                  margin: '0.5rem 0 0 0'
                }}>
                  Select the type of vehicle you&apos;re adding
                </p>
              </div>

              {/* Firmware Version */}
              <div>
                <label style={{
                  display: 'block',
                  color: currentThemeStyles.textPrimary,
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Firmware Version *
                </label>
                <input
                  type="text"
                  name="firmwareVersion"
                  value={formData.firmwareVersion}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 1.0.0, 2.1.3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    backgroundColor: 'rgba(51, 65, 85, 0.6)',
                    color: currentThemeStyles.textPrimary,
                    fontSize: '0.875rem',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <p style={{
                  color: currentThemeStyles.textSecondary,
                  fontSize: '0.75rem',
                  margin: '0.5rem 0 0 0'
                }}>
                  GPS tracking device firmware version
                </p>
              </div>

              {/* Install Date */}
              <div>
                <label style={{
                  display: 'block',
                  color: currentThemeStyles.textPrimary,
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Install Date *
                </label>
                <input
                  type="date"
                  name="installDate"
                  value={formData.installDate}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    backgroundColor: 'rgba(51, 65, 85, 0.6)',
                    color: currentThemeStyles.textPrimary,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <p style={{
                  color: currentThemeStyles.textSecondary,
                  fontSize: '0.75rem',
                  margin: '0.5rem 0 0 0'
                }}>
                  Date when the GPS device was installed
                </p>
              </div>
            </div>

            {/* Information Box */}
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: currentThemeStyles.glassPanelBorder,
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '2rem',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <ExclamationCircleIcon width={20} height={20} color="#3b82f6" style={{ marginTop: '0.25rem' }} />
                <div>
                  <h4 style={{
                    color: '#3b82f6',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Important Information
                  </h4>
                  <ul style={{
                    color: currentThemeStyles.textSecondary,
                    fontSize: '0.875rem',
                    margin: 0,
                    paddingLeft: '1rem',
                    lineHeight: '1.5'
                  }}>
                    <li>Vehicle number must be unique across your fleet</li>
                    <li>GPS tracking device will be automatically configured</li>
                    <li>Vehicle will appear as &quot;offline&quot; until the device comes online</li>
                    <li>You can update vehicle details after registration</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <Link
                href="/fleet/vehicles"
                style={{
                  backgroundColor: '#374151',
                  color: '#f9fafb',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Adding Vehicle...
                  </>
                ) : (
                  <>
                    <PlusIcon width={16} height={16} />
                    Add Vehicle
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Information */}
        <div style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: currentThemeStyles.glassPanelBorder,
          boxShadow: currentThemeStyles.glassPanelShadow,
          backdropFilter: 'blur(12px)',
          marginTop: '2rem'
        }}>
          <h3 style={{
            color: currentThemeStyles.textPrimary,
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            Next Steps
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            color: currentThemeStyles.textSecondary,
            fontSize: '0.875rem',
            lineHeight: '1.5'
          }}>
            <div>
              <strong style={{ color: currentThemeStyles.textPrimary }}>1. Device Setup</strong><br />
              Install and configure the GPS tracking device in your vehicle
            </div>
            <div>
              <strong style={{ color: currentThemeStyles.textPrimary }}>2. Testing</strong><br />
              Test the device connectivity and location reporting
            </div>
            <div>
              <strong style={{ color: currentThemeStyles.textPrimary }}>3. Route Assignment</strong><br />
              Assign the vehicle to specific routes for operations
            </div>
          </div>
        </div>
      </div>

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}