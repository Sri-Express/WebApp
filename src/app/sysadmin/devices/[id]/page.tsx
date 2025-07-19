// src/app/sysadmin/devices/[id]/page.tsx

"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
    DevicePhoneMobileIcon, MapPinIcon, SignalIcon, BoltIcon, ExclamationTriangleIcon, 
    CheckCircleIcon, XCircleIcon, ClockIcon, PencilIcon, TrashIcon, ArrowPathIcon, 
    CpuChipIcon, UserIcon, ChevronLeftIcon, TruckIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';

// --- Data Interface ---
interface Device {
    _id: string;
    deviceId: string;
    vehicleNumber: string;
    vehicleType: 'bus' | 'train';
    status: 'online' | 'offline' | 'maintenance';
    lastSeen: string;
    location: {
        latitude: number;
        longitude: number;
        address: string;
        lastUpdated: string;
    };
    batteryLevel: number;
    signalStrength: number; // Assuming 1-5 scale
    assignedTo: {
        type: 'route_admin' | 'company_admin' | 'system';
        name: string;
        id: string;
    };
    route?: {
        id: string;
        name: string;
    };
    firmwareVersion: string;
    installDate: string;
    lastMaintenance?: string;
    alerts: {
        count: number;
        messages: string[];
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function DeviceDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const deviceId = params.id as string;
    const { theme } = useTheme();
    
    // --- State Management ---
    const [device, setDevice] = useState<Device | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // --- API and Data Logic ---
    const getToken = () => localStorage.getItem('token');

    const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
        const token = getToken();
        if (!token) {
            router.push('/sysadmin/login');
            return null;
        }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers,
                },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/sysadmin/login');
                    return null;
                }
                throw new Error(`API Error: ${response.status}`);
            }
            if (options.method === 'DELETE') return { success: true };
            return await response.json();
        } catch (error) {
            console.error('API call error:', error);
            return null;
        }
    }, [router]);

    const loadDevice = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiCall(`/api/admin/devices/${deviceId}`);
            if (response) {
                setDevice(response);
            } else {
                setError('Device not found or failed to load.');
            }
        } catch (err) {
            setError('Failed to load device details.');
            console.error('Error loading device:', err);
        } finally {
            setLoading(false);
        }
    }, [deviceId, apiCall]);

    useEffect(() => {
        if (deviceId) {
            loadDevice();
        }
    }, [deviceId, loadDevice]);

    // --- Action Handlers ---
    const handleDeleteDevice = async () => {
        setActionLoading('delete');
        try {
            await apiCall(`/api/admin/devices/${deviceId}`, { method: 'DELETE' });
            router.push('/sysadmin/devices');
        } catch (error) {
            console.error('Error deleting device:', error);
            setError('Failed to delete device.');
        } finally {
            setActionLoading(null);
            setShowDeleteModal(false);
        }
    };

    const handleClearAlerts = async () => {
        setActionLoading('clearAlerts');
        try {
            await apiCall(`/api/admin/devices/${deviceId}/alerts`, { method: 'DELETE' });
            await loadDevice();
        } catch (error) {
            console.error('Error clearing alerts:', error);
            setError('Failed to clear alerts.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRefresh = async () => {
        setActionLoading('refresh');
        await loadDevice();
        setActionLoading(null);
    };

    // --- Helper Functions & Styles ---
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return '#10b981';
            case 'offline': return '#ef4444';
            case 'maintenance': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status: string) => {
        const style = { width: 20, height: 20, color: getStatusColor(status) };
        switch (status) {
            case 'online': return <CheckCircleIcon {...style} />;
            case 'offline': return <XCircleIcon {...style} />;
            case 'maintenance': return <ClockIcon {...style} />;
            default: return <ExclamationTriangleIcon {...style} />;
        }
    };

    const getSignalBars = (strength: number) => {
        const bars = [];
        for (let i = 1; i <= 5; i++) {
            bars.push(<div key={i} style={{ width: '3px', height: `${6 + i * 3}px`, backgroundColor: i <= strength ? '#10b981' : '#4b5563', margin: '0 1px', borderRadius: '1px' }} />);
        }
        return <div style={{ display: 'flex', alignItems: 'end', height: '20px' }}>{bars}</div>;
    };

    const getBatteryColor = (level: number) => {
        if (level > 50) return '#10b981';
        if (level > 20) return '#f59e0b';
        return '#ef4444';
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
    const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString();
    const getTimeSince = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const lightTheme = { mainBg: '#f7fafc', bgGradient: 'linear-gradient(to bottom right, #ffffff, #e2e8f0)', glassPanelBg: 'rgba(255, 255, 255, 0.85)', glassPanelBorder: '1px solid rgba(203, 213, 225, 0.5)', glassPanelShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', textPrimary: '#1a202c', textSecondary: '#4a5568', textMuted: '#718096' };
    const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b)', glassPanelBg: 'rgba(30, 41, 59, 0.75)', glassPanelBorder: '1px solid rgba(71, 85, 105, 0.5)', glassPanelShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.15)', textPrimary: '#f8fafc', textSecondary: '#94a3b8', textMuted: '#64748b' };
    const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
    const glassPanelStyle = { backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, color: currentThemeStyles.textPrimary }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowPathIcon width={24} height={24} className="animate-spin" />Loading device details...</div>
            </div>
        );
    }

    if (error || !device) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, color: currentThemeStyles.textPrimary, flexDirection: 'column', gap: '1rem' }}>
                <ExclamationTriangleIcon width={48} height={48} color="#ef4444" />
                <div>{error || 'Device not found'}</div>
                <Link href="/sysadmin/devices" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none' }}>Back to Devices</Link>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, color: currentThemeStyles.textPrimary }}>
            <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <Link href="/sysadmin/devices" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ChevronLeftIcon width={16} height={16} /> Back to Devices</Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DevicePhoneMobileIcon width={24} height={24} color="#10b981" /><h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>Device Details</h1></div>
                    </div>
                    <ThemeSwitcher />
                </div>
            </nav>

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>{device.deviceId}</h2>
                        <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0' }}>Vehicle: {device.vehicleNumber}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={handleRefresh} disabled={!!actionLoading} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ArrowPathIcon width={16} height={16} className={actionLoading === 'refresh' ? 'animate-spin' : ''} /> Refresh
                        </button>
                        <Link href={`/sysadmin/devices/${deviceId}/edit`} style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <PencilIcon width={16} height={16} /> Edit
                        </Link>
                        <button onClick={() => setShowDeleteModal(true)} disabled={!!actionLoading} style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrashIcon width={16} height={16} /> Delete
                        </button>
                    </div>
                </div>

                {/* Main Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={glassPanelStyle}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Status Overview</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: getStatusColor(device.status), fontWeight: 'bold', fontSize: '1.125rem' }}>
                                        {getStatusIcon(device.status)} {device.status.toUpperCase()}
                                    </div>
                                    <p style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Last seen: {getTimeSince(device.lastSeen)}</p>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: getBatteryColor(device.batteryLevel), fontWeight: 'bold', fontSize: '1.125rem' }}>
                                        <BoltIcon width={20} height={20} /> {device.batteryLevel}%
                                    </div>
                                    <p style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Battery</p>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentThemeStyles.textPrimary, fontWeight: 'bold', fontSize: '1.125rem' }}>
                                        <SignalIcon width={20} height={20} /> {getSignalBars(device.signalStrength)}
                                    </div>
                                    <p style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Signal</p>
                                </div>
                            </div>
                        </div>

                        <div style={glassPanelStyle}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TruckIcon width={20} height={20} /> Vehicle Information</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: currentThemeStyles.textSecondary }}>Vehicle Number:</span> <span>{device.vehicleNumber}</span></li>
                                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: currentThemeStyles.textSecondary }}>Vehicle Type:</span> <span>{device.vehicleType.charAt(0).toUpperCase() + device.vehicleType.slice(1)}</span></li>
                                {device.route && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: currentThemeStyles.textSecondary }}>Assigned Route:</span> <Link href={`/sysadmin/routes/${device.route.id}`} style={{ color: '#3b82f6', textDecoration: 'underline' }}>{device.route.name}</Link></li>
                                )}
                            </ul>
                        </div>

                        <div style={glassPanelStyle}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CpuChipIcon width={20} height={20} /> Device Specs</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: currentThemeStyles.textSecondary }}>Firmware:</span> <span>{device.firmwareVersion}</span></li>
                                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: currentThemeStyles.textSecondary }}>Install Date:</span> <span>{formatDate(device.installDate)}</span></li>
                                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: currentThemeStyles.textSecondary }}>Last Maintenance:</span> <span>{device.lastMaintenance ? formatDate(device.lastMaintenance) : 'N/A'}</span></li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={glassPanelStyle}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Last Known Location</h3>
                            <div style={{ height: '200px', backgroundColor: currentThemeStyles.textMuted, borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p>Map Placeholder</p>
                            </div>
                            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPinIcon width={16} height={16} /> {device.location.address}</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: currentThemeStyles.textSecondary }}>Updated: {formatDateTime(device.location.lastUpdated)}</p>
                        </div>

                        <div style={glassPanelStyle}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Assignment</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: '0.75rem', borderRadius: '50%' }}>
                                    <UserIcon width={24} height={24} color="#3b82f6" />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: '500' }}>{device.assignedTo.name}</p>
                                    <p style={{ margin: '0.25rem 0 0 0', color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>{device.assignedTo.type.replace('_', ' ').toUpperCase()}</p>
                                </div>
                            </div>
                        </div>

                        <div style={glassPanelStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Alerts ({device.alerts.count})</h3>
                                {device.alerts.count > 0 && (
                                    <button onClick={handleClearAlerts} disabled={actionLoading === 'clearAlerts'} style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
                                        Clear All
                                    </button>
                                )}
                            </div>
                            {device.alerts.count > 0 ? (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' }}>
                                    {device.alerts.messages.map((msg, index) => (
                                        <li key={index} style={{ padding: '0.5rem', borderBottom: `1px solid ${currentThemeStyles.glassPanelBorder}` }}>{msg}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ color: currentThemeStyles.textSecondary }}>No active alerts.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ ...glassPanelStyle, maxWidth: '400px', width: '90%' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>Confirm Deletion</h3>
                        <p style={{ color: currentThemeStyles.textSecondary, margin: '0 0 1.5rem 0' }}>Are you sure you want to delete device {device.deviceId}? This action cannot be undone.</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button onClick={() => setShowDeleteModal(false)} style={{ backgroundColor: '#4b5563', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleDeleteDevice} disabled={actionLoading === 'delete'} style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
                                {actionLoading === 'delete' ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}