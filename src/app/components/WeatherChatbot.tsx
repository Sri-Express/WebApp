
// // /app/components/WeatherChatbot.tsx
// // AI-Powered Weather Chatbot for Sri Express Transportation Platform

// 'use client';

// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import {
//   PaperAirplaneIcon,
//   ArrowPathIcon,
//   CloudIcon,
//   SunIcon,
//   BoltIcon,
//   MicrophoneIcon,
//   SpeakerWaveIcon,
//   SpeakerXMarkIcon,
//   ChartBarIcon,
//   CalendarDaysIcon,
//   XMarkIcon,
//   ExclamationCircleIcon,
//   CheckCircleIcon,
//   MapPinIcon,
//   ClockIcon,
//   EyeIcon,
//   FlagIcon, // Corrected: Replaced WindIcon with FlagIcon
//   BeakerIcon,
//   QuestionMarkCircleIcon,
//   SparklesIcon,
//   TruckIcon,
// } from '@heroicons/react/24/solid';
// import { WeatherData, CurrentWeather } from '@/app/services/weatherService';

// // Enhanced Weather Icons
// const WeatherIconMap = {
//   'clear': SunIcon,
//   'clouds': CloudIcon,
//   'rain': () => <CloudIcon className="text-blue-400" />,
//   'drizzle': () => <CloudIcon className="text-blue-300" />,
//   'thunderstorm': BoltIcon,
//   'snow': () => <CloudIcon className="text-gray-300" />,
//   'mist': () => <CloudIcon className="text-gray-400" />,
//   'fog': () => <CloudIcon className="text-gray-500" />,
// };

// interface Message {
//   id: string;
//   role: 'user' | 'assistant' | 'system';
//   content: string;
//   timestamp: Date;
//   weatherData?: {
//     temperature?: number;
//     condition?: string;
//     precipitation?: number;
//     wind?: number;
//     visibility?: number;
//     location?: string;
//     visualType?: 'default' | 'chart' | 'forecast' | 'route' | 'alert';
//     routeInfo?: {
//       from: string;
//       to: string;
//       conditions: string;
//       recommendation: string;
//     };
//     chartData?: any[];
//   };
//   suggestions?: string[];
//   isTyping?: boolean;
// }

// interface WeatherChatbotProps {
//   weatherData: WeatherData | null;
//   currentLocation: string;
//   availableLocations: string[];
//   onLocationChange?: (location: string) => void;
//   className?: string;
//   multiLocationData?: Map<string, CurrentWeather>;
// }

// interface GeminiResponse {
//   candidates: Array<{
//     content: {
//       parts: Array<{
//         text: string;
//       }>;
//     };
//     finishReason: string;
//     index: number;
//   }>;
// }

// const WeatherChatbot: React.FC<WeatherChatbotProps> = ({
//   weatherData,
//   currentLocation,
//   availableLocations,
//   onLocationChange,
//   className = '',
//   multiLocationData = new Map(),
// }) => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: '1',
//       role: 'assistant',
//       content: `🌤️ Hello! I'm your AI Weather Assistant for Sri Express. I can help you with:\n\n• Current weather conditions across Sri Lanka\n• Weather impact on bus and train routes\n• Travel time recommendations\n• 7-day forecasts with transportation insights\n• Route-specific weather analysis\n\nWhat would you like to know about the weather?`,
//       timestamp: new Date(),
//       suggestions: [
//         "What's the weather like right now?",
//         "Will rain affect my Colombo to Kandy trip?",
//         "Show me the 7-day forecast",
//         "Best time to travel tomorrow?",
//       ],
//     },
//   ]);

//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [conversationContext, setConversationContext] = useState<string>('');
  
//   const chatContainerRef = useRef<HTMLDivElement>(null);
//   const speechRecognition = useRef<any>(null);

//   // Initialize speech recognition
//   useEffect(() => {
//     if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
//       // @ts-ignore
//       const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
//       speechRecognition.current = new SpeechRecognition();
//       speechRecognition.current.continuous = false;
//       speechRecognition.current.interimResults = false;
//       speechRecognition.current.lang = 'en-US';

//       speechRecognition.current.onresult = (event: any) => {
//         const transcript = event.results[0][0].transcript;
//         setInputMessage(transcript);
//         setTimeout(() => handleSendMessage(transcript), 500);
//       };

