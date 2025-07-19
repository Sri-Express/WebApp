// src/app/sysadmin/devices/[id]/edit/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { DevicePhoneMobileIcon, TruckIcon, MapPinIcon, CpuChipIcon, UserIcon, InformationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';

interface EditDeviceForm { deviceId: string; vehicleNumber: string; vehicleType: 'bus' | 'train'; assignedTo: { type: 'route_admin' | 'company_admin' | 'system'; userId: string; name: string; }; firmwareVersion: string; installDate: string; location: { latitude: number; longitude: number; address: string; }; route?: { routeId: string; name: string; }; status: 'online' | 'offline' | 'maintenance'; isActive: boolean; }
interface User { _id: string; name: string; email: string; role: string; }

export default function EditDevicePage() {
  const router = useRouter();
  const params = useParams();
  const deviceId = params.id as string;
  const { theme } = useTheme();
  const [formData, setFormData] = useState<EditDeviceForm | null>(null);
  const [originalData, setOriginalData] = useState<EditDeviceForm | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const getToken = () => localStorage.getItem('token');
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => { const token = getToken(); if (!token) { router.push('/sysadmin/login'); return null; } try { const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers, }, }); if (!response.ok) { if (response.status === 401) { localStorage.removeItem('token'); router.push('/sysadmin/login'); return null; } throw new Error(`API Error: ${response.status}`); } return await response.json(); } catch (error) { console.error('API call error:', error); return null; } }, [router]);
  useEffect(() => { const loadData = async () => { setLoading(true); try { const deviceResponse = await apiCall(`/admin/devices/${deviceId}`); if (deviceResponse) { const deviceData: EditDeviceForm = { deviceId: deviceResponse.deviceId, vehicleNumber: deviceResponse.vehicleNumber, vehicleType: deviceResponse.vehicleType, assignedTo: deviceResponse.assignedTo, firmwareVersion: deviceResponse.firmwareVersion, installDate: deviceResponse.installDate.split('T')[0], location: deviceResponse.location, route: deviceResponse.route, status: deviceResponse.status, isActive: deviceResponse.isActive }; setFormData(deviceData); setOriginalData(deviceData); } setLoadingUsers(true); const usersResponse = await apiCall('/admin/users?limit=100&role=route_admin,company_admin'); if (usersResponse?.users) { setAvailableUsers(usersResponse.users); } setLoadingUsers(false); } catch (error) { console.error('Error loading data:', error); setErrors({ submit: 'Failed to load device data' }); } finally { setLoading(false); } }; if (deviceId) { loadData(); } }, [deviceId, apiCall]);
  
  // ✅ FIXED: Rewrote handleChange to be fully type-safe and avoid `any`
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.') as [keyof EditDeviceForm, string];
      setFormData(prev => {
        if (!prev) return null;
        const parentObject = prev[parentKey];
        if (typeof parentObject === 'object' && parentObject !== null) {
          return { ...prev, [parentKey]: { ...parentObject, [childKey]: type === 'number' ? parseFloat(value) : value, }, };
        }
        return prev;
      });
    } else {
      setFormData(prev => prev ? ({ ...prev, [name]: type === 'checkbox' ? checked : value }) : null);
    }
    if (errors[name]) { setErrors(prev => ({ ...prev, [name]: '' })); }
  };

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => { if (!formData) return; const { name, value } = e.target; if (name === 'assignedTo.type') { if (value === 'system') { setFormData(prev => prev ? ({ ...prev, assignedTo: { type: 'system', userId: '', name: 'System Control' } }) : null); } else { setFormData(prev => prev ? ({ ...prev, assignedTo: { ...prev.assignedTo, type: value as 'route_admin' | 'company_admin', userId: '', name: '' } }) : null); } } else if (name === 'assignedTo.userId') { const selectedUser = availableUsers.find(user => user._id === value); setFormData(prev => prev ? ({ ...prev, assignedTo: { ...prev.assignedTo, userId: value, name: selectedUser?.name || '' } }) : null); } };
  const validateForm = () => { if (!formData) return false; const newErrors: Record<string, string> = {}; if (!formData.deviceId.trim()) { newErrors.deviceId = 'Device ID is required'; } if (!formData.vehicleNumber.trim()) { newErrors.vehicleNumber = 'Vehicle number is required'; } if (!formData.firmwareVersion.trim()) { newErrors.firmwareVersion = 'Firmware version is required'; } if (!formData.installDate) { newErrors.installDate = 'Install date is required'; } if (!formData.location.address.trim()) { newErrors['location.address'] = 'Address is required'; } if (formData.assignedTo.type !== 'system' && !formData.assignedTo.userId) { newErrors['assignedTo.userId'] = 'Please select a user for assignment'; } setErrors(newErrors); return Object.keys(newErrors).length === 0; };
  const hasChanges = () => { if (!formData || !originalData) return false; return JSON.stringify(formData) !== JSON.stringify(originalData); };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!formData || !validateForm()) { return; } setSaving(true); try { const response = await apiCall(`/admin/devices/${deviceId}`, { method: 'PUT', body: JSON.stringify(formData), }); if (response) { router.push(`/sysadmin/devices/${deviceId}`); } } catch (error) { console.error('Error updating device:', error); setErrors({ submit: error instanceof Error ? error.message : 'Failed to update device' }); } finally { setSaving(false); } };
  const getStatusColor = (status: string) => { switch (status) { case 'online': return '#10b981'; case 'offline': return '#ef4444'; case 'maintenance': return '#f59e0b'; default: return '#6b7280'; } };
  const filteredUsers = availableUsers.filter(user => formData?.assignedTo.type === 'route_admin' ? user.role === 'route_admin' : formData?.assignedTo.type === 'company_admin' ? user.role === 'company_admin' : false);

  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', inputBg: '#ffffff', inputBorder: '#d1d5db', infoBoxBg: 'rgba(243, 244, 246, 0.9)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', inputBg: '#334155', inputBorder: '#475569', infoBoxBg: 'rgba(51, 65, 85, 0.8)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  const animationStyles = ` @keyframes road-marking { 0% { transform: translateX(-200%); } 100% { transform: translateX(500%); } } .animate-road-marking { animation: road-marking 10s linear infinite; } @keyframes car-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(100vw); } } .animate-car-right { animation: car-right 15s linear infinite; } @keyframes car-left { 0% { transform: translateX(100vw) scaleX(-1); } 100% { transform: translateX(-200px) scaleX(-1); } } .animate-car-left { animation: car-left 16s linear infinite; } @keyframes light-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } } .animate-light-blink { animation: light-blink 1s infinite; } @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; } @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; } @keyframes trainMove { from { left: 100%; } to { left: -300px; } } @keyframes slight-bounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-1px); } } .animate-slight-bounce { animation: slight-bounce 2s ease-in-out infinite; } @keyframes steam { 0% { opacity: 0.8; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-20px) scale(2.5); } } .animate-steam { animation: steam 2s ease-out infinite; } @keyframes wheels { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } } .animate-wheels { animation: wheels 2s linear infinite; } @keyframes connecting-rod { 0% { transform: translateX(-1px) rotate(0deg); } 50% { transform: translateX(1px) rotate(180deg); } 100% { transform: translateX(-1px) rotate(360deg); } } .animate-connecting-rod { animation: connecting-rod 2s linear infinite; } @keyframes piston-move { 0% { transform: translateX(-2px); } 50% { transform: translateX(2px); } 100% { transform: translateX(-2px); } } .animate-piston { animation: piston-move 2s linear infinite; } .animation-delay-100 { animation-delay: 0.1s; } .animation-delay-200 { animation-delay: 0.2s; } .animation-delay-300 { animation-delay: 0.3s; } .animation-delay-400 { animation-delay: 0.4s; } .animation-delay-500 { animation-delay: 0.5s; } .animation-delay-600 { animation-delay: 0.6s; } .animation-delay-700 { animation-delay: 0.7s; } .animation-delay-800 { animation-delay: 0.8s; } .animation-delay-1000 { animation-delay: 1s; } .animation-delay-1200 { animation-delay: 1.2s; } .animation-delay-1500 { animation-delay: 1.5s; } .animation-delay-2000 { animation-delay: 2s; } .animation-delay-2500 { animation-delay: 2.5s; } .animation-delay-3000 { animation-delay: 3s; } `;

  const glassPanelStyle = { backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, color: currentThemeStyles.textPrimary }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowPathIcon width={24} height={24} className="animate-spin" />Loading device data...</div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, color: currentThemeStyles.textPrimary, flexDirection: 'column', gap: '1rem' }}>
        <ExclamationTriangleIcon width={48} height={48} color="#ef4444" />
        <div>Device not found</div>
        <Link href="/sysadmin/devices" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none' }}>Back to Devices</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, position: 'relative', overflow: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      
      <div style={{ position: 'absolute', inset: 0, background: currentThemeStyles.bgGradient, zIndex: 0 }}></div>

      <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link href={`/sysadmin/devices/${deviceId}`} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ChevronLeftIcon width={16} height={16} /> Back to Device</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DevicePhoneMobileIcon width={24} height={24} color="#f59e0b" /><h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>Edit Device</h1></div>
          </div>
          <ThemeSwitcher />
        </div>
      </nav>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 5 }}>
        <form onSubmit={handleSubmit} className="animate-fade-in-up">
          {errors.submit && (<div style={{ backgroundColor: '#991b1b', color: '#fecaca', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid #dc2626' }}>{errors.submit}</div>)}

          <div style={{ ...glassPanelStyle, marginBottom: '2rem' }}>
            <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CpuChipIcon width={20} height={20} />Device Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Device ID</label>
                <input type="text" name="deviceId" value={formData.deviceId} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${errors.deviceId ? '#dc2626' : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box' }} />
                {errors.deviceId && <p style={{ color: '#fecaca', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.deviceId}</p>}
              </div>
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Firmware Version</label>
                <input type="text" name="firmwareVersion" value={formData.firmwareVersion} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${errors.firmwareVersion ? '#dc2626' : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box' }} />
                {errors.firmwareVersion && <p style={{ color: '#fecaca', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.firmwareVersion}</p>}
              </div>
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Install Date</label>
                <input type="date" name="installDate" value={formData.installDate} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${errors.installDate ? '#dc2626' : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box' }} />
                {errors.installDate && <p style={{ color: '#fecaca', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.installDate}</p>}
              </div>
            </div>
          </div>

          <div style={{ ...glassPanelStyle, marginBottom: '2rem' }}>
            <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TruckIcon width={20} height={20} />Vehicle & Status</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Vehicle Number</label>
                <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${errors.vehicleNumber ? '#dc2626' : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box' }} />
                {errors.vehicleNumber && <p style={{ color: '#fecaca', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.vehicleNumber}</p>}
              </div>
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Vehicle Type</label>
                <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box' }}><option value="bus">🚌 Bus</option><option value="train">🚊 Train</option></select>
              </div>
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Device Status</label>
                <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: getStatusColor(formData.status), fontWeight: '600', fontSize: '1rem', boxSizing: 'border-box' }}><option value="online">Online</option><option value="offline">Offline</option><option value="maintenance">Maintenance</option></select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: '1 / -1' }}>
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="isActiveCheckbox" style={{ width: '1rem', height: '1rem' }} />
                <label htmlFor="isActiveCheckbox" style={{ color: currentThemeStyles.textPrimary, fontWeight: '600' }}>Device is Active</label>
              </div>
            </div>
          </div>

          {/* ✅ ADDED: Location Section */}
          <div style={{ ...glassPanelStyle, marginBottom: '2rem' }}>
            <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPinIcon width={20} height={20} />Location</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Latitude</label>
                <input type="number" step="any" name="location.latitude" value={formData.location.latitude} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Longitude</label>
                <input type="number" step="any" name="location.longitude" value={formData.location.longitude} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Address</label>
              <input type="text" name="location.address" value={formData.location.address} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${errors['location.address'] ? '#dc2626' : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box' }} />
              {errors['location.address'] && <p style={{ color: '#fecaca', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors['location.address']}</p>}
            </div>
          </div>

          <div style={{ ...glassPanelStyle, marginBottom: '2rem' }}>
            <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserIcon width={20} height={20} />Assignment</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Assign To</label>
                <select name="assignedTo.type" value={formData.assignedTo.type} onChange={handleAssignmentChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box' }}><option value="system">🏛️ System Control</option><option value="route_admin">🚌 Route Administrator</option><option value="company_admin">🏢 Company Administrator</option></select>
              </div>
              {formData.assignedTo.type !== 'system' && (
                <div>
                  <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Select User</label>
                  <select name="assignedTo.userId" value={formData.assignedTo.userId} onChange={handleAssignmentChange} disabled={loadingUsers} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${errors['assignedTo.userId'] ? '#dc2626' : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', opacity: loadingUsers ? 0.7 : 1 }}>
                    <option value="">{loadingUsers ? 'Loading...' : 'Select a user'}</option>
                    {filteredUsers.map(user => (<option key={user._id} value={user._id}>{user.name} ({user.email})</option>))}
                  </select>
                  {errors['assignedTo.userId'] && <p style={{ color: '#fecaca', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors['assignedTo.userId']}</p>}
                </div>
              )}
            </div>
            {/* ✅ ADDED: Information Box */}
            <div style={{ backgroundColor: currentThemeStyles.infoBoxBg, padding: '1rem', borderRadius: '0.5rem', marginTop: '1.5rem', border: `1px solid ${currentThemeStyles.inputBorder}` }}>
              <p style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><InformationCircleIcon width={20} height={20} />
                {formData.assignedTo.type === 'system' ? 'Device will be managed by system administrators.' : 'Assigning to a user will give them control over this device.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Link href={`/sysadmin/devices/${deviceId}`} style={{ backgroundColor: '#374151', color: '#f9fafb', padding: '0.875rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500' }}>Cancel</Link>
            <button type="submit" disabled={saving || !hasChanges()} style={{ backgroundColor: hasChanges() ? '#10b981' : '#6b7280', color: 'white', padding: '0.875rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: '500', cursor: (saving || !hasChanges()) ? 'not-allowed' : 'pointer', opacity: (saving || !hasChanges()) ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {saving ? <><ArrowPathIcon width={20} height={20} className="animate-spin" /> Saving...</> : <><CheckCircleIcon width={20} height={20} /> Save Changes</>}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}