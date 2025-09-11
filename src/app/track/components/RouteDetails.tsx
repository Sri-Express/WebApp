// src/app/track/components/RouteDetails.tsx - Display route details with start/end locations
import React, { useState } from 'react';
import { MapPinIcon, ArrowRightIcon, ClockIcon, TruckIcon, EyeIcon } from '@heroicons/react/24/outline';
import { getRouteDetails, getRouteDisplayName } from '../../utils/locationUtils';
import StreetViewModal from './StreetViewModal';

interface Route {
  _id: string;
  name: string;
  routeId: string;
  startLocation: {
    name: string;
    coordinates: [number, number];
    address: string;
  };
  endLocation: {
    name: string;
    coordinates: [number, number];
    address: string;
  };
  waypoints?: Array<{
    name: string;
    coordinates: [number, number];
    order: number;
  }>;
  distance?: number;
  estimatedDuration?: number;
  approvalStatus: string;
  status: string;
}

interface RouteDetailsProps {
  route: Route;
  currentThemeStyles: any;
  isSelected?: boolean;
  onClick?: () => void;
}

const RouteDetails: React.FC<RouteDetailsProps> = ({
  route,
  currentThemeStyles,
  isSelected = false,
  onClick
}) => {
  const routeDetails = getRouteDetails(route);
  const [showStreetView, setShowStreetView] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    location: { name: string; coordinates: [number, number]; address: string };
    label: string;
  } | null>(null);

  const openStreetView = (location: { name: string; coordinates: [number, number]; address: string }, label: string) => {
    setSelectedLocation({ location, label });
    setShowStreetView(true);
  };

  const closeStreetView = () => {
    setShowStreetView(false);
    setSelectedLocation(null);
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: isSelected 
          ? 'rgba(59, 130, 246, 0.1)' 
          : currentThemeStyles.glassPanelBg,
        padding: '1.5rem',
        borderRadius: '0.75rem',
        border: isSelected 
          ? '2px solid #3B82F6' 
          : currentThemeStyles.glassPanelBorder,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: currentThemeStyles.glassPanelShadow,
        backdropFilter: 'blur(8px)',
        marginBottom: '1rem'
      }}
    >
      {/* Route Name and Status */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: currentThemeStyles.textPrimary,
            margin: '0 0 0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <TruckIcon width={20} height={20} color={currentThemeStyles.textPrimary} />
            {route.name}
            {isSelected && (
              <span style={{
                fontSize: '0.75rem',
                color: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                fontWeight: '500'
              }}>
                Selected
              </span>
            )}
          </h3>
          <div style={{
            fontSize: '0.875rem',
            color: currentThemeStyles.textMuted,
            fontFamily: 'monospace'
          }}>
            ID: {route.routeId}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '99px',
            fontSize: '0.75rem',
            fontWeight: '600',
            backgroundColor: route.status === 'active' ? '#10B981' : '#6B7280',
            color: 'white'
          }}>
            {route.status.toUpperCase()}
          </span>
          {route.approvalStatus === 'approved' && (
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '99px',
              fontSize: '0.75rem',
              fontWeight: '600',
              backgroundColor: '#059669',
              color: 'white'
            }}>
              APPROVED
            </span>
          )}
        </div>
      </div>

      {/* Route Path */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
        padding: '1rem',
        backgroundColor: currentThemeStyles.cardBg,
        borderRadius: '0.5rem',
        border: currentThemeStyles.cardBorder
      }}>
        {/* Start Location */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.25rem'
          }}>
            <MapPinIcon width={16} height={16} color="#10B981" />
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: currentThemeStyles.textPrimary
            }}>
              From
            </span>
          </div>
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: currentThemeStyles.textPrimary,
            marginBottom: '0.25rem'
          }}>
            {route.startLocation.name}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: currentThemeStyles.textMuted,
            lineHeight: '1.3',
            marginBottom: '0.5rem'
          }}>
            {route.startLocation.address}
          </div>
          {routeDetails.startDistrict && (
            <div style={{
              fontSize: '0.75rem',
              color: '#3B82F6',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              📍 {routeDetails.startDistrict}, {routeDetails.province}
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openStreetView(route.startLocation, 'Start Point');
            }}
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '0.375rem',
              padding: '0.5rem 0.75rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            }}
          >
            <EyeIcon width={14} height={14} />
            360° View
          </button>
        </div>

        {/* Arrow */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          minWidth: '60px'
        }}>
          <ArrowRightIcon width={24} height={24} color={currentThemeStyles.textSecondary} />
          <div style={{
            fontSize: '0.75rem',
            color: currentThemeStyles.textMuted,
            textAlign: 'center'
          }}>
            {routeDetails.distance}
          </div>
        </div>

        {/* End Location */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.25rem'
          }}>
            <MapPinIcon width={16} height={16} color="#EF4444" />
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: currentThemeStyles.textPrimary
            }}>
              To
            </span>
          </div>
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: currentThemeStyles.textPrimary,
            marginBottom: '0.25rem'
          }}>
            {route.endLocation.name}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: currentThemeStyles.textMuted,
            lineHeight: '1.3',
            marginBottom: '0.5rem'
          }}>
            {route.endLocation.address}
          </div>
          {routeDetails.endDistrict && (
            <div style={{
              fontSize: '0.75rem',
              color: '#EF4444',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              📍 {routeDetails.endDistrict}
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openStreetView(route.endLocation, 'End Point');
            }}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.375rem',
              padding: '0.5rem 0.75rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
          >
            <EyeIcon width={14} height={14} />
            360° View
          </button>
        </div>
      </div>

      {/* Route Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '0.75rem',
            color: currentThemeStyles.textMuted,
            marginBottom: '0.25rem'
          }}>
            Distance
          </div>
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: currentThemeStyles.textPrimary
          }}>
            {routeDetails.distance}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            marginBottom: '0.25rem'
          }}>
            <ClockIcon width={12} height={12} color={currentThemeStyles.textMuted} />
            <span style={{
              fontSize: '0.75rem',
              color: currentThemeStyles.textMuted
            }}>
              Duration
            </span>
          </div>
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: currentThemeStyles.textPrimary
          }}>
            {routeDetails.duration}
          </div>
        </div>

        {routeDetails.waypoints > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '0.75rem',
              color: currentThemeStyles.textMuted,
              marginBottom: '0.25rem'
            }}>
              Waypoints
            </div>
            <div style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: currentThemeStyles.textPrimary
            }}>
              {routeDetails.waypoints}
            </div>
          </div>
        )}
      </div>

      {/* Coordinates for debugging (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: currentThemeStyles.buttonBg,
          borderRadius: '0.375rem',
          fontSize: '0.75rem',
          color: currentThemeStyles.textMuted,
          fontFamily: 'monospace'
        }}>
          Start: [{route.startLocation.coordinates.join(', ')}] • 
          End: [{route.endLocation.coordinates.join(', ')}]
        </div>
      )}

      {/* Street View Modal */}
      {showStreetView && selectedLocation && (
        <StreetViewModal
          isOpen={showStreetView}
          onClose={closeStreetView}
          location={selectedLocation.location}
          locationLabel={selectedLocation.label}
          currentThemeStyles={currentThemeStyles}
        />
      )}
    </div>
  );
};

export default RouteDetails;