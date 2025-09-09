// src/app/route-admin/slots/create/page.tsx - Route Admin Slot Creation
"use client";

import { useState, useEffect } from 'react';
import {
  ClockIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
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
  estimatedDuration: number;
}

interface SlotData {
  slotNumber: number;
  departureTime: string;
  arrivalTime: string;
  bufferMinutes: number;
  daysOfWeek: string[];
  slotType: 'regular' | 'rush_hour' | 'peak' | 'night';
  maxCapacity: number;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday', short: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { value: 'thursday', label: 'Thursday', short: 'Thu' },
  { value: 'friday', label: 'Friday', short: 'Fri' },
  { value: 'saturday', label: 'Saturday', short: 'Sat' },
  { value: 'sunday', label: 'Sunday', short: 'Sun' }
];

const SLOT_TYPES = [
  { value: 'regular', label: 'Regular', color: '#3b82f6' },
  { value: 'rush_hour', label: 'Rush Hour', color: '#f59e0b' },
  { value: 'peak', label: 'Peak', color: '#ef4444' },
  { value: 'night', label: 'Night', color: '#8b5cf6' }
];

export default function CreateRouteSlots() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [assignedRoute, setAssignedRoute] = useState<Route | null>(null);
  const [slots, setSlots] = useState<SlotData[]>([
    {
      slotNumber: 1,
      departureTime: '06:00',
      arrivalTime: '09:00',
      bufferMinutes: 15,
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      slotType: 'rush_hour',
      maxCapacity: 1
    }
  ]);

  const lightTheme = {
    mainBg: '#fffbeb',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    textPrimary: '#1f2937',
    textSecondary: '#4B5563',
    cardBg: 'rgba(249, 250, 251, 0.8)',
    cardBorder: '1px solid rgba(209, 213, 219, 0.5)',
    bgGradient: 'radial-gradient(ellipse at top, rgba(255, 255, 255, 0.1) 0%, rgba(251, 191, 36, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)'
  };

  const darkTheme = {
    mainBg: '#0f172a',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    cardBg: 'rgba(51, 65, 85, 0.8)',
    cardBorder: '1px solid rgba(75, 85, 99, 0.5)',
    bgGradient: 'radial-gradient(ellipse at top, rgba(30, 41, 59, 0.3) 0%, rgba(15, 23, 42, 0.8) 50%, rgba(30, 41, 59, 0.3) 100%)'
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    loadAssignedRoute();
  }, []);

  const loadAssignedRoute = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.hasAssignedRoute) {
          setAssignedRoute(data.assignedRoute);
        } else {
          setError('No route assigned to you. Contact system administrator.');
        }
      }
    } catch (err) {
      console.error('Load assigned route error:', err);
      setError('Failed to load your assigned route');
    }
  };

  const addSlot = () => {
    const lastSlot = slots[slots.length - 1];
    const lastArrivalTime = lastSlot ? lastSlot.arrivalTime : '06:00';
    
    // Calculate next departure time (arrival + buffer)
    const [hours, minutes] = lastArrivalTime.split(':').map(Number);
    const nextDepartureMinutes = (hours * 60 + minutes + (lastSlot?.bufferMinutes || 15)) % 1440;
    const nextHours = Math.floor(nextDepartureMinutes / 60);
    const nextMins = nextDepartureMinutes % 60;
    
    const newSlot: SlotData = {
      slotNumber: slots.length + 1,
      departureTime: `${String(nextHours).padStart(2, '0')}:${String(nextMins).padStart(2, '0')}`,
      arrivalTime: `${String((nextHours + Math.floor((assignedRoute?.estimatedDuration || 180) / 60)) % 24).padStart(2, '0')}:${String(nextMins).padStart(2, '0')}`,
      bufferMinutes: 15,
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      slotType: 'regular',
      maxCapacity: 1
    };

    setSlots([...slots, newSlot]);
  };

  const removeSlot = (index: number) => {
    const newSlots = slots.filter((_, i) => i !== index);
    // Renumber slots
    const renumberedSlots = newSlots.map((slot, i) => ({ ...slot, slotNumber: i + 1 }));
    setSlots(renumberedSlots);
  };

  const updateSlot = (index: number, field: keyof SlotData, value: any) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const toggleDay = (slotIndex: number, day: string) => {
    const newSlots = [...slots];
    const currentDays = newSlots[slotIndex].daysOfWeek;
    
    if (currentDays.includes(day)) {
      newSlots[slotIndex].daysOfWeek = currentDays.filter(d => d !== day);
    } else {
      newSlots[slotIndex].daysOfWeek = [...currentDays, day];
    }
    
    setSlots(newSlots);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assignedRoute) {
      setError('No route assigned');
      return;
    }

    if (slots.length === 0) {
      setError('Please add at least one slot');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/slots/routes/${assignedRoute._id}/slots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slots })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Successfully created ${data.slots.length} time slots for your route!`);
        // Reset form
        setSlots([{
          slotNumber: 1,
          departureTime: '06:00',
          arrivalTime: '09:00',
          bufferMinutes: 15,
          daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          slotType: 'rush_hour',
          maxCapacity: 1
        }]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create slots');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create slots');
    } finally {
      setLoading(false);
    }
  };

  if (!assignedRoute && !error) {
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
          <p>Loading your assigned route...</p>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative' }}>
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />
      
      {/* Navigation Header */}
      <nav style={{ 
        backgroundColor: 'rgba(30, 41, 59, 0.92)', 
        backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid rgba(251, 191, 36, 0.3)', 
        padding: '1rem 0', 
        position: 'relative', 
        zIndex: 10 
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '0 1rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheckIcon width={32} height={32} color="#dc2626" />
            <div>
              <h1 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#ffffff', 
                margin: 0 
              }}>
                <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span> 
                E<span style={{ color: '#DC2626' }}>x</span>press Slots
              </h1>
              {assignedRoute && (
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
                  Route: <strong style={{ color: '#8b5cf6' }}>{assignedRoute.name}</strong> ({assignedRoute.routeId})
                </p>
              )}
            </div>
          </div>
          <ThemeSwitcher />
        </div>
      </nav>
      
      <div style={{ padding: '2rem', position: 'relative', zIndex: 10 }}>
        {/* Messages */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ExclamationTriangleIcon width={20} height={20} color="#ef4444" />
            <span style={{ color: '#ef4444' }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid #22c55e',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircleIcon width={20} height={20} color="#22c55e" />
            <span style={{ color: '#22c55e' }}>{success}</span>
          </div>
        )}

        {assignedRoute && (
          <form onSubmit={handleSubmit}>
            {/* Route Info */}
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '2rem',
              borderRadius: '0.75rem',
              border: currentThemeStyles.glassPanelBorder,
              marginBottom: '2rem',
              backdropFilter: 'blur(12px)'
            }}>
              <h2 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>
                Create Time Slots for Your Route
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Route:</span>
                  <p style={{ color: currentThemeStyles.textPrimary, margin: 0, fontWeight: '600' }}>
                    {assignedRoute.name}
                  </p>
                </div>
                <div>
                  <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>From:</span>
                  <p style={{ color: currentThemeStyles.textPrimary, margin: 0 }}>
                    {assignedRoute.startLocation.name}
                  </p>
                </div>
                <div>
                  <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>To:</span>
                  <p style={{ color: currentThemeStyles.textPrimary, margin: 0 }}>
                    {assignedRoute.endLocation.name}
                  </p>
                </div>
                <div>
                  <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>Duration:</span>
                  <p style={{ color: currentThemeStyles.textPrimary, margin: 0 }}>
                    {Math.floor(assignedRoute.estimatedDuration / 60)}h {assignedRoute.estimatedDuration % 60}m
                  </p>
                </div>
              </div>
            </div>

            {/* Slots Configuration */}
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '2rem',
              borderRadius: '0.75rem',
              border: currentThemeStyles.glassPanelBorder,
              marginBottom: '2rem',
              backdropFilter: 'blur(12px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ color: currentThemeStyles.textPrimary, margin: 0 }}>
                  Time Slots ({slots.length})
                </h2>
                <button
                  type="button"
                  onClick={addSlot}
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
                  Add Slot
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {slots.map((slot, index) => (
                  <div key={index} style={{
                    backgroundColor: currentThemeStyles.cardBg,
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    border: currentThemeStyles.cardBorder
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ color: currentThemeStyles.textPrimary, margin: 0 }}>
                        Slot {slot.slotNumber}
                      </h3>
                      {slots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSlot(index)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <TrashIcon width={14} height={14} />
                          Remove
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      {/* Departure Time */}
                      <div>
                        <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                          Departure Time
                        </label>
                        <input
                          type="time"
                          value={slot.departureTime}
                          onChange={(e) => updateSlot(index, 'departureTime', e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: currentThemeStyles.cardBg,
                            border: currentThemeStyles.cardBorder,
                            borderRadius: '0.375rem',
                            padding: '0.75rem',
                            color: currentThemeStyles.textPrimary
                          }}
                          required
                        />
                      </div>

                      {/* Arrival Time */}
                      <div>
                        <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                          Arrival Time
                        </label>
                        <input
                          type="time"
                          value={slot.arrivalTime}
                          onChange={(e) => updateSlot(index, 'arrivalTime', e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: currentThemeStyles.cardBg,
                            border: currentThemeStyles.cardBorder,
                            borderRadius: '0.375rem',
                            padding: '0.75rem',
                            color: currentThemeStyles.textPrimary
                          }}
                          required
                        />
                      </div>

                      {/* Buffer Minutes */}
                      <div>
                        <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                          Buffer Minutes
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="60"
                          value={slot.bufferMinutes}
                          onChange={(e) => updateSlot(index, 'bufferMinutes', parseInt(e.target.value))}
                          style={{
                            width: '100%',
                            backgroundColor: currentThemeStyles.cardBg,
                            border: currentThemeStyles.cardBorder,
                            borderRadius: '0.375rem',
                            padding: '0.75rem',
                            color: currentThemeStyles.textPrimary
                          }}
                          required
                        />
                      </div>

                      {/* Slot Type */}
                      <div>
                        <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                          Slot Type
                        </label>
                        <select
                          value={slot.slotType}
                          onChange={(e) => updateSlot(index, 'slotType', e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: currentThemeStyles.cardBg,
                            border: currentThemeStyles.cardBorder,
                            borderRadius: '0.375rem',
                            padding: '0.75rem',
                            color: currentThemeStyles.textPrimary
                          }}
                        >
                          {SLOT_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Max Capacity */}
                      <div>
                        <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                          Max Vehicles
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={slot.maxCapacity}
                          onChange={(e) => updateSlot(index, 'maxCapacity', parseInt(e.target.value))}
                          style={{
                            width: '100%',
                            backgroundColor: currentThemeStyles.cardBg,
                            border: currentThemeStyles.cardBorder,
                            borderRadius: '0.375rem',
                            padding: '0.75rem',
                            color: currentThemeStyles.textPrimary
                          }}
                          required
                        />
                      </div>
                    </div>

                    {/* Days of Week */}
                    <div>
                      <label style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                        Operating Days
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {DAYS_OF_WEEK.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDay(index, day.value)}
                            style={{
                              backgroundColor: slot.daysOfWeek.includes(day.value) ? '#8b5cf6' : currentThemeStyles.cardBg,
                              color: slot.daysOfWeek.includes(day.value) ? 'white' : currentThemeStyles.textPrimary,
                              border: currentThemeStyles.cardBorder,
                              borderRadius: '0.375rem',
                              padding: '0.5rem 1rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            {day.short}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => {
                  setSlots([{
                    slotNumber: 1,
                    departureTime: '06:00',
                    arrivalTime: '09:00',
                    bufferMinutes: 15,
                    daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                    slotType: 'rush_hour',
                    maxCapacity: 1
                  }]);
                  setSuccess(null);
                  setError(null);
                }}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#6b7280' : '#8b5cf6',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <CalendarDaysIcon width={20} height={20} />
                {loading ? 'Creating Slots...' : `Create ${slots.length} Time Slots`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}