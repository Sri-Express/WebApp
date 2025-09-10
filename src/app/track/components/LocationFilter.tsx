// src/app/track/components/LocationFilter.tsx - Province → District → Route filter component
import React from 'react';
import { SRI_LANKAN_PROVINCES, filterRoutes, getDistrictsForProvince } from '../../utils/locationUtils';

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
  approvalStatus: string;
  status: string;
}

interface LocationFilterProps {
  routes: Route[];
  selectedProvince: string;
  selectedDistrict: string;
  selectedRoute: string;
  onProvinceChange: (province: string) => void;
  onDistrictChange: (district: string) => void;
  onRouteChange: (route: string) => void;
  currentThemeStyles: any;
}

const LocationFilter: React.FC<LocationFilterProps> = ({
  routes,
  selectedProvince,
  selectedDistrict,
  selectedRoute,
  onProvinceChange,
  onDistrictChange,
  onRouteChange,
  currentThemeStyles
}) => {
  // Get available districts for selected province
  const availableDistricts = selectedProvince && selectedProvince !== 'all' 
    ? getDistrictsForProvince(routes, selectedProvince)
    : [];

  // Get filtered routes based on selections
  const filteredRoutes = filterRoutes(routes, 
    selectedProvince === 'all' ? undefined : selectedProvince,
    selectedDistrict === 'all' ? undefined : selectedDistrict
  );

  const handleProvinceChange = (province: string) => {
    onProvinceChange(province);
    // Reset district and route when province changes
    onDistrictChange('all');
    onRouteChange('all');
  };

  const handleDistrictChange = (district: string) => {
    onDistrictChange(district);
    // Reset route when district changes
    onRouteChange('all');
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '1rem', 
      alignItems: 'center', 
      flexWrap: 'wrap',
      marginBottom: '1rem'
    }}>
      {/* Province Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          color: currentThemeStyles.textSecondary 
        }}>
          Province
        </label>
        <select
          value={selectedProvince}
          onChange={(e) => handleProvinceChange(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: `1px solid ${currentThemeStyles.selectBorder}`,
            borderRadius: '0.5rem',
            backgroundColor: currentThemeStyles.selectBg,
            color: currentThemeStyles.selectText,
            fontSize: '1rem',
            minWidth: '200px',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Provinces ({routes.length} routes)</option>
          {SRI_LANKAN_PROVINCES.map((province) => {
            const provinceRoutes = filterRoutes(routes, province.name);
            return (
              <option key={province.name} value={province.name}>
                {province.name} ({provinceRoutes.length} routes)
              </option>
            );
          })}
        </select>
      </div>

      {/* District Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          color: currentThemeStyles.textSecondary 
        }}>
          District
        </label>
        <select
          value={selectedDistrict}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={selectedProvince === 'all' || availableDistricts.length === 0}
          style={{
            padding: '0.75rem 1rem',
            border: `1px solid ${currentThemeStyles.selectBorder}`,
            borderRadius: '0.5rem',
            backgroundColor: selectedProvince === 'all' ? currentThemeStyles.buttonBg : currentThemeStyles.selectBg,
            color: selectedProvince === 'all' ? currentThemeStyles.textMuted : currentThemeStyles.selectText,
            fontSize: '1rem',
            minWidth: '180px',
            cursor: selectedProvince === 'all' ? 'not-allowed' : 'pointer',
            opacity: selectedProvince === 'all' ? 0.6 : 1
          }}
        >
          <option value="all">
            {selectedProvince === 'all' 
              ? 'Select Province First' 
              : `All Districts (${filteredRoutes.length} routes)`
            }
          </option>
          {availableDistricts.map((district) => {
            const districtRoutes = filterRoutes(routes, selectedProvince, district);
            return (
              <option key={district} value={district}>
                {district} ({districtRoutes.length} routes)
              </option>
            );
          })}
        </select>
      </div>

      {/* Route Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          color: currentThemeStyles.textSecondary 
        }}>
          Route
        </label>
        <select
          value={selectedRoute}
          onChange={(e) => onRouteChange(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: `1px solid ${currentThemeStyles.selectBorder}`,
            borderRadius: '0.5rem',
            backgroundColor: currentThemeStyles.selectBg,
            color: currentThemeStyles.selectText,
            fontSize: '1rem',
            minWidth: '250px',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Routes ({filteredRoutes.length} routes)</option>
          {filteredRoutes.map((route) => (
            <option key={route._id} value={route._id}>
              {route.name}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Summary */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: currentThemeStyles.glassPanelBg,
        borderRadius: '0.5rem',
        border: currentThemeStyles.glassPanelBorder
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          backgroundColor: filteredRoutes.length > 0 ? '#10B981' : '#6B7280',
          borderRadius: '50%'
        }}></div>
        <span style={{
          fontSize: '0.875rem',
          color: currentThemeStyles.textSecondary,
          fontWeight: '500'
        }}>
          {filteredRoutes.length} route{filteredRoutes.length !== 1 ? 's' : ''} found
        </span>
      </div>
    </div>
  );
};

export default LocationFilter;