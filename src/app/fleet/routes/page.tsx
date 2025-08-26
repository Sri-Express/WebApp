// src/app/fleet/routes/page.tsx - Fleet Route Assignment Management (FIXED - ASSIGNMENT ONLY)
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapIcon,
  TruckIcon,
  PlusIcon,
  MinusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface Route {
  _id: string;
  routeId: string;
  name: string;
  startLocation: {
    name: string;
    address: string;
  };
  endLocation: {
    name: string;
    address: string;
  };
  distance: number;
  estimatedDuration: number;
  vehicleInfo: {
    type: 'bus' | 'train';
    capacity: number;
    amenities: string[];
  };
  pricing: {
    basePrice: number;
    pricePerKm: number;
  };
  assignedVehicles?: number; // Count of assigned vehicles
}

interface Vehicle {
  _id: string;
  vehicleNumber: string;
  vehicleType: string;
  status: 'online' | 'offline' | 'maintenance';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  assignedRoutes?: string[]; // Route IDs this vehicle is assigned to
}

interface RouteAssignment {
  _id: string;
  routeId: {
    _id: string;
    name: string;
    routeId: string;
    startLocation: { name: string };
    endLocation: { name: string };
  };
  vehicleId: {
    _id: string;
    vehicleNumber: string;
    vehicleType: string;
    status: string;
  };
  assignedAt: string;
  status: 'active' | 'inactive';
}

