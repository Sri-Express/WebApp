// src/app/route-admin/vehicles/page.tsx - Vehicle Assignment Management
"use client";

import { useState, useEffect } from 'react';
import {
  TruckIcon,
  PlusIcon,
  MinusIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Route {
  _id: string;
  routeId: string;
  name: string;
  requiredVehicleType: string;
  capacity: number;
}

interface Vehicle {
  _id: string;
  vehicleNumber: string;
  vehicleType: string;
  status: 'online' | 'offline' | 'maintenance';
  location?: string;
  batteryLevel?: number;
  signalStrength?: number;
  fleetId: {
    _id: string;
    companyName: string;
    contactNumber: string;
  };
}

interface FleetData {
  fleet: {
    _id: string;
    companyName: string;
    contactNumber: string;
  };
  vehicles: Vehicle[];
  vehicleCount: number;
}

interface Assignment {
  _id: string;
  vehicleId: {
    _id: string;
    vehicleNumber: string;
    vehicleType: string;
    status: string;
    location?: string;
    batteryLevel?: number;
  };
  fleetId: {
    _id: string;
    companyName: string;
    contactNumber: string;
  };
  assignedBy: {
    _id: string;
    name: string;
    email: string;
  };
  assignedAt: string;
  status: 'active' | 'inactive';
  schedules: Array<{
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
    isActive: boolean;
  }>;
}

export default function RouteAdminVehicles() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [route, setRoute] = useState<Route | null>(null);
  const [availableFleets, setAvailableFleets] = useState<FleetData[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [totalAvailableVehicles, setTotalAvailableVehicles] = useState(0);
  
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load available vehicles
      const vehiclesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/available-vehicles`, {
        headers
      });

      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json();
        setRoute(vehiclesData.route);
        setAvailableFleets(vehiclesData.availableFleets || []);
        setTotalAvailableVehicles(vehiclesData.totalAvailableVehicles || 0);
      }

      // Load current assignments
      const assignmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/assignments`, {
        headers
      });

      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData.assignments || []);
      }
    } catch (err) {
      console.error('Load data error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignVehicles = async () => {
    if (selectedVehicleIds.length === 0) return;
    
    setActionLoading('assign-vehicles');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/assign-vehicles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vehicleIds: selectedVehicleIds,
          schedules: [{
            startTime: "06:00",
            endTime: "22:00",
            daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
            isActive: true
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign vehicles');
      }

      const result = await response.json();
      
      // Update assignments state
      setAssignments(prev => [...prev, ...result.assignments]);
      
      // Reload data to refresh available vehicles
      await loadData();
      
      setShowAssignModal(false);
      setSelectedVehicleIds([]);
    } catch (err) {
      console.error('Assign vehicles error:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign vehicles');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    setActionLoading(`remove-${assignmentId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'Removed by route admin'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to remove assignment');
      }

      // Remove assignment from state
      setAssignments(prev => prev.filter(a => a._id !== assignmentId));
      
      // Reload data to refresh available vehicles
      await loadData();
    } catch (err) {
      console.error('Remove assignment error:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove assignment');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'offline': return '#6b7280';
      case 'maintenance': return '#ef4444';
      default: return '#6b7280';
    }
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
        minHeight: '80vh',
        color: '#f1f5f9'
      }}>
        Loading vehicle management...
      </div>
    );
  }

  if (!route) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{
          backgroundColor: '#7c2d12',
          border: '1px solid #991b1b',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <ExclamationTriangleIcon width={48} height={48} color="#fed7a1" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: '#fed7a1', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            No Route Assigned
          </h2>
          <p style={{ color: '#fecaca' }}>
            You need an assigned route to manage vehicle assignments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
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
          alignItems: 'flex-start',
          marginBottom: '1rem'
        }}>
          <div>
            <h1 style={{
              color: '#f1f5f9',
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              Vehicle Assignment Management
            </h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>
              Route: <strong style={{ color: '#8b5cf6' }}>{route.name}</strong> ({route.routeId})
            </p>
          </div>

          {totalAvailableVehicles > 0 && (
            <button
              onClick={() => setShowAssignModal(true)}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              <PlusIcon width={16} height={16} />
              Assign Vehicles
            </button>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#334155',
            padding: '1rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {assignments.length}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Assigned Vehicles</div>
          </div>

          <div style={{
            backgroundColor: '#334155',
            padding: '1rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {assignments.filter(a => a.vehicleId.status === 'online').length}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Online</div>
          </div>

          <div style={{
            backgroundColor: '#334155',
            padding: '1rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {totalAvailableVehicles}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Available to Assign</div>
          </div>

          <div style={{
            backgroundColor: '#334155',
            padding: '1rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {availableFleets.length}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Partner Fleets</div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(127, 29, 29, 0.8)',
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
          <button
            onClick={() => setError(null)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fca5a5',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Currently Assigned Vehicles */}
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
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <TruckIcon width={20} height={20} />
          Currently Assigned Vehicles ({assignments.length})
        </h2>

        {assignments.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem'
          }}>
            {assignments.map((assignment) => (
              <div key={assignment._id} style={{
                backgroundColor: '#334155',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #475569'
              }}>
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
                      marginBottom: '0.5rem'
                    }}>
                      {assignment.vehicleId.vehicleNumber}
                    </h3>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      Fleet: {assignment.fleetId.companyName}
                    </p>
                  </div>
                  
                  <div style={{
                    backgroundColor: getStatusColor(assignment.vehicleId.status),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {assignment.vehicleId.status}
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#1e293b',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Assigned: </span>
                    <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                      {formatDateTime(assignment.assignedAt)}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Assigned by: </span>
                    <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                      {assignment.assignedBy.name}
                    </span>
                  </div>

                  {assignment.vehicleId.batteryLevel && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Battery: </span>
                      <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                        {assignment.vehicleId.batteryLevel}%
                      </span>
                    </div>
                  )}

                  {assignment.schedules && assignment.schedules.length > 0 && (
                    <div>
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Schedule: </span>
                      <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                        {assignment.schedules[0].startTime} - {assignment.schedules[0].endTime}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => setSelectedAssignment(assignment)}
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
                    <EyeIcon width={14} height={14} />
                    Details
                  </button>
                  
                  <button
                    onClick={() => handleRemoveAssignment(assignment._id)}
                    disabled={actionLoading === `remove-${assignment._id}`}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flex: 1,
                      opacity: actionLoading === `remove-${assignment._id}` ? 0.7 : 1
                    }}
                  >
                    <MinusIcon width={14} height={14} />
                    {actionLoading === `remove-${assignment._id}` ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#94a3b8'
          }}>
            <TruckIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No vehicles assigned to this route yet.</p>
            {totalAvailableVehicles > 0 && (
              <button
                onClick={() => setShowAssignModal(true)}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                Assign First Vehicle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Available Vehicles by Fleet */}
      {totalAvailableVehicles > 0 && (
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
            Available Vehicles by Fleet
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem'
          }}>
            {availableFleets.map((fleetData) => (
              <div key={fleetData.fleet._id} style={{
                backgroundColor: '#334155',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #475569'
              }}>
                <h3 style={{
                  color: '#f1f5f9',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  {fleetData.fleet.companyName}
                </h3>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}>
                  {fleetData.vehicleCount} compatible vehicles available
                </p>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {fleetData.vehicles.map((vehicle) => (
                    <div key={vehicle._id} style={{
                      backgroundColor: '#1e293b',
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(vehicle.status)
                        }} />
                        <div>
                          <div style={{
                            color: '#f1f5f9',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            {vehicle.vehicleNumber}
                          </div>
                          <div style={{
                            color: '#94a3b8',
                            fontSize: '0.75rem'
                          }}>
                            {vehicle.vehicleType} • {vehicle.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle Assignment Modal */}
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
            <h3 style={{
              color: '#f1f5f9',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Assign Vehicles to Route
            </h3>
            
            <p style={{
              color: '#94a3b8',
              marginBottom: '1.5rem'
            }}>
              Select vehicles from any fleet to assign to <strong>{route.name}</strong>
            </p>

            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              marginBottom: '1.5rem'
            }}>
              {availableFleets.map((fleetData) => (
                <div key={fleetData.fleet._id} style={{
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem'
                  }}>
                    {fleetData.fleet.companyName}
                  </h4>
                  
                  {fleetData.vehicles.map((vehicle) => (
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
                        style={{ accentColor: '#8b5cf6' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          color: '#f1f5f9',
                          fontWeight: '500'
                        }}>
                          {vehicle.vehicleNumber}
                        </div>
                        <div style={{
                          color: '#94a3b8',
                          fontSize: '0.875rem'
                        }}>
                          {vehicle.vehicleType} • {vehicle.status}
                        </div>
                      </div>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(vehicle.status)
                      }} />
                    </label>
                  ))}
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => {
                  setShowAssignModal(false);
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
                onClick={handleAssignVehicles}
                disabled={selectedVehicleIds.length === 0 || actionLoading === 'assign-vehicles'}
                style={{
                  backgroundColor: selectedVehicleIds.length === 0 ? '#6b7280' : '#10b981',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: selectedVehicleIds.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: actionLoading === 'assign-vehicles' ? 0.7 : 1
                }}
              >
                {actionLoading === 'assign-vehicles' ? 'Assigning...' : `Assign ${selectedVehicleIds.length} Vehicle${selectedVehicleIds.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Details Modal */}
      {selectedAssignment && (
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
            maxWidth: '500px',
            width: '90%'
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
                Vehicle Assignment Details
              </h3>
              <button
                onClick={() => setSelectedAssignment(null)}
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
              backgroundColor: '#334155',
              padding: '1.5rem',
              borderRadius: '0.5rem'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Vehicle:</span>
                <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0', fontWeight: '600' }}>
                  {selectedAssignment.vehicleId.vehicleNumber}
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Fleet:</span>
                <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>
                  {selectedAssignment.fleetId.companyName}
                </p>
                <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                  Contact: {selectedAssignment.fleetId.contactNumber}
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Status:</span>
                <p style={{
                  color: getStatusColor(selectedAssignment.vehicleId.status),
                  margin: '0.25rem 0 0 0',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {selectedAssignment.vehicleId.status}
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Assigned:</span>
                <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>
                  {formatDateTime(selectedAssignment.assignedAt)}
                </p>
                <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                  By: {selectedAssignment.assignedBy.name}
                </p>
              </div>

              {selectedAssignment.schedules && selectedAssignment.schedules.length > 0 && (
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Schedule:</span>
                  <div style={{
                    backgroundColor: '#1e293b',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    marginTop: '0.5rem'
                  }}>
                    <p style={{ color: '#f1f5f9', margin: 0 }}>
                      {selectedAssignment.schedules[0].startTime} - {selectedAssignment.schedules[0].endTime}
                    </p>
                    <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                      Days: {selectedAssignment.schedules[0].daysOfWeek.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              marginTop: '1.5rem'
            }}>
              <button
                onClick={() => setSelectedAssignment(null)}
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
    </div>
  );
}