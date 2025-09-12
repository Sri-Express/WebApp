// src/app/sysadmin/vehicles/page.tsx - Admin Vehicle Approval Management - REFACTORED WITH CONSISTENT STYLING
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  CogIcon,
  SignalIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/sysadmin/components/AnimatedBackground';

interface Vehicle {
  _id: string;
  deviceId: string;
  vehicleNumber: string;
  vehicleType: 'bus' | 'van' | 'minibus' | 'train';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  status: 'online' | 'offline' | 'maintenance';
  firmwareVersion: string;
  installDate: string;
  registrationDate: string;
  approvalDate?: string;
  rejectionDate?: string;
  rejectionReason?: string;
  fleetId?: {
    _id: string;
    companyName: string;
    registrationNumber: string;
    contactPerson: string;
    email: string;
  };
  approvedBy?: {
    name: string;
    email: string;
  };
  rejectedBy?: {
    name: string;
    email: string;
  };
  batteryLevel: number;
  signalStrength: number;
  lastSeen: string;
  alerts: {
    count: number;
    messages: string[];
  };
  documents?: {
    vehicleRegistration?: {
      uploaded: boolean;
      fileName?: string;
    };
    insurance?: {
      uploaded: boolean;
      fileName?: string;
    };
    safetyInspection?: {
      uploaded: boolean;
      fileName?: string;
    };
    revenueLicense?: {
      uploaded: boolean;
      fileName?: string;
    };
    additionalFiles?: Array<{
      fileName: string;
      uploadDate?: string;
    }>;
  };
  ratingStats?: {
    averageRating: number;
    totalRatings: number;
    breakdown: {
      cleanliness: number;
      comfort: number;
      condition: number;
      safety: number;
      punctuality: number;
    };
  };
}

interface VehicleStats {
  totalVehicles: number;
  pendingApproval: number;
  approvedVehicles: number;
  rejectedVehicles: number;
  onlineVehicles: number;
  offlineVehicles: number;
  maintenanceVehicles: number;
  recentApplications: number;
}

