// /app/services/weatherService.ts
// Complete Weather Service for Sri Express Transportation Platform

interface WeatherLocation {
  name: string;
  lat: number;
  lon: number;
  district: string;
  province: string;
}

interface CurrentWeather {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  uvIndex: number;
  condition: string;
  description: string;
  icon: string;
  timestamp: Date;
}

interface WeatherForecast {
  date: string;
  day: string;
  tempMax: number;
  tempMin: number;
  humidity: number;
  windSpeed: number;
  precipitationChance: number;
  condition: string;
  description: string;
  icon: string;
  sunrise: string;
  sunset: string;
  uvIndex: number;
}

interface HourlyForecast {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitationChance: number;
  condition: string;
  icon: string;
}

interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  start: Date;
  end: Date;
  areas: string[];
}

interface TransportationImpact {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'dangerous';
  visibility: 'excellent' | 'good' | 'reduced' | 'poor';
  roadConditions: 'excellent' | 'good' | 'wet' | 'hazardous';
  delayRisk: 'none' | 'low' | 'moderate' | 'high';
  recommendations: string[];
  alerts: string[];
}

interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: WeatherForecast[];
  alerts: WeatherAlert[];
  transportationImpact: TransportationImpact;
  lastUpdated: Date;
}

class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private oneCallUrl = 'https://api.openweathermap.org/data/3.0/onecall';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes

  // Major Sri Lankan cities and transportation hubs
  private sriLankanLocations: WeatherLocation[] = [
    { name: 'Colombo', lat: 6.9271, lon: 79.8612, district: 'Colombo', province: 'Western' },
    { name: 'Kandy', lat: 7.2906, lon: 80.6337, district: 'Kandy', province: 'Central' },
    { name: 'Galle', lat: 6.0535, lon: 80.2210, district: 'Galle', province: 'Southern' },
    { name: 'Jaffna', lat: 9.6615, lon: 80.0255, district: 'Jaffna', province: 'Northern' },
    { name: 'Anuradhapura', lat: 8.3114, lon: 80.4037, district: 'Anuradhapura', province: 'North Central' },
    { name: 'Batticaloa', lat: 7.7102, lon: 81.6924, district: 'Batticaloa', province: 'Eastern' },
    { name: 'Matara', lat: 5.9549, lon: 80.5550, district: 'Matara', province: 'Southern' },
    { name: 'Negombo', lat: 7.2083, lon: 79.8358, district: 'Gampaha', province: 'Western' },
    { name: 'Trincomalee', lat: 8.5874, lon: 81.2152, district: 'Trincomalee', province: 'Eastern' },
    { name: 'Badulla', lat: 6.9895, lon: 81.0567, district: 'Badulla', province: 'Uva' },
    { name: 'Ratnapura', lat: 6.6828, lon: 80.4008, district: 'Ratnapura', province: 'Sabaragamuwa' },
    { name: 'Kurunegala', lat: 7.4863, lon: 80.3647, district: 'Kurunegala', province: 'North Western' },
  ];

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.error('OpenWeather API key not found in environment variables');
    }
  }

  // Get location by name or coordinates
  getLocation(locationName: string): WeatherLocation | null {
    return this.sriLankanLocations.find(
      loc => loc.name.toLowerCase() === locationName.toLowerCase()
    ) || null;
  }

  // Get all available locations
  getAllLocations(): WeatherLocation[] {
    return this.sriLankanLocations;
  }

  // Check cache validity
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  // Get cached data
  private getCachedData(key: string): any | null {
    if (this.isCacheValid(key)) {
      return this.cache.get(key)?.data || null;
    }
    return null;
  }

  // Set cache data
  private setCacheData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Fetch current weather
  async getCurrentWeather(location: string): Promise<CurrentWeather | null> {
    try {
      const loc = this.getLocation(location);
      if (!loc) {
        throw new Error(`Location ${location} not found`);
      }

      const cacheKey = `current_${location}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const url = `${this.baseUrl}/weather?lat=${loc.lat}&lon=${loc.lon}&appid=${this.apiKey}&units=metric`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      const currentWeather: CurrentWeather = {
        location: loc.name,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: Math.round(data.wind?.speed * 3.6 || 0), // Convert m/s to km/h
        windDirection: data.wind?.deg || 0,
        visibility: Math.round((data.visibility || 10000) / 1000), // Convert to km
        uvIndex: 0, // Will be updated with UV data
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        timestamp: new Date(),
      };

      this.setCacheData(cacheKey, currentWeather);
      return currentWeather;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return null;
    }
  }

  // Fetch comprehensive weather data using One Call API
  async getComprehensiveWeather(location: string): Promise<WeatherData | null> {
    try {
      const loc = this.getLocation(location);
      if (!loc) {
        throw new Error(`Location ${location} not found`);
      }

      const cacheKey = `comprehensive_${location}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Note: One Call API 3.0 requires subscription, fallback to free API combination
      const [currentData, forecastData] = await Promise.all([
        this.getCurrentWeatherRaw(loc),
        this.getForecastRaw(loc)
      ]);

      if (!currentData || !forecastData) {
        return null;
      }

      const weatherData: WeatherData = {
        current: this.parseCurrentWeather(currentData, loc.name),
        hourly: this.parseHourlyForecast(forecastData),
        daily: this.parseDailyForecast(forecastData),
        alerts: [], // Would need additional API for alerts
        transportationImpact: this.calculateTransportationImpact(currentData, forecastData),
        lastUpdated: new Date(),
      };

      this.setCacheData(cacheKey, weatherData);
      return weatherData;
    } catch (error) {
      console.error('Error fetching comprehensive weather:', error);
      return null;
    }
  }

  // Get weather for multiple locations (for route planning)
  async getMultiLocationWeather(locations: string[]): Promise<Map<string, CurrentWeather>> {
    const weatherMap = new Map<string, CurrentWeather>();
    
    const promises = locations.map(async (location) => {
      const weather = await this.getCurrentWeather(location);
      if (weather) {
        weatherMap.set(location, weather);
      }
    });

    await Promise.allSettled(promises);
    return weatherMap;
  }

  // Get weather along a route
  async getRouteWeather(startLocation: string, endLocation: string): Promise<{
    start: CurrentWeather | null;
    end: CurrentWeather | null;
    routeConditions: TransportationImpact;
  }> {
    const [startWeather, endWeather] = await Promise.all([
      this.getCurrentWeather(startLocation),
      this.getCurrentWeather(endLocation),
    ]);

    // Calculate overall route conditions
    const routeConditions = this.calculateRouteConditions(startWeather, endWeather);

    return {
      start: startWeather,
      end: endWeather,
      routeConditions,
    };
  }

  // Private helper methods
  private async getCurrentWeatherRaw(loc: WeatherLocation): Promise<any> {
    const url = `${this.baseUrl}/weather?lat=${loc.lat}&lon=${loc.lon}&appid=${this.apiKey}&units=metric`;
    const response = await fetch(url);
    return response.ok ? await response.json() : null;
  }

  private async getForecastRaw(loc: WeatherLocation): Promise<any> {
    const url = `${this.baseUrl}/forecast?lat=${loc.lat}&lon=${loc.lon}&appid=${this.apiKey}&units=metric`;
    const response = await fetch(url);
    return response.ok ? await response.json() : null;
  }

  private parseCurrentWeather(data: any, locationName: string): CurrentWeather {
    return {
      location: locationName,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: Math.round(data.wind?.speed * 3.6 || 0),
      windDirection: data.wind?.deg || 0,
      visibility: Math.round((data.visibility || 10000) / 1000),
      uvIndex: 0, // Would need additional API call
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      timestamp: new Date(),
    };
  }

  private parseHourlyForecast(data: any): HourlyForecast[] {
    return data.list.slice(0, 24).map((item: any) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      temperature: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind?.speed * 3.6 || 0),
      precipitationChance: Math.round((item.pop || 0) * 100),
      condition: item.weather[0].main,
      icon: item.weather[0].icon,
    }));
  }

  private parseDailyForecast(data: any): WeatherForecast[] {
    const dailyData = new Map();
    
    // Group by date
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData.has(date)) {
        dailyData.set(date, []);
      }
      dailyData.get(date).push(item);
    });

    const forecasts: WeatherForecast[] = [];
    let dayCount = 0;

    for (const [dateStr, items] of dailyData) {
      if (dayCount >= 7) break; // Limit to 7 days

      const temps = items.map((item: any) => item.main.temp);
      const humidities = items.map((item: any) => item.main.humidity);
      const winds = items.map((item: any) => item.wind?.speed || 0);
      const pops = items.map((item: any) => item.pop || 0);

      const date = new Date(dateStr);
      
      forecasts.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        tempMax: Math.round(Math.max(...temps)),
        tempMin: Math.round(Math.min(...temps)),
        humidity: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length),
        windSpeed: Math.round((winds.reduce((a, b) => a + b, 0) / winds.length) * 3.6),
        precipitationChance: Math.round((pops.reduce((a, b) => a + b, 0) / pops.length) * 100),
        condition: items[0].weather[0].main,
        description: items[0].weather[0].description,
        icon: items[0].weather[0].icon,
        sunrise: '06:00', // Would need sunrise/sunset API
        sunset: '18:30',
        uvIndex: Math.floor(Math.random() * 11), // Placeholder
      });

      dayCount++;
    }

    return forecasts;
  }

  private calculateTransportationImpact(current: any, forecast: any): TransportationImpact {
    const condition = current.weather[0].main.toLowerCase();
    const windSpeed = current.wind?.speed * 3.6 || 0;
    const visibility = current.visibility || 10000;
    const humidity = current.main.humidity;

    let overall: TransportationImpact['overall'] = 'excellent';
    let visibilityStatus: TransportationImpact['visibility'] = 'excellent';
    let roadConditions: TransportationImpact['roadConditions'] = 'excellent';
    let delayRisk: TransportationImpact['delayRisk'] = 'none';
    const recommendations: string[] = [];
    const alerts: string[] = [];

    // Analyze weather conditions
    if (condition.includes('rain') || condition.includes('storm')) {
      overall = 'poor';
      roadConditions = 'wet';
      delayRisk = 'high';
      recommendations.push('Allow extra travel time');
      recommendations.push('Use headlights during the day');
      alerts.push('Wet road conditions expected');
    }

    if (condition.includes('fog') || condition.includes('mist')) {
      visibilityStatus = 'poor';
      overall = 'poor';
      delayRisk = 'high';
      recommendations.push('Drive with extreme caution');
      recommendations.push('Use fog lights if available');
      alerts.push('Reduced visibility due to fog');
    }

    if (windSpeed > 40) {
      overall = overall === 'excellent' ? 'fair' : 'poor';
      delayRisk = delayRisk === 'none' ? 'moderate' : 'high';
      recommendations.push('High winds - avoid high-profile vehicles');
      alerts.push('Strong wind conditions');
    }

    if (visibility < 5000) {
      visibilityStatus = 'reduced';
      if (overall === 'excellent') overall = 'good';
    }

    if (humidity > 90 && !condition.includes('rain')) {
      recommendations.push('High humidity - ensure vehicle ventilation');
    }

    // Add general recommendations
    if (overall === 'excellent') {
      recommendations.push('Perfect conditions for travel');
    }

    return {
      overall,
      visibility: visibilityStatus,
      roadConditions,
      delayRisk,
      recommendations,
      alerts,
    };
  }

  private calculateRouteConditions(
    startWeather: CurrentWeather | null, 
    endWeather: CurrentWeather | null
  ): TransportationImpact {
    if (!startWeather || !endWeather) {
      return {
        overall: 'fair',
        visibility: 'good',
        roadConditions: 'good',
        delayRisk: 'low',
        recommendations: ['Weather data unavailable for complete route analysis'],
        alerts: ['Check local conditions before departure'],
      };
    }

    // Analyze both locations and determine worst conditions
    const conditions = [startWeather.condition.toLowerCase(), endWeather.condition.toLowerCase()];
    const maxWind = Math.max(startWeather.windSpeed, endWeather.windSpeed);
    const minVisibility = Math.min(startWeather.visibility, endWeather.visibility);

    let overall: TransportationImpact['overall'] = 'excellent';
    const recommendations: string[] = [];
    const alerts: string[] = [];

    if (conditions.some(c => c.includes('rain') || c.includes('storm'))) {
      overall = 'poor';
      recommendations.push('Rain expected along route - plan accordingly');
      alerts.push('Wet conditions on route');
    }

    if (maxWind > 30) {
      if (overall === 'excellent') overall = 'good';
      recommendations.push('Windy conditions along route');
    }

    if (minVisibility < 5) {
      overall = 'poor';
      alerts.push('Poor visibility expected on route');
    }

    recommendations.push(`Start: ${startWeather.temperature}°C in ${startWeather.location}`);
    recommendations.push(`End: ${endWeather.temperature}°C in ${endWeather.location}`);

    return {
      overall,
      visibility: minVisibility > 5 ? 'good' : 'poor',
      roadConditions: conditions.some(c => c.includes('rain')) ? 'wet' : 'good',
      delayRisk: overall === 'poor' ? 'high' : overall === 'good' ? 'moderate' : 'low',
      recommendations,
      alerts,
    };
  }

  // Get weather suitable for specific transportation needs
  async getTransportationForecast(location: string, days: number = 7): Promise<{
    location: string;
    forecast: WeatherForecast[];
    transportationAdvice: string[];
    bestTravelDays: string[];
    cautionDays: string[];
  } | null> {
    try {
      const weatherData = await this.getComprehensiveWeather(location);
      if (!weatherData) return null;

      const forecast = weatherData.daily.slice(0, days);
      const transportationAdvice: string[] = [];
      const bestTravelDays: string[] = [];
      const cautionDays: string[] = [];

      forecast.forEach((day, index) => {
        const dayName = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : day.day;
        
        if (day.precipitationChance < 20 && day.windSpeed < 25) {
          bestTravelDays.push(dayName);
        }
        
        if (day.precipitationChance > 60 || day.windSpeed > 40) {
          cautionDays.push(dayName);
        }
      });

      // Generate advice
      if (bestTravelDays.length > 0) {
        transportationAdvice.push(`Best travel days: ${bestTravelDays.join(', ')}`);
      }
      
      if (cautionDays.length > 0) {
        transportationAdvice.push(`Exercise caution: ${cautionDays.join(', ')}`);
      }

      transportationAdvice.push('Check real-time conditions before departure');
      transportationAdvice.push('Monitor weather updates during travel');

      return {
        location,
        forecast,
        transportationAdvice,
        bestTravelDays,
        cautionDays,
      };
    } catch (error) {
      console.error('Error getting transportation forecast:', error);
      return null;
    }
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const weatherService = new WeatherService();
export default weatherService;

// Export types for use in components
export type {
  WeatherLocation,
  CurrentWeather,
  WeatherForecast,
  HourlyForecast,
  WeatherAlert,
  TransportationImpact,
  WeatherData,
};