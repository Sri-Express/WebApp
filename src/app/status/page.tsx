// src/app/status/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StatusPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const services = [
    {
      name: 'Web Application',
      status: 'operational',
      uptime: '99.9%',
      responseTime: '120ms',
      description: 'Main website and booking platform'
    },
    {
      name: 'Mobile App API',
      status: 'operational',
      uptime: '99.8%',
      responseTime: '95ms',
      description: 'Mobile application backend services'
    },
    {
      name: 'Real-time Tracking',
      status: 'operational',
      uptime: '99.7%',
      responseTime: '200ms',
      description: 'GPS tracking and live updates'
    },
    {
      name: 'Payment Gateway',
      status: 'operational',
      uptime: '99.9%',
      responseTime: '300ms',
      description: 'Payment processing and transactions'
    },
    {
      name: 'SMS Notifications',
      status: 'degraded',
      uptime: '98.5%',
      responseTime: '2.5s',
      description: 'SMS alerts and notifications'
    },
    {
      name: 'Customer Support',
      status: 'operational',
      uptime: '99.6%',
      responseTime: '30s',
      description: 'Help desk and customer service'
    }
  ];

  const incidents = [
    {
      id: 1,
      title: 'SMS Delivery Delays',
      status: 'investigating',
      severity: 'minor',
      time: '2025-01-15 14:30',
      description: 'Some users experiencing delays in SMS notifications. We are investigating the issue.',
      updates: [
        { time: '14:45', message: 'Issue identified with SMS provider. Working on resolution.' },
        { time: '14:30', message: 'Initial reports of SMS delivery delays received.' }
      ]
    },
    {
      id: 2,
      title: 'Scheduled Maintenance - Database Optimization',
      status: 'completed',
      severity: 'maintenance',
      time: '2025-01-14 02:00',
      description: 'Routine database maintenance completed successfully.',
      updates: [
        { time: '03:30', message: 'Maintenance completed. All services restored.' },
        { time: '02:00', message: 'Maintenance started. Brief service interruption expected.' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return '#10B981';
      case 'degraded': return '#F59E0B';
      case 'outage': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational': return 'Operational';
      case 'degraded': return 'Degraded Performance';
      case 'outage': return 'Major Outage';
      default: return 'Unknown';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'major': return '#F59E0B';
      case 'minor': return '#3B82F6';
      case 'maintenance': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getIncidentStatusColor = (status: string) => {
    switch (status) {
      case 'investigating': return '#F59E0B';
      case 'identified': return '#3B82F6';
      case 'monitoring': return '#8B5CF6';
      case 'resolved': return '#10B981';
      case 'completed': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            <span style={{ color: '#F59E0B' }}>ශ්‍රී</span>
            <span style={{ color: '#1F2937' }}>Express</span>
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</Link>
            <Link href="/help" style={{ color: '#6B7280', textDecoration: 'none' }}>Help</Link>
            <Link href="/contact" style={{ color: '#6B7280', textDecoration: 'none' }}>Contact</Link>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1F2937',
            marginBottom: '0.5rem'
          }}>
            System Status
          </h1>
          <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
            Current status of Sri Express services and infrastructure
          </p>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Last updated: {currentTime.toLocaleString()}
          </p>
        </div>

        {/* Overall Status */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#10B981',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontSize: '1.5rem' }}>✓</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', marginBottom: '0.5rem' }}>
            All Systems Operational
          </h2>
          <p style={{ color: '#6B7280' }}>
            All services are running normally with minor SMS delivery delays.
          </p>
        </div>

        {/* Services Status */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1F2937' }}>
            Service Status
          </h3>
          
          {services.map((service, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 0',
              borderBottom: index < services.length - 1 ? '1px solid #f3f4f6' : 'none'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#1F2937', marginBottom: '0.25rem' }}>
                  {service.name}
                </div>
                <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                  {service.description}
                </div>
              </div>
              
              <div style={{ textAlign: 'right', minWidth: '200px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: `${getStatusColor(service.status)}20`,
                  color: getStatusColor(service.status),
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: getStatusColor(service.status),
                    borderRadius: '50%',
                    marginRight: '0.5rem'
                  }}></div>
                  {getStatusText(service.status)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  {service.uptime} uptime • {service.responseTime} avg
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Incidents */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1F2937' }}>
            Recent Incidents
          </h3>
          
          {incidents.map((incident, index) => (
            <div key={incident.id} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: index < incidents.length - 1 ? '1rem' : '0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1F2937', margin: 0 }}>
                  {incident.title}
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{
                    backgroundColor: `${getSeverityColor(incident.severity)}20`,
                    color: getSeverityColor(incident.severity),
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {incident.severity}
                  </span>
                  <span style={{
                    backgroundColor: `${getIncidentStatusColor(incident.status)}20`,
                    color: getIncidentStatusColor(incident.status),
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {incident.status}
                  </span>
                </div>
              </div>
              
              <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {incident.description}
              </p>
              
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '1rem' }}>
                Started: {incident.time}
              </div>
              
              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Updates:
                </h5>
                {incident.updates.map((update, updateIndex) => (
                  <div key={updateIndex} style={{
                    borderLeft: '2px solid #e5e7eb',
                    paddingLeft: '1rem',
                    marginBottom: updateIndex < incident.updates.length - 1 ? '0.75rem' : '0'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>
                      {update.time}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#4B5563' }}>
                      {update.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Historical Performance */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
            7-Day Performance Summary
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>99.8%</div>
              <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>Overall Uptime</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3B82F6' }}>156ms</div>
              <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>Avg Response Time</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B' }}>2</div>
              <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>Total Incidents</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8B5CF6' }}>15min</div>
              <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>Avg Resolution Time</div>
            </div>
          </div>
        </div>

        {/* Subscribe to Updates */}
        <div style={{
          backgroundColor: '#F59E0B',
          color: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Stay Updated
          </h3>
          <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
            Subscribe to status updates and get notified of any incidents or maintenance.
          </p>
          <Link
            href="/contact"
            style={{
              backgroundColor: 'white',
              color: '#F59E0B',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'inline-block'
            }}
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}