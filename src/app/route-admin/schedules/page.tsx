// src/app/route-admin/schedules/page.tsx - Route Admin Schedule Management
"use client";

import { useState, useEffect } from 'react';
import {
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

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

export default function RouteAdminSchedules() {
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
        throw new Error('Failed to load schedule data');
      }
    } catch (err) {
      console.error('Load data error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
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

      const result = await response.json();
      
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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        color: '#f1f5f9'
      }}>
        Loading schedule management...
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
            You need an assigned route to manage schedules.
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
        <h1 style={{
          color: '#f1f5f9',
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem'
        }}>
          Schedule Management
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Route: <strong style={{ color: '#8b5cf6' }}>{route.name}</strong> ({route.routeId})
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid #10b981',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircleIcon width={20} height={20} color="#10b981" />
          <span style={{ color: '#10b981' }}>{success}</span>
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

      {/* Vehicle Schedules */}
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
          <CalendarDaysIcon width={20} height={20} />
          Vehicle Schedules ({assignments.length})
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
                    backgroundColor: assignment.vehicleId.status === 'online' ? '#10b981' : '#6b7280',
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

                {/* Current Schedule */}
                <div style={{
                  backgroundColor: '#1e293b',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  {assignment.schedules && assignment.schedules.length > 0 ? (
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem'
                      }}>
                        <ClockIcon width={16} height={16} color="#94a3b8" />
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Current Schedule</span>
                        <div style={{
                          backgroundColor: assignment.schedules[0].isActive ? '#10b981' : '#6b7280',
                          color: 'white',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.625rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {assignment.schedules[0].isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '500' }}>
                          {formatTime(assignment.schedules[0].startTime)} - {formatTime(assignment.schedules[0].endTime)}
                        </span>
                      </div>
                      
                      <div style={{
                        color: '#94a3b8',
                        fontSize: '0.75rem'
                      }}>
                        {formatDays(assignment.schedules[0].daysOfWeek)}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontSize: '0.875rem'
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
                      fontSize: '0.875rem',
                      cursor: assignment.status !== 'active' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flex: 1
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
            color: '#94a3b8'
          }}>
            <CalendarDaysIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
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
                    color: '#f1f5f9',
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
                  <label style={{
                    color: '#f1f5f9',
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

              {/* Days of Week */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  color: '#f1f5f9',
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
                      backgroundColor: '#334155',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      border: scheduleForm.daysOfWeek.includes(day.value) ? '2px solid #8b5cf6' : '1px solid #475569'
                    }}>
                      <input
                        type="checkbox"
                        checked={scheduleForm.daysOfWeek.includes(day.value)}
                        onChange={() => toggleDay(day.value)}
                        style={{ accentColor: '#8b5cf6' }}
                      />
                      <span style={{
                        color: '#f1f5f9',
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
                    color: '#f1f5f9',
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
                    cursor: 'pointer'
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
                    opacity: actionLoading === `update-${editingAssignment._id}` ? 0.7 : 1
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
  );
}