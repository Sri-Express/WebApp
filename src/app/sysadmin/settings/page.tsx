// src/app/sysadmin/settings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Cog6ToothIcon,
  ServerIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  ClockIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface SystemSettings {
  system: {
    siteName: string;
    siteUrl: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    defaultUserRole: string;
    sessionTimeout: number;
    apiRateLimit: number;
    maxUploadSize: number;
  };
  security: {
    passwordMinLength: number;
    passwordRequireSpecial: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireUppercase: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
    requireEmailVerification: boolean;
    twoFactorEnabled: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    systemAlerts: boolean;
    userNotifications: boolean;
    emergencyAlerts: boolean;
  };
  integrations: {
    googleMapsApiKey: string;
    emailServiceProvider: string;
    emailApiKey: string;
    smsProvider: string;
    smsApiKey: string;
    paymentGateway: string;
    paymentApiKey: string;
  };
  monitoring: {
    healthCheckInterval: number;
    alertThresholds: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      responseTime: number;
    };
    logRetention: number;
    backupFrequency: string;
    backupRetention: number;
  };
}

export default function SystemSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('system');
  const [hasChanges, setHasChanges] = useState(false);

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

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        // Mock settings data (replace with real API call)
        const mockSettings: SystemSettings = {
          system: {
            siteName: 'Sri Express',
            siteUrl: 'https://sri-express.lk',
            maintenanceMode: false,
            allowRegistration: true,
            defaultUserRole: 'client',
            sessionTimeout: 30,
            apiRateLimit: 1000,
            maxUploadSize: 10
          },
          security: {
            passwordMinLength: 8,
            passwordRequireSpecial: true,
            passwordRequireNumbers: true,
            passwordRequireUppercase: true,
            maxLoginAttempts: 5,
            lockoutDuration: 15,
            requireEmailVerification: true,
            twoFactorEnabled: false
          },
          notifications: {
            emailEnabled: true,
            smsEnabled: true,
            pushEnabled: true,
            systemAlerts: true,
            userNotifications: true,
            emergencyAlerts: true
          },
          integrations: {
            googleMapsApiKey: 'AIza***************',
            emailServiceProvider: 'SendGrid',
            emailApiKey: 'SG.***************',
            smsProvider: 'Twilio',
            smsApiKey: 'AC***************',
            paymentGateway: 'Stripe',
            paymentApiKey: 'sk_***************'
          },
          monitoring: {
            healthCheckInterval: 60,
            alertThresholds: {
              cpuUsage: 80,
              memoryUsage: 85,
              diskUsage: 90,
              responseTime: 5000
            },
            logRetention: 30,
            backupFrequency: 'daily',
            backupRetention: 7
          }
        };

        setSettings(mockSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (section: keyof SystemSettings, field: string, value: string | number | boolean) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;
      
      if (field.includes('.')) {
        const [subField, subKey] = field.split('.');
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subField]: {
              ...(prev[section] as Record<string, Record<string, string | number | boolean>>)[subField],
              [subKey]: value
            }
          }
        };
      } else {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
    });

    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await apiCall('/admin/system/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings }),
      });

      setHasChanges(false);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
      // Could show error message here if needed
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'system', name: 'System', icon: ServerIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'integrations', name: 'Integrations', icon: GlobeAltIcon },
    { id: 'monitoring', name: 'Monitoring', icon: ClockIcon }
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9'
      }}>
        <div>Loading system settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9'
      }}>
        <div>Failed to load settings</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '1rem 0'
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
              fontSize: '0.875rem'
            }}>
              ← Dashboard
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Cog6ToothIcon width={24} height={24} color="#06b6d4" />
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f1f5f9',
                margin: 0
              }}>
                System Settings
              </h1>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {hasChanges && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#f59e0b'
              }}>
                <ExclamationTriangleIcon width={16} height={16} />
                <span style={{ fontSize: '0.875rem' }}>Unsaved changes</span>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              style={{
                backgroundColor: hasChanges ? '#10b981' : '#6b7280',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: hasChanges ? 'pointer' : 'not-allowed',
                opacity: saving ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {saving ? <ArrowPathIcon width={16} height={16} /> : <CheckCircleIcon width={16} height={16} />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Tabs */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '0.75rem',
          border: '1px solid #334155',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #334155'
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  backgroundColor: activeTab === tab.id ? '#334155' : 'transparent',
                  color: activeTab === tab.id ? '#f1f5f9' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: activeTab === tab.id ? '0.75rem 0.75rem 0 0' : '0'
                }}
              >
                <tab.icon width={16} height={16} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '2rem' }}>
            {/* System Settings */}
            {activeTab === 'system' && (
              <div>
                <h2 style={{
                  color: '#f1f5f9',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem'
                }}>
                  System Configuration
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.system.siteName}
                      onChange={(e) => handleChange('system', 'siteName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #475569',
                        backgroundColor: '#334155',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Site URL
                    </label>
                    <input
                      type="url"
                      value={settings.system.siteUrl}
                      onChange={(e) => handleChange('system', 'siteUrl', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #475569',
                        backgroundColor: '#334155',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Default User Role
                    </label>
                    <select
                      value={settings.system.defaultUserRole}
                      onChange={(e) => handleChange('system', 'defaultUserRole', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #475569',
                        backgroundColor: '#334155',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    >
                      <option value="client">Client</option>
                      <option value="customer_service">Customer Service</option>
                      <option value="route_admin">Route Admin</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.system.sessionTimeout}
                      onChange={(e) => handleChange('system', 'sessionTimeout', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #475569',
                        backgroundColor: '#334155',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      API Rate Limit (requests/hour)
                    </label>
                    <input
                      type="number"
                      value={settings.system.apiRateLimit}
                      onChange={(e) => handleChange('system', 'apiRateLimit', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #475569',
                        backgroundColor: '#334155',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Max Upload Size (MB)
                    </label>
                    <input
                      type="number"
                      value={settings.system.maxUploadSize}
                      onChange={(e) => handleChange('system', 'maxUploadSize', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #475569',
                        backgroundColor: '#334155',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  marginTop: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#e2e8f0',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={settings.system.maintenanceMode}
                      onChange={(e) => handleChange('system', 'maintenanceMode', e.target.checked)}
                      style={{
                        accentColor: '#3b82f6'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '500' }}>Maintenance Mode</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Temporarily disable the system for maintenance
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#e2e8f0',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={settings.system.allowRegistration}
                      onChange={(e) => handleChange('system', 'allowRegistration', e.target.checked)}
                      style={{
                        accentColor: '#3b82f6'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '500' }}>Allow User Registration</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Allow new users to register on the platform
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <h2 style={{
                  color: '#f1f5f9',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem'
                }}>
                  Security Configuration
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Minimum Password Length
                    </label>
                    <input
                      type="number"
                      min="6"
                      max="20"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => handleChange('security', 'passwordMinLength', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #475569',
                        backgroundColor: '#334155',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #475569',
                        backgroundColor: '#334155',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Lockout Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={settings.security.lockoutDuration}
                      onChange={(e) => handleChange('security', 'lockoutDuration', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #475569',
                        backgroundColor: '#334155',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#e2e8f0',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={settings.security.passwordRequireSpecial}
                      onChange={(e) => handleChange('security', 'passwordRequireSpecial', e.target.checked)}
                      style={{
                        accentColor: '#3b82f6'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '500' }}>Require Special Characters</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Passwords must contain special characters (!@#$%^&*)
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#e2e8f0',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={settings.security.passwordRequireNumbers}
                      onChange={(e) => handleChange('security', 'passwordRequireNumbers', e.target.checked)}
                      style={{
                        accentColor: '#3b82f6'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '500' }}>Require Numbers</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Passwords must contain at least one number
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#e2e8f0',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={settings.security.passwordRequireUppercase}
                      onChange={(e) => handleChange('security', 'passwordRequireUppercase', e.target.checked)}
                      style={{
                        accentColor: '#3b82f6'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '500' }}>Require Uppercase Letters</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Passwords must contain at least one uppercase letter
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#e2e8f0',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={settings.security.requireEmailVerification}
                      onChange={(e) => handleChange('security', 'requireEmailVerification', e.target.checked)}
                      style={{
                        accentColor: '#3b82f6'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '500' }}>Require Email Verification</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Users must verify their email before accessing the system
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#e2e8f0',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorEnabled}
                      onChange={(e) => handleChange('security', 'twoFactorEnabled', e.target.checked)}
                      style={{
                        accentColor: '#3b82f6'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '500' }}>Enable Two-Factor Authentication</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Require 2FA for admin accounts
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div>
                <h2 style={{
                  color: '#f1f5f9',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem'
                }}>
                  Notification Configuration
                </h2>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                  <div style={{
                    backgroundColor: '#334155',
                    padding: '1.5rem',
                    borderRadius: '0.5rem'
                  }}>
                    <h3 style={{
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <EnvelopeIcon width={16} height={16} />
                      Email Notifications
                    </h3>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#e2e8f0',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailEnabled}
                          onChange={(e) => handleChange('notifications', 'emailEnabled', e.target.checked)}
                          style={{
                            accentColor: '#3b82f6'
                          }}
                        />
                        Enable Email Notifications
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#e2e8f0',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={settings.notifications.systemAlerts}
                          onChange={(e) => handleChange('notifications', 'systemAlerts', e.target.checked)}
                          style={{
                            accentColor: '#3b82f6'
                          }}
                        />
                        System Alert Emails
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#e2e8f0',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={settings.notifications.userNotifications}
                          onChange={(e) => handleChange('notifications', 'userNotifications', e.target.checked)}
                          style={{
                            accentColor: '#3b82f6'
                          }}
                        />
                        User Activity Emails
                      </label>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#334155',
                    padding: '1.5rem',
                    borderRadius: '0.5rem'
                  }}>
                    <h3 style={{
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <DevicePhoneMobileIcon width={16} height={16} />
                      SMS & Push Notifications
                    </h3>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#e2e8f0',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={settings.notifications.smsEnabled}
                          onChange={(e) => handleChange('notifications', 'smsEnabled', e.target.checked)}
                          style={{
                            accentColor: '#3b82f6'
                          }}
                        />
                        Enable SMS Notifications
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#e2e8f0',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={settings.notifications.pushEnabled}
                          onChange={(e) => handleChange('notifications', 'pushEnabled', e.target.checked)}
                          style={{
                            accentColor: '#3b82f6'
                          }}
                        />
                        Enable Push Notifications
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#e2e8f0',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={settings.notifications.emergencyAlerts}
                          onChange={(e) => handleChange('notifications', 'emergencyAlerts', e.target.checked)}
                          style={{
                            accentColor: '#3b82f6'
                          }}
                        />
                        Emergency Alert Notifications
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Settings */}
            {activeTab === 'integrations' && (
              <div>
                <h2 style={{
                  color: '#f1f5f9',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem'
                }}>
                  External Integrations
                </h2>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2rem'
                }}>
                  <div style={{
                    backgroundColor: '#334155',
                    padding: '1.5rem',
                    borderRadius: '0.5rem'
                  }}>
                    <h3 style={{
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '1rem'
                    }}>
                      Google Maps API
                    </h3>
                    <input
                      type="text"
                      value={settings.integrations.googleMapsApiKey}
                      onChange={(e) => handleChange('integrations', 'googleMapsApiKey', e.target.value)}
                      placeholder="Enter Google Maps API Key"
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #475569',
                        backgroundColor: '#1e293b',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{
                    backgroundColor: '#334155',
                    padding: '1.5rem',
                    borderRadius: '0.5rem'
                  }}>
                    <h3 style={{
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '1rem'
                    }}>
                      Email Service
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 2fr',
                      gap: '1rem'
                    }}>
                      <select
                        value={settings.integrations.emailServiceProvider}
                        onChange={(e) => handleChange('integrations', 'emailServiceProvider', e.target.value)}
                        style={{
                          padding: '0.875rem 1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #475569',
                          backgroundColor: '#1e293b',
                          color: '#f1f5f9',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      >
                        <option value="SendGrid">SendGrid</option>
                        <option value="Mailgun">Mailgun</option>
                        <option value="AWS SES">AWS SES</option>
                      </select>
                      <input
                        type="text"
                        value={settings.integrations.emailApiKey}
                        onChange={(e) => handleChange('integrations', 'emailApiKey', e.target.value)}
                        placeholder="Enter API Key"
                        style={{
                          padding: '0.875rem 1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #475569',
                          backgroundColor: '#1e293b',
                          color: '#f1f5f9',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#334155',
                    padding: '1.5rem',
                    borderRadius: '0.5rem'
                  }}>
                    <h3 style={{
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '1rem'
                    }}>
                      SMS Service
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 2fr',
                      gap: '1rem'
                    }}>
                      <select
                        value={settings.integrations.smsProvider}
                        onChange={(e) => handleChange('integrations', 'smsProvider', e.target.value)}
                        style={{
                          padding: '0.875rem 1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #475569',
                          backgroundColor: '#1e293b',
                          color: '#f1f5f9',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      >
                        <option value="Twilio">Twilio</option>
                        <option value="AWS SNS">AWS SNS</option>
                        <option value="MessageBird">MessageBird</option>
                      </select>
                      <input
                        type="text"
                        value={settings.integrations.smsApiKey}
                        onChange={(e) => handleChange('integrations', 'smsApiKey', e.target.value)}
                        placeholder="Enter API Key"
                        style={{
                          padding: '0.875rem 1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #475569',
                          backgroundColor: '#1e293b',
                          color: '#f1f5f9',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#334155',
                    padding: '1.5rem',
                    borderRadius: '0.5rem'
                  }}>
                    <h3 style={{
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '1rem'
                    }}>
                      Payment Gateway
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 2fr',
                      gap: '1rem'
                    }}>
                      <select
                        value={settings.integrations.paymentGateway}
                        onChange={(e) => handleChange('integrations', 'paymentGateway', e.target.value)}
                        style={{
                          padding: '0.875rem 1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #475569',
                          backgroundColor: '#1e293b',
                          color: '#f1f5f9',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      >
                        <option value="Stripe">Stripe</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Razorpay">Razorpay</option>
                      </select>
                      <input
                        type="text"
                        value={settings.integrations.paymentApiKey}
                        onChange={(e) => handleChange('integrations', 'paymentApiKey', e.target.value)}
                        placeholder="Enter API Key"
                        style={{
                          padding: '0.875rem 1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #475569',
                          backgroundColor: '#1e293b',
                          color: '#f1f5f9',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Monitoring Settings */}
            {activeTab === 'monitoring' && (
              <div>
                <h2 style={{
                  color: '#f1f5f9',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem'
                }}>
                  Monitoring & Alerts
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Health Check Interval (seconds)
                    </label>
                    <input
                      type="number"
                      value={settings.monitoring.healthCheckInterval}
                      onChange={(e) => handleChange('monitoring', 'healthCheckInterval', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #475569',
                        backgroundColor: '#334155',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Log Retention (days)
                    </label>
                    <input
                      type="number"
                      value={settings.monitoring.logRetention}
                      onChange={(e) => handleChange('monitoring', 'logRetention', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #475569',
                        backgroundColor: '#334155',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Backup Frequency
                    </label>
                    <select
                      value={settings.monitoring.backupFrequency}
                      onChange={(e) => handleChange('monitoring', 'backupFrequency', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #475569',
                        backgroundColor: '#334155',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Backup Retention (days)
                    </label>
                    <input
                      type="number"
                      value={settings.monitoring.backupRetention}
                      onChange={(e) => handleChange('monitoring', 'backupRetention', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #475569',
                        backgroundColor: '#334155',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#334155',
                  padding: '1.5rem',
                  borderRadius: '0.5rem'
                }}>
                  <h3 style={{
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '1rem'
                  }}>
                    Alert Thresholds
                  </h3>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#e2e8f0',
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem'
                      }}>
                        CPU Usage (%)
                      </label>
                      <input
                        type="number"
                        max="100"
                        value={settings.monitoring.alertThresholds.cpuUsage}
                        onChange={(e) => handleChange('monitoring', 'alertThresholds.cpuUsage', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #475569',
                          backgroundColor: '#1e293b',
                          color: '#f1f5f9',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        color: '#e2e8f0',
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem'
                      }}>
                        Memory Usage (%)
                      </label>
                      <input
                        type="number"
                        max="100"
                        value={settings.monitoring.alertThresholds.memoryUsage}
                        onChange={(e) => handleChange('monitoring', 'alertThresholds.memoryUsage', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #475569',
                          backgroundColor: '#1e293b',
                          color: '#f1f5f9',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        color: '#e2e8f0',
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem'
                      }}>
                        Disk Usage (%)
                      </label>
                      <input
                        type="number"
                        max="100"
                        value={settings.monitoring.alertThresholds.diskUsage}
                        onChange={(e) => handleChange('monitoring', 'alertThresholds.diskUsage', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #475569',
                          backgroundColor: '#1e293b',
                          color: '#f1f5f9',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        color: '#e2e8f0',
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem'
                      }}>
                        Response Time (ms)
                      </label>
                      <input
                        type="number"
                        value={settings.monitoring.alertThresholds.responseTime}
                        onChange={(e) => handleChange('monitoring', 'alertThresholds.responseTime', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #475569',
                          backgroundColor: '#1e293b',
                          color: '#f1f5f9',
                          fontSize: '0.875rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Information Notice */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <InformationCircleIcon width={20} height={20} color="#3b82f6" />
            <h3 style={{
              color: '#f1f5f9',
              fontSize: '1rem',
              fontWeight: '600',
              margin: 0
            }}>
              System Configuration
            </h3>
          </div>
          <p style={{
            color: '#94a3b8',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Changes to system settings will take effect immediately. Some settings may require a system restart 
            to fully apply. Always test configurations in a staging environment before applying to production.
          </p>
        </div>
      </div>
    </div>
  );
}
