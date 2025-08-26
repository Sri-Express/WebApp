// src/app/fleet/routes/add/page.tsx - Fleet Route Creation Form - FIXED VERSION
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  MapIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TruckIcon,
  PlusIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface RouteForm {
  name: string;
  startLocation: {
    name: string;
    address: string;
  };
  endLocation: {
    name: string;
    address: string;
  };
  waypoints: Array<{
    name: string;
    estimatedTime: number;
  }>;
  distance: string;
  estimatedDuration: string;
  vehicleInfo: {
    type: 'bus' | 'train';
    capacity: string;
    amenities: string[];
  };
  pricing: {
    basePrice: string;
    pricePerKm: string;
  };
  schedules: Array<{
    departureTime: string;
    arrivalTime: string;
    frequency: string;
    daysOfWeek: string[];
  }>;
}

const daysOfWeek = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

const commonAmenities = [
  'AC', 'WiFi', 'Charging Ports', 'Comfortable Seating', 
  'Reading Lights', 'Storage Space', 'Clean Restrooms', 'Entertainment System'
];

export default function AddRoutePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [fleetProfile, setFleetProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Theme styles
  const currentThemeStyles = theme === 'dark' ? {
    mainBg: '#0f172a',
    cardBg: '#1e293b',
    inputBg: '#334155',
    borderColor: '#475569',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8'
  } : {
    mainBg: '#fffbeb',
    cardBg: '#ffffff',
    inputBg: '#f9fafb',
    borderColor: '#d1d5db',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280'
  };

  const [formData, setFormData] = useState<RouteForm>({
    name: '',
    startLocation: { name: '', address: '' },
    endLocation: { name: '', address: '' },
    waypoints: [],
    distance: '',
    estimatedDuration: '',
    vehicleInfo: {
      type: 'bus',
      capacity: '',
      amenities: []
    },
    pricing: {
      basePrice: '',
      pricePerKm: ''
    },
    schedules: [{
      departureTime: '',
      arrivalTime: '',
      frequency: '60',
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }]
  });

  // Check fleet profile on load
  useEffect(() => {
    const checkFleetProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Fleet profile not found');
        }

        const data = await response.json();
        setFleetProfile(data.fleet);

        if (data.fleet.status !== 'approved') {
          setError(`Cannot create routes. Fleet status: ${data.fleet.status}. Please wait for approval.`);
        }
      } catch (error) {
        console.error('Fleet profile check error:', error);
        setError('Fleet profile not found. Please complete your fleet profile first.');
      }
    };

    checkFleetProfile();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const addWaypoint = () => {
    setFormData(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, { name: '', estimatedTime: 30 }]
    }));
  };

  const removeWaypoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index)
    }));
  };

  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedules: [...prev.schedules, {
        departureTime: '',
        arrivalTime: '',
        frequency: '60',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }]
    }));
  };

  const removeSchedule = (index: number) => {
    if (formData.schedules.length > 1) {
      setFormData(prev => ({
        ...prev,
        schedules: prev.schedules.filter((_, i) => i !== index)
      }));
    }
  };

  const handleScheduleChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.map((schedule, i) => 
        i === index ? { ...schedule, [field]: value } : schedule
      )
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleInfo: {
        ...prev.vehicleInfo,
        amenities: prev.vehicleInfo.amenities.includes(amenity)
          ? prev.vehicleInfo.amenities.filter(a => a !== amenity)
          : [...prev.vehicleInfo.amenities, amenity]
      }
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Route name is required';
    if (!formData.startLocation.name.trim() || !formData.startLocation.address.trim()) 
      return 'Start location name and address are required';
    if (!formData.endLocation.name.trim() || !formData.endLocation.address.trim()) 
      return 'End location name and address are required';
    if (!formData.distance || parseFloat(formData.distance) <= 0) 
      return 'Valid distance is required';
    if (!formData.estimatedDuration || parseInt(formData.estimatedDuration) <= 0) 
      return 'Valid duration is required';
    if (!formData.vehicleInfo.capacity || parseInt(formData.vehicleInfo.capacity) <= 0) 
      return 'Valid vehicle capacity is required';
    if (!formData.pricing.basePrice || parseFloat(formData.pricing.basePrice) <= 0) 
      return 'Valid base price is required';
    if (!formData.pricing.pricePerKm || parseFloat(formData.pricing.pricePerKm) <= 0) 
      return 'Valid price per km is required';
    
    for (let i = 0; i < formData.schedules.length; i++) {
      const schedule = formData.schedules[i];
      if (!schedule.departureTime) return `Departure time is required for schedule ${i + 1}`;
      if (!schedule.arrivalTime) return `Arrival time is required for schedule ${i + 1}`;
      if (schedule.daysOfWeek.length === 0) return `At least one day must be selected for schedule ${i + 1}`;
      if (!schedule.frequency || parseInt(schedule.frequency) < 5) return `Frequency must be at least 5 minutes for schedule ${i + 1}`;
    }

    return null;
  };

  // NEW: Function to prepare data for API submission
  const prepareApiData = (formData: RouteForm) => {
    return {
      name: formData.name.trim(),
      startLocation: {
        name: formData.startLocation.name.trim(),
        address: formData.startLocation.address.trim(),
        coordinates: [79.8612, 6.9271] // Default Colombo coordinates
      },
      endLocation: {
        name: formData.endLocation.name.trim(),
        address: formData.endLocation.address.trim(),
        coordinates: [80.2210, 5.9549] // Default Galle coordinates
      },
      waypoints: formData.waypoints.map((waypoint, index) => ({
        name: waypoint.name.trim(),
        coordinates: [79.8612 + (index * 0.1), 6.9271 + (index * 0.1)],
        estimatedTime: Number(waypoint.estimatedTime),
        order: index
      })),
      distance: parseFloat(formData.distance), // Convert to number
      estimatedDuration: parseInt(formData.estimatedDuration), // Convert to number
      schedules: formData.schedules.map(schedule => ({
        departureTime: schedule.departureTime, // HTML time input gives 24-hour format
        arrivalTime: schedule.arrivalTime,
        frequency: parseInt(schedule.frequency), // Convert to number
        daysOfWeek: schedule.daysOfWeek, // Already array of strings
        isActive: true
      })),
      vehicleInfo: {
        type: formData.vehicleInfo.type,
        capacity: parseInt(formData.vehicleInfo.capacity), // Convert to number
        amenities: formData.vehicleInfo.amenities
      },
      pricing: {
        basePrice: parseFloat(formData.pricing.basePrice), // Convert to number
        pricePerKm: parseFloat(formData.pricing.pricePerKm), // Convert to number
        discounts: [
          { type: 'student', percentage: 50 },
          { type: 'senior', percentage: 25 },
          { type: 'military', percentage: 30 }
        ]
      }
    };
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Prepare the data with proper types
      const apiData = prepareApiData(formData);
      
      console.log('Sending route data:', apiData); // Debug log

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/routes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData) // Send the converted data
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create route');
      }

      setSuccess('Route application submitted successfully! It will be reviewed by administrators.');
      
      // Reset form or redirect after success
      setTimeout(() => {
        router.push('/fleet/routes');
      }, 2000);

    } catch (error) {
      console.error('Create route error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create route');
    } finally {
      setLoading(false);
    }
  };

  if (!fleetProfile || (fleetProfile && (fleetProfile as any).status !== 'approved')) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: currentThemeStyles.mainBg,
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: currentThemeStyles.cardBg,
          padding: '2rem',
          borderRadius: '0.75rem',
          border: `1px solid ${currentThemeStyles.borderColor}`,
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <InformationCircleIcon width={48} height={48} style={{ 
            margin: '0 auto 1rem', 
            color: '#f59e0b'
          }} />
          <h2 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>
            Fleet Profile Required
          </h2>
          <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1.5rem' }}>
            {error || 'You need an approved fleet profile to create routes.'}
          </p>
          <button
            onClick={() => router.push('/fleet/profile')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            Go to Profile
          </button>
          <button
            onClick={() => router.push('/fleet/routes')}
            style={{
              backgroundColor: currentThemeStyles.inputBg,
              color: currentThemeStyles.textPrimary,
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: `1px solid ${currentThemeStyles.borderColor}`,
              cursor: 'pointer'
            }}
          >
            Back to Routes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: currentThemeStyles.mainBg,
      padding: '2rem 0'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 1.5rem'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => router.push('/fleet/routes')}
            style={{
              backgroundColor: 'transparent',
              color: currentThemeStyles.textSecondary,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            ← Back to Routes
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <MapIcon width={24} height={24} color="#f59e0b" />
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: currentThemeStyles.textPrimary,
              margin: 0
            }}>
              Create New Route
            </h1>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
            border: `1px solid ${theme === 'dark' ? '#991b1b' : '#f87171'}`,
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            color: theme === 'dark' ? '#fecaca' : '#dc2626'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: theme === 'dark' ? '#064e3b' : '#f0fdf4',
            border: `1px solid ${theme === 'dark' ? '#059669' : '#10b981'}`,
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            color: theme === 'dark' ? '#6ee7b7' : '#047857'
          }}>
            {success}
          </div>
        )}

        <div>
          {/* Basic Route Information */}
          <div style={{
            backgroundColor: currentThemeStyles.cardBg,
            padding: '2rem',
            borderRadius: '0.75rem',
            border: `1px solid ${currentThemeStyles.borderColor}`,
            marginBottom: '2rem'
          }}>
            <h3 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <InformationCircleIcon width={20} height={20} />
              Basic Information
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1.5rem'
            }}>
              <div>
                <label style={{ 
                  color: currentThemeStyles.textPrimary,
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  display: 'block'
                }}>
                  Route Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Colombo - Galle Express"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: currentThemeStyles.inputBg,
                    border: `1px solid ${currentThemeStyles.borderColor}`,
                    borderRadius: '0.5rem',
                    color: currentThemeStyles.textPrimary
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    color: currentThemeStyles.textPrimary,
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    Start Location Name *
                  </label>
                  <input
                    type="text"
                    value={formData.startLocation.name}
                    onChange={(e) => handleNestedChange('startLocation', 'name', e.target.value)}
                    placeholder="e.g., Colombo Fort"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: currentThemeStyles.inputBg,
                      border: `1px solid ${currentThemeStyles.borderColor}`,
                      borderRadius: '0.5rem',
                      color: currentThemeStyles.textPrimary
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    color: currentThemeStyles.textPrimary,
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    End Location Name *
                  </label>
                  <input
                    type="text"
                    value={formData.endLocation.name}
                    onChange={(e) => handleNestedChange('endLocation', 'name', e.target.value)}
                    placeholder="e.g., Galle Bus Stand"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: currentThemeStyles.inputBg,
                      border: `1px solid ${currentThemeStyles.borderColor}`,
                      borderRadius: '0.5rem',
                      color: currentThemeStyles.textPrimary
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    color: currentThemeStyles.textPrimary,
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    Start Address *
                  </label>
                  <input
                    type="text"
                    value={formData.startLocation.address}
                    onChange={(e) => handleNestedChange('startLocation', 'address', e.target.value)}
                    placeholder="Full address of start location"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: currentThemeStyles.inputBg,
                      border: `1px solid ${currentThemeStyles.borderColor}`,
                      borderRadius: '0.5rem',
                      color: currentThemeStyles.textPrimary
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    color: currentThemeStyles.textPrimary,
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    End Address *
                  </label>
                  <input
                    type="text"
                    value={formData.endLocation.address}
                    onChange={(e) => handleNestedChange('endLocation', 'address', e.target.value)}
                    placeholder="Full address of end location"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: currentThemeStyles.inputBg,
                      border: `1px solid ${currentThemeStyles.borderColor}`,
                      borderRadius: '0.5rem',
                      color: currentThemeStyles.textPrimary
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    color: currentThemeStyles.textPrimary,
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    Distance (km) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distance}
                    onChange={(e) => handleInputChange('distance', e.target.value)}
                    placeholder="e.g., 116.5"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: currentThemeStyles.inputBg,
                      border: `1px solid ${currentThemeStyles.borderColor}`,
                      borderRadius: '0.5rem',
                      color: currentThemeStyles.textPrimary
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    color: currentThemeStyles.textPrimary,
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                    placeholder="e.g., 150"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: currentThemeStyles.inputBg,
                      border: `1px solid ${currentThemeStyles.borderColor}`,
                      borderRadius: '0.5rem',
                      color: currentThemeStyles.textPrimary
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div style={{
            backgroundColor: currentThemeStyles.cardBg,
            padding: '2rem',
            borderRadius: '0.75rem',
            border: `1px solid ${currentThemeStyles.borderColor}`,
            marginBottom: '2rem'
          }}>
            <h3 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <TruckIcon width={20} height={20} />
              Vehicle Information
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label style={{ 
                  color: currentThemeStyles.textPrimary,
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  display: 'block'
                }}>
                  Vehicle Type *
                </label>
                <select
                  value={formData.vehicleInfo.type}
                  onChange={(e) => handleNestedChange('vehicleInfo', 'type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: currentThemeStyles.inputBg,
                    border: `1px solid ${currentThemeStyles.borderColor}`,
                    borderRadius: '0.5rem',
                    color: currentThemeStyles.textPrimary
                  }}
                >
                  <option value="bus">Bus</option>
                  <option value="train">Train</option>
                </select>
              </div>
              <div>
                <label style={{ 
                  color: currentThemeStyles.textPrimary,
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  display: 'block'
                }}>
                  Capacity (passengers) *
                </label>
                <input
                  type="number"
                  value={formData.vehicleInfo.capacity}
                  onChange={(e) => handleNestedChange('vehicleInfo', 'capacity', e.target.value)}
                  placeholder="e.g., 50"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: currentThemeStyles.inputBg,
                    border: `1px solid ${currentThemeStyles.borderColor}`,
                    borderRadius: '0.5rem',
                    color: currentThemeStyles.textPrimary
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ 
                color: currentThemeStyles.textPrimary,
                fontWeight: '500',
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                Amenities
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '0.5rem'
              }}>
                {commonAmenities.map((amenity) => (
                  <label key={amenity} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: currentThemeStyles.textPrimary,
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.vehicleInfo.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      style={{ cursor: 'pointer' }}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div style={{
            backgroundColor: currentThemeStyles.cardBg,
            padding: '2rem',
            borderRadius: '0.75rem',
            border: `1px solid ${currentThemeStyles.borderColor}`,
            marginBottom: '2rem'
          }}>
            <h3 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CurrencyDollarIcon width={20} height={20} />
              Pricing
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              <div>
                <label style={{ 
                  color: currentThemeStyles.textPrimary,
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  display: 'block'
                }}>
                  Base Price (LKR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricing.basePrice}
                  onChange={(e) => handleNestedChange('pricing', 'basePrice', e.target.value)}
                  placeholder="e.g., 350.00"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: currentThemeStyles.inputBg,
                    border: `1px solid ${currentThemeStyles.borderColor}`,
                    borderRadius: '0.5rem',
                    color: currentThemeStyles.textPrimary
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  color: currentThemeStyles.textPrimary,
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  display: 'block'
                }}>
                  Price per KM (LKR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricing.pricePerKm}
                  onChange={(e) => handleNestedChange('pricing', 'pricePerKm', e.target.value)}
                  placeholder="e.g., 3.00"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: currentThemeStyles.inputBg,
                    border: `1px solid ${currentThemeStyles.borderColor}`,
                    borderRadius: '0.5rem',
                    color: currentThemeStyles.textPrimary
                  }}
                />
              </div>
            </div>
          </div>

          {/* Schedules */}
          <div style={{
            backgroundColor: currentThemeStyles.cardBg,
            padding: '2rem',
            borderRadius: '0.75rem',
            border: `1px solid ${currentThemeStyles.borderColor}`,
            marginBottom: '2rem'
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
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <ClockIcon width={20} height={20} />
                Schedules
              </h3>
              <button
                type="button"
                onClick={addSchedule}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <PlusIcon width={16} height={16} />
                Add Schedule
              </button>
            </div>

            {formData.schedules.map((schedule, index) => (
              <div key={index} style={{
                backgroundColor: currentThemeStyles.inputBg,
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: `1px solid ${currentThemeStyles.borderColor}`,
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{
                    color: currentThemeStyles.textPrimary,
                    margin: 0
                  }}>
                    Schedule {index + 1}
                  </h4>
                  {formData.schedules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSchedule(index)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <XMarkIcon width={16} height={16} />
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <label style={{ 
                      color: currentThemeStyles.textPrimary,
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>
                      Departure Time *
                    </label>
                    <input
                      type="time"
                      value={schedule.departureTime}
                      onChange={(e) => handleScheduleChange(index, 'departureTime', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: currentThemeStyles.cardBg,
                        border: `1px solid ${currentThemeStyles.borderColor}`,
                        borderRadius: '0.5rem',
                        color: currentThemeStyles.textPrimary
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      color: currentThemeStyles.textPrimary,
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>
                      Arrival Time *
                    </label>
                    <input
                      type="time"
                      value={schedule.arrivalTime}
                      onChange={(e) => handleScheduleChange(index, 'arrivalTime', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: currentThemeStyles.cardBg,
                        border: `1px solid ${currentThemeStyles.borderColor}`,
                        borderRadius: '0.5rem',
                        color: currentThemeStyles.textPrimary
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      color: currentThemeStyles.textPrimary,
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>
                      Frequency (minutes) *
                    </label>
                    <input
                      type="number"
                      min="5"
                      value={schedule.frequency}
                      onChange={(e) => handleScheduleChange(index, 'frequency', e.target.value)}
                      placeholder="60"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: currentThemeStyles.cardBg,
                        border: `1px solid ${currentThemeStyles.borderColor}`,
                        borderRadius: '0.5rem',
                        color: currentThemeStyles.textPrimary
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ 
                    color: currentThemeStyles.textPrimary,
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    Operating Days *
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                    gap: '0.5rem'
                  }}>
                    {daysOfWeek.map((day) => (
                      <label key={day.value} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: currentThemeStyles.textPrimary,
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={schedule.daysOfWeek.includes(day.value)}
                          onChange={(e) => {
                            const newDays = e.target.checked
                              ? [...schedule.daysOfWeek, day.value]
                              : schedule.daysOfWeek.filter(d => d !== day.value);
                            handleScheduleChange(index, 'daysOfWeek', newDays);
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        {day.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={() => router.push('/fleet/routes')}
              style={{
                backgroundColor: currentThemeStyles.inputBg,
                color: currentThemeStyles.textPrimary,
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                border: `1px solid ${currentThemeStyles.borderColor}`,
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#6b7280' : '#3b82f6',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Route Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}