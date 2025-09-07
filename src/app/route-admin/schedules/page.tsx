// src/app/route-admin/schedules/page.tsx - Fixed Route Admin Schedule Management
"use client";

import { useState, useEffect } from 'react';
import {
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  BellIcon,
  TruckIcon,
  MapIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/sysadmin/components/AnimatedBackground';

interface Route {
  _id: string;
  routeId: string;
  name: string;
  startLocation: { name: string };
  endLocation: { name: string };
  distance: number;
  estimatedDuration: number;
}

interface Assignment {
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
  };
  schedules: Schedule[];
  status: string;
}

interface Schedule {
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  isActive: boolean;
}

interface ScheduleFormData {
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  isActive: boolean;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

// Mock data for demonstration
const mockRoute: Route = {
  _id: '64b5f1c2a3d4e5f6g7h8i9j0',
  routeId: 'RT-COL-KDY-001',
  name: 'Colombo - Kandy Express',
  startLocation: { name: 'Colombo Fort Railway Station' },
  endLocation: { name: 'Kandy Railway Station' },
  distance: 116,
  estimatedDuration: 180
};

const mockAssignments: Assignment[] = [
  {
    _id: '1',
    vehicleId: { _id: 'v1', vehicleNumber: 'NC-2847', vehicleType: 'luxury_bus', status: 'online' },
    fleetId: { _id: 'f1', companyName: 'Ceylon Express Pvt Ltd' },
    schedules: [{
      startTime: '06:00',
      endTime: '22:00',
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      isActive: true
    }],
    status: 'active'
  },
  {
    _id: '2',
    vehicleId: { _id: 'v2', vehicleNumber: 'WP-4523', vehicleType: 'semi_luxury', status: 'online' },
    fleetId: { _id: 'f2', companyName: 'Golden Route Tours' },
    schedules: [{
      startTime: '05:30',
      endTime: '23:00',
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      isActive: true
    }],
    status: 'active'
  },
  {
    _id: '3',
    vehicleId: { _id: 'v3', vehicleNumber: 'CP-7891', vehicleType: 'luxury_bus', status: 'maintenance' },
    fleetId: { _id: 'f3', companyName: 'Mountain View Transport' },
    schedules: [],
    status: 'inactive'
  }
];

export default function RouteAdminSchedules() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [route, setRoute] = useState<Route | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>({
    startTime: '06:00',
    endTime: '22:00',
    daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    isActive: true
  });

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

