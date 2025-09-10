// src/app/utils/locationUtils.ts - Sri Lankan location filtering utilities

export interface Province {
  name: string;
  districts: string[];
}

export interface LocationFilter {
  province: string;
  district: string;
  routes: Route[];
}

export interface Route {
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
  approvalStatus: string;
  status: string;
  distance?: number;
  estimatedDuration?: number;
}

// Sri Lankan provinces and districts mapping
export const SRI_LANKAN_PROVINCES: Province[] = [
  {
    name: "Western Province",
    districts: ["Colombo", "Gampaha", "Kalutara"]
  },
  {
    name: "Central Province", 
    districts: ["Kandy", "Matale", "Nuwara Eliya"]
  },
  {
    name: "Southern Province",
    districts: ["Galle", "Matara", "Hambantota"]
  },
  {
    name: "Northern Province",
    districts: ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"]
  },
  {
    name: "Eastern Province",
    districts: ["Ampara", "Batticaloa", "Trincomalee"]
  },
  {
    name: "North Western Province",
    districts: ["Kurunegala", "Puttalam"]
  },
  {
    name: "North Central Province",
    districts: ["Anuradhapura", "Polonnaruwa"]
  },
  {
    name: "Uva Province",
    districts: ["Badulla", "Monaragala"]
  },
  {
    name: "Sabaragamuwa Province",
    districts: ["Ratnapura", "Kegalle"]
  }
];

// Major cities to district mapping
export const CITY_TO_DISTRICT: { [key: string]: string } = {
  // Western Province
  "colombo": "Colombo",
  "dehiwala": "Colombo", 
  "mount lavinia": "Colombo",
  "maharagama": "Colombo",
  "nugegoda": "Colombo",
  "kottawa": "Colombo",
  "moratuwa": "Colombo",
  "panadura": "Kalutara",
  "kalutara": "Kalutara",
  "beruwala": "Kalutara",
  "aluthgama": "Kalutara",
  "bentota": "Kalutara",
  "gampaha": "Gampaha",
  "negombo": "Gampaha",
  "ragama": "Gampaha",
  "kadawatha": "Gampaha",
  "kelaniya": "Gampaha",

  // Central Province  
  "kandy": "Kandy",
  "peradeniya": "Kandy",
  "gampola": "Kandy",
  "matale": "Matale",
  "dambulla": "Matale",
  "nuwara eliya": "Nuwara Eliya",
  "hatton": "Nuwara Eliya",
  "ella": "Nuwara Eliya",

  // Southern Province
  "galle": "Galle",
  "hikkaduwa": "Galle",
  "unawatuna": "Galle",
  "ambalangoda": "Galle",
  "matara": "Matara",
  "mirissa": "Matara",
  "tangalle": "Hambantota",
  "tissamaharama": "Hambantota",

  // Northern Province
  "jaffna": "Jaffna",
  "kilinochchi": "Kilinochchi",
  "vavuniya": "Vavuniya",
  "mannar": "Mannar",

  // Eastern Province
  "batticaloa": "Batticaloa",
  "trincomalee": "Trincomalee",
  "ampara": "Ampara",
  "arugam bay": "Ampara",

  // North Western Province
  "kurunegala": "Kurunegala",
  "puttalam": "Puttalam",
  "chilaw": "Puttalam",

  // North Central Province
  "anuradhapura": "Anuradhapura",
  "polonnaruwa": "Polonnaruwa",
  "sigiriya": "Polonnaruwa",

  // Uva Province
  "badulla": "Badulla",
  "bandarawela": "Badulla",
  "monaragala": "Monaragala",

  // Sabaragamuwa Province
  "ratnapura": "Ratnapura",
  "kegalle": "Kegalle",
  "avissawella": "Kegalle"
};

/**
 * Extract district from location address or name
 */
export const extractDistrict = (location: string): string | null => {
  if (!location) return null;
  
  const locationLower = location.toLowerCase();
  
  // Direct city match
  for (const [city, district] of Object.entries(CITY_TO_DISTRICT)) {
    if (locationLower.includes(city)) {
      return district;
    }
  }
  
  // District name match
  for (const province of SRI_LANKAN_PROVINCES) {
    for (const district of province.districts) {
      if (locationLower.includes(district.toLowerCase())) {
        return district;
      }
    }
  }
  
  return null;
};

