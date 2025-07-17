// src/app/sysadmin/ai/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CpuChipIcon,
  BoltIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  LightBulbIcon,
  AcademicCapIcon,
  EyeIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

interface AIModule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'training' | 'error';
  accuracy: number;
  lastTrained: string;
  version: string;
  type: 'prediction' | 'optimization' | 'analysis';
}

interface AIStats {
  totalModules: number;
  activeModules: number;
  trainingModules: number;
  totalPredictions: number;
  averageAccuracy: number;
  cpuUsage: number;
  memoryUsage: number;
}

export default function AIModulePage() {
  const [modules, setModules] = useState<AIModule[]>([]);
  const [stats, setStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<AIModule | null>(null);

  // Load AI module data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Mock data for now since AI module isn't implemented yet
        const mockModules: AIModule[] = [
          {
            id: 'arrival-predictor',
            name: 'Arrival Time Predictor',
            description: 'Predicts bus/train arrival times using traffic and historical data',
            status: 'active',
            accuracy: 87.5,
            lastTrained: '2025-01-15T10:30:00Z',
            version: '2.1.3',
            type: 'prediction'
          },
          {
            id: 'route-optimizer',
            name: 'Route Optimizer',
            description: 'Optimizes routes based on real-time traffic and passenger demand',
            status: 'inactive',
            accuracy: 92.1,
            lastTrained: '2025-01-10T14:20:00Z',
            version: '1.8.2',
            type: 'optimization'
          },
          {
            id: 'demand-forecaster',
            name: 'Demand Forecaster',
            description: 'Forecasts passenger demand for different routes and times',
            status: 'training',
            accuracy: 78.3,
            lastTrained: '2025-01-17T08:15:00Z',
            version: '3.0.1',
            type: 'analysis'
          },
          {
            id: 'anomaly-detector',
            name: 'Anomaly Detector',
            description: 'Detects unusual patterns in vehicle behavior and system performance',
            status: 'error',
            accuracy: 65.4,
            lastTrained: '2025-01-12T16:45:00Z',
            version: '1.5.7',
            type: 'analysis'
          }
        ];

        const mockStats: AIStats = {
          totalModules: 4,
          activeModules: 1,
          trainingModules: 1,
          totalPredictions: 156789,
          averageAccuracy: 80.8,
          cpuUsage: 34.2,
          memoryUsage: 67.8
        };

        setModules(mockModules);
        setStats(mockStats);
      } catch (error) {
        console.error('Error loading AI modules:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'inactive':
        return '#6b7280';
      case 'training':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon width={20} height={20} />;
      case 'inactive':
        return <PauseIcon width={20} height={20} />;
      case 'training':
        return <ClockIcon width={20} height={20} />;
      case 'error':
        return <ExclamationTriangleIcon width={20} height={20} />;
      default:
        return <ExclamationTriangleIcon width={20} height={20} />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction':
        return <LightBulbIcon width={16} height={16} />;
      case 'optimization':
        return <ChartBarIcon width={16} height={16} />;
      case 'analysis':
        return <AcademicCapIcon width={16} height={16} />;
      default:
        return <CpuChipIcon width={16} height={16} />;
    }
  };

  const handleModuleAction = async (moduleId: string, action: 'start' | 'stop' | 'restart' | 'train') => {
    setActionLoading(`${moduleId}-${action}`);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update module status based on action
      setModules(prev => prev.map(module => {
        if (module.id === moduleId) {
          let newStatus = module.status;
          switch (action) {
            case 'start':
              newStatus = 'active';
              break;
            case 'stop':
              newStatus = 'inactive';
              break;
            case 'restart':
              newStatus = 'active';
              break;
            case 'train':
              newStatus = 'training';
              break;
          }
          return { ...module, status: newStatus };
        }
        return module;
      }));
    } catch (error) {
      console.error(`Error performing ${action} on module ${moduleId}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

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
        <div>Loading AI modules...</div>
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
              <CpuChipIcon width={24} height={24} color="#8b5cf6" />
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f1f5f9',
                margin: 0
              }}>
                AI Module Control
              </h1>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              style={{
                backgroundColor: '#374151',
                color: '#f9fafb',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Cog6ToothIcon width={16} height={16} />
              Configuration
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <ArrowPathIcon width={16} height={16} />
              Refresh
            </button>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* System Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CpuChipIcon width={32} height={32} color="#8b5cf6" />
              <div>
                <h3 style={{ color: '#8b5cf6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats?.totalModules}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Total Modules</p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckCircleIcon width={32} height={32} color="#10b981" />
              <div>
                <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats?.activeModules}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Active</p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ChartBarIcon width={32} height={32} color="#f59e0b" />
              <div>
                <h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats?.averageAccuracy.toFixed(1)}%
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Avg Accuracy</p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <BoltIcon width={32} height={32} color="#06b6d4" />
              <div>
                <h3 style={{ color: '#06b6d4', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats?.totalPredictions.toLocaleString()}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Predictions</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Resources */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '2rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155',
          marginBottom: '2rem'
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
            <WrenchScrewdriverIcon width={20} height={20} />
            System Resources
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {/* CPU Usage */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#e2e8f0', fontWeight: '600' }}>CPU Usage</span>
                <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{stats?.cpuUsage}%</span>
              </div>
              <div style={{
                backgroundColor: '#334155',
                borderRadius: '0.5rem',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: stats && stats.cpuUsage > 80 ? '#ef4444' : stats && stats.cpuUsage > 60 ? '#f59e0b' : '#10b981',
                  height: '100%',
                  width: `${stats?.cpuUsage}%`,
                  borderRadius: '0.5rem',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Memory Usage */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Memory Usage</span>
                <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{stats?.memoryUsage}%</span>
              </div>
              <div style={{
                backgroundColor: '#334155',
                borderRadius: '0.5rem',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: stats && stats.memoryUsage > 80 ? '#ef4444' : stats && stats.memoryUsage > 60 ? '#f59e0b' : '#10b981',
                  height: '100%',
                  width: `${stats?.memoryUsage}%`,
                  borderRadius: '0.5rem',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* AI Modules */}
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
            <CpuChipIcon width={20} height={20} />
            AI Modules
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem'
          }}>
            {modules.map((module) => (
              <div key={module.id} style={{
                backgroundColor: '#334155',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #475569'
              }}>
                {/* Module Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ color: '#94a3b8' }}>
                        {getTypeIcon(module.type)}
                      </span>
                      <h3 style={{
                        color: '#f1f5f9',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        margin: 0
                      }}>
                        {module.name}
                      </h3>
                    </div>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {module.description}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginLeft: '1rem'
                  }}>
                    <span style={{ color: getStatusColor(module.status) }}>
                      {getStatusIcon(module.status)}
                    </span>
                    <span style={{
                      color: getStatusColor(module.status),
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {module.status}
                    </span>
                  </div>
                </div>

                {/* Module Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: '#1e293b',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Accuracy</span>
                    <span style={{
                      color: module.accuracy > 80 ? '#10b981' : module.accuracy > 60 ? '#f59e0b' : '#ef4444',
                      fontSize: '1.25rem',
                      fontWeight: 'bold'
                    }}>
                      {module.accuracy}%
                    </span>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Version</span>
                    <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>
                      v{module.version}
                    </span>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Type</span>
                    <span style={{
                      color: '#f1f5f9',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {module.type}
                    </span>
                  </div>
                </div>

                {/* Last Trained */}
                <div style={{
                  backgroundColor: '#1e293b',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Last Trained: </span>
                  <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                    {formatDateTime(module.lastTrained)}
                  </span>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {module.status === 'inactive' ? (
                    <button
                      onClick={() => handleModuleAction(module.id, 'start')}
                      disabled={actionLoading === `${module.id}-start`}
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
                        opacity: actionLoading === `${module.id}-start` ? 0.7 : 1
                      }}
                    >
                      <PlayIcon width={14} height={14} />
                      {actionLoading === `${module.id}-start` ? 'Starting...' : 'Start'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModuleAction(module.id, 'stop')}
                      disabled={actionLoading === `${module.id}-stop`}
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
                        opacity: actionLoading === `${module.id}-stop` ? 0.7 : 1
                      }}
                    >
                      <StopIcon width={14} height={14} />
                      {actionLoading === `${module.id}-stop` ? 'Stopping...' : 'Stop'}
                    </button>
                  )}

                  <button
                    onClick={() => handleModuleAction(module.id, 'restart')}
                    disabled={actionLoading === `${module.id}-restart`}
                    style={{
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      opacity: actionLoading === `${module.id}-restart` ? 0.7 : 1
                    }}
                  >
                    <ArrowPathIcon width={14} height={14} />
                    {actionLoading === `${module.id}-restart` ? 'Restarting...' : 'Restart'}
                  </button>

                  <button
                    onClick={() => handleModuleAction(module.id, 'train')}
                    disabled={actionLoading === `${module.id}-train` || module.status === 'training'}
                    style={{
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      fontSize: '0.875rem',
                      cursor: module.status === 'training' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      opacity: actionLoading === `${module.id}-train` || module.status === 'training' ? 0.7 : 1
                    }}
                  >
                    <AcademicCapIcon width={14} height={14} />
                    {actionLoading === `${module.id}-train` ? 'Training...' : 
                     module.status === 'training' ? 'Training...' : 'Train'}
                  </button>

                  <button
                    onClick={() => setSelectedModule(module)}
                    style={{
                      backgroundColor: '#374151',
                      color: '#f9fafb',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <EyeIcon width={14} height={14} />
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Notice */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155',
          marginTop: '2rem'
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
              AI System Status
            </h3>
          </div>
          <p style={{
            color: '#94a3b8',
            margin: 0,
            lineHeight: '1.5'
          }}>
            The AI modules are currently in development phase. Full integration with real-time data and 
            production-ready machine learning models will be available in the next release. Current modules 
            use simulated data for demonstration purposes.
          </p>
        </div>
      </div>

      {/* Module Details Modal */}
      {selectedModule && (
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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                margin: 0
              }}>
                {selectedModule.name} Details
              </h3>
              <button
                onClick={() => setSelectedModule(null)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Description</label>
                <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>
                  {selectedModule.description}
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Status</label>
                  <p style={{
                    color: getStatusColor(selectedModule.status),
                    margin: '0.25rem 0 0 0',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {selectedModule.status}
                  </p>
                </div>

                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Accuracy</label>
                  <p style={{
                    color: selectedModule.accuracy > 80 ? '#10b981' : selectedModule.accuracy > 60 ? '#f59e0b' : '#ef4444',
                    margin: '0.25rem 0 0 0',
                    fontWeight: '600'
                  }}>
                    {selectedModule.accuracy}%
                  </p>
                </div>

                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Version</label>
                  <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>
                    v{selectedModule.version}
                  </p>
                </div>

                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Type</label>
                  <p style={{
                    color: '#f1f5f9',
                    margin: '0.25rem 0 0 0',
                    textTransform: 'capitalize'
                  }}>
                    {selectedModule.type}
                  </p>
                </div>
              </div>

              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Last Trained</label>
                <p style={{ color: '#f1f5f9', margin: '0.25rem 0 0 0' }}>
                  {formatDateTime(selectedModule.lastTrained)}
                </p>
              </div>
            </div>

            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setSelectedModule(null)}
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
  );
}