//       speechRecognition.current.onend = () => setIsListening(false);
//       speechRecognition.current.onerror = () => setIsListening(false);
//     }
//   }, []);

//   // Auto-scroll to bottom
//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//     }
//   }, [messages]);

//   // Generate enhanced weather context for AI
//   const generateWeatherContext = useCallback((): string => {
//     if (!weatherData) return 'No weather data available.';

//     const { current, daily, hourly, transportationImpact } = weatherData;
    
//     const context = {
//       location: currentLocation,
//       current: {
//         temperature: current.temperature,
//         condition: current.condition,
//         description: current.description,
//         humidity: current.humidity,
//         windSpeed: current.windSpeed,
//         visibility: current.visibility,
//         pressure: current.pressure,
//       },
//       todayForecast: daily[0] || null,
//       tomorrowForecast: daily[1] || null,
//       nextHours: hourly.slice(0, 12),
//       transportationImpact: {
//         overall: transportationImpact.overall,
//         visibility: transportationImpact.visibility,
//         roadConditions: transportationImpact.roadConditions,
//         delayRisk: transportationImpact.delayRisk,
//         recommendations: transportationImpact.recommendations,
//         alerts: transportationImpact.alerts,
//       },
//       availableLocations,
//       multiLocationWeather: Array.from(multiLocationData.entries()).map(([loc, weather]) => ({
//         location: loc,
//         temperature: weather.temperature,
//         condition: weather.condition,
//         windSpeed: weather.windSpeed,
//       })),
//     };

//     return JSON.stringify(context, null, 2);
//   }, [weatherData, currentLocation, availableLocations, multiLocationData]);

//   // Enhanced AI response generation
//   const generateAIResponse = async (userMessage: string): Promise<Message> => {
//     try {
//       const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
//       if (!GEMINI_API_KEY) {
//         throw new Error('Gemini API key not configured');
//       }

//       const weatherContext = generateWeatherContext();
//       const recentMessages = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');

//       const systemPrompt = `You are an AI Weather Assistant for Sri Express, a transportation company in Sri Lanka. You specialize in providing weather information that's relevant to bus and train travel.

// CONTEXT:
// ${weatherContext}

// RECENT CONVERSATION:
// ${recentMessages}

// INSTRUCTIONS:
// 1. Always provide accurate weather information based on the context data
// 2. Focus on transportation impact - how weather affects bus/train travel
// 3. Be conversational, helpful, and professional
// 4. Include specific temperatures, conditions, and forecasts when relevant
// 5. Provide practical travel advice based on weather conditions
// 6. When discussing routes, consider weather at both origin and destination
// 7. Use emojis moderately to make responses engaging
// 8. Keep responses concise but informative (max 200 words)
// 9. Always specify location names when giving weather information
// 10. Include transportation-specific recommendations

// For route weather queries, provide:
// - Weather conditions at departure and arrival locations
// - Travel impact assessment
// - Recommended departure times
// - Any weather-related delays or precautions

// If asked about visualizations or charts, mention that detailed charts are available in the analytics section.

// Current date: ${new Date().toLocaleDateString()}
// Current time: ${new Date().toLocaleTimeString()}

// User query: "${userMessage}"`;

//       const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           contents: [{
//             parts: [{ text: systemPrompt }]
//           }],
//           generationConfig: {
//             temperature: 0.7,
//             maxOutputTokens: 500,
//           },
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`Gemini API error: ${response.status}`);
//       }

//       const data = await response.json() as GeminiResponse;
//       const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process your request.';

//       // Extract weather data and generate suggestions
//       const weatherDataExtracted = extractWeatherDataFromResponse(aiResponse, userMessage);
//       const suggestions = generateSmartSuggestions(userMessage, aiResponse);

//       return {
//         id: Date.now().toString(),
//         role: 'assistant',
//         content: aiResponse,
//         timestamp: new Date(),
//         weatherData: weatherDataExtracted,
//         suggestions,
//       };

//     } catch (error) {
//       console.error('Error generating AI response:', error);
//       return generateFallbackResponse(userMessage);
//     }
//   };

//   // Extract weather data from AI response
//   const extractWeatherDataFromResponse = (response: string, userQuery: string): Message['weatherData'] => {
//     const data: Message['weatherData'] = {};

