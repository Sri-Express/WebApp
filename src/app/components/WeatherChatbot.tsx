// /app/components/WeatherChatbot.tsx
// AI-Powered Weather Chatbot for Sri Express Transportation Platform - Glass Design

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PaperAirplaneIcon,
  ArrowPathIcon,
  CloudIcon,
  SunIcon,
  BoltIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  FlagIcon,
  TruckIcon,
} from '@heroicons/react/24/solid';
import { WeatherData, CurrentWeather } from '@/app/services/weatherService';
import { useTheme } from '@/app/context/ThemeContext';

// Define interfaces for Speech Recognition API for type safety
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: Event) => void;
}

interface SpeechRecognitionEvent extends Event {
  results: Array<Array<{ transcript: string }>>;
}

// Custom Sri Express Weather Bot Avatar Component
const WeatherBotAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; animate?: boolean }> = ({ 
  size = 'md', 
  animate = false 
}) => {
  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 48
  };
  const avatarSize = sizeMap[size];

  return (
    <div style={{
      width: `${avatarSize}px`,
      height: `${avatarSize}px`,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      animation: animate ? 'pulse 2s infinite' : 'none'
    }}>
      <svg
        width={avatarSize * 0.7}
        height={avatarSize * 0.7}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bot Head Background */}
        <circle cx="50" cy="45" r="35" fill="white" fillOpacity="0.9" />
        
        {/* Weather Elements Background */}
        <g opacity="0.3">
          {/* Sun rays */}
          <path d="M20 20L25 25M80 20L75 25M15 50H25M75 50H85M20 80L25 75M80 80L75 75" 
                stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          {/* Cloud */}
          <path d="M70 35C72 33 75 33 77 35C79 33 82 35 82 38C84 38 85 40 85 42C85 44 83 45 81 45H72C70 45 69 43 69 41C69 38 70 35 70 35Z" 
                fill="#e5e7eb" />
        </g>

        {/* Bot Face */}
        {/* Eyes */}
        <circle cx="42" cy="40" r="4" fill="#1d4ed8" />
        <circle cx="58" cy="40" r="4" fill="#1d4ed8" />
        
        {/* Eye Shine */}
        <circle cx="43" cy="38" r="1.5" fill="white" />
        <circle cx="59" cy="38" r="1.5" fill="white" />
        
        {/* Nose/Sensor */}
        <rect x="48" y="45" width="4" height="2" rx="1" fill="#6b7280" />
        
        {/* Mouth - Friendly Smile */}
        <path d="M40 55C40 55 45 60 50 60C55 60 60 55 60 55" 
              stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" fill="none" />
        
        {/* Antenna with Weather Sensor */}
        <line x1="50" y1="15" x2="50" y2="25" stroke="#6b7280" strokeWidth="2" />
        <circle cx="50" cy="12" r="3" fill="#fbbf24" />
        <circle cx="50" cy="12" r="1.5" fill="white" fillOpacity="0.8" />
        
        {/* Circuit Pattern */}
        <g opacity="0.4">
          <path d="M35 50L30 50L30 55M65 50L70 50L70 55" 
                stroke="#3b82f6" strokeWidth="1" fill="none" />
          <circle cx="30" cy="55" r="1" fill="#3b82f6" />
          <circle cx="70" cy="55" r="1" fill="#3b82f6" />
        </g>
        
        {/* Sri Lankan Flag Colors Accent */}
        <rect x="25" y="70" width="8" height="2" fill="#ff6b35" />
        <rect x="35" y="70" width="8" height="2" fill="#fbbf24" />
        <rect x="45" y="70" width="8" height="2" fill="#10b981" />
        <rect x="67" y="70" width="8" height="2" fill="#dc2626" />
      </svg>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
          50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5); }
        }
      `}</style>
    </div>
  );
};

// Enhanced Weather Icons
const WeatherIconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  'clear': SunIcon,
  'clouds': CloudIcon,
  'rain': () => <CloudIcon style={{ color: '#60a5fa' }} />,
  'drizzle': () => <CloudIcon style={{ color: '#93c5fd' }} />,
  'thunderstorm': BoltIcon,
  'snow': () => <CloudIcon style={{ color: '#f3f4f6' }} />,
  'mist': () => <CloudIcon style={{ color: '#9ca3af' }} />,
  'fog': () => <CloudIcon style={{ color: '#6b7280' }} />,
};

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  weatherData?: {
    temperature?: number;
    condition?: string;
    precipitation?: number;
    wind?: number;
    visibility?: number;
    location?: string;
    visualType?: 'default' | 'chart' | 'forecast' | 'route' | 'alert';
    routeInfo?: {
      from: string;
      to: string;
      conditions: string;
      recommendation: string;
    };
    chartData?: Record<string, string | number>[];
  };
  suggestions?: string[];
  isTyping?: boolean;
}

interface WeatherChatbotProps {
  weatherData: WeatherData | null;
  currentLocation: string;
  availableLocations: string[];
  className?: string;
  multiLocationData?: Map<string, CurrentWeather>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
    index: number;
  }>;
}

const WeatherChatbot: React.FC<WeatherChatbotProps> = ({
  weatherData,
  currentLocation,
  availableLocations,
  className = '',
  multiLocationData = new Map(),
}) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `🌤️ Hello! I'm your AI Weather Assistant for Sri Express. I can help you with:\n\n• Current weather conditions across Sri Lanka\n• Weather impact on bus and train routes\n• Travel time recommendations\n• 7-day forecasts with transportation insights\n• Route-specific weather analysis\n\nWhat would you like to know about the weather?`,
      timestamp: new Date(),
      suggestions: [
        "What's the weather like right now?",
        "Will rain affect my Colombo to Kandy trip?",
        "Show me the 7-day forecast",
        "Best time to travel tomorrow?",
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechRecognition = useRef<SpeechRecognition | null>(null);

  // Theme styles
  const lightTheme = {
    mainBg: '#fffbeb',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
    textPrimary: '#1f2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    controlBg: 'rgba(249, 250, 251, 0.8)',
    controlBorder: '1px solid rgba(209, 213, 219, 0.5)',
    userMessageBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    assistantMessageBg: 'rgba(30, 41, 59, 0.8)',
    inputBg: 'rgba(255, 255, 255, 0.9)',
    buttonBg: '#3b82f6',
    buttonHover: '#2563eb',
  };

  const darkTheme = {
    mainBg: '#0f172a',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
    textPrimary: '#f9fafb',
    textSecondary: '#9ca3af',
    textMuted: '#9ca3af',
    controlBg: 'rgba(51, 65, 85, 0.8)',
    controlBorder: '1px solid rgba(75, 85, 99, 0.5)',
    userMessageBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    assistantMessageBg: 'rgba(51, 65, 85, 0.9)',
    inputBg: 'rgba(51, 65, 85, 0.9)',
    buttonBg: '#3b82f6',
    buttonHover: '#2563eb',
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Generate enhanced weather context for AI
  const generateWeatherContext = useCallback((): string => {
    if (!weatherData) return 'No weather data available.';

    const { current, daily, hourly, transportationImpact } = weatherData;
    
    const context = {
      location: currentLocation,
      current: {
        temperature: current.temperature,
        condition: current.condition,
        description: current.description,
        humidity: current.humidity,
        windSpeed: current.windSpeed,
        visibility: current.visibility,
        pressure: current.pressure,
      },
      todayForecast: daily[0] || null,
      tomorrowForecast: daily[1] || null,
      nextHours: hourly.slice(0, 12),
      transportationImpact: {
        overall: transportationImpact.overall,
        visibility: transportationImpact.visibility,
        roadConditions: transportationImpact.roadConditions,
        delayRisk: transportationImpact.delayRisk,
        recommendations: transportationImpact.recommendations,
        alerts: transportationImpact.alerts,
      },
      availableLocations,
      multiLocationWeather: Array.from(multiLocationData.entries()).map(([loc, weather]) => ({
        location: loc,
        temperature: weather.temperature,
        condition: weather.condition,
        windSpeed: weather.windSpeed,
      })),
    };

    return JSON.stringify(context, null, 2);
  }, [weatherData, currentLocation, availableLocations, multiLocationData]);

  // Extract weather data from AI response
  const extractWeatherDataFromResponse = useCallback((response: string, userQuery: string): Message['weatherData'] => {
    const data: Message['weatherData'] = {};

    const tempMatch = response.match(/(\d+)°C/);
    if (tempMatch) data.temperature = parseInt(tempMatch[1]);

    const conditionKeywords = ['sunny', 'clear', 'cloudy', 'rain', 'storm', 'drizzle', 'fog', 'mist'];
    const foundCondition = conditionKeywords.find(keyword => 
      response.toLowerCase().includes(keyword)
    );
    if (foundCondition) data.condition = foundCondition;

    const precipMatch = response.match(/(\d+)%.*?(rain|precipitation|chance)/i);
    if (precipMatch) data.precipitation = parseInt(precipMatch[1]);

    const windMatch = response.match(/(\d+)\s*km\/h/i);
    if (windMatch) data.wind = parseInt(windMatch[1]);

    if (userQuery.toLowerCase().includes('forecast') || userQuery.toLowerCase().includes('tomorrow') || userQuery.toLowerCase().includes('week')) {
      data.visualType = 'forecast';
    } else if (userQuery.toLowerCase().includes('route') || userQuery.toLowerCase().includes('travel') || userQuery.toLowerCase().includes('trip')) {
      data.visualType = 'route';
    } else if (userQuery.toLowerCase().includes('chart') || userQuery.toLowerCase().includes('graph') || userQuery.toLowerCase().includes('trend')) {
      data.visualType = 'chart';
    } else if (response.toLowerCase().includes('alert') || response.toLowerCase().includes('warning')) {
      data.visualType = 'alert';
    }

    if (userQuery.toLowerCase().includes('to') && data.visualType === 'route') {
      const routeMatch = userQuery.match(/([\w\s]+)\s+to\s+([\w\s]+)/i);
      if (routeMatch) {
        data.routeInfo = {
          from: routeMatch[1].trim(),
          to: routeMatch[2].trim(),
          conditions: data.condition || 'unknown',
          recommendation: 'Check current conditions before departure',
        };
      }
    }

    data.location = currentLocation;
    return data;
  }, [currentLocation]);

  // Generate smart follow-up suggestions
  const generateSmartSuggestions = useCallback((userQuery: string): string[] => {
    const suggestions: string[] = [];
    
    if (userQuery.toLowerCase().includes('current') || userQuery.toLowerCase().includes('now')) {
      suggestions.push('Show me the hourly forecast');
      suggestions.push('How will this affect transportation?');
      suggestions.push('Compare with other cities');
    } else if (userQuery.toLowerCase().includes('forecast') || userQuery.toLowerCase().includes('tomorrow')) {
      suggestions.push('Best time to travel tomorrow?');
      suggestions.push('Show weather analytics');
      suggestions.push('Any weather alerts?');
    } else if (userQuery.toLowerCase().includes('route') || userQuery.toLowerCase().includes('travel')) {
      suggestions.push('Check return journey weather');
      suggestions.push('Alternative route conditions');
      suggestions.push('Travel time recommendations');
    } else {
      suggestions.push('Will it rain today?');
      suggestions.push('Best travel times this week');
      suggestions.push('Weather for Colombo to Kandy');
    }

    return suggestions.slice(0, 3);
  }, []);

  // Generate fallback response for errors
  const generateFallbackResponse = useCallback((): Message => {
    let fallbackContent = '🌤️ I apologize, but I\'m having trouble accessing the latest weather data right now.';
    
    if (weatherData) {
      const { current } = weatherData;
      fallbackContent = `🌤️ Based on the available data for ${currentLocation}:

📍 Current conditions: ${current.temperature}°C, ${current.description}
💨 Wind: ${current.windSpeed} km/h
💧 Humidity: ${current.humidity}%

For detailed forecasts and transportation impact, please check the analytics section or try asking again.`;
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: fallbackContent,
      timestamp: new Date(),
      weatherData: weatherData ? {
        temperature: weatherData.current.temperature,
        condition: weatherData.current.condition,
        location: currentLocation,
      } : undefined,
      suggestions: ['Try asking again', 'Check weather analytics', 'Current conditions'],
    };
  }, [weatherData, currentLocation]);

  // Enhanced AI response generation
  const generateAIResponse = useCallback(async (userMessage: string): Promise<Message> => {
    try {
      const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
      }

      const weatherContext = generateWeatherContext();
      const recentMessages = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');

      const systemPrompt = `You are an AI Weather Assistant for Sri Express, a transportation company in Sri Lanka. You specialize in providing weather information that's relevant to bus and train travel.

CONTEXT:
${weatherContext}

RECENT CONVERSATION:
${recentMessages}

INSTRUCTIONS:
1. Always provide accurate weather information based on the context data
2. Focus on transportation impact - how weather affects bus/train travel
3. Be conversational, helpful, and professional
4. Include specific temperatures, conditions, and forecasts when relevant
5. Provide practical travel advice based on weather conditions
6. When discussing routes, consider weather at both origin and destination
7. Use emojis moderately to make responses engaging
8. Keep responses concise but informative (max 200 words)
9. Always specify location names when giving weather information
10. Include transportation-specific recommendations

For route weather queries, provide:
- Weather conditions at departure and arrival locations
- Travel impact assessment
- Recommended departure times
- Any weather-related delays or precautions

If asked about visualizations or charts, mention that detailed charts are available in the analytics section.

Current date: ${new Date().toLocaleDateString()}
Current time: ${new Date().toLocaleTimeString()}

User query: "${userMessage}"`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: systemPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json() as GeminiResponse;
      const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process your request.';

      const weatherDataExtracted = extractWeatherDataFromResponse(aiResponseText, userMessage);
      const suggestions = generateSmartSuggestions(userMessage);

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date(),
        weatherData: weatherDataExtracted,
        suggestions,
      };

    } catch (error) {
      console.error('Error generating AI response:', error);
      return generateFallbackResponse();
    }
  }, [generateWeatherContext, messages, extractWeatherDataFromResponse, generateSmartSuggestions, generateFallbackResponse]);

  // Handle sending messages
  const handleSendMessage = useCallback(async (message?: string) => {
    const messageText = message || inputMessage.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: 'Analyzing weather data...',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const aiResponse = await generateAIResponse(messageText);
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat(aiResponse));
    } catch (error) {
      console.error('Error in chat:', error);
      const errorResponse = generateFallbackResponse();
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat(errorResponse));
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, generateAIResponse, generateFallbackResponse]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-expect-error - Using vendor-prefixed API which is not in standard TS lib
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      speechRecognition.current = new SpeechRecognition() as SpeechRecognition;
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      speechRecognition.current.lang = 'en-US';

      speechRecognition.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setTimeout(() => handleSendMessage(transcript), 500);
      };

      speechRecognition.current.onend = () => setIsListening(false);
      speechRecognition.current.onerror = () => setIsListening(false);
    }
  }, [handleSendMessage]);

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      handleSendMessage(suggestion);
    }
  };

  // Speech recognition toggle
  const toggleSpeechInput = () => {
    if (!speechRecognition.current) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    if (isListening) {
      speechRecognition.current.abort();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechRecognition.current.start();
    }
  };

  // Text-to-speech toggle
  const toggleSpeechOutput = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Get weather icon component
  const getWeatherIcon = (condition?: string) => {
    if (!condition) return CloudIcon;
    const IconComponent = WeatherIconMap[condition.toLowerCase()];
    return IconComponent || CloudIcon;
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render weather visualization
  const renderWeatherVisualization = (data?: Message['weatherData']) => {
    if (!data || data.visualType === 'default') return null;

    const baseVisualizationStyle: React.CSSProperties = {
      marginTop: '0.75rem',
      padding: '1rem',
      borderRadius: '0.75rem',
      backdropFilter: 'blur(8px)',
    };

    switch (data.visualType) {
      case 'forecast':
        return (
          <div style={{
            ...baseVisualizationStyle,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.3) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
              <CalendarDaysIcon style={{ width: '20px', height: '20px', color: '#60a5fa', marginRight: '0.5rem' }} />
              <span style={{ color: '#93c5fd', fontWeight: '500' }}>7-Day Forecast</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {weatherData?.daily?.slice(0, 3).map((day, index) => (
                <div key={index} style={{ 
                  textAlign: 'center', 
                  padding: '0.5rem', 
                  backgroundColor: 'rgba(59, 130, 246, 0.3)', 
                  borderRadius: '0.5rem' 
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                    {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : day.day.slice(0, 3)}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white' }}>
                    {day.tempMax}°/{day.tempMin}°
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#60a5fa' }}>
                    {day.precipitationChance}% rain
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'route':
        return (
          <div style={{
            ...baseVisualizationStyle,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(6, 182, 212, 0.3) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
              <TruckIcon style={{ width: '20px', height: '20px', color: '#10b981', marginRight: '0.5rem' }} />
              <span style={{ color: '#6ee7b7', fontWeight: '500' }}>Route Weather Analysis</span>
            </div>
            {data.routeInfo && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6ee7b7' }}>{data.routeInfo.from}</span>
                  <span style={{ color: '#10b981' }}>→</span>
                  <span style={{ color: '#6ee7b7' }}>{data.routeInfo.to}</span>
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: '#d1fae5', 
                  backgroundColor: 'rgba(16, 185, 129, 0.3)', 
                  padding: '0.5rem', 
                  borderRadius: '0.25rem' 
                }}>
                  {data.routeInfo.recommendation}
                </div>
              </div>
            )}
          </div>
        );

      case 'chart':
        return (
          <div style={{
            ...baseVisualizationStyle,
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.3) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px' }}>
              <div style={{ textAlign: 'center' }}>
                <ChartBarIcon style={{ width: '32px', height: '32px', color: '#a78bfa', margin: '0 auto 0.5rem' }} />
                <span style={{ color: '#c4b5fd', fontSize: '0.875rem' }}>
                  View detailed charts in Analytics section
                </span>
              </div>
            </div>
          </div>
        );

      case 'alert':
        return (
          <div style={{
            ...baseVisualizationStyle,
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(245, 101, 101, 0.3) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <ExclamationCircleIcon style={{ width: '20px', height: '20px', color: '#f87171', marginRight: '0.5rem' }} />
              <span style={{ color: '#fca5a5', fontWeight: '500' }}>Weather Alert</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#fed7d7' }}>
              Monitor conditions closely and check for updates before traveling.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: currentThemeStyles.glassPanelBg,
      backdropFilter: 'blur(12px)',
      borderRadius: '1rem',
      border: currentThemeStyles.glassPanelBorder,
      boxShadow: currentThemeStyles.glassPanelShadow,
      overflow: 'hidden'
    }} className={className}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        borderBottom: `1px solid ${currentThemeStyles.controlBorder}`,
        backgroundColor: currentThemeStyles.controlBg,
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <WeatherBotAvatar size="lg" animate={isLoading} />
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: 0 }}>
              AI Weather Assistant
            </h3>
            <p style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', margin: 0 }}>
              Powered by Gemini AI • {currentLocation}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: weatherData ? '#10b981' : '#ef4444'
          }}></div>
          <span style={{ fontSize: '0.75rem', color: currentThemeStyles.textMuted }}>
            {weatherData ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                padding: '1rem',
                borderRadius: '1rem',
                ...(message.role === 'user' ? {
                  background: currentThemeStyles.userMessageBg,
                  color: 'white',
                  borderBottomRightRadius: '0.25rem'
                } : {
                  backgroundColor: currentThemeStyles.assistantMessageBg,
                  backdropFilter: 'blur(8px)',
                  color: currentThemeStyles.textPrimary,
                  border: currentThemeStyles.controlBorder,
                  borderBottomLeftRadius: '0.25rem'
                }),
                ...(message.isTyping ? {
                  animation: 'pulse 1.5s infinite'
                } : {})
              }}
            >
              {/* Message header for assistant */}
              {message.role === 'assistant' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  paddingBottom: '0.5rem',
                  borderBottom: `1px solid ${currentThemeStyles.textMuted}40`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <WeatherBotAvatar size="sm" />
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#60a5fa' }}>
                      AI Assistant
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button
                      onClick={() => toggleSpeechOutput(message.content)}
                      style={{
                        padding: '0.25rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentThemeStyles.controlBg}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title={isSpeaking ? "Stop" : "Read aloud"}
                    >
                      {isSpeaking ? (
                        <SpeakerXMarkIcon style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                      ) : (
                        <SpeakerWaveIcon style={{ width: '16px', height: '16px', color: currentThemeStyles.textMuted }} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Message content */}
              <div style={{ 
                whiteSpace: 'pre-line', 
                fontSize: '0.875rem', 
                lineHeight: '1.5' 
              }}>
                {message.content}
              </div>

              {/* Weather data display */}
              {message.weatherData && (
                <div style={{ 
                  marginTop: '0.75rem', 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem' 
                }}>
                  {message.weatherData.temperature && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#fca5a5',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}>
                      <SunIcon style={{ width: '12px', height: '12px' }} />
                      {message.weatherData.temperature}°C
                    </div>
                  )}
                  {message.weatherData.condition && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      color: '#93c5fd',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                      {React.createElement(getWeatherIcon(message.weatherData.condition), { 
                        style: { width: '12px', height: '12px' } 
                      })}
                      {message.weatherData.condition}
                    </div>
                  )}
                  {message.weatherData.precipitation !== undefined && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      color: '#93c5fd',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                      <CloudIcon style={{ width: '12px', height: '12px' }} />
                      {message.weatherData.precipitation}% rain
                    </div>
                  )}
                  {message.weatherData.wind && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      color: '#6ee7b7',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      <FlagIcon style={{ width: '12px', height: '12px' }} />
                      {message.weatherData.wind} km/h
                    </div>
                  )}
                </div>
              )}

              {/* Weather visualization */}
              {renderWeatherVisualization(message.weatherData)}

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: `1px solid ${currentThemeStyles.textMuted}40`
                }}>
                  <div style={{ fontSize: '0.75rem', color: currentThemeStyles.textMuted, marginBottom: '0.5rem' }}>
                    Suggestions:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isLoading}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: currentThemeStyles.controlBg,
                          color: currentThemeStyles.textSecondary,
                          fontSize: '0.75rem',
                          borderRadius: '9999px',
                          border: currentThemeStyles.controlBorder,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: isLoading ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!isLoading) {
                            e.currentTarget.style.backgroundColor = currentThemeStyles.buttonBg;
                            e.currentTarget.style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = currentThemeStyles.controlBg;
                          e.currentTarget.style.color = currentThemeStyles.textSecondary;
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.75rem', 
                color: currentThemeStyles.textMuted 
              }}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {/* Speech recognition indicator */}
        {isListening && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'pulse 1.5s infinite'
            }}>
              <MicrophoneIcon style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '0.875rem' }}>Listening...</span>
              <button 
                onClick={toggleSpeechInput}
                style={{
                  padding: '0.25rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.8)',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                <XMarkIcon style={{ width: '12px', height: '12px', color: 'white' }} />
              </button>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(0.98); }
          }
        `}</style>
      </div>

      {/* Input Area */}
      <div style={{
        padding: '1rem',
        borderTop: `1px solid ${currentThemeStyles.controlBorder}`,
        backgroundColor: currentThemeStyles.controlBg,
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Voice input button */}
          <button
            onClick={toggleSpeechInput}
            disabled={isLoading}
            style={{
              padding: '0.75rem',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: isListening ? '#ef4444' : currentThemeStyles.controlBg,
              color: isListening ? 'white' : currentThemeStyles.textSecondary,
              boxShadow: isListening ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none',
              opacity: isLoading ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading && !isListening) {
                e.currentTarget.style.backgroundColor = currentThemeStyles.buttonBg;
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (!isListening) {
                e.currentTarget.style.backgroundColor = currentThemeStyles.controlBg;
                e.currentTarget.style.color = currentThemeStyles.textSecondary;
              }
            }}
          >
            <MicrophoneIcon style={{ width: '20px', height: '20px' }} />
          </button>

          {/* Text input */}
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={isListening ? 'Listening...' : inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about weather conditions, forecasts, or travel impact..."
              disabled={isLoading || isListening}
              style={{
                width: '100%',
                backgroundColor: currentThemeStyles.inputBg,
                border: currentThemeStyles.controlBorder,
                borderRadius: '9999px',
                padding: '0.75rem 3rem 0.75rem 1rem',
                color: currentThemeStyles.textPrimary,
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                opacity: isLoading || isListening ? 0.5 : 1
              }}
              onFocus={(e) => e.target.style.borderColor = '#60a5fa'}
              onBlur={(e) => e.target.style.borderColor = (currentThemeStyles.controlBorder.split(' ')[2] || '')}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim() || isListening}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '0.5rem',
                backgroundColor: currentThemeStyles.buttonBg,
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: (isLoading || !inputMessage.trim() || isListening) ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading && inputMessage.trim() && !isListening) {
                  e.currentTarget.style.backgroundColor = currentThemeStyles.buttonHover;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = currentThemeStyles.buttonBg;
              }}
            >
              {isLoading ? (
                <ArrowPathIcon style={{ width: '16px', height: '16px', color: 'white', animation: 'spin 1s linear infinite' }} />
              ) : (
                <PaperAirplaneIcon style={{ width: '16px', height: '16px', color: 'white' }} />
              )}
            </button>
          </div>
        </div>

        {/* Quick suggestions */}
        {!isLoading && messages.length > 1 && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {[
              "Current weather",
              "Tomorrow's forecast", 
              "Travel recommendations",
              "Weather alerts",
              "Route conditions",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: currentThemeStyles.controlBg,
                  color: currentThemeStyles.textSecondary,
                  fontSize: '0.75rem',
                  borderRadius: '9999px',
                  border: currentThemeStyles.controlBorder,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = currentThemeStyles.buttonBg;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = currentThemeStyles.controlBg;
                  e.currentTarget.style.color = currentThemeStyles.textSecondary;
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Status info */}
        <div style={{
          marginTop: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: currentThemeStyles.textMuted
        }}>
          <span>Powered by Gemini AI</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: weatherData ? '#10b981' : '#ef4444'
            }}></div>
            <span>Weather data {weatherData ? 'connected' : 'unavailable'}</span>
          </span>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default WeatherChatbot;
