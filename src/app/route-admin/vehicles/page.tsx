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
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/sysadmin/components/AnimatedBackground';

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
  const { theme } = useTheme();
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

  // Theme definitions
  const lightTheme = {
    mainBg: '#fffbeb',
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
    textPrimary: '#1f2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    cardBg: 'rgba(249, 250, 251, 0.8)',
    cardBorder: '1px solid rgba(209, 213, 219, 0.5)',
  };

  const darkTheme = {
    mainBg: '#0f172a',
    bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    cardBg: 'rgba(51, 65, 85, 0.8)',
    cardBorder: '1px solid rgba(75, 85, 99, 0.5)',
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: currentThemeStyles.mainBg, 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative'
      }}>
        <AnimatedBackground currentThemeStyles={currentThemeStyles} />
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary, position: 'relative', zIndex: 10 }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading vehicle management...</p>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!route) {
    return (
      <div style={{ 
        backgroundColor: currentThemeStyles.mainBg, 
        minHeight: '100vh',
        position: 'relative'
      }}>
        <AnimatedBackground currentThemeStyles={currentThemeStyles} />
        <div style={{ padding: '2rem', position: 'relative', zIndex: 10 }}>
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            border: currentThemeStyles.glassPanelBorder,
            borderRadius: '0.75rem',
            padding: 'clamp(1rem, 3vw, 2rem)',
            textAlign: 'center',
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <ExclamationTriangleIcon width={48} height={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              No Route Assigned
            </h2>
            <p style={{ color: currentThemeStyles.textSecondary }}>
              You need an assigned route to manage vehicle assignments.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: currentThemeStyles.mainBg,
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />
      <div style={{ padding: 'clamp(1rem, 3vw, 2rem)', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          padding: '2rem',
          borderRadius: '0.75rem',
          border: currentThemeStyles.glassPanelBorder,
          marginBottom: '2rem',
          backdropFilter: 'blur(12px)',
          boxShadow: currentThemeStyles.glassPanelShadow
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
          <div>
            <h1 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              Vehicle Assignment Management
            </h1>
            <p style={{ color: currentThemeStyles.textSecondary, margin: 0, fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>
              Route: <strong style={{ color: '#8b5cf6' }}>{route.name}</strong> ({route.routeId})
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'clamp(0.5rem, 2vw, 1rem)', alignItems: 'center', flexWrap: 'wrap' }}>
            <ThemeSwitcher />
            {totalAvailableVehicles > 0 && (
              <button
                onClick={() => setShowAssignModal(true)}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                  fontWeight: '500'
                }}
              >
                <PlusIcon width={16} height={16} />
                Assign Vehicles
              </button>
            )}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <div style={{
            backgroundColor: currentThemeStyles.cardBg,
            padding: '1rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
            border: currentThemeStyles.cardBorder,
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {assignments.length}
            </div>
            <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Assigned Vehicles</div>
          </div>

          <div style={{
            backgroundColor: currentThemeStyles.cardBg,
            padding: '1rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
            border: currentThemeStyles.cardBorder,
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {assignments.filter(a => a.vehicleId.status === 'online').length}
            </div>
            <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Online</div>
          </div>

          <div style={{
            backgroundColor: currentThemeStyles.cardBg,
            padding: '1rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
            border: currentThemeStyles.cardBorder,
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {totalAvailableVehicles}
            </div>
            <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Available to Assign</div>
          </div>

          <div style={{
            backgroundColor: currentThemeStyles.cardBg,
            padding: '1rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
            border: currentThemeStyles.cardBorder,
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {availableFleets.length}
            </div>
            <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Partner Fleets</div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          position: 'relative',
          zIndex: 10,
          padding: '0 2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'rgba(127, 29, 29, 0.8)',
            border: '1px solid #991b1b',
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backdropFilter: 'blur(8px)'
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
        </div>
      )}

      {/* Currently Assigned Vehicles */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '0 2rem',
        marginBottom: '2rem'
      }}>
      <div style={{
        backgroundColor: currentThemeStyles.glassPanelBg,
        padding: 'clamp(1rem, 3vw, 2rem)',
        borderRadius: '0.75rem',
        border: currentThemeStyles.glassPanelBorder,
        backdropFilter: 'blur(12px)',
        boxShadow: currentThemeStyles.glassPanelShadow
      }}>
        <h2 style={{
          color: currentThemeStyles.textPrimary,
          fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))',
            gap: 'clamp(1rem, 3vw, 1.5rem)'
          }}>
            {assignments.map((assignment) => (
              <div key={assignment._id} style={{
                backgroundColor: currentThemeStyles.cardBg,
                padding: 'clamp(1rem, 3vw, 1.5rem)',
                borderRadius: '0.5rem',
                border: currentThemeStyles.cardBorder,
                backdropFilter: 'blur(8px)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h3 style={{
                      color: currentThemeStyles.textPrimary,
                      fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}>
                      {assignment.vehicleId.vehicleNumber}
                    </h3>
                    <p style={{
                      color: currentThemeStyles.textSecondary,
                      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
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
                  backgroundColor: theme === 'dark' ? '#1e293b' : 'rgba(243, 244, 246, 0.5)',
                  padding: 'clamp(0.75rem, 2.5vw, 1rem)',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Assigned: </span>
                    <span style={{ color: currentThemeStyles.textPrimary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                      {formatDateTime(assignment.assignedAt)}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Assigned by: </span>
                    <span style={{ color: currentThemeStyles.textPrimary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                      {assignment.assignedBy.name}
                    </span>
                  </div>

                  {assignment.vehicleId.batteryLevel && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Battery: </span>
                      <span style={{ color: currentThemeStyles.textPrimary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                        {assignment.vehicleId.batteryLevel}%
                      </span>
                    </div>
                  )}

                  {assignment.schedules && assignment.schedules.length > 0 && (
                    <div>
                      <span style={{ color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Schedule: </span>
                      <span style={{ color: currentThemeStyles.textPrimary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
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
                      padding: 'clamp(0.375rem, 1.5vw, 0.5rem) clamp(0.75rem, 2.5vw, 1rem)',
                      borderRadius: '0.375rem',
                      border: 'none',
                      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
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
                      padding: 'clamp(0.375rem, 1.5vw, 0.5rem) clamp(0.75rem, 2.5vw, 1rem)',
                      borderRadius: '0.375rem',
                      border: 'none',
                      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
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
            padding: 'clamp(2rem, 5vw, 3rem)',
            color: currentThemeStyles.textSecondary
          }}>
            <TruckIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No vehicles assigned to this route yet.</p>
            {totalAvailableVehicles > 0 && (
              <button
                onClick={() => setShowAssignModal(true)}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
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
      </div>

      {/* Available Vehicles by Fleet */}
      {totalAvailableVehicles > 0 && (
        <div style={{
          position: 'relative',
          zIndex: 10,
          padding: '0 2rem',
          marginBottom: '2rem'
        }}>
        <div style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          padding: 'clamp(1rem, 3vw, 2rem)',
          borderRadius: '0.75rem',
          border: currentThemeStyles.glassPanelBorder,
          backdropFilter: 'blur(12px)',
          boxShadow: currentThemeStyles.glassPanelShadow
        }}>
          <h2 style={{
            color: currentThemeStyles.textPrimary,
            fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))',
            gap: 'clamp(1rem, 3vw, 2rem)'
          }}>
            {availableFleets.map((fleetData) => (
              <div key={fleetData.fleet._id} style={{
                backgroundColor: currentThemeStyles.cardBg,
                padding: 'clamp(1rem, 3vw, 1.5rem)',
                borderRadius: '0.5rem',
                border: currentThemeStyles.cardBorder,
                backdropFilter: 'blur(8px)'
              }}>
                <h3 style={{
                  color: currentThemeStyles.textPrimary,
                  fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  {fleetData.fleet.companyName}
                </h3>
                <p style={{
                  color: currentThemeStyles.textSecondary,
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
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
                      backgroundColor: theme === 'dark' ? '#1e293b' : 'rgba(243, 244, 246, 0.5)',
                      padding: 'clamp(0.5rem, 2vw, 0.75rem)',
                      borderRadius: '0.375rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
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
                            color: currentThemeStyles.textPrimary,
                            fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                            fontWeight: '500'
                          }}>
                            {vehicle.vehicleNumber}
                          </div>
                          <div style={{
                            color: currentThemeStyles.textSecondary,
                            fontSize: 'clamp(0.7rem, 1.8vw, 0.75rem)'
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
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: 'clamp(1rem, 3vw, 2rem)',
            borderRadius: '0.75rem',
            border: currentThemeStyles.glassPanelBorder,
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow,
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Assign Vehicles to Route
            </h3>
            
            <p style={{
              color: currentThemeStyles.textSecondary,
              marginBottom: '1.5rem',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
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
                    color: currentThemeStyles.textPrimary,
                    fontSize: 'clamp(0.925rem, 2.5vw, 1rem)',
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
                      padding: 'clamp(0.5rem, 2vw, 0.75rem)',
                      backgroundColor: currentThemeStyles.cardBg,
                      borderRadius: '0.5rem',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      border: currentThemeStyles.cardBorder
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
                          color: currentThemeStyles.textPrimary,
                          fontWeight: '500'
                        }}>
                          {vehicle.vehicleNumber}
                        </div>
                        <div style={{
                          color: currentThemeStyles.textSecondary,
                          fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
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
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: 'clamp(1rem, 3vw, 2rem)',
            borderRadius: '0.75rem',
            border: currentThemeStyles.glassPanelBorder,
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow,
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                color: currentThemeStyles.textPrimary,
                fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
                fontWeight: 'bold',
                margin: 0
              }}>
                Vehicle Assignment Details
              </h3>
              <button
                onClick={() => setSelectedAssignment(null)}
                style={{
                  backgroundColor: 'transparent',
                  color: currentThemeStyles.textSecondary,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              backgroundColor: currentThemeStyles.cardBg,
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              border: currentThemeStyles.cardBorder,
              borderRadius: '0.5rem'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Vehicle:</span>
                <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0', fontWeight: '600' }}>
                  {selectedAssignment.vehicleId.vehicleNumber}
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Fleet:</span>
                <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>
                  {selectedAssignment.fleetId.companyName}
                </p>
                <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                  Contact: {selectedAssignment.fleetId.contactNumber}
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Status:</span>
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
                <span style={{ color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Assigned:</span>
                <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>
                  {formatDateTime(selectedAssignment.assignedAt)}
                </p>
                <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                  By: {selectedAssignment.assignedBy.name}
                </p>
              </div>

              {selectedAssignment.schedules && selectedAssignment.schedules.length > 0 && (
                <div>
                  <span style={{ color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Schedule:</span>
                  <div style={{
                    backgroundColor: currentThemeStyles.glassPanelBg,
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    marginTop: '0.5rem'
                  }}>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: 0 }}>
                      {selectedAssignment.schedules[0].startTime} - {selectedAssignment.schedules[0].endTime}
                    </p>
                    <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
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
    </div>
  );
}