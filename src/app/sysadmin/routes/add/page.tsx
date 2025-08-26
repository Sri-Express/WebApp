// src/app/sysadmin/routes/add/page.tsx - Admin Route Creation Form
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MapIcon,
  ArrowLeftIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface LocationData {
  name: string;
  coordinates: [number, number];
  address: string;
}

interface WaypointData {
  name: string;
  coordinates: [number, number];
  estimatedTime: number;
  order: number;
}

interface RouteFormData {
  name: string;
  startLocation: LocationData;
  endLocation: LocationData;
  waypoints: WaypointData[];
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
}

export default function CreateRoutePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<RouteFormData>({
    name: '',
    startLocation: {
      name: '',
      coordinates: [0, 0],
      address: ''
    },
    endLocation: {
      name: '',
      coordinates: [0, 0],
      address: ''
    },
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
    }
  });

  const [newAmenity, setNewAmenity] = useState('');

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addWaypoint = () => {
    const newWaypoint: WaypointData = {
      name: '',
      coordinates: [0, 0],
      estimatedTime: 0,
      order: formData.waypoints.length + 1
    };
    setFormData(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, newWaypoint]
    }));
  };

  const removeWaypoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index).map((wp, i) => ({
        ...wp,
        order: i + 1
      }))
    }));
  };

  const updateWaypoint = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      waypoints: prev.waypoints.map((wp, i) => 
        i === index ? { ...wp, [field]: value } : wp
      )
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.vehicleInfo.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        vehicleInfo: {
          ...prev.vehicleInfo,
          amenities: [...prev.vehicleInfo.amenities, newAmenity.trim()]
        }
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleInfo: {
        ...prev.vehicleInfo,
        amenities: prev.vehicleInfo.amenities.filter(a => a !== amenity)
      }
    }));
  };

  const parseCoordinates = (coordString: string): [number, number] => {
    const coords = coordString.split(',').map(c => parseFloat(c.trim()));
    return coords.length === 2 && !coords.some(isNaN) ? [coords[0], coords[1]] : [0, 0];
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Route name is required');
      return false;
    }

    if (!formData.startLocation.name.trim() || !formData.startLocation.address.trim()) {
      setError('Start location name and address are required');
      return false;
    }

    if (!formData.endLocation.name.trim() || !formData.endLocation.address.trim()) {
      setError('End location name and address are required');
      return false;
    }

    if (!formData.distance || parseFloat(formData.distance) <= 0) {
      setError('Valid distance is required');
      return false;
    }

    if (!formData.estimatedDuration || parseInt(formData.estimatedDuration) <= 0) {
      setError('Valid estimated duration is required');
      return false;
    }

    if (!formData.vehicleInfo.capacity || parseInt(formData.vehicleInfo.capacity) <= 0) {
      setError('Valid vehicle capacity is required');
      return false;
    }

    if (!formData.pricing.basePrice || parseFloat(formData.pricing.basePrice) <= 0) {
      setError('Valid base price is required');
      return false;
    }

    if (!formData.pricing.pricePerKm || parseFloat(formData.pricing.pricePerKm) <= 0) {
      setError('Valid price per km is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      const routeData = {
        name: formData.name.trim(),
        startLocation: {
          ...formData.startLocation,
          coordinates: formData.startLocation.coordinates
        },
        endLocation: {
          ...formData.endLocation,
          coordinates: formData.endLocation.coordinates
        },
        waypoints: formData.waypoints,
        distance: parseFloat(formData.distance),
        estimatedDuration: parseInt(formData.estimatedDuration),
        vehicleInfo: {
          type: formData.vehicleInfo.type,
          capacity: parseInt(formData.vehicleInfo.capacity),
          amenities: formData.vehicleInfo.amenities
        },
        pricing: {
          basePrice: parseFloat(formData.pricing.basePrice),
          pricePerKm: parseFloat(formData.pricing.pricePerKm)
        }
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/routes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create route');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/sysadmin/routes');
      }, 2000);
    } catch (error) {
      console.error('Route creation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create route');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          backgroundColor: '#1e293b',
          padding: '3rem',
          borderRadius: '1rem',
          border: '1px solid #334155',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <CheckIcon width={48} height={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Route Created Successfully!
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
            Your new route has been created and is now available in the system.
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Redirecting to routes page...
          </p>
        </div>
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
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Link href="/sysadmin/routes" style={{
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ArrowLeftIcon width={16} height={16} />
            Back to Routes
          </Link>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <MapIcon width={24} height={24} color="#10b981" />
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#f1f5f9',
              margin: 0
            }}>
              Create New Route
            </h1>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Basic Route Information */}
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
              Route Information
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                Route Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g., Padukka to Colombo Express"
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#f1f5f9',
                  fontSize: '0.875rem'
                }}
                required
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                  Distance (km) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.distance}
                  onChange={(e) => updateFormData('distance', e.target.value)}
                  placeholder="e.g., 45.5"
                  style={{
                    width: '100%',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    color: '#f1f5f9',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                  Estimated Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => updateFormData('estimatedDuration', e.target.value)}
                  placeholder="e.g., 120"
                  style={{
                    width: '100%',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    color: '#f1f5f9',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Start Location */}
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
              Start Location
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                Location Name *
              </label>
              <input
                type="text"
                value={formData.startLocation.name}
                onChange={(e) => updateFormData('startLocation.name', e.target.value)}
                placeholder="e.g., Padukka Bus Station"
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#f1f5f9',
                  fontSize: '0.875rem'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                Address *
              </label>
              <input
                type="text"
                value={formData.startLocation.address}
                onChange={(e) => updateFormData('startLocation.address', e.target.value)}
                placeholder="e.g., Main Street, Padukka, Western Province, Sri Lanka"
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#f1f5f9',
                  fontSize: '0.875rem'
                }}
                required
              />
            </div>

            <div>
              <label style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                Coordinates (longitude, latitude)
              </label>
              <input
                type="text"
                placeholder="e.g., 80.1234, 6.5678"
                onChange={(e) => {
                  const coords = parseCoordinates(e.target.value);
                  updateFormData('startLocation.coordinates', coords);
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#f1f5f9',
                  fontSize: '0.875rem'
                }}
              />
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Optional: Enter as "longitude, latitude" format
              </p>
            </div>
          </div>

          {/* End Location */}
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
              End Location
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                Location Name *
              </label>
              <input
                type="text"
                value={formData.endLocation.name}
                onChange={(e) => updateFormData('endLocation.name', e.target.value)}
                placeholder="e.g., Colombo Fort Railway Station"
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#f1f5f9',
                  fontSize: '0.875rem'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                Address *
              </label>
              <input
                type="text"
                value={formData.endLocation.address}
                onChange={(e) => updateFormData('endLocation.address', e.target.value)}
                placeholder="e.g., Fort Railway Station, Colombo 01, Western Province, Sri Lanka"
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#f1f5f9',
                  fontSize: '0.875rem'
                }}
                required
              />
            </div>

            <div>
              <label style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                Coordinates (longitude, latitude)
              </label>
              <input
                type="text"
                placeholder="e.g., 79.8612, 6.9271"
                onChange={(e) => {
                  const coords = parseCoordinates(e.target.value);
                  updateFormData('endLocation.coordinates', coords);
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#f1f5f9',
                  fontSize: '0.875rem'
                }}
              />
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Optional: Enter as "longitude, latitude" format
              </p>
            </div>
          </div>

          {/* Waypoints (Optional) */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                color: '#f1f5f9',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                margin: 0
              }}>
                Waypoints (Optional)
              </h2>
              <button
                type="button"
                onClick={addWaypoint}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <PlusIcon width={16} height={16} />
                Add Waypoint
              </button>
            </div>

            {formData.waypoints.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
                No waypoints added. Click "Add Waypoint" to add intermediate stops.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {formData.waypoints.map((waypoint, index) => (
                  <div key={index} style={{
                    backgroundColor: '#334155',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <h4 style={{ color: '#f1f5f9', margin: 0 }}>Waypoint {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeWaypoint(index)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        <MinusIcon width={12} height={12} />
                      </button>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <input
                        type="text"
                        value={waypoint.name}
                        onChange={(e) => updateWaypoint(index, 'name', e.target.value)}
                        placeholder="Waypoint name"
                        style={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '0.5rem',
                          padding: '0.75rem',
                          color: '#f1f5f9',
                          fontSize: '0.875rem'
                        }}
                      />
                      <input
                        type="number"
                        value={waypoint.estimatedTime}
                        onChange={(e) => updateWaypoint(index, 'estimatedTime', parseInt(e.target.value) || 0)}
                        placeholder="Time (min)"
                        style={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '0.5rem',
                          padding: '0.75rem',
                          color: '#f1f5f9',
                          fontSize: '0.875rem'
                        }}
                      />
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Coordinates (longitude, latitude)"
                      onChange={(e) => {
                        const coords = parseCoordinates(e.target.value);
                        updateWaypoint(index, 'coordinates', coords);
                      }}
                      style={{
                        width: '100%',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        color: '#f1f5f9',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Information */}
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
              Vehicle Information
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                  Vehicle Type *
                </label>
                <select
                  value={formData.vehicleInfo.type}
                  onChange={(e) => updateFormData('vehicleInfo.type', e.target.value as 'bus' | 'train')}
                  style={{
                    width: '100%',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    color: '#f1f5f9',
                    fontSize: '0.875rem'
                  }}
                  required
                >
                  <option value="bus">Bus</option>
                  <option value="train">Train</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                  Capacity (seats) *
                </label>
                <input
                  type="number"
                  value={formData.vehicleInfo.capacity}
                  onChange={(e) => updateFormData('vehicleInfo.capacity', e.target.value)}
                  placeholder="e.g., 50"
                  style={{
                    width: '100%',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    color: '#f1f5f9',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                Amenities
              </label>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="e.g., Air Conditioning"
                  style={{
                    flex: 1,
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    color: '#f1f5f9',
                    fontSize: '0.875rem'
                  }}
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Add
                </button>
              </div>
              
              {formData.vehicleInfo.amenities.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {formData.vehicleInfo.amenities.map((amenity, index) => (
                    <div key={index} style={{
                      backgroundColor: '#334155',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>{amenity}</span>
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pricing Information */}
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
              Pricing Information
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem'
            }}>
              <div>
                <label style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                  Base Price (LKR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricing.basePrice}
                  onChange={(e) => updateFormData('pricing.basePrice', e.target.value)}
                  placeholder="e.g., 50.00"
                  style={{
                    width: '100%',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    color: '#f1f5f9',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ color: '#f1f5f9', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                  Price per KM (LKR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricing.pricePerKm}
                  onChange={(e) => updateFormData('pricing.pricePerKm', e.target.value)}
                  placeholder="e.g., 2.50"
                  style={{
                    width: '100%',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    color: '#f1f5f9',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>
            </div>
          </div>

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

          {/* Submit Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem'
          }}>
            <Link href="/sysadmin/routes">
              <button
                type="button"
                style={{
                  backgroundColor: '#374151',
                  color: '#f9fafb',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#4b5563' : '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
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
                    border: '2px solid #ffffff40',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Creating Route...
                </>
              ) : (
                <>
                  <CheckIcon width={16} height={16} />
                  Create Route
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}