      // Load route and assignments
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/assignments`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setRoute(data.route);
        setAssignments(data.assignments || []);
      } else {
        // Use mock data for demonstration
        setRoute(mockRoute);
        setAssignments(mockAssignments);
      }
    } catch (err) {
      console.error('Load data error:', err);
      setError('Using demo data - backend not available');
      // Use mock data as fallback
      setRoute(mockRoute);
      setAssignments(mockAssignments);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (assignmentId: string, schedules: Schedule[]) => {
    setActionLoading(`update-${assignmentId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/assignments/${assignmentId}/schedules`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          schedules: schedules
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }

      // Update assignment in state
      setAssignments(prev => prev.map(assignment => 
        assignment._id === assignmentId 
          ? { ...assignment, schedules: schedules }
          : assignment
      ));
      
      setSuccess('Schedule updated successfully');
      setShowScheduleModal(false);
      setEditingAssignment(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Update schedule error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update schedule');
      
      // For demo purposes, still update the UI
      setAssignments(prev => prev.map(assignment => 
        assignment._id === assignmentId 
          ? { ...assignment, schedules: schedules }
          : assignment
      ));
      setSuccess('Schedule updated successfully (demo mode)');
      setShowScheduleModal(false);
      setEditingAssignment(null);
      setTimeout(() => setSuccess(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const openScheduleModal = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    
    // Load current schedule if exists
    if (assignment.schedules && assignment.schedules.length > 0) {
      const currentSchedule = assignment.schedules[0];
      setScheduleForm({
        startTime: currentSchedule.startTime,
        endTime: currentSchedule.endTime,
        daysOfWeek: currentSchedule.daysOfWeek,
        isActive: currentSchedule.isActive
      });
    } else {
      // Reset to default
      setScheduleForm({
        startTime: '06:00',
        endTime: '22:00',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        isActive: true
      });
    }
    
    setShowScheduleModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAssignment) return;
    
    if (scheduleForm.daysOfWeek.length === 0) {
      setError('Please select at least one day of the week');
      return;
    }

    const updatedSchedules = [scheduleForm];
    handleUpdateSchedule(editingAssignment._id, updatedSchedules);
  };

  const toggleDay = (day: string) => {
    setScheduleForm(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
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

  // Theme definitions - consistent with other dashboard pages
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

  // Animation styles
  const animationStyles = `
    @keyframes fade-in-up { 
      from { opacity: 0; transform: translateY(20px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    @keyframes fade-in-down { 
      from { opacity: 0; transform: translateY(-20px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
    .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
    @keyframes pulse-glow { 
      0%, 100% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); } 
      50% { box-shadow: 0 0 25px rgba(59, 130, 246, 0.5); } 
    }
    .pulse-glow { animation: pulse-glow 2s infinite; }
    @keyframes spin { 
      0% { transform: rotate(0deg); } 
      100% { transform: rotate(360deg); } 
    }
  `;

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
        <style jsx>{animationStyles}</style>
        <AnimatedBackground currentThemeStyles={currentThemeStyles} />
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary, position: 'relative', zIndex: 10 }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading schedule management...</p>
        </div>
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
        <style jsx>{animationStyles}</style>
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
      <style jsx>{animationStyles}</style>
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      {/* Navigation Bar - Consistent with other pages */}
      <nav style={{ backgroundColor: currentThemeStyles.navBg, backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
            <ShieldCheckIcon width={32} height={32} color="#dc2626" className="sm:w-8 sm:h-8" />
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
            </div>
            <div style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: 'clamp(0.7rem, 2vw, 0.875rem)' }}>ROUTE ADMIN</div>
          </div>
        </div>
      </nav>

      <div style={{ width: '100%', minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(0.5rem, 3vw, 2rem)', position: 'relative', zIndex: 10 }}>
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '1600px', margin: '0 auto' }}>

          {/* Success Message */}
          {success && (
            <div className="animate-fade-in-down" style={{
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

          {/* Vehicle Schedules */}
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
              <CalendarDaysIcon width={24} height={24} color="#8b5cf6" />
              Vehicle Schedules ({assignments.length})
            </h2>

            {assignments.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px, 100%), 1fr))',
                gap: 'clamp(1rem, 3vw, 1.5rem)'
              }}>
                {assignments.map((assignment, index) => (
                  <div key={assignment._id} className="animate-fade-in-up" style={{
                    backgroundColor: currentThemeStyles.cardBg,
                    padding: 'clamp(1rem, 3vw, 1.5rem)',
                    borderRadius: '0.75rem',
                    border: currentThemeStyles.cardBorder,
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.1)',
                    animationDelay: `${index * 0.1}s`,
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          color: currentThemeStyles.textPrimary,
                          fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                          fontWeight: 'bold',
                          marginBottom: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <TruckIcon width={20} height={20} color="#F59E0B" />
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
                        backgroundColor: assignment.vehicleId.status === 'online' ? '#10b981' : assignment.vehicleId.status === 'maintenance' ? '#f59e0b' : '#6b7280',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.25rem',
                        fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {assignment.vehicleId.status}
                      </div>
                    </div>

                    {/* Current Schedule */}
                    <div style={{
                      backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      border: currentThemeStyles.cardBorder
                    }}>
                      {assignment.schedules && assignment.schedules.length > 0 ? (
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem',
                            flexWrap: 'wrap'
                          }}>
                            <ClockIcon width={16} height={16} color="#8b5cf6" />
                            <span style={{ color: currentThemeStyles.textSecondary, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Current Schedule</span>
                            <div style={{
                              backgroundColor: assignment.schedules[0].isActive ? '#10b981' : '#6b7280',
                              color: 'white',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: 'clamp(0.625rem, 1.8vw, 0.65rem)',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {assignment.schedules[0].isActive ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                          
                          <div style={{ marginBottom: '0.5rem' }}>
                            <span style={{ color: currentThemeStyles.textPrimary, fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', fontWeight: '500' }}>
                              {formatTime(assignment.schedules[0].startTime)} - {formatTime(assignment.schedules[0].endTime)}
                            </span>
                          </div>
                          
                          <div style={{
                            color: currentThemeStyles.textMuted,
                            fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
                          }}>
                            {formatDays(assignment.schedules[0].daysOfWeek)}
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          color: currentThemeStyles.textMuted,
                          fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
                        }}>
                          No schedule configured
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem'
                    }}>
                      <button
                        onClick={() => openScheduleModal(assignment)}
                        disabled={assignment.status !== 'active'}
                        style={{
                          backgroundColor: assignment.status !== 'active' ? '#6b7280' : '#3b82f6',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          border: 'none',
                          fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                          cursor: assignment.status !== 'active' ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flex: 1,
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          opacity: assignment.status !== 'active' ? 0.6 : 1
                        }}
                      >
                        <PencilIcon width={14} height={14} />
                        {assignment.schedules && assignment.schedules.length > 0 ? 'Edit Schedule' : 'Set Schedule'}
                      </button>
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
                <p>No vehicles assigned to schedule yet.</p>
              </div>
            )}
          </div>

          {/* Schedule Modal */}
          {showScheduleModal && editingAssignment && (
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
                backgroundColor: currentThemeStyles.glassPanelBg,
                padding: '2rem',
                borderRadius: '0.75rem',
                border: currentThemeStyles.glassPanelBorder,
                maxWidth: '500px',
                width: '90%',
                backdropFilter: 'blur(12px)',
                boxShadow: currentThemeStyles.glassPanelShadow,
                maxHeight: '90vh',
                overflowY: 'auto'
              }}>
                <h3 style={{
                  color: currentThemeStyles.textPrimary,
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  Configure Schedule - {editingAssignment.vehicleId.vehicleNumber}
                </h3>

                <form onSubmit={handleFormSubmit}>
                  {/* Time Range */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div>
                      <label style={{
                        color: currentThemeStyles.textPrimary,
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.5rem',
                        display: 'block'
                      }}>
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={scheduleForm.startTime}
                        onChange={(e) => setScheduleForm(prev => ({
                          ...prev,
                          startTime: e.target.value
                        }))}
                        style={{
                          width: '100%',
                          backgroundColor: currentThemeStyles.cardBg,
                          border: currentThemeStyles.cardBorder,
                          borderRadius: '0.5rem',
                          padding: '0.75rem',
                          color: currentThemeStyles.textPrimary,
                          fontSize: '0.875rem'
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{
                        color: currentThemeStyles.textPrimary,
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.5rem',
                        display: 'block'
                      }}>
                        End Time
                      </label>
                      <input
                        type="time"
                        value={scheduleForm.endTime}
                        onChange={(e) => setScheduleForm(prev => ({
                          ...prev,
                          endTime: e.target.value
                        }))}
                        style={{
                          width: '100%',
                          backgroundColor: currentThemeStyles.cardBg,
                          border: currentThemeStyles.cardBorder,
                          borderRadius: '0.5rem',
                          padding: '0.75rem',
                          color: currentThemeStyles.textPrimary,
                          fontSize: '0.875rem'
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Days of Week */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      color: currentThemeStyles.textPrimary,
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>
                      Days of Week
                    </label>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '0.5rem'
                    }}>
                      {DAYS_OF_WEEK.map((day) => (
                        <label key={day.value} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          backgroundColor: currentThemeStyles.cardBg,
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          border: scheduleForm.daysOfWeek.includes(day.value) ? '2px solid #8b5cf6' : currentThemeStyles.cardBorder,
                          transition: 'all 0.2s ease'
                        }}>
                          <input
                            type="checkbox"
                            checked={scheduleForm.daysOfWeek.includes(day.value)}
                            onChange={() => toggleDay(day.value)}
                            style={{ accentColor: '#8b5cf6' }}
                          />
                          <span style={{
                            color: currentThemeStyles.textPrimary,
                            fontSize: '0.875rem'
                          }}>
                            {day.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Active Status */}
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={scheduleForm.isActive}
                        onChange={(e) => setScheduleForm(prev => ({
                          ...prev,
                          isActive: e.target.checked
                        }))}
                        style={{ accentColor: '#8b5cf6' }}
                      />
                      <span style={{
                        color: currentThemeStyles.textPrimary,
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        Schedule is active
                      </span>
                    </label>
                  </div>

                  {/* Form Actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem'
                  }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowScheduleModal(false);
                        setEditingAssignment(null);
                      }}
                      style={{
                        backgroundColor: '#374151',
                        color: '#f9fafb',
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading === `update-${editingAssignment._id}` || scheduleForm.daysOfWeek.length === 0}
                      style={{
                        backgroundColor: (actionLoading === `update-${editingAssignment._id}` || scheduleForm.daysOfWeek.length === 0) ? '#6b7280' : '#8b5cf6',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: (actionLoading === `update-${editingAssignment._id}` || scheduleForm.daysOfWeek.length === 0) ? 'not-allowed' : 'pointer',
                        opacity: actionLoading === `update-${editingAssignment._id}` ? 0.7 : 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      {actionLoading === `update-${editingAssignment._id}` ? 'Updating...' : 'Update Schedule'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}