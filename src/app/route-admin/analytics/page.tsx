// src/app/route-admin/analytics/page.tsx - Route Admin Analytics
"use client";

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  MapIcon,
  TruckIcon,
  CurrencyDollarIcon,
  StarIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface RouteAnalytics {
  routeInfo: {
    name: string;
    routeId: string;
    distance: number;
    estimatedDuration: number;
  };
  performance: {
    totalTrips: number;
    completedTrips: number;
    totalRevenue: number;
    avgRating: number;
  };
  vehicles: {
    total: number;
    active: number;
    byFleet: Record<string, number>;
  };
  period: string;
}

interface PerformanceMetric {
  label: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<{ width: number; height: number; color?: string }>;
  color: string;
  format?: 'currency' | 'rating' | 'percentage' | 'number';
}

export default function RouteAdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<RouteAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/analytics?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      console.error('Analytics load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  
  const formatRating = (rating: number) => `${rating.toFixed(1)} / 5.0`;
  
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpIcon width={16} height={16} color="#10b981" />;
    if (change < 0) return <ArrowDownIcon width={16} height={16} color="#ef4444" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return '#10b981';
    if (change < 0) return '#ef4444';
    return '#6b7280';
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
        Loading analytics...
      </div>
    );
  }

  if (!analytics || error) {
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
            Analytics Unavailable
          </h2>
          <p style={{ color: '#fecaca' }}>
            {error || 'Unable to load route analytics data.'}
          </p>
        </div>
      </div>
    );
  }

  // Mock trend data for demonstration
  const performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Total Trips',
      value: analytics.performance.totalTrips,
      change: 12.5,
      icon: MapIcon,
      color: '#3b82f6',
      format: 'number'
    },
    {
      label: 'Completion Rate',
      value: analytics.performance.totalTrips > 0 ? 
        (analytics.performance.completedTrips / analytics.performance.totalTrips) * 100 : 0,
      change: 5.2,
      icon: ChartBarIcon,
      color: '#10b981',
      format: 'percentage'
    },
    {
      label: 'Total Revenue',
      value: analytics.performance.totalRevenue,
      change: 8.7,
      icon: CurrencyDollarIcon,
      color: '#f59e0b',
      format: 'currency'
    },
    {
      label: 'Average Rating',
      value: analytics.performance.avgRating,
      change: 0.2,
      icon: StarIcon,
      color: '#8b5cf6',
      format: 'rating'
    }
  ];

  const formatMetricValue = (value: string | number, format?: string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    switch (format) {
      case 'currency':
        return formatCurrency(numValue);
      case 'rating':
        return formatRating(numValue);
      case 'percentage':
        return formatPercentage(numValue);
      case 'number':
      default:
        return numValue.toLocaleString();
    }
  };

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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1rem'
        }}>
          <div>
            <h1 style={{
              color: '#f1f5f9',
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              Route Performance Analytics
            </h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>
              <strong style={{ color: '#8b5cf6' }}>{analytics.routeInfo.name}</strong> ({analytics.routeInfo.routeId})
            </p>
          </div>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              backgroundColor: '#334155',
              color: '#f1f5f9',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #475569',
              cursor: 'pointer'
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#334155',
            padding: '1rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ color: '#3b82f6', fontSize: '1.25rem', fontWeight: 'bold' }}>
              {analytics.routeInfo.distance} km
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Route Distance</div>
          </div>

          <div style={{
            backgroundColor: '#334155',
            padding: '1rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: 'bold' }}>
              {Math.floor(analytics.routeInfo.estimatedDuration / 60)}h {analytics.routeInfo.estimatedDuration % 60}m
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Est. Duration</div>
          </div>

          <div style={{
            backgroundColor: '#334155',
            padding: '1rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ color: '#f59e0b', fontSize: '1.25rem', fontWeight: 'bold' }}>
              {analytics.vehicles.total}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Vehicles</div>
          </div>

          <div style={{
            backgroundColor: '#334155',
            padding: '1rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ color: '#8b5cf6', fontSize: '1.25rem', fontWeight: 'bold' }}>
              {analytics.vehicles.active}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Active Vehicles</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {performanceMetrics.map((metric, index) => (
          <div key={index} style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem'
            }}>
              <div style={{
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                padding: '0.75rem',
                borderRadius: '0.5rem'
              }}>
                <metric.icon width={24} height={24} color={metric.color} />
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                backgroundColor: getChangeColor(metric.change) + '20',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem'
              }}>
                {getChangeIcon(metric.change)}
                <span style={{
                  color: getChangeColor(metric.change),
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {Math.abs(metric.change)}%
                </span>
              </div>
            </div>

            <div style={{
              color: '#f1f5f9',
              fontSize: '1.875rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              {formatMetricValue(metric.value, metric.format)}
            </div>

            <div style={{
              color: '#94a3b8',
              fontSize: '0.875rem'
            }}>
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Fleet Performance & Vehicle Status */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Fleet Performance */}
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
            Fleet Performance
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {Object.entries(analytics.vehicles.byFleet).map(([fleetName, vehicleCount], index) => (
              <div key={index} style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{
                    color: '#f1f5f9',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {fleetName}
                  </div>
                  <div style={{
                    color: '#94a3b8',
                    fontSize: '0.75rem'
                  }}>
                    {vehicleCount} vehicle{vehicleCount !== 1 ? 's' : ''} assigned
                  </div>
                </div>
                
                <div style={{
                  color: '#8b5cf6',
                  fontSize: '1.25rem',
                  fontWeight: 'bold'
                }}>
                  {Math.round((vehicleCount / analytics.vehicles.total) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
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
            <ClockIcon width={20} height={20} />
            Recent Activity
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* Mock recent activity data */}
            <div style={{
              backgroundColor: '#334155',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <div style={{
                color: '#f1f5f9',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.25rem'
              }}>
                Trip Completed
              </div>
              <div style={{
                color: '#94a3b8',
                fontSize: '0.75rem'
              }}>
                Vehicle BUS-001 • 2 hours ago
              </div>
            </div>

            <div style={{
              backgroundColor: '#334155',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <div style={{
                color: '#f1f5f9',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.25rem'
              }}>
                New Vehicle Assigned
              </div>
              <div style={{
                color: '#94a3b8',
                fontSize: '0.75rem'
              }}>
                Vehicle BUS-012 from Elite Fleet • 5 hours ago
              </div>
            </div>

            <div style={{
              backgroundColor: '#334155',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <div style={{
                color: '#f1f5f9',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.25rem'
              }}>
              Schedule Updated
              </div>
              <div style={{
                color: '#94a3b8',
                fontSize: '0.75rem'
              }}>
                Peak hour frequency increased • Yesterday
              </div>
            </div>

            <div style={{
              backgroundColor: '#334155',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <div style={{
                color: '#f1f5f9',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.25rem'
              }}>
                Customer Rating
              </div>
              <div style={{
                color: '#94a3b8',
                fontSize: '0.75rem'
              }}>
                5.0 stars for yesterday's service • 2 days ago
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
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
          <ChartBarIcon width={20} height={20} />
          Performance Summary ({selectedPeriod})
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              color: '#3b82f6',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              {analytics.performance.totalTrips}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Total Trips
            </div>
            <div style={{
              color: '#10b981',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              ↑ 12.5% vs last period
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              color: '#10b981',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              {analytics.performance.completedTrips}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Completed Trips
            </div>
            <div style={{
              color: '#10b981',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              ↑ 8.2% vs last period
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              color: '#f59e0b',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              {formatCurrency(analytics.performance.totalRevenue)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Total Revenue
            </div>
            <div style={{
              color: '#10b981',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              ↑ 15.3% vs last period
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              color: '#8b5cf6',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              {formatRating(analytics.performance.avgRating)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Average Rating
            </div>
            <div style={{
              color: '#10b981',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              ↑ 0.2 vs last period
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}