// src/app/fleet/analytics/page.tsx - Fleet Analytics Dashboard
"use client";

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  TruckIcon,
  StarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BatteryIcon,
  SignalIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface FleetAnalytics {
  fleet: {
    complianceScore: number;
    totalVehicles: number;
    activeVehicles: number;
    operatingRoutes: number;
  };
  vehicles: {
    total: number;
    online: number;
    offline: number;
    maintenance: number;
    avgBattery: number;
    avgSignal: number;
  };
  routes: {
    total: number;
    active: number;
    avgRating: number;
  };
  performance: {
    utilizationRate: number;
    complianceStatus: string;
    fleetStatus: string;
  };
}

export default function FleetAnalyticsPage() {
  const [analytics, setAnalytics] = useState<FleetAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/analytics?period=${timeframe}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load analytics');
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Load analytics error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [timeframe]);

  const getComplianceColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getComplianceStatus = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Needs Improvement';
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return '#10b981';
    if (level > 20) return '#f59e0b';
    return '#ef4444';
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return '#10b981';
    if (rate >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        width={16}
        height={16}
        style={{
          color: i < Math.floor(rating) ? '#f59e0b' : '#374151',
          fill: i < Math.floor(rating) ? '#f59e0b' : 'none'
        }}
      />
    ));
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
        Loading analytics...
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#ef4444'
      }}>
        {error || 'Analytics data not available'}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#f1f5f9',
              margin: '0 0 0.5rem 0'
            }}>
              Fleet Analytics
            </h1>
            <p style={{
              color: '#94a3b8',
              margin: 0
            }}>
              Performance insights and metrics for your fleet
            </p>
          </div>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            style={{
              backgroundColor: '#334155',
              color: '#f9fafb',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #475569',
              cursor: 'pointer'
            }}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        {/* Overview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Fleet Overview */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <TruckIcon width={24} height={24} color="#3b82f6" />
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1rem',
                fontWeight: '600',
                margin: 0
              }}>
                Fleet Overview
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Vehicles:</span>
                <span style={{ color: '#3b82f6', fontWeight: '600' }}>{analytics.fleet.totalVehicles}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Active Vehicles:</span>
                <span style={{ color: '#10b981', fontWeight: '600' }}>{analytics.fleet.activeVehicles}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Operating Routes:</span>
                <span style={{ color: '#f59e0b', fontWeight: '600' }}>{analytics.fleet.operatingRoutes}</span>
              </div>
            </div>
          </div>

          {/* Compliance Score */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <CheckCircleIcon width={24} height={24} color={getComplianceColor(analytics.fleet.complianceScore)} />
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1rem',
                fontWeight: '600',
                margin: 0
              }}>
                Compliance Score
              </h3>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <span style={{
                color: getComplianceColor(analytics.fleet.complianceScore),
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>
                {analytics.fleet.complianceScore}%
              </span>
              <span style={{
                color: getComplianceColor(analytics.fleet.complianceScore),
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {getComplianceStatus(analytics.fleet.complianceScore)}
              </span>
            </div>
            <div style={{
              backgroundColor: '#334155',
              borderRadius: '0.5rem',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                backgroundColor: getComplianceColor(analytics.fleet.complianceScore),
                height: '100%',
                width: `${analytics.fleet.complianceScore}%`,
                borderRadius: '0.5rem',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Vehicle Utilization */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <ChartBarIcon width={24} height={24} color={getUtilizationColor(analytics.performance.utilizationRate)} />
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1rem',
                fontWeight: '600',
                margin: 0
              }}>
                Vehicle Utilization
              </h3>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <span style={{
                color: getUtilizationColor(analytics.performance.utilizationRate),
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>
                {analytics.performance.utilizationRate.toFixed(1)}%
              </span>
            </div>
            <div style={{
              backgroundColor: '#334155',
              borderRadius: '0.5rem',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                backgroundColor: getUtilizationColor(analytics.performance.utilizationRate),
                height: '100%',
                width: `${analytics.performance.utilizationRate}%`,
                borderRadius: '0.5rem',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Route Performance */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <StarIcon width={24} height={24} color="#f59e0b" />
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1rem',
                fontWeight: '600',
                margin: 0
              }}>
                Route Performance
              </h3>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {renderStars(analytics.routes.avgRating)}
              </div>
              <span style={{
                color: '#f59e0b',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                {analytics.routes.avgRating.toFixed(1)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Active Routes:</span>
              <span style={{ color: '#f1f5f9', fontWeight: '600' }}>{analytics.routes.active}/{analytics.routes.total}</span>
            </div>
          </div>
        </div>

        {/* Vehicle Status Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Vehicle Status */}
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
              <TruckIcon width={20} height={20} />
              Vehicle Status
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  color: '#10b981',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {analytics.vehicles.online}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Online</div>
              </div>

              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  color: '#6b7280',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {analytics.vehicles.offline}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Offline</div>
              </div>

              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  color: '#f59e0b',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {analytics.vehicles.maintenance}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Maintenance</div>
              </div>

              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  color: '#3b82f6',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {analytics.vehicles.total}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total</div>
              </div>
            </div>
          </div>

          {/* System Health */}
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
              <ExclamationTriangleIcon width={20} height={20} />
              System Health
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Average Battery */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <BatteryIcon width={16} height={16} color={getBatteryColor(analytics.vehicles.avgBattery)} />
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Average Battery</span>
                  </div>
                  <span style={{
                    color: getBatteryColor(analytics.vehicles.avgBattery),
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}>
                    {analytics.vehicles.avgBattery.toFixed(1)}%
                  </span>
                </div>
                <div style={{
                  backgroundColor: '#334155',
                  borderRadius: '0.5rem',
                  height: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    backgroundColor: getBatteryColor(analytics.vehicles.avgBattery),
                    height: '100%',
                    width: `${analytics.vehicles.avgBattery}%`,
                    borderRadius: '0.5rem',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Average Signal */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <SignalIcon width={16} height={16} color="#10b981" />
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Average Signal</span>
                  </div>
                  <span style={{
                    color: '#10b981',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}>
                    {analytics.vehicles.avgSignal.toFixed(1)}/5
                  </span>
                </div>
                <div style={{
                  backgroundColor: '#334155',
                  borderRadius: '0.5rem',
                  height: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    backgroundColor: '#10b981',
                    height: '100%',
                    width: `${(analytics.vehicles.avgSignal / 5) * 100}%`,
                    borderRadius: '0.5rem',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Fleet Status */}
              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Fleet Status:</span>
                  <span style={{
                    color: analytics.performance.fleetStatus === 'approved' ? '#10b981' : '#f59e0b',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {analytics.performance.fleetStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
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
            marginBottom: '1.5rem'
          }}>
            Performance Insights
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Insights Cards */}
            <div style={{
              backgroundColor: '#334155',
              padding: '1.5rem',
              borderRadius: '0.5rem'
            }}>
              <h3 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Fleet Utilization</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>
                Your fleet utilization rate of {analytics.performance.utilizationRate.toFixed(1)}% 
                {analytics.performance.utilizationRate >= 80 
                  ? ' is excellent. Keep up the good work!' 
                  : analytics.performance.utilizationRate >= 60
                  ? ' is good but can be improved. Consider optimizing routes.'
                  : ' needs improvement. Review vehicle assignments and route efficiency.'
                }
              </p>
            </div>

            <div style={{
              backgroundColor: '#334155',
              padding: '1.5rem',
              borderRadius: '0.5rem'
            }}>
              <h3 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Compliance Status</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>
                Your compliance score of {analytics.fleet.complianceScore}% 
                {analytics.fleet.complianceScore >= 90 
                  ? ' is excellent. All systems are running smoothly.'
                  : analytics.fleet.complianceScore >= 70
                  ? ' is good. Minor improvements needed in documentation.'
                  : ' requires immediate attention. Please update missing documents.'
                }
              </p>
            </div>

            <div style={{
              backgroundColor: '#334155',
              padding: '1.5rem',
              borderRadius: '0.5rem'
            }}>
              <h3 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Customer Satisfaction</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>
                Your average route rating of {analytics.routes.avgRating.toFixed(1)}/5.0 
                {analytics.routes.avgRating >= 4.5 
                  ? ' is outstanding. Customers are very satisfied.'
                  : analytics.routes.avgRating >= 4.0
                  ? ' is good. Continue maintaining service quality.'
                  : ' needs improvement. Focus on service quality and punctuality.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}