export default function FleetRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assignments, setAssignments] = useState<RouteAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<Route | null>(null);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Load available routes (admin-created, approved routes)
        const routesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/routes/available`, {
          headers
        });
        
        if (!routesResponse.ok) {
          throw new Error('Failed to load available routes');
        }
        const routesData = await routesResponse.json();

        // Load approved vehicles for assignment
        const vehiclesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/vehicles`, {
          headers
        });
        
        if (!vehiclesResponse.ok) {
          throw new Error('Failed to load vehicles');
        }
        const vehiclesData = await vehiclesResponse.json();

        // Load current route assignments
        const assignmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/route-assignments`, {
          headers
        });
        
        if (!assignmentsResponse.ok) {
          throw new Error('Failed to load assignments');
        }
        const assignmentsData = await assignmentsResponse.json();

        setRoutes(routesData.routes || []);
        setVehicles(vehiclesData.vehicles?.filter((v: Vehicle) => v.approvalStatus === 'approved') || []);
        setAssignments(assignmentsData.assignments || []);
      } catch (error) {
        console.error('Load data error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getRouteAssignments = (routeId: string) => {
    return assignments.filter(a => a.routeId._id === routeId && a.status === 'active');
  };

  const getAvailableVehiclesForRoute = (route: Route) => {
    return vehicles.filter(v => 
      v.approvalStatus === 'approved' && 
      v.vehicleType === route.vehicleInfo.type && 
      v.status !== 'maintenance'
    );
  };

  const handleAssignVehicles = async (routeId: string, vehicleIds: string[]) => {
    setActionLoading(`assign-${routeId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/route-assignments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          routeId,
          vehicleIds
        })
      });

      if (!response.ok) {
        throw new Error('Failed to assign vehicles');
      }

      const result = await response.json();

      // Update assignments state
      setAssignments(prev => [...prev, ...result.assignments]);
      setShowAssignModal(null);
      setSelectedVehicleIds([]);
    } catch (error) {
      console.error('Assign vehicles error:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign vehicles');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnassignVehicle = async (routeId: string, vehicleId: string) => {
    setActionLoading(`unassign-${vehicleId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/route-assignments/${routeId}/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to unassign vehicle');
      }

      setAssignments(prev => 
        prev.filter(a => !(a.routeId._id === routeId && a.vehicleId._id === vehicleId))
      );
    } catch (error) {
      console.error('Unassign vehicle error:', error);
      setError(error instanceof Error ? error.message : 'Failed to unassign vehicle');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number) => `LKR ${amount.toFixed(2)}`;
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
        Loading routes and vehicles...
      </div>
    );
  }

  const approvedVehicles = vehicles.filter(v => v.approvalStatus === 'approved');

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
          alignItems: 'flex-start',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#f1f5f9',
              margin: '0 0 0.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <MapIcon width={32} height={32} color="#10b981" />
              Route Assignments
            </h1>
            <p style={{
              color: '#94a3b8',
              margin: 0,
              fontSize: '1rem'
            }}>
              Assign your approved vehicles to available routes
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <Link href="/fleet/vehicles" style={{
              backgroundColor: '#374151',
              color: '#f9fafb',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <TruckIcon width={20} height={20} />
              Manage Vehicles
            </Link>
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

        {/* Fleet Summary */}
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
              <MapIcon width={32} height={32} color="#3b82f6" />
              <div>
                <h3 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {routes.length}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Available Routes</p>
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
                  {approvedVehicles.length}
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
              <TruckIcon width={32} height={32} color="#f59e0b" />
              <div>
                <h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {assignments.filter(a => a.status === 'active').length}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Active Assignments</p>
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
              <BuildingOfficeIcon width={32} height={32} color="#8b5cf6" />
              <div>
                <h3 style={{ color: '#8b5cf6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {vehicles.filter(v => v.status === 'online').length}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Vehicles Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Information Box */}
        {approvedVehicles.length === 0 && (
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <InformationCircleIcon width={24} height={24} color="#3b82f6" />
              <h3 style={{ color: '#3b82f6', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                No Approved Vehicles Available
              </h3>
            </div>
            <p style={{ color: '#94a3b8', margin: '0 0 1rem 0' }}>
              You need approved vehicles before you can assign them to routes. Make sure you have:
            </p>
            <ul style={{ color: '#94a3b8', margin: 0, paddingLeft: '1.5rem' }}>
              <li>Added vehicles to your fleet</li>
              <li>Received admin approval for your vehicles</li>
              <li>Vehicles are in working condition (not in maintenance)</li>
            </ul>
            <div style={{ marginTop: '1rem' }}>
              <Link href="/fleet/vehicles/add" style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}>
                <PlusIcon width={16} height={16} />
                Add Vehicle
              </Link>
            </div>
          </div>
        )}

        {/* Available Routes */}
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
            <MapIcon width={20} height={20} />
            Available Routes ({routes.length})
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '1.5rem'
          }}>
            {routes.map((route) => {
              const routeAssignments = getRouteAssignments(route._id);
              const assignedVehicles = routeAssignments.map(a => a.vehicleId);
              const availableVehicles = getAvailableVehiclesForRoute(route);
              
              return (
                <div key={route._id} style={{
                  backgroundColor: '#334155',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #475569'
                }}>
                  {/* Route Header */}
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
                        {route.name}
                      </h3>
                      <p style={{
                        color: '#94a3b8',
                        fontSize: '0.875rem',
                        margin: 0
                      }}>
                        {route.startLocation.name} → {route.endLocation.name}
                      </p>
                    </div>
                    
                    <div style={{
                      backgroundColor: route.vehicleInfo.type === 'bus' ? '#10b981' : '#6b7280',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      marginLeft: '1rem'
                    }}>
                      {route.vehicleInfo.type}
                    </div>
                  </div>

                  {/* Route Details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1rem',
                    padding: '1rem',
                    backgroundColor: '#1e293b',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        color: '#f1f5f9',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '0.25rem'
                      }}>
                        {route.distance} km
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Distance</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        color: '#f1f5f9',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '0.25rem'
                      }}>
                        {formatDuration(route.estimatedDuration)}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Duration</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        color: '#f1f5f9',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '0.25rem'
                      }}>
                        {route.vehicleInfo.capacity} seats
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Capacity</div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div style={{
                    backgroundColor: '#1e293b',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Base Price: </span>
                        <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>
                          {formatCurrency(route.pricing.basePrice)}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Per KM: </span>
                        <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>
                          {formatCurrency(route.pricing.pricePerKm)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Vehicles */}
                  <div style={{
                    backgroundColor: '#1e293b',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: assignedVehicles.length > 0 ? '1rem' : 0
                    }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '500' }}>
                        Assigned Vehicles ({assignedVehicles.length})
                      </span>
                    </div>
                    
                    {assignedVehicles.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {assignedVehicles.map((vehicle) => (
                          <div key={vehicle._id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#334155',
                            padding: '0.75rem',
                            borderRadius: '0.5rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: vehicle.status === 'online' ? '#10b981' : '#6b7280'
                              }} />
                              <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '500' }}>
                                {vehicle.vehicleNumber}
                              </span>
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                ({vehicle.status})
                              </span>
                            </div>
                            <button
                              onClick={() => handleUnassignVehicle(route._id, vehicle._id)}
                              disabled={actionLoading === `unassign-${vehicle._id}`}
                              style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                border: 'none',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                opacity: actionLoading === `unassign-${vehicle._id}` ? 0.7 : 1
                              }}
                            >
                              <MinusIcon width={12} height={12} />
                              {actionLoading === `unassign-${vehicle._id}` ? 'Removing...' : 'Remove'}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0, textAlign: 'center' }}>
                        No vehicles assigned to this route
                      </p>
                    )}
                  </div>

                  {/* Amenities */}
                  {route.vehicleInfo.amenities.length > 0 && (
                    <div style={{
                      backgroundColor: '#1e293b',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>
                        Required Amenities:
                      </span>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        {route.vehicleInfo.amenities.map((amenity, index) => (
                          <span key={index} style={{
                            backgroundColor: '#334155',
                            color: '#f1f5f9',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem'
                          }}>
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={() => setSelectedRoute(route)}
                      style={{
                        backgroundColor: '#374151',
                        color: '#f9fafb',
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
                      <InformationCircleIcon width={16} height={16} />
                      View Details
                    </button>
                    
                    {availableVehicles.length > 0 && (
                      <button
                        onClick={() => {
                          setShowAssignModal(route);
                          setSelectedVehicleIds([]);
                        }}
                        disabled={actionLoading === `assign-${route._id}`}
                        style={{
                          backgroundColor: actionLoading === `assign-${route._id}` ? '#4b5563' : '#10b981',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          border: 'none',
                          fontSize: '0.875rem',
                          cursor: actionLoading === `assign-${route._id}` ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flex: 1
                        }}
                      >
                        <PlusIcon width={16} height={16} />
                        {actionLoading === `assign-${route._id}` ? 'Assigning...' : 'Assign Vehicles'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {routes.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#94a3b8'
            }}>
              <MapIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>No Routes Available</h3>
              <p>No approved routes are available for vehicle assignment at this time.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
                Routes are created by system administrators. Please contact admin if you need new routes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Route Details Modal */}
      {selectedRoute && (
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
                {selectedRoute.name}
              </h3>
              <button
                onClick={() => setSelectedRoute(null)}
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
              gridTemplateColumns: '1fr',
              gap: '1.5rem'
            }}>
              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <h4 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Route Information</h4>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Route ID:</span>
                  <span style={{ color: '#f1f5f9', marginLeft: '0.5rem' }}>{selectedRoute.routeId}</span>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Start:</span>
                  <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                    {selectedRoute.startLocation.address}
                  </p>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>End:</span>
                  <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                    {selectedRoute.endLocation.address}
                  </p>
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
                onClick={() => setSelectedRoute(null)}
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

      {/* Assign Vehicles Modal */}
      {showAssignModal && (
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
              Assign Vehicles to {showAssignModal.name}
            </h3>
            
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              marginBottom: '1.5rem'
            }}>
              {getAvailableVehiclesForRoute(showAssignModal)
                .filter(v => !getRouteAssignments(showAssignModal._id).some(a => a.vehicleId._id === v._id))
                .map((vehicle) => (
                <label key={vehicle._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: '#334155',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedVehicleIds.includes(vehicle._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVehicleIds(prev => [...prev, vehicle._id]);
                      } else {
                        setSelectedVehicleIds(prev => prev.filter(id => id !== vehicle._id));
                      }
                    }}
                    style={{ accentColor: '#10b981' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#f1f5f9', fontWeight: '500' }}>
                      {vehicle.vehicleNumber}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                      {vehicle.vehicleType} • {vehicle.status}
                    </div>
                  </div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: vehicle.status === 'online' ? '#10b981' : '#6b7280'
                  }} />
                </label>
              ))}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => {
                  setShowAssignModal(null);
                  setSelectedVehicleIds([]);
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
                onClick={() => handleAssignVehicles(showAssignModal._id, selectedVehicleIds)}
                disabled={selectedVehicleIds.length === 0 || actionLoading === `assign-${showAssignModal._id}`}
                style={{
                  backgroundColor: selectedVehicleIds.length === 0 ? '#4b5563' : '#10b981',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: selectedVehicleIds.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: actionLoading === `assign-${showAssignModal._id}` ? 0.7 : 1
                }}
              >
                {actionLoading === `assign-${showAssignModal._id}` ? 'Assigning...' : `Assign ${selectedVehicleIds.length} Vehicle${selectedVehicleIds.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}