//     // Extract temperature
//     const tempMatch = response.match(/(\d+)°C/);
//     if (tempMatch) data.temperature = parseInt(tempMatch[1]);

//     // Extract weather condition
//     const conditionKeywords = ['sunny', 'clear', 'cloudy', 'rain', 'storm', 'drizzle', 'fog', 'mist'];
//     const foundCondition = conditionKeywords.find(keyword => 
//       response.toLowerCase().includes(keyword)
//     );
//     if (foundCondition) data.condition = foundCondition;

//     // Extract precipitation
//     const precipMatch = response.match(/(\d+)%.*?(rain|precipitation|chance)/i);
//     if (precipMatch) data.precipitation = parseInt(precipMatch[1]);

//     // Extract wind
//     const windMatch = response.match(/(\d+)\s*km\/h/i);
//     if (windMatch) data.wind = parseInt(windMatch[1]);

//     // Determine visual type based on query
//     if (userQuery.toLowerCase().includes('forecast') || userQuery.toLowerCase().includes('tomorrow') || userQuery.toLowerCase().includes('week')) {
//       data.visualType = 'forecast';
//     } else if (userQuery.toLowerCase().includes('route') || userQuery.toLowerCase().includes('travel') || userQuery.toLowerCase().includes('trip')) {
//       data.visualType = 'route';
//     } else if (userQuery.toLowerCase().includes('chart') || userQuery.toLowerCase().includes('graph') || userQuery.toLowerCase().includes('trend')) {
//       data.visualType = 'chart';
//     } else if (response.toLowerCase().includes('alert') || response.toLowerCase().includes('warning')) {
//       data.visualType = 'alert';
//     }

//     // Extract route information if present
//     if (userQuery.toLowerCase().includes('to') && data.visualType === 'route') {
//       const routeMatch = userQuery.match(/([\w\s]+)\s+to\s+([\w\s]+)/i);
//       if (routeMatch) {
//         data.routeInfo = {
//           from: routeMatch[1].trim(),
//           to: routeMatch[2].trim(),
//           conditions: data.condition || 'unknown',
//           recommendation: 'Check current conditions before departure',
//         };
//       }
//     }

//     data.location = currentLocation;
//     return data;
//   };

//   // Generate smart follow-up suggestions
//   const generateSmartSuggestions = (userQuery: string, aiResponse: string): string[] => {
//     const suggestions: string[] = [];
    
//     if (userQuery.toLowerCase().includes('current') || userQuery.toLowerCase().includes('now')) {
//       suggestions.push('Show me the hourly forecast');
//       suggestions.push('How will this affect transportation?');
//       suggestions.push('Compare with other cities');
//     } else if (userQuery.toLowerCase().includes('forecast') || userQuery.toLowerCase().includes('tomorrow')) {
//       suggestions.push('Best time to travel tomorrow?');
//       suggestions.push('Show weather analytics');
//       suggestions.push('Any weather alerts?');
//     } else if (userQuery.toLowerCase().includes('route') || userQuery.toLowerCase().includes('travel')) {
//       suggestions.push('Check return journey weather');
//       suggestions.push('Alternative route conditions');
//       suggestions.push('Travel time recommendations');
//     } else {
//       // Default suggestions
//       suggestions.push('Will it rain today?');
//       suggestions.push('Best travel times this week');
//       suggestions.push('Weather for Colombo to Kandy');
//     }

//     return suggestions.slice(0, 3);
//   };

//   // Generate fallback response for errors
//   const generateFallbackResponse = (userMessage: string): Message => {
//     let fallbackContent = '🌤️ I apologize, but I\'m having trouble accessing the latest weather data right now.';
    
//     if (weatherData) {
//       const { current } = weatherData;
//       fallbackContent = `🌤️ Based on the available data for ${currentLocation}:

// 📍 Current conditions: ${current.temperature}°C, ${current.description}
// 💨 Wind: ${current.windSpeed} km/h
// 💧 Humidity: ${current.humidity}%

// For detailed forecasts and transportation impact, please check the analytics section or try asking again.`;
//     }