export default function AdminVehiclesPage() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showApprovalModal, setShowApprovalModal] = useState<Vehicle | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState<Vehicle | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentViewModal, setDocumentViewModal] = useState<{vehicleId: string; documents: any} | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // --- Theme and Style Definitions (Same as dashboard) ---
  const lightTheme = {
    mainBg: '#fffbeb',
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
    textPrimary: '#1f2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    quickActionBg: 'rgba(249, 250, 251, 0.8)',
    quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)',
    alertBg: 'rgba(249, 250, 251, 0.6)',
    modalBg: 'rgba(255, 255, 255, 0.95)',
    modalBorder: '1px solid rgba(209, 213, 219, 0.5)'
  };

  const darkTheme = {
    mainBg: '#0f172a',
    bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
    textPrimary: '#f9fafb',
    textSecondary: '#9ca3af',
    textMuted: '#9ca3af',
    quickActionBg: 'rgba(51, 65, 85, 0.8)',
    quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)',
    alertBg: 'rgba(51, 65, 85, 0.6)',
    modalBg: 'rgba(30, 41, 59, 0.95)',
    modalBorder: '1px solid rgba(75, 85, 99, 0.5)'
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // --- Animation styles for UI elements ---
  const animationStyles = `
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    @keyframes light-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `;

  // Load vehicle data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Get vehicles
        const vehiclesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vehicles?approvalStatus=${filterStatus}`, {
          headers
        });
        
        if (!vehiclesResponse.ok) {
          throw new Error('Failed to fetch vehicles');
        }
        
        const vehiclesData = await vehiclesResponse.json();

        // Get vehicle statistics
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vehicles/stats`, {
          headers
        });
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const statsData = await statsResponse.json();

        setVehicles(vehiclesData.vehicles || []);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading vehicle data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load vehicle data');
        
        // Fallback data for demo purposes
        setStats({
          totalVehicles: 156,
          pendingApproval: 12,
          approvedVehicles: 134,
          rejectedVehicles: 10,
          onlineVehicles: 118,
          offlineVehicles: 28,
          maintenanceVehicles: 10,
          recentApplications: 5
        });
        
        // Mock vehicles data
        setVehicles([
          {
            _id: '1',
            deviceId: 'SRI-DEV-001',
            vehicleNumber: 'LB-2847',
            vehicleType: 'bus',
            approvalStatus: 'pending',
            status: 'offline',
            firmwareVersion: '2.1.4',
            installDate: '2024-01-15T10:00:00Z',
            registrationDate: '2024-01-15T10:00:00Z',
            batteryLevel: 85,
            signalStrength: 75,
            lastSeen: new Date(Date.now() - 300000).toISOString(),
            alerts: { count: 1, messages: ['Low battery warning'] },
            fleetId: {
              _id: 'fleet1',
              companyName: 'Ceylon Express',
              registrationNumber: 'CE-001',
              contactPerson: 'Kamal Silva',
              email: 'kamal@ceylon.lk'
            }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filterStatus]);

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return currentThemeStyles.textMuted;
    }
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon width={20} height={20} />;
      case 'pending': return <ClockIcon width={20} height={20} />;
      case 'rejected': return <XCircleIcon width={20} height={20} />;
      default: return <ClockIcon width={20} height={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'offline': return currentThemeStyles.textMuted;
      case 'maintenance': return '#f59e0b';
      default: return currentThemeStyles.textMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <SignalIcon width={16} height={16} />;
      case 'offline': return <XCircleIcon width={16} height={16} />;
      case 'maintenance': return <CogIcon width={16} height={16} />;
      default: return <ExclamationTriangleIcon width={16} height={16} />;
    }
  };

  const handleApproveVehicle = async (vehicleId: string) => {
    setActionLoading(`approve-${vehicleId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vehicles/${vehicleId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: approvalNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve vehicle');
      }

      // Update vehicle status in state
      setVehicles(prev => prev.map(vehicle => {
        if (vehicle._id === vehicleId) {
          return { 
            ...vehicle, 
            approvalStatus: 'approved',
            approvalDate: new Date().toISOString()
          };
        }
        return vehicle;
      }));
      
      setShowApprovalModal(null);
      setApprovalNotes('');
    } catch (error) {
      console.error(`Error approving vehicle ${vehicleId}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectVehicle = async (vehicleId: string, reason: string) => {
    setActionLoading(`reject-${vehicleId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vehicles/${vehicleId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject vehicle');
      }

      // Update vehicle status in state
      setVehicles(prev => prev.map(vehicle => {
        if (vehicle._id === vehicleId) {
          return { 
            ...vehicle, 
            approvalStatus: 'rejected',
            rejectionReason: reason,
            rejectionDate: new Date().toISOString()
          };
        }
        return vehicle;
      }));
      
      setShowRejectionModal(null);
      setRejectionReason('');
    } catch (error) {
      console.error(`Error rejecting vehicle ${vehicleId}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedVehicles.length === 0) return;
    
    setActionLoading('bulk-approve');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vehicles/bulk-approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vehicleIds: selectedVehicles,
          notes: approvalNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to bulk approve vehicles');
      }

      // Update vehicles status in state
      setVehicles(prev => prev.map(vehicle => {
        if (selectedVehicles.includes(vehicle._id)) {
          return { 
            ...vehicle, 
            approvalStatus: 'approved',
            approvalDate: new Date().toISOString()
          };
        }
        return vehicle;
      }));
      
      setSelectedVehicles([]);
      setShowBulkActions(false);
      setApprovalNotes('');
    } catch (error) {
      console.error('Error bulk approving vehicles:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const toggleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const selectAllPending = () => {
    const pendingIds = vehicles
      .filter(v => v.approvalStatus === 'pending')
      .map(v => v._id);
    setSelectedVehicles(pendingIds);
  };

  const handleViewDocuments = async (vehicleId: string) => {
    setLoadingDocuments(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/vehicles/admin/${vehicleId}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicle documents');
      }

      const data = await response.json();
      console.log('Fetched vehicle documents:', data);
      console.log('Documents object details:', JSON.stringify(data.documents, null, 2));
      setDocumentViewModal({
        vehicleId: vehicleId,
        documents: data.documents || {}
      });
    } catch (error) {
      console.error('Error fetching vehicle documents:', error);
      setError('Failed to load vehicle documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleDownloadDocument = async (vehicleId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/vehicles/admin/${vehicleId}/documents/${encodeURIComponent(fileName)}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const data = await response.json();
      // Open the signed URL in a new window/tab
      window.open(data.downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document');
    }
  };

  // Loading state with consistent styling
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
        <div style={{ 
          textAlign: 'center', 
          color: currentThemeStyles.textPrimary,
          backgroundColor: currentThemeStyles.glassPanelBg,
          padding: '2rem',
          borderRadius: '1rem',
          backdropFilter: 'blur(12px)',
          border: currentThemeStyles.glassPanelBorder,
          boxShadow: currentThemeStyles.glassPanelShadow,
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid rgba(59, 130, 246, 0.3)', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite', 
            margin: '0 auto 1rem' 
          }}></div>
          <p>Loading vehicle management...</p>
          {error && (
            <p style={{ 
              color: '#ef4444', 
              fontSize: '0.875rem', 
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center'
            }}>
              <ExclamationTriangleIcon width={16} height={16} />
              Using fallback data - {error}
            </p>
          )}
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
      <style jsx>{animationStyles}</style>
      
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      {/* Navigation - Updated with consistent styling */}
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
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Link href="/sysadmin/dashboard" style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(51, 65, 85, 0.5)',
              transition: 'all 0.3s ease'
            }}>
              <ArrowLeftIcon width={16} height={16} />
              Dashboard
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ShieldCheckIcon width={24} height={24} color="#dc2626" />
              <div>
                <h1 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  margin: 0,
                  textShadow: '0 4px 8px rgba(0, 0, 0, 0.7)'
                }}>
                  Vehicle Management
                </h1>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  margin: 0
                }}>
                  Fleet Vehicle Approval System
                </p>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ThemeSwitcher />
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                backgroundColor: 'rgba(51, 65, 85, 0.8)',
                color: '#f9fafb',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            {selectedVehicles.length > 0 && (
              <button
                onClick={() => setShowBulkActions(true)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                }}
              >
                Bulk Actions ({selectedVehicles.length})
              </button>
            )}
            
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)'
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Error Display with consistent styling */}
        {error && (
          <div className="animate-fade-in-down" style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backdropFilter: 'blur(8px)'
          }}>
            <ExclamationTriangleIcon width={20} height={20} color="#f59e0b" />
            <div>
              <span style={{ color: '#ef4444', fontWeight: '600' }}>Warning:</span>
              <span style={{ color: currentThemeStyles.textSecondary, marginLeft: '0.5rem' }}>{error}</span>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: currentThemeStyles.textMuted }}>
                Displaying fallback data for demonstration
              </p>
            </div>
          </div>
        )}

        {/* Vehicle Statistics with glassmorphism */}
        <div className="animate-fade-in-up" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {stats && [
            { label: 'Pending Approval', value: stats.pendingApproval, icon: ClockIcon, color: '#f59e0b' },
            { label: 'Approved Vehicles', value: stats.approvedVehicles, icon: CheckCircleIcon, color: '#10b981' },
            { label: 'Online Now', value: stats.onlineVehicles, icon: SignalIcon, color: '#3b82f6' },
            { label: 'Rejected', value: stats.rejectedVehicles, icon: XCircleIcon, color: '#ef4444' }
          ].map((metric, index) => (
            <div key={metric.label} style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(12px)',
              border: currentThemeStyles.glassPanelBorder,
              animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <metric.icon width={32} height={32} color={metric.color} />
                <div>
                  <h3 style={{ 
                    color: metric.color, 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    margin: 0 
                  }}>
                    {metric.value}
                  </h3>
                  <p style={{ 
                    color: currentThemeStyles.textPrimary, 
                    margin: '0.5rem 0 0 0', 
                    fontWeight: '600' 
                  }}>
                    {metric.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions with glassmorphism */}
        {vehicles.filter(v => v.approvalStatus === 'pending').length > 0 && (
          <div className="animate-fade-in-up" style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.glassPanelBorder,
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow,
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ 
                  color: currentThemeStyles.textPrimary, 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  margin: 0 
                }}>
                  Quick Actions
                </h3>
                <p style={{ 
                  color: currentThemeStyles.textSecondary, 
                  fontSize: '0.875rem', 
                  margin: '0.5rem 0 0 0' 
                }}>
                  {vehicles.filter(v => v.approvalStatus === 'pending').length} vehicles pending approval
                </p>
              </div>
              <button
                onClick={selectAllPending}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                Select All Pending
              </button>
            </div>
          </div>
        )}

        {/* Vehicle Applications with glassmorphism */}
        <div className="animate-fade-in-up" style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          padding: '2rem',
          borderRadius: '0.75rem',
          border: currentThemeStyles.glassPanelBorder,
          backdropFilter: 'blur(12px)',
          boxShadow: currentThemeStyles.glassPanelShadow
        }}>
          <h2 style={{
            color: currentThemeStyles.textPrimary,
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <TruckIcon width={20} height={20} color="#F59E0B" />
            Vehicle Applications ({vehicles.length})
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '1.5rem'
          }}>
            {vehicles.map((vehicle, index) => (
              <div key={vehicle._id} style={{
                backgroundColor: currentThemeStyles.quickActionBg,
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: currentThemeStyles.quickActionBorder,
                position: 'relative',
                backdropFilter: 'blur(8px)',
                animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both`
              }}>
                {/* Selection Checkbox for Pending Vehicles */}
                {vehicle.approvalStatus === 'pending' && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedVehicles.includes(vehicle._id)}
                      onChange={() => toggleVehicleSelection(vehicle._id)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: '#3b82f6'
                      }}
                    />
                  </div>
                )}

                {/* Vehicle Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                  marginLeft: vehicle.approvalStatus === 'pending' ? '2rem' : '0'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      color: currentThemeStyles.textPrimary,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {vehicle.vehicleNumber}
                    </h3>
                    <p style={{
                      color: currentThemeStyles.textSecondary,
                      fontSize: '0.875rem',
                      margin: '0 0 0.5rem 0',
                      textTransform: 'capitalize'
                    }}>
                      {vehicle.vehicleType} • {vehicle.fleetId?.companyName || 'Fleet not assigned'}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem'
                    }}>
                      <span style={{ color: getApprovalStatusColor(vehicle.approvalStatus) }}>
                        {getApprovalStatusIcon(vehicle.approvalStatus)}
                      </span>
                      <span style={{
                        color: getApprovalStatusColor(vehicle.approvalStatus),
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {vehicle.approvalStatus}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem'
                    }}>
                      <span style={{ color: getStatusColor(vehicle.status) }}>
                        {getStatusIcon(vehicle.status)}
                      </span>
                      <span style={{
                        color: getStatusColor(vehicle.status),
                        fontSize: '0.75rem',
                        textTransform: 'capitalize'
                      }}>
                        {vehicle.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '0.5rem'
                }}>
                  <div>
                    <div style={{
                      color: currentThemeStyles.textMuted,
                      fontSize: '0.75rem',
                      marginBottom: '0.25rem'
                    }}>
                      Device ID
                    </div>
                    <div style={{
                      color: currentThemeStyles.textPrimary,
                      fontSize: '0.875rem',
                      fontFamily: 'monospace'
                    }}>
                      {vehicle.deviceId}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{
                      color: currentThemeStyles.textMuted,
                      fontSize: '0.75rem',
                      marginBottom: '0.25rem'
                    }}>
                      Firmware
                    </div>
                    <div style={{
                      color: currentThemeStyles.textPrimary,
                      fontSize: '0.875rem'
                    }}>
                      v{vehicle.firmwareVersion}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{
                      color: currentThemeStyles.textMuted,
                      fontSize: '0.75rem',
                      marginBottom: '0.25rem'
                    }}>
                      Battery Level
                    </div>
                    <div style={{
                      color: vehicle.batteryLevel > 50 ? '#10b981' : vehicle.batteryLevel > 20 ? '#f59e0b' : '#ef4444',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {vehicle.batteryLevel}%
                    </div>
                  </div>

                  <div>
                    <div style={{
                      color: currentThemeStyles.textMuted,
                      fontSize: '0.75rem',
                      marginBottom: '0.25rem'
                    }}>
                      Last Seen
                    </div>
                    <div style={{
                      color: currentThemeStyles.textPrimary,
                      fontSize: '0.875rem'
                    }}>
                      {formatLastSeen(vehicle.lastSeen)}
                    </div>
                  </div>
                </div>

                {/* Fleet Information */}
                <div style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <BuildingOfficeIcon width={16} height={16} color={currentThemeStyles.textMuted} />
                    <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>Fleet Information</span>
                  </div>
                  <div style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    {vehicle.fleetId?.companyName || 'Fleet not assigned'}
                  </div>
                  <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem' }}>
                    {vehicle.fleetId?.contactPerson || 'N/A'} • {vehicle.fleetId?.email || 'N/A'}
                  </div>
                </div>

                {/* Registration Date */}
                <div style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>Registered: </span>
                  <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem' }}>
                    {formatDateTime(vehicle.registrationDate)}
                  </span>
                  {vehicle.approvalDate && (
                    <>
                      <br />
                      <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>Approved: </span>
                      <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem' }}>
                        {formatDateTime(vehicle.approvalDate)}
                      </span>
                    </>
                  )}
                </div>

                {/* Rejection Reason */}
                {vehicle.rejectionReason && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '600' }}>Rejection Reason: </span>
                    <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
                      {vehicle.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Documents Section */}
                {vehicle.documents && (
                  <div style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{ fontSize: '1rem' }}>📄</span>
                      <span style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: '600' }}>
                        Supporting Documents
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.5rem',
                      fontSize: '0.75rem'
                    }}>
                      {/* Vehicle Registration */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.25rem 0'
                      }}>
                        <span style={{ color: currentThemeStyles.textSecondary }}>Vehicle Registration:</span>
                        {vehicle.documents?.vehicleRegistration?.uploaded ? (
                          <button
                            onClick={() => handleDownloadDocument(vehicle._id, vehicle.documents?.vehicleRegistration?.fileName || '')}
                            style={{ 
                              color: '#10b981',
                              fontWeight: '500',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              textDecoration: 'underline'
                            }}
                          >
                            ✓ Download
                          </button>
                        ) : (
                          <span style={{ 
                            color: currentThemeStyles.textMuted,
                            fontWeight: '500'
                          }}>
                            Not uploaded
                          </span>
                        )}
                      </div>

                      {/* Insurance */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.25rem 0'
                      }}>
                        <span style={{ color: currentThemeStyles.textSecondary }}>Insurance Certificate:</span>
                        {vehicle.documents?.insurance?.uploaded ? (
                          <button
                            onClick={() => handleDownloadDocument(vehicle._id, vehicle.documents?.insurance?.fileName || '')}
                            style={{ 
                              color: '#10b981',
                              fontWeight: '500',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              textDecoration: 'underline'
                            }}
                          >
                            ✓ Download
                          </button>
                        ) : (
                          <span style={{ 
                            color: currentThemeStyles.textMuted,
                            fontWeight: '500'
                          }}>
                            Not uploaded
                          </span>
                        )}
                      </div>

                      {/* Safety Inspection */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.25rem 0'
                      }}>
                        <span style={{ color: currentThemeStyles.textSecondary }}>Safety Certificate:</span>
                        {vehicle.documents?.safetyInspection?.uploaded ? (
                          <button
                            onClick={() => handleDownloadDocument(vehicle._id, vehicle.documents?.safetyInspection?.fileName || '')}
                            style={{ 
                              color: '#10b981',
                              fontWeight: '500',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              textDecoration: 'underline'
                            }}
                          >
                            ✓ Download
                          </button>
                        ) : (
                          <span style={{ 
                            color: currentThemeStyles.textMuted,
                            fontWeight: '500'
                          }}>
                            Not uploaded
                          </span>
                        )}
                      </div>

                      {/* Revenue License */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.25rem 0'
                      }}>
                        <span style={{ color: currentThemeStyles.textSecondary }}>Revenue License:</span>
                        {vehicle.documents?.revenueLicense?.uploaded ? (
                          <button
                            onClick={() => handleDownloadDocument(vehicle._id, vehicle.documents?.revenueLicense?.fileName || '')}
                            style={{ 
                              color: '#10b981',
                              fontWeight: '500',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              textDecoration: 'underline'
                            }}
                          >
                            ✓ Download
                          </button>
                        ) : (
                          <span style={{ 
                            color: currentThemeStyles.textMuted,
                            fontWeight: '500'
                          }}>
                            Not uploaded
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Additional Files */}
                    {vehicle.documents?.additionalFiles && vehicle.documents.additionalFiles.length > 0 && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(75, 85, 99, 0.3)' }}>
                        <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.75rem', fontWeight: '600' }}>
                          Additional Files ({vehicle.documents.additionalFiles.length}):
                        </span>
                        <div style={{ marginTop: '0.25rem' }}>
                          {vehicle.documents.additionalFiles.slice(0, 2).map((file, index: number) => (
                            <div key={index} style={{ 
                              color: '#10b981', 
                              fontSize: '0.75rem',
                              margin: '0.25rem 0'
                            }}>
                              • {file.fileName}
                            </div>
                          ))}
                          {vehicle.documents.additionalFiles.length > 2 && (
                            <div style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>
                              ... and {vehicle.documents.additionalFiles.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* View Documents Button for Pending/Approved Vehicles */}
                    {(vehicle.approvalStatus === 'pending' || vehicle.approvalStatus === 'approved') && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <button
                          onClick={() => handleViewDocuments(vehicle._id)}
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.8)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.25rem',
                            border: 'none',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          📋 View All Documents
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Alerts */}
                {vehicle.alerts.count > 0 && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <ExclamationTriangleIcon width={16} height={16} color="#ef4444" />
                      <span style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: '600' }}>
                        {vehicle.alerts.count} Alert{vehicle.alerts.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {vehicle.alerts.messages.slice(0, 2).map((message, index) => (
                      <p key={index} style={{ color: '#ef4444', fontSize: '0.75rem', margin: '0.25rem 0' }}>
                        • {message}
                      </p>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {vehicle.approvalStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => setShowApprovalModal(vehicle)}
                        disabled={actionLoading === `approve-${vehicle._id}`}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          opacity: actionLoading === `approve-${vehicle._id}` ? 0.7 : 1,
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                        }}
                      >
                        <CheckCircleIcon width={14} height={14} />
                        {actionLoading === `approve-${vehicle._id}` ? 'Approving...' : 'Approve'}
                      </button>
                      
                      <button
                        onClick={() => setShowRejectionModal(vehicle)}
                        disabled={actionLoading === `reject-${vehicle._id}`}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          opacity: actionLoading === `reject-${vehicle._id}` ? 0.7 : 1,
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                        }}
                      >
                        <XCircleIcon width={14} height={14} />
                        {actionLoading === `reject-${vehicle._id}` ? 'Rejecting...' : 'Reject'}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setSelectedVehicle(vehicle)}
                    style={{
                      backgroundColor: 'rgba(75, 85, 99, 0.8)',
                      color: currentThemeStyles.textPrimary,
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(75, 85, 99, 0.5)',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backdropFilter: 'blur(8px)'
                    }}
                  >
                    <EyeIcon width={14} height={14} />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {vehicles.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: currentThemeStyles.textSecondary
            }}>
              <TruckIcon width={48} height={48} style={{ 
                margin: '0 auto 1rem', 
                opacity: 0.5,
                color: currentThemeStyles.textMuted
              }} />
              <p>No vehicles found for the selected filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals with consistent glassmorphism styling */}
      
      {/* Vehicle Details Modal */}
      {selectedVehicle && (
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
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: currentThemeStyles.modalBg,
            padding: '2rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.modalBorder,
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                color: currentThemeStyles.textPrimary,
                fontSize: '1.25rem',
                fontWeight: 'bold',
                margin: 0
              }}>
                {selectedVehicle.vehicleNumber} Details
              </h3>
              <button
                onClick={() => setSelectedVehicle(null)}
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
              display: 'grid',
              gap: '1rem'
            }}>
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <h4 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>Vehicle Information</h4>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>Device ID:</span>
                  <span style={{ color: currentThemeStyles.textPrimary, marginLeft: '0.5rem', fontFamily: 'monospace' }}>{selectedVehicle.deviceId}</span>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>Type:</span>
                  <span style={{ color: currentThemeStyles.textPrimary, marginLeft: '0.5rem', textTransform: 'capitalize' }}>{selectedVehicle.vehicleType}</span>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>Install Date:</span>
                  <span style={{ color: currentThemeStyles.textPrimary, marginLeft: '0.5rem' }}>{formatDateTime(selectedVehicle.installDate)}</span>
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
                onClick={() => setSelectedVehicle(null)}
                style={{
                  backgroundColor: 'rgba(75, 85, 99, 0.8)',
                  color: currentThemeStyles.textPrimary,
                  padding: '0.5rem 1rem',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
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
          zIndex: 1001,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: currentThemeStyles.modalBg,
            padding: '2rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.modalBorder,
            maxWidth: '500px',
            width: '90%',
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <h3 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Approve Vehicle
            </h3>
            <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1rem' }}>
              Are you sure you want to approve vehicle <strong>{showApprovalModal.vehicleNumber}</strong> from <strong>{showApprovalModal.fleetId?.companyName || 'unknown fleet'}</strong>?
            </p>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Optional notes (visible to fleet operator)..."
              style={{
                width: '100%',
                height: '80px',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                color: currentThemeStyles.textPrimary,
                resize: 'vertical',
                marginBottom: '1.5rem'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => {
                  setShowApprovalModal(null);
                  setApprovalNotes('');
                }}
                style={{
                  backgroundColor: 'rgba(75, 85, 99, 0.8)',
                  color: currentThemeStyles.textPrimary,
                  padding: '0.5rem 1rem',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveVehicle(showApprovalModal._id)}
                disabled={actionLoading === `approve-${showApprovalModal._id}`}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  opacity: actionLoading === `approve-${showApprovalModal._id}` ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}
              >
                {actionLoading === `approve-${showApprovalModal._id}` ? 'Approving...' : 'Approve Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
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
          zIndex: 1001,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: currentThemeStyles.modalBg,
            padding: '2rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.modalBorder,
            maxWidth: '500px',
            width: '90%',
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <h3 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Reject Vehicle
            </h3>
            <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1rem' }}>
              Please provide a reason for rejecting vehicle <strong>{showRejectionModal.vehicleNumber}</strong>:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              style={{
                width: '100%',
                height: '100px',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                color: currentThemeStyles.textPrimary,
                resize: 'vertical',
                marginBottom: '1.5rem'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => {
                  setShowRejectionModal(null);
                  setRejectionReason('');
                }}
                style={{
                  backgroundColor: 'rgba(75, 85, 99, 0.8)',
                  color: currentThemeStyles.textPrimary,
                  padding: '0.5rem 1rem',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectVehicle(showRejectionModal._id, rejectionReason)}
                disabled={!rejectionReason.trim() || actionLoading === `reject-${showRejectionModal._id}`}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: !rejectionReason.trim() ? 'not-allowed' : 'pointer',
                  opacity: (!rejectionReason.trim() || actionLoading === `reject-${showRejectionModal._id}`) ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                }}
              >
                {actionLoading === `reject-${showRejectionModal._id}` ? 'Rejecting...' : 'Reject Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActions && (
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
          zIndex: 1001,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: currentThemeStyles.modalBg,
            padding: '2rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.modalBorder,
            maxWidth: '500px',
            width: '90%',
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <h3 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Bulk Vehicle Actions
            </h3>
            <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1rem' }}>
              {selectedVehicles.length} vehicles selected for bulk action.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <button
                onClick={handleBulkApprove}
                disabled={actionLoading === 'bulk-approve'}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  flex: 1,
                  opacity: actionLoading === 'bulk-approve' ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}
              >
                {actionLoading === 'bulk-approve' ? 'Approving...' : 'Approve All'}
              </button>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => {
                  setShowBulkActions(false);
                  setSelectedVehicles([]);
                }}
                style={{
                  backgroundColor: 'rgba(75, 85, 99, 0.8)',
                  color: currentThemeStyles.textPrimary,
                  padding: '0.5rem 1rem',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {documentViewModal && (
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
          zIndex: 1002,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: currentThemeStyles.modalBg,
            padding: '2rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.modalBorder,
            maxWidth: '700px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                color: currentThemeStyles.textPrimary,
                fontSize: '1.25rem',
                fontWeight: 'bold',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📄 Vehicle Documents
              </h3>
              <button
                onClick={() => setDocumentViewModal(null)}
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

            {loadingDocuments ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: currentThemeStyles.textSecondary
              }}>
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  border: '3px solid rgba(59, 130, 246, 0.3)', 
                  borderTop: '3px solid #3b82f6', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite', 
                  margin: '0 auto 1rem' 
                }}></div>
                Loading documents...
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '1rem'
              }}>
                {/* Standard Documents */}
                <div>
                  <h4 style={{
                    color: currentThemeStyles.textPrimary,
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    📋 Required Documents
                  </h4>
                  
                  <div style={{
                    display: 'grid',
                    gap: '0.75rem'
                  }}>
                    {[
                      { key: 'vehicleRegistration', label: 'Vehicle Registration Certificate' },
                      { key: 'insurance', label: 'Insurance Certificate' },
                      { key: 'safetyInspection', label: 'Safety/Fitness Certificate' },
                      { key: 'revenueLicense', label: 'Revenue License' }
                    ].map(doc => {
                      const docData = documentViewModal.documents[doc.key];
                      const isUploaded = docData?.uploaded;
                      
                      return (
                        <div key={doc.key} style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{
                              color: currentThemeStyles.textPrimary,
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              marginBottom: '0.25rem'
                            }}>
                              {doc.label}
                            </div>
                            <div style={{
                              color: isUploaded ? '#10b981' : currentThemeStyles.textMuted,
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {isUploaded ? '✓ Uploaded' : '✗ Not uploaded'}
                            </div>
                            {isUploaded && docData.uploadDate && (
                              <div style={{
                                color: currentThemeStyles.textMuted,
                                fontSize: '0.7rem',
                                marginTop: '0.25rem'
                              }}>
                                Uploaded: {new Date(docData.uploadDate).toLocaleDateString()}
                              </div>
                            )}
                            {docData?.expiryDate && (
                              <div style={{
                                color: new Date(docData.expiryDate) < new Date() ? '#ef4444' : '#f59e0b',
                                fontSize: '0.7rem',
                                marginTop: '0.25rem'
                              }}>
                                Expires: {new Date(docData.expiryDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          
                          {isUploaded && docData.fileName && (
                            <button
                              onClick={() => handleDownloadDocument(documentViewModal.vehicleId, docData.fileName)}
                              style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.25rem',
                                border: 'none',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              📥 Download
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Files */}
                {documentViewModal.documents.additionalFiles && documentViewModal.documents.additionalFiles.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{
                      color: currentThemeStyles.textPrimary,
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      📎 Additional Files ({documentViewModal.documents.additionalFiles.length})
                    </h4>
                    
                    <div style={{
                      display: 'grid',
                      gap: '0.5rem'
                    }}>
                      {documentViewModal.documents.additionalFiles.map((file: any, index: number) => (
                        <div key={index} style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{
                              color: currentThemeStyles.textPrimary,
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}>
                              {file.name}
                            </div>
                            <div style={{
                              color: currentThemeStyles.textMuted,
                              fontSize: '0.7rem',
                              marginTop: '0.25rem'
                            }}>
                              Uploaded: {new Date(file.uploadDate).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDownloadDocument(documentViewModal.vehicleId, file.fileName)}
                            style={{
                              backgroundColor: '#10b981',
                              color: 'white',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.25rem',
                              border: 'none',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            📥 Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Documents Available */}
                {(!documentViewModal.documents.vehicleRegistration?.uploaded && 
                  !documentViewModal.documents.insurance?.uploaded &&
                  !documentViewModal.documents.safetyInspection?.uploaded &&
                  !documentViewModal.documents.revenueLicense?.uploaded &&
                  (!documentViewModal.documents.additionalFiles || documentViewModal.documents.additionalFiles.length === 0)) && (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: currentThemeStyles.textSecondary,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
                    <p>No documents have been uploaded for this vehicle yet.</p>
                  </div>
                )}
              </div>
            )}

            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => setDocumentViewModal(null)}
                style={{
                  backgroundColor: 'rgba(75, 85, 99, 0.8)',
                  color: currentThemeStyles.textPrimary,
                  padding: '0.5rem 1rem',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)'
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