/**
 * Extract province from district
 */
export const getProvinceFromDistrict = (district: string): string | null => {
  for (const province of SRI_LANKAN_PROVINCES) {
    if (province.districts.includes(district)) {
      return province.name;
    }
  }
  return null;
};

/**
 * Get route's primary province (based on start location)
 */
export const getRoutePrimaryProvince = (route: Route): string | null => {
  const startDistrict = extractDistrict(route.startLocation?.name || route.startLocation?.address || '');
  return startDistrict ? getProvinceFromDistrict(startDistrict) : null;
};

/**
 * Get route's primary district (based on start location)
 */
export const getRoutePrimaryDistrict = (route: Route): string | null => {
  return extractDistrict(route.startLocation?.name || route.startLocation?.address || '');
};

/**
 * Group routes by province
 */
export const groupRoutesByProvince = (routes: Route[]): { [province: string]: Route[] } => {
  const grouped: { [province: string]: Route[] } = {};
  
  routes.forEach(route => {
    const province = getRoutePrimaryProvince(route);
    if (province) {
      if (!grouped[province]) {
        grouped[province] = [];
      }
      grouped[province].push(route);
    } else {
      // Handle routes with unrecognized locations
      if (!grouped['Other']) {
        grouped['Other'] = [];
      }
      grouped['Other'].push(route);
    }
  });
  
  return grouped;
};

/**
 * Group routes by district within a province
 */
export const groupRoutesByDistrict = (routes: Route[], selectedProvince?: string): { [district: string]: Route[] } => {
  const grouped: { [district: string]: Route[] } = {};
  
  routes.forEach(route => {
    const district = getRoutePrimaryDistrict(route);
    const province = district ? getProvinceFromDistrict(district) : null;
    
    // Only include routes that belong to the selected province (if specified)
    if (selectedProvince && province !== selectedProvince) {
      return;
    }
    
    if (district) {
      if (!grouped[district]) {
        grouped[district] = [];
      }
      grouped[district].push(route);
    } else {
      // Handle routes with unrecognized locations
      if (!grouped['Other']) {
        grouped['Other'] = [];
      }
      grouped['Other'].push(route);
    }
  });
  
  return grouped;
};

/**
 * Filter routes by province and district
 */
export const filterRoutes = (
  routes: Route[], 
  selectedProvince?: string, 
  selectedDistrict?: string
): Route[] => {
  return routes.filter(route => {
    const district = getRoutePrimaryDistrict(route);
    const province = district ? getProvinceFromDistrict(district) : null;
    
    // If province is selected, route must match
    if (selectedProvince && selectedProvince !== 'all' && province !== selectedProvince) {
      return false;
    }
    
    // If district is selected, route must match
    if (selectedDistrict && selectedDistrict !== 'all' && district !== selectedDistrict) {
      return false;
    }
    
    return true;
  });
};

/**
 * Get available districts for a selected province
 */
export const getDistrictsForProvince = (routes: Route[], selectedProvince: string): string[] => {
  if (selectedProvince === 'all') {
    return [];
  }
  
  const routesInProvince = routes.filter(route => {
    const province = getRoutePrimaryProvince(route);
    return province === selectedProvince;
  });
  
  const districts = new Set<string>();
  routesInProvince.forEach(route => {
    const district = getRoutePrimaryDistrict(route);
    if (district) {
      districts.add(district);
    }
  });
  
  return Array.from(districts).sort();
};

/**
 * Get route display name with locations
 */
export const getRouteDisplayName = (route: Route): string => {
  const start = route.startLocation?.name || 'Unknown';
  const end = route.endLocation?.name || 'Unknown';
  return `${start} → ${end}`;
};

/**
 * Get formatted route details for display
 */
export const getRouteDetails = (route: Route) => {
  const startDistrict = getRoutePrimaryDistrict(route);
  const endDistrict = extractDistrict(route.endLocation?.name || route.endLocation?.address || '');
  const province = startDistrict ? getProvinceFromDistrict(startDistrict) : null;
  
  return {
    displayName: getRouteDisplayName(route),
    startDistrict,
    endDistrict,
    province,
    distance: route.distance ? `${route.distance} km` : 'Unknown',
    duration: route.estimatedDuration ? `${route.estimatedDuration} min` : 'Unknown',
    waypoints: route.waypoints?.length || 0
  };
};