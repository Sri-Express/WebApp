// src/app/sysadmin/devices/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  DevicePhoneMobileIcon,
  MapPinIcon,
  SignalIcon,
  BatteryIcon,
  TruckIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  RefreshCcwIcon,
  CalendarIcon,
  CpuChipIcon,
  UserIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

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
  signalStrength: number;
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

  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
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

      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      return null;
    }
  };

  // Load device data
  useEffect(() => {
    const loadDevice = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await apiCall(`/admin/devices/${deviceId}`);
        if (response) {
          setDevice(response);
        } else {
          setError('Device not found');
        }
      } catch (err) {
        setError('Failed to load device details');
        console.error('Error loading device:', err);
      } finally {
        setLoading(false);
      }
    };

    if (deviceId) {
      loadDevice();
    }
  }, [deviceId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return '#10b981';
      case 'offline':
        return '#ef4444';
      case 'maintenance':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon width={20} height={20} />;
      case 'offline':
        return <XCircleIcon width={20} height={20} />;
      case 'maintenance':
        return <ClockIcon width={20} height={20} />;
      default:
        return <ExclamationTriangleIcon width={20} height={20} />;
    }
  };

  const getSignalBars = (strength: number) => {
    const bars = [];
    for (let i = 1; i <= 5; i++) {
      bars.push(
        <div
          key={i}
          s