//     return {
//       id: Date.now().toString(),
//       role: 'assistant',
//       content: fallbackContent,
//       timestamp: new Date(),
//       weatherData: weatherData ? {
//         temperature: weatherData.current.temperature,
//         condition: weatherData.current.condition,
//         location: currentLocation,
//       } : undefined,
//       suggestions: ['Try asking again', 'Check weather analytics', 'Current conditions'],
//     };
//   };

//   // Handle sending messages
//   const handleSendMessage = async (message?: string) => {
//     const messageText = message || inputMessage.trim();
//     if (!messageText || isLoading) return;

//     // Add user message
//     const userMessage: Message = {
//       id: Date.now().toString(),
//       role: 'user',
//       content: messageText,
//       timestamp: new Date(),
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInputMessage('');
//     setIsLoading(true);

//     // Add typing indicator
//     const typingMessage: Message = {
//       id: 'typing',
//       role: 'assistant',
//       content: 'Analyzing weather data...',
//       timestamp: new Date(),
//       isTyping: true,
//     };
//     setMessages(prev => [...prev, typingMessage]);

//     try {
//       // Generate AI response
//       const aiResponse = await generateAIResponse(messageText);
      
//       // Remove typing indicator and add real response
//       setMessages(prev => prev.filter(m => m.id !== 'typing').concat(aiResponse));
      
//       // Update conversation context
//       setConversationContext(prev => prev + `\nUser: ${messageText}\nAssistant: ${aiResponse.content}`);
//     } catch (error) {
//       console.error('Error in chat:', error);
//       const errorResponse = generateFallbackResponse(messageText);
//       setMessages(prev => prev.filter(m => m.id !== 'typing').concat(errorResponse));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle suggestion clicks
//   const handleSuggestionClick = (suggestion: string) => {
//     if (!isLoading) {
//       handleSendMessage(suggestion);
//     }
//   };

//   // Speech recognition toggle
//   const toggleSpeechInput = () => {
//     if (!speechRecognition.current) {
//       alert("Speech recognition not supported in this browser");
//       return;
//     }

//     if (isListening) {
//       speechRecognition.current.abort();
//       setIsListening(false);
//     } else {
//       setIsListening(true);
//       speechRecognition.current.start();
//     }
//   };

//   // Text-to-speech toggle
//   const toggleSpeechOutput = (text: string) => {
//     if (isSpeaking) {
//       window.speechSynthesis.cancel();
//       setIsSpeaking(false);
//     } else {
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.rate = 0.9;
//       utterance.pitch = 1.0;
//       utterance.onend = () => setIsSpeaking(false);
      
//       window.speechSynthesis.speak(utterance);
//       setIsSpeaking(true);
//     }
//   };

//   // Get weather icon component
//   const getWeatherIcon = (condition?: string) => {
//     if (!condition) return CloudIcon;
//     const IconComponent = WeatherIconMap[condition.toLowerCase() as keyof typeof WeatherIconMap];
//     return IconComponent || CloudIcon;
//   };

//   // Format timestamp
//   const formatTime = (date: Date) => {
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   // Render weather visualization
//   const renderWeatherVisualization = (data?: Message['weatherData']) => {
//     if (!data || data.visualType === 'default') return null;

//     switch (data.visualType) {
//       case 'forecast':
//         return (
//           <div className="mt-3 p-4 bg-gradient-to-br from-blue-900/40 to-purple-900/30 rounded-xl border border-blue-700/30">
//             <div className="flex items-center mb-3">
//               <CalendarDaysIcon className="h-5 w-5 text-blue-400 mr-2" />
//               <span className="text-blue-300 font-medium">7-Day Forecast</span>
//             </div>
//             <div className="grid grid-cols-3 gap-2">
//               {weatherData?.daily?.slice(0, 3).map((day, index) => (
//                 <div key={index} className="text-center p-2 bg-blue-900/30 rounded-lg">
//                   <div className="text-xs text-blue-300">{index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : day.day.slice(0, 3)}</div>
//                   <div className="text-sm font-semibold text-white">{day.tempMax}°/{day.tempMin}°</div>
//                   <div className="text-xs text-blue-400">{day.precipitationChance}% rain</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );

//       case 'route':
//         return (
//           <div className="mt-3 p-4 bg-gradient-to-br from-green-900/40 to-teal-900/30 rounded-xl border border-green-700/30">
//             <div className="flex items-center mb-3">
//               <TruckIcon className="h-5 w-5 text-green-400 mr-2" />
//               <span className="text-green-300 font-medium">Route Weather Analysis</span>
//             </div>
//             {data.routeInfo && (
//               <div className="space-y-2">
//                 <div className="flex justify-between items-center">
//                   <span className="text-green-300">{data.routeInfo.from}</span>
//                   <span className="text-green-400">→</span>
//                   <span className="text-green-300">{data.routeInfo.to}</span>
//                 </div>
//                 <div className="text-sm text-green-400 bg-green-900/30 p-2 rounded">
//                   {data.routeInfo.recommendation}
//                 </div>
//               </div>
//             )}
//           </div>
//         );

//       case 'chart':
//         return (
//           <div className="mt-3 p-4 bg-gradient-to-br from-purple-900/40 to-pink-900/30 rounded-xl border border-purple-700/30">
//             <div className="flex items-center justify-center h-20">
//               <div className="text-center">
//                 <ChartBarIcon className="h-8 w-8 text-purple-400 mx-auto mb-2" />
//                 <span className="text-purple-300 text-sm">View detailed charts in Analytics section</span>
//               </div>
//             </div>
//           </div>
//         );

//       case 'alert':
//         return (
//           <div className="mt-3 p-4 bg-gradient-to-br from-red-900/40 to-orange-900/30 rounded-xl border border-red-700/30">
//             <div className="flex items-center mb-2">
//               <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
//               <span className="text-red-300 font-medium">Weather Alert</span>
//             </div>
//             <div className="text-sm text-red-200">
//               Monitor conditions closely and check for updates before traveling.
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className={`flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-700 ${className}`}>
//       {/* Header */}
//       <div className="flex items-center justify-between p-4 border-b border-slate-700">
//         <div className="flex items-center space-x-3">
//           <div className="bg-blue-600 p-2 rounded-lg">
//             <SparklesIcon className="h-5 w-5 text-white" />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-white">AI Weather Assistant</h3>
//             <p className="text-slate-400 text-sm">Powered by Gemini AI • {currentLocation}</p>
//           </div>
//         </div>
        
//         <div className="flex items-center space-x-2">
//           <div className={`w-2 h-2 rounded-full ${weatherData ? 'bg-green-400' : 'bg-red-400'}`}></div>
//           <span className="text-xs text-slate-400">
//             {weatherData ? 'Connected' : 'Offline'}
//           </span>
//         </div>
//       </div>

//       {/* Chat Messages */}
//       <div
//         ref={chatContainerRef}
//         className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
//       >
//         {messages.map((message) => (
//           <div
//             key={message.id}
//             className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
//           >
//             <div
//               className={`max-w-3/4 p-4 rounded-2xl ${
//                 message.role === 'user'
//                   ? 'bg-blue-600 text-white rounded-br-none'
//                   : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
//               } ${message.isTyping ? 'animate-pulse' : ''}`}
//             >
//               {/* Message header for assistant */}
//               {message.role === 'assistant' && (
//                 <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-600">
//                   <div className="flex items-center space-x-2">
//                     <SparklesIcon className="h-4 w-4 text-blue-400" />
//                     <span className="text-xs font-medium text-blue-400">AI Assistant</span>
//                   </div>
//                   <div className="flex items-center space-x-1">
//                     <button
//                       onClick={() => toggleSpeechOutput(message.content)}
//                       className="p-1 hover:bg-slate-700 rounded transition-colors"
//                       title={isSpeaking ? "Stop" : "Read aloud"}
//                     >
//                       {isSpeaking ? (
//                         <SpeakerXMarkIcon className="h-4 w-4 text-red-400" />
//                       ) : (
//                         <SpeakerWaveIcon className="h-4 w-4 text-slate-400" />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Message content */}
//               <div className="whitespace-pre-line text-sm leading-relaxed">
//                 {message.content}
//               </div>

