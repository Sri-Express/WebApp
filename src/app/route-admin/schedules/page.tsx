// src/app/route-admin/schedules/page.tsx - Updated Slot-Based Schedule Management
"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  ClockIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  BellIcon,
  TruckIcon,
  MapIcon,
  ShieldCheckIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/sysadmin/components/AnimatedBackground';
import Link from 'next/link';

interface Route {
  _id: string;
  name: string;
  routeId: string;
  startLocation: { name: string };
  endLocation: { name: string };
}

interface RouteSlot {
  _id: string;
  slotNumber: number;
  departureTime: string;
  arrivalTime: string;
  bufferMinutes: number;
  daysOfWeek: string[];
  slotType: 'regular' | 'rush_hour' | 'peak' | 'night';
  maxCapacity: number;
  assignments: SlotAssignment[];
  availableCapacity: number;
}

interface SlotAssignment {
  _id: string;
  vehicleId: {
    _id: string;
    vehicleNumber: string;
    vehicleType: string;
    status: string;
  };
  fleetId: {
    _id: string;
    companyName: string;
    phone: string;
  };
  assignedBy: {
    name: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  assignedAt: string;
  priority: number;
}

export default function RouteAdminSchedules() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [route, setRoute] = useState<Route | null>(null);
  const [slots, setSlots] = useState<RouteSlot[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<SlotAssignment[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<RouteSlot | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);

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
    navBg: 'rgba(30, 41, 59, 0.92)'
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
    navBg: 'rgba(30, 41, 59, 0.92)'
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load route admin dashboard to get route info
      const dashboardResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/dashboard`, {
        headers
      });

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        if (dashboardData.hasAssignedRoute) {
          setRoute(dashboardData.assignedRoute);
          
          // Load slots for this route
          await loadSlotsForRoute(dashboardData.assignedRoute._id, headers);
          
          // Load pending assignments
          await loadPendingAssignments(headers);
        } else {
          setError('No route assigned to you. Contact system administrator.');
        }
      } else {
        throw new Error('Failed to load route information');
      }
    } catch (err) {
      console.error('Load data error:', err);
      setError('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadSlotsForRoute = async (routeId: string, headers: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/slots/routes/${routeId}/slots`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
      }
    } catch (err) {
      console.error('Load slots error:', err);
    }
  };

  const loadPendingAssignments = async (headers: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/slots/route-admin/assignments/pending`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setPendingAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error('Load pending assignments error:', err);
    }
  };

  const handleApproveAssignment = async (assignmentId: string) => {
    setActionLoading(`approve-${assignmentId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/slots/route-admin/assignments/${assignmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'approve' })
      });

      if (response.ok) {
        setSuccess('Assignment approved successfully');
        await loadData(); // Reload data
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to approve assignment');
      }
    } catch (error) {
      console.error('Approve assignment error:', error);
      setError('Failed to approve assignment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAssignment = async (assignmentId: string) => {
    setActionLoading(`reject-${assignmentId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/slots/route-admin/assignments/${assignmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'reject', reason: 'Rejected by route admin' })
      });

      if (response.ok) {
        setSuccess('Assignment rejected successfully');
        await loadData(); // Reload data
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to reject assignment');
      }
    } catch (error) {
      console.error('Reject assignment error:', error);
      setError('Failed to reject assignment');
    } finally {
      setActionLoading(null);
    }
  };

  const loadAvailableVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/available-vehicles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Flatten vehicles from all fleets and include fleet info
        const allVehicles = data.availableFleets?.flatMap((fleet: any) => 
          fleet.vehicles.map((vehicle: any) => ({
            ...vehicle,
            fleetName: fleet.fleet.companyName,
            fleetId: fleet.fleet
          }))
        ) || [];
        setAvailableVehicles(allVehicles);
      }
    } catch (error) {
      console.error('Load available vehicles error:', error);
    }
  };

  const handleAssignVehiclesToSlot = async () => {
    if (!selectedSlot || selectedVehicleIds.length === 0) return;
    
    setActionLoading('assign-to-slot');
    
    try {
      const token = localStorage.getItem('token');
      let successCount = 0;
      const errors: string[] = [];
      
      // Assign vehicles one by one using the existing fleet/assignments/slots endpoint
      for (const vehicleId of selectedVehicleIds) {
        try {
          // Find the vehicle to get its fleet info
          const vehicle = availableVehicles.find(v => v._id === vehicleId);
          if (!vehicle) {
            errors.push(`Vehicle not found: ${vehicleId}`);
            continue;
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/slots/fleet/assignments/slots`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              slotId: selectedSlot._id,
              vehicleId: vehicleId,
              fleetId: vehicle.fleetId._id,
              priority: 1
            })
          });

          if (response.ok) {
            successCount++;
          } else {
            const errorData = await response.json();
            errors.push(`${vehicle.vehicleNumber}: ${errorData.message || 'Assignment failed'}`);
          }
        } catch (vehicleError) {
          const vehicle = availableVehicles.find(v => v._id === vehicleId);
          errors.push(`${vehicle?.vehicleNumber || vehicleId}: ${vehicleError instanceof Error ? vehicleError.message : 'Assignment failed'}`);
        }
      }

      if (successCount > 0) {
        setSuccess(`${successCount} vehicle(s) assigned to slot successfully`);
        await loadData(); // Reload data
      }

      if (errors.length > 0) {
        setError(`Some assignments failed: ${errors.join(', ')}`);
      }

      setShowAssignModal(false);
      setSelectedSlot(null);
      setSelectedVehicleIds([]);
      
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);

    } catch (error) {
      console.error('Assign vehicles to slot error:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign vehicles to slot');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveVehicleFromSlot = async (slotId: string, assignmentId: string) => {
    setActionLoading(`remove-${assignmentId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/slots/route-admin/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Vehicle removed from slot successfully');
        await loadData(); // Reload data
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to remove vehicle from slot');
      }
    } catch (error) {
      console.error('Remove vehicle from slot error:', error);
      setError('Failed to remove vehicle from slot');
    } finally {
      setActionLoading(null);
    }
  };

  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case 'rush_hour': return '#f59e0b';
      case 'peak': return '#ef4444';
      case 'night': return '#8b5cf6';
      default: return '#3b82f6';
    }
  };

  const getSlotTypeLabel = (type: string) => {
    switch (type) {
      case 'rush_hour': return 'Rush Hour';
      case 'peak': return 'Peak';
      case 'night': return 'Night';
      default: return 'Regular';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDays = (days: string[]) => {
    const dayAbbr: Record<string, string> = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };
    
    return days.map(day => dayAbbr[day]).join(', ');
  };

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: currentThemeStyles.mainBg, 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <AnimatedBackground currentThemeStyles={currentThemeStyles} />
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary, position: 'relative', zIndex: 10 }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading schedule management...</p>
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
        position: 'relative',
        overflow: 'hidden'
      }}>
        <AnimatedBackground currentThemeStyles={currentThemeStyles} />
        <div style={{ padding: '2rem', position: 'relative', zIndex: 10 }}>
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            border: currentThemeStyles.glassPanelBorder,
            borderRadius: '0.75rem',
            padding: '2rem',
            textAlign: 'center',
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <ExclamationTriangleIcon width={48} height={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              No Route Assigned
            </h2>
            <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1rem' }}>
              You need an assigned route to manage schedules.
            </p>
            <p style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>
              Please contact the system administrator to have a route assigned to you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      {/* Navigation Bar */}
      <nav style={{ backgroundColor: currentThemeStyles.navBg, backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
            <ShieldCheckIcon width={32} height={32} color="#dc2626" />
            <div>
              <h1 style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 4px 8px rgba(0, 0, 0, 0.7)' }}>
                <span style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', marginRight: '0.5rem', textShadow: '0 4px 8px rgba(0, 0, 0, 0.7), 0 0 30px rgba(250, 204, 21, 0.4)' }}>ශ්‍රී</span> 
                E<span style={{ color: '#DC2626' }}>x</span>press Schedule
              </h1>
              <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#94a3b8', margin: 0 }}>
                Route: <strong style={{ color: '#8b5cf6' }}>{route.name}</strong> ({route.routeId})
                {error && <span style={{ color: '#f59e0b', marginLeft: '1rem' }}>⚠ {error}</span>}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'clamp(0.5rem, 2vw, 1rem)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <ThemeSwitcher />
            <div style={{ position: 'relative' }}>
              <BellIcon width={20} height={20} color="#F59E0B" />
              {pendingAssignments.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {pendingAssignments.length}
                </div>
              )}
            </div>
            <div style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: 'clamp(0.7rem, 2vw, 0.875rem)' }}>ROUTE ADMIN</div>
          </div>
        </div>
      </nav>

      <div style={{ width: '100%', minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'clamp(0.5rem, 3vw, 2rem)', position: 'relative', zIndex: 10 }}>
        <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto' }}>

          {/* Success Message */}
          {success && (
            <div style={{
              backgroundColor: '#10b981',
              border: '1px solid #059669',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white'
            }}>
              <CheckCircleIcon width={20} height={20} />
              <span>{success}</span>
            </div>
          )}

          {/* Quick Actions */}
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '1.5rem',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow,
            marginBottom: '2rem'
          }}>
            <h2 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CalendarDaysIcon width={24} height={24} color="#8b5cf6" />
              Quick Actions
            </h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link 
                href="/route-admin/slots/create"
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                <PlusIcon width={16} height={16} />
                Create Time Slots
              </Link>
            </div>
          </div>

          {/* Pending Assignments */}
          {pendingAssignments.length > 0 && (
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              backdropFilter: 'blur(12px)',
              boxShadow: currentThemeStyles.glassPanelShadow,
              marginBottom: '2rem'
            }}>
              <h2 style={{
                color: currentThemeStyles.textPrimary,
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <BellIcon width={24} height={24} color="#f59e0b" />
                Pending Approvals ({pendingAssignments.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingAssignments.map((assignment) => (
                  <div key={assignment._id} style={{
                    backgroundColor: currentThemeStyles.cardBg,
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #f59e0b',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ color: currentThemeStyles.textPrimary, margin: 0, fontWeight: '500' }}>
                        Vehicle: {assignment.vehicleId.vehicleNumber}
                      </p>
                      <p style={{ color: currentThemeStyles.textSecondary, margin: 0, fontSize: '0.875rem' }}>
                        Fleet: {assignment.fleetId.companyName}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleApproveAssignment(assignment._id)}
                        disabled={actionLoading === `approve-${assignment._id}`}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          opacity: actionLoading === `approve-${assignment._id}` ? 0.7 : 1
                        }}
                      >
                        <CheckCircleIcon width={16} height={16} />
                        {actionLoading === `approve-${assignment._id}` ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectAssignment(assignment._id)}
                        disabled={actionLoading === `reject-${assignment._id}`}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          opacity: actionLoading === `reject-${assignment._id}` ? 0.7 : 1
                        }}
                      >
                        <MinusIcon width={16} height={16} />
                        {actionLoading === `reject-${assignment._id}` ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Slots */}
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: 'clamp(1rem, 3vw, 2rem)',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <h2 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: 'bold',
              marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ClockIcon width={24} height={24} color="#8b5cf6" />
              Time Slots ({slots.length})
            </h2>

            {slots.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))',
                gap: 'clamp(1rem, 3vw, 1.5rem)'
              }}>
                {slots.map((slot, index) => (
                  <div key={slot._id} style={{
                    backgroundColor: currentThemeStyles.cardBg,
                    padding: 'clamp(1rem, 3vw, 1.5rem)',
                    borderRadius: '0.75rem',
                    border: currentThemeStyles.cardBorder,
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    {/* Slot Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <h3 style={{
                          color: currentThemeStyles.textPrimary,
                          fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                          fontWeight: 'bold',
                          marginBottom: '0.25rem'
                        }}>
                          Slot {slot.slotNumber}
                        </h3>
                        <div style={{
                          backgroundColor: getSlotTypeColor(slot.slotType),
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          {getSlotTypeLabel(slot.slotType)}
                        </div>
                      </div>
                      <div style={{
                        textAlign: 'right',
                        color: currentThemeStyles.textSecondary,
                        fontSize: '0.875rem'
                      }}>
                        <div>Capacity: {slot.assignments.length}/{slot.maxCapacity}</div>
                        <div>Available: {slot.availableCapacity}</div>
                      </div>
                    </div>

                    {/* Time Info */}
                    <div style={{
                      backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      border: currentThemeStyles.cardBorder
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ color: currentThemeStyles.textPrimary, fontWeight: '600' }}>
                          {formatTime(slot.departureTime)} → {formatTime(slot.arrivalTime)}
                        </span>
                        <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>
                          +{slot.bufferMinutes}min buffer
                        </span>
                      </div>
                      <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>
                        {formatDays(slot.daysOfWeek)}
                      </div>
                    </div>

                    {/* Assigned Vehicles */}
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <h4 style={{
                          color: currentThemeStyles.textPrimary,
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          margin: 0
                        }}>
                          Assigned Vehicles ({slot.assignments.length})
                        </h4>
                        <button
                          onClick={async () => {
                            setSelectedSlot(slot);
                            await loadAvailableVehicles();
                            setShowAssignModal(true);
                          }}
                          style={{
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: 'none',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <PlusIcon width={12} height={12} />
                          Assign
                        </button>
                      </div>
                      
                      {slot.assignments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {slot.assignments.map((assignment) => (
                            <div key={assignment._id} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              backgroundColor: 'rgba(51, 65, 85, 0.8)',
                              padding: '0.75rem',
                              borderRadius: '0.5rem',
                              backdropFilter: 'blur(8px)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: assignment.vehicleId.status === 'online' ? '#10b981' : '#6b7280'
                                }} />
                                <div>
                                  <div style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: '500' }}>
                                    {assignment.vehicleId.vehicleNumber}
                                  </div>
                                  <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>
                                    Fleet: {assignment.fleetId.companyName}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                  backgroundColor: assignment.status === 'approved' ? '#10b981' : assignment.status === 'pending' ? '#f59e0b' : '#6b7280',
                                  color: 'white',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  textTransform: 'capitalize'
                                }}>
                                  {assignment.status}
                                </div>
                                {assignment.status === 'approved' && (
                                  <button
                                    onClick={() => handleRemoveVehicleFromSlot(slot._id, assignment._id)}
                                    disabled={actionLoading === `remove-${assignment._id}`}
                                    style={{
                                      backgroundColor: '#ef4444',
                                      color: 'white',
                                      padding: '0.25rem',
                                      borderRadius: '0.25rem',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                      opacity: actionLoading === `remove-${assignment._id}` ? 0.7 : 1
                                    }}
                                  >
                                    <MinusIcon width={12} height={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          color: currentThemeStyles.textMuted,
                          fontSize: '0.875rem',
                          padding: '1rem',
                          backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.3)' : 'rgba(243, 244, 246, 0.5)',
                          borderRadius: '0.5rem'
                        }}>
                          No vehicles assigned to this slot
                          <br />
                          <button
                            onClick={async () => {
                              setSelectedSlot(slot);
                              await loadAvailableVehicles();
                              setShowAssignModal(true);
                            }}
                            style={{
                              backgroundColor: '#8b5cf6',
                              color: 'white',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.25rem',
                              border: 'none',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              marginTop: '0.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              margin: '0.5rem auto 0 auto'
                            }}
                          >
                            <PlusIcon width={14} height={14} />
                            Assign Vehicle
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: currentThemeStyles.textSecondary
              }}>
                <CalendarDaysIcon width={48} height={48} color={currentThemeStyles.textMuted} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ marginBottom: '1rem' }}>No time slots created yet.</p>
                <Link 
                  href="/route-admin/slots/create"
                  style={{
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <PlusIcon width={16} height={16} />
                  Create Your First Time Slot
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Assignment Modal */}
      {showAssignModal && selectedSlot && (
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                color: currentThemeStyles.textPrimary,
                fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
                fontWeight: 'bold',
                margin: 0
              }}>
                Assign Vehicles to Slot {selectedSlot.slotNumber}
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedSlot(null);
                  setSelectedVehicleIds([]);
                }}
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
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              border: currentThemeStyles.cardBorder
            }}>
              <div style={{ color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>
                {formatTime(selectedSlot.departureTime)} → {formatTime(selectedSlot.arrivalTime)}
              </div>
              <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>
                {formatDays(selectedSlot.daysOfWeek)} • Capacity: {selectedSlot.availableCapacity} available
              </div>
            </div>

            <p style={{
              color: currentThemeStyles.textSecondary,
              marginBottom: '1.5rem',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
            }}>
              Select vehicles to assign to this time slot:
            </p>

            {availableVehicles.length > 0 ? (
              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                marginBottom: '1.5rem'
              }}>
                {availableVehicles.map((vehicle) => (
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
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: vehicle.status === 'online' ? '#10b981' : '#6b7280'
                    }} />
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
                        Fleet: {vehicle.fleetName} • {vehicle.vehicleType} • {vehicle.status}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                color: currentThemeStyles.textSecondary,
                padding: '2rem',
                backgroundColor: currentThemeStyles.cardBg,
                borderRadius: '0.5rem',
                marginBottom: '1.5rem'
              }}>
                <TruckIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>No available vehicles to assign</p>
                <p style={{ fontSize: '0.875rem' }}>All compatible vehicles may already be assigned to other slots.</p>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedSlot(null);
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
                onClick={handleAssignVehiclesToSlot}
                disabled={selectedVehicleIds.length === 0 || actionLoading === 'assign-to-slot'}
                style={{
                  backgroundColor: selectedVehicleIds.length === 0 ? '#6b7280' : '#10b981',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: selectedVehicleIds.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: actionLoading === 'assign-to-slot' ? 0.7 : 1
                }}
              >
                {actionLoading === 'assign-to-slot' ? 'Assigning...' : `Assign ${selectedVehicleIds.length} Vehicle${selectedVehicleIds.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}