//               {/* Weather data display */}
//               {message.weatherData && (
//                 <div className="mt-3 flex flex-wrap gap-2">
//                   {message.weatherData.temperature && (
//                     <div className="inline-flex items-center px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">
//                       <SunIcon className="h-3 w-3 mr-1" />
//                       {message.weatherData.temperature}°C
//                     </div>
//                   )}
//                   {message.weatherData.condition && (
//                     <div className="inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs capitalize">
//                       {React.createElement(getWeatherIcon(message.weatherData.condition), { className: "h-3 w-3 mr-1" })}
//                       {message.weatherData.condition}
//                     </div>
//                   )}
//                   {message.weatherData.precipitation !== undefined && (
//                     <div className="inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
//                       <CloudIcon className="h-3 w-3 mr-1" />
//                       {message.weatherData.precipitation}% rain
//                     </div>
//                   )}
//                   {message.weatherData.wind && (
//                     <div className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
//                       <FlagIcon className="h-3 w-3 mr-1" />
//                       {message.weatherData.wind} km/h
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Weather visualization */}
//               {renderWeatherVisualization(message.weatherData)}

//               {/* Suggestions */}
//               {message.suggestions && message.suggestions.length > 0 && (
//                 <div className="mt-3 pt-3 border-t border-slate-600">
//                   <div className="text-xs text-slate-400 mb-2">Suggestions:</div>
//                   <div className="flex flex-wrap gap-2">
//                     {message.suggestions.map((suggestion, index) => (
//                       <button
//                         key={index}
//                         onClick={() => handleSuggestionClick(suggestion)}
//                         disabled={isLoading}
//                         className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-full transition-colors disabled:opacity-50"
//                       >
//                         {suggestion}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Timestamp */}
//               <div className="mt-2 text-xs text-slate-500">
//                 {formatTime(message.timestamp)}
//               </div>
//             </div>
//           </div>
//         ))}

//         {/* Speech recognition indicator */}
//         {isListening && (
//           <div className="flex justify-center">
//             <div className="bg-red-600/90 text-white px-4 py-2 rounded-full flex items-center space-x-2 animate-pulse">
//               <MicrophoneIcon className="h-4 w-4" />
//               <span className="text-sm">Listening...</span>
//               <button onClick={toggleSpeechInput} className="p-1 hover:bg-red-700 rounded">
//                 <XMarkIcon className="h-3 w-3" />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Input Area */}
//       <div className="p-4 border-t border-slate-700">
//         <div className="flex items-center space-x-3">
//           {/* Voice input button */}
//           <button
//             onClick={toggleSpeechInput}
//             disabled={isLoading}
//             className={`p-3 rounded-full transition-colors ${
//               isListening
//                 ? 'bg-red-600 text-white'
//                 : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
//             } disabled:opacity-50`}
//           >
//             <MicrophoneIcon className="h-5 w-5" />
//           </button>

//           {/* Text input */}
//           <div className="flex-1 relative">
//             <input
//               type="text"
//               value={isListening ? 'Listening...' : inputMessage}
//               onChange={(e) => setInputMessage(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//               placeholder="Ask about weather conditions, forecasts, or travel impact..."
//               disabled={isLoading || isListening}
//               className="w-full bg-slate-800 border border-slate-600 rounded-full px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
//             />
//             <button
//               onClick={() => handleSendMessage()}
//               disabled={isLoading || !inputMessage.trim() || isListening}
//               className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-full transition-colors disabled:opacity-50"
//             >
//               {isLoading ? (
//                 <ArrowPathIcon className="h-4 w-4 text-white animate-spin" />
//               ) : (
//                 <PaperAirplaneIcon className="h-4 w-4 text-white" />
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Quick suggestions */}
//         {!isLoading && messages.length > 1 && (
//           <div className="mt-3 flex flex-wrap gap-2">
//             {[
//               "Current weather",
//               "Tomorrow's forecast",
//               "Travel recommendations",
//               "Weather alerts",
//               "Route conditions",
//             ].map((suggestion) => (
//               <button
//                 key={suggestion}
//                 onClick={() => handleSuggestionClick(suggestion)}
//                 className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-full transition-colors"
//               >
//                 {suggestion}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* Status info */}
//         <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
//           <span>Powered by Gemini AI</span>
//           <span className="flex items-center space-x-1">
//             <div className={`w-1.5 h-1.5 rounded-full ${weatherData ? 'bg-green-400' : 'bg-red-400'}`}></div>
//             <span>Weather data {weatherData ? 'connected' : 'unavailable'}</span>
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WeatherChatbot;
