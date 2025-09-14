"use client";
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  MapIcon, 
  ClockIcon, 
  CreditCardIcon, 
  ChatBubbleLeftIcon,
  UserGroupIcon,
  TruckIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from './hooks/useTranslation';

// Lazy load language switcher as it's not critical for initial render
const LanguageSwitcher = dynamic(() => import('./components/LanguageSwitcher'), {
  ssr: false,
  loading: () => <div style={{ width: '100px', height: '36px' }} />
});

export default function LandingPage() {
  const { t, loading } = useTranslation();

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }

  const features = [
    {
      icon: MapIcon,
      title: t('features.items.0.title', 'Real-time Tracking'),
      description: t('features.items.0.description', 'Track your bus live on the map with accurate ETAs and route updates.'),
      color: "#10B981"
    },
    {
      icon: CreditCardIcon,
      title: t('features.items.1.title', 'Easy Booking'),
      description: t('features.items.1.description', 'Book tickets instantly with secure payment options and digital receipts.'),
      color: "#3B82F6"
    },
    {
      icon: ClockIcon,
      title: t('features.items.2.title', 'Smart Scheduling'),
      description: t('features.items.2.description', 'AI-powered arrival predictions and optimized route planning.'),
      color: "#F59E0B"
    },
    {
      icon: ChatBubbleLeftIcon,
      title: t('features.items.3.title', '24/7 Support'),
      description: t('features.items.3.description', 'Get instant help with our AI chatbot and dedicated support team.'),
      color: "#8B5CF6"
    }
  ];

  const testimonials = [
    {
      name: t('testimonials.items.0.name', 'Sunil Perera'),
      role: t('testimonials.items.0.role', 'Daily Commuter'),
      rating: 5,
      comment: t('testimonials.items.0.comment', 'Sri Express has made my daily commute so much easier.')
    },
    {
      name: t('testimonials.items.1.name', 'Priya Wickramasinghe'),
      role: t('testimonials.items.1.role', 'University Student'),
      rating: 5,
      comment: t('testimonials.items.1.comment', 'The app is amazing! I can plan my trips perfectly and never miss a bus.')
    },
    {
      name: t('testimonials.items.2.name', 'Raj Gunawardhana'),
      role: t('testimonials.items.2.role', 'Business Executive'),
      rating: 4,
      comment: t('testimonials.items.2.comment', 'Great service for business travel. Professional, reliable, and always on time.')
    }
  ];

  return (
    <div className="landing-page">
      {/* Complete animated background */}
      <div className="animated-background">
        {/* Main Road */}
        <div className="main-road"></div>
        <div className="road-markings">
          <div className="road-center-line"></div>
        </div>
        
        <div className="road-marking-container">
          <div className="road-marking-top">
            <div className="animate-road-marking road-marking-piece road-marking-piece-1"></div>
            <div className="animate-road-marking animation-delay-200 road-marking-piece road-marking-piece-2"></div>
            <div className="animate-road-marking animation-delay-500 road-marking-piece road-marking-piece-3"></div>
            <div className="animate-road-marking animation-delay-700 road-marking-piece road-marking-piece-4"></div>
          </div>
          
          <div className="road-marking-bottom">
            <div className="animate-road-marking animation-delay-300 road-marking-piece road-marking-piece-5"></div>
            <div className="animate-road-marking animation-delay-400 road-marking-piece road-marking-piece-6"></div>
            <div className="animate-road-marking animation-delay-600 road-marking-piece road-marking-piece-7"></div>
            <div className="animate-road-marking animation-delay-800 road-marking-piece road-marking-piece-8"></div>
          </div>
        </div>

        {/* Enhanced 3-Wheeler Tuk-Tuk - Secondary Road */}
        <div className="animate-car-right animation-delay-1500 enhanced-tuktuk">
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div style={{ 
              position: 'absolute', 
              bottom: '20px', 
              left: '10px', 
              width: '50px', 
              height: '22px', 
              background: 'linear-gradient(to bottom, #0ea5e9 0%, #0284c7 100%)', 
              borderRadius: '10px 10px 0 0'
            }}></div>
            <div className="animate-wheels" style={{ 
              position: 'absolute', 
              bottom: '0', 
              right: '10px', 
              width: '14px', 
              height: '14px', 
              backgroundColor: '#0f172a', 
              borderRadius: '50%',
              border: '3px solid #94a3b8',
              boxSizing: 'border-box'
            }}></div>
          </div>
        </div>

        {/* Enhanced Motorcycle - Main Road */}
        <div className="animate-car-left animation-delay-1200 enhanced-motorcycle">
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div style={{ 
              position: 'absolute', 
              bottom: '10px', 
              left: '20px', 
              width: '40px', 
              height: '4px', 
              background: 'linear-gradient(to bottom, #4b5563 0%, #374151 100%)', 
              borderRadius: '2px',
              transform: 'rotate(5deg)',
              boxShadow: '0 2px 3px rgba(0, 0, 0, 0.3)'
            }}></div>
            
            <div className="animate-wheels" style={{ 
              position: 'absolute', 
              bottom: '-7px', 
              right: '15px', 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#0f172a', 
              borderRadius: '50%',
              border: '3px solid #94a3b8',
              boxSizing: 'border-box'
            }}></div>
            
            <div className="animate-wheels" style={{ 
              position: 'absolute', 
              bottom: '0', 
              left: '15px', 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#0f172a', 
              borderRadius: '50%',
              border: '3px solid #94a3b8',
              boxSizing: 'border-box'
            }}></div>
          </div>
        </div>

        {/* Secondary Road */}
        <div className="secondary-road"></div>
        <div className="secondary-road-markings">
          <div className="secondary-road-center-line"></div>
        </div>
        
        <div className="secondary-road-marking-container">
          <div className="secondary-road-marking-top">
            <div className="animate-road-marking animation-delay-300 secondary-road-marking-piece secondary-road-marking-piece-1"></div>
            <div className="animate-road-marking animation-delay-500 secondary-road-marking-piece secondary-road-marking-piece-2"></div>
            <div className="animate-road-marking animation-delay-700 secondary-road-marking-piece secondary-road-marking-piece-3"></div>
          </div>
          
          <div className="secondary-road-marking-bottom">
            <div className="animate-road-marking animation-delay-200 secondary-road-marking-piece secondary-road-marking-piece-4"></div>
            <div className="animate-road-marking animation-delay-400 secondary-road-marking-piece secondary-road-marking-piece-5"></div>
            <div className="animate-road-marking animation-delay-600 secondary-road-marking-piece secondary-road-marking-piece-6"></div>
          </div>
        </div>
        
        {/* Enhanced Railway */}
        <div className="railway"></div>
        <div className="railway-tracks-container">
          <div className="railway-track-top"></div>
          <div className="railway-track-bottom"></div>
          
          <div className="railway-ties-container">
            {Array(30).fill(0).map((_, i) => (
              <div key={i} className="railway-tie" style={{ marginLeft: `${i * 30}px` }}></div>
            ))}
          </div>
          
          <div className="railway-texture"></div>
        </div>

        {/* Enhanced Train on Railway - HIGH Z-INDEX */}
        <div className="animate-slight-bounce enhanced-train">
          <div className="train-container">
            <div className="train-engine">
              <div className="train-engine-body"></div>
              <div className="train-cabin"></div>
              <div className="train-roof"></div>
              <div className="train-front"></div>
              <div className="train-buffer"></div>
              
              <div className="train-sign">දුම්රිය සේවය</div>
              
              <div className="train-chimney">
                <div className="train-chimney-top"></div>
                <div className="animate-steam train-steam-1"></div>
                <div className="animate-steam animation-delay-200 train-steam-2"></div>
                <div className="animate-steam animation-delay-400 train-steam-3"></div>
              </div>
              
              <div className="animate-wheels train-wheel train-wheel-1">
                <div className="train-wheel-inner"></div>
                <div className="train-wheel-spoke-h"></div>
                <div className="train-wheel-spoke-v"></div>
              </div>
              
              <div className="animate-wheels train-wheel train-wheel-2">
                <div className="train-wheel-inner"></div>
                <div className="train-wheel-spoke-h"></div>
                <div className="train-wheel-spoke-v"></div>
              </div>
              
              <div className="animate-wheels train-wheel train-wheel-3">
                <div className="train-wheel-inner"></div>
                <div className="train-wheel-spoke-h"></div>
                <div className="train-wheel-spoke-v"></div>
              </div>
            </div>
            
            {/* Train Carriage 1 */}
            <div className="train-carriage train-carriage-1">
              <div className="train-carriage-body train-carriage-body-red">
                <div style={{ 
                  position: 'absolute', 
                  top: '18px', 
                  left: '0', 
                  width: '100%', 
                  height: '3px', 
                  backgroundColor: '#fbbf24', 
                  opacity: 0.8
                }}></div>
              </div>
              
              <div className="train-carriage-roof"></div>
              <div className="train-carriage-window train-carriage-window-1"></div>
              <div className="train-carriage-window train-carriage-window-2"></div>
              <div className="train-carriage-window train-carriage-window-3"></div>
              
              <div className="animate-light-blink animation-delay-500 train-carriage-light"></div>
              
              <div className="animate-wheels train-carriage-wheel train-carriage-wheel-1">
                <div className="train-wheel-inner"></div>
                <div className="train-wheel-spoke-h"></div>
                <div className="train-wheel-spoke-v"></div>
              </div>
              
              <div className="animate-wheels train-carriage-wheel train-carriage-wheel-2">
                <div className="train-wheel-inner"></div>
                <div className="train-wheel-spoke-h"></div>
                <div className="train-wheel-spoke-v"></div>
              </div>
              
              <div className="train-carriage-coupling train-carriage-coupling-left"></div>
            </div>
            
            {/* Train Carriage 2 */}
            <div className="train-carriage train-carriage-2">
              <div className="train-carriage-body train-carriage-body-purple">
                <div style={{ 
                  position: 'absolute', 
                  top: '18px', 
                  left: '0', 
                  width: '100%', 
                  height: '3px', 
                  backgroundColor: '#fbbf24', 
                  opacity: 0.8
                }}></div>
              </div>
              
              <div className="train-carriage-roof"></div>
              <div className="train-carriage-window train-carriage-window-1"></div>
              <div className="train-carriage-window train-carriage-window-2"></div>
              <div className="train-carriage-window train-carriage-window-3"></div>
              
              <div className="animate-light-blink animation-delay-500 train-carriage-rear-light"></div>
              
              <div className="animate-wheels train-carriage-wheel train-carriage-wheel-1">
                <div className="train-wheel-inner"></div>
                <div className="train-wheel-spoke-h"></div>
                <div className="train-wheel-spoke-v"></div>
              </div>
              
              <div className="animate-wheels train-carriage-wheel train-carriage-wheel-2">
                <div className="train-wheel-inner"></div>
                <div className="train-wheel-spoke-h"></div>
                <div className="train-wheel-spoke-v"></div>
              </div>
              
              <div className="train-carriage-coupling train-carriage-coupling-left"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Yellow Public Bus - Main Road - HIGH Z-INDEX */}
        <div className="animate-car-right animation-delay-1000 enhanced-bus">
          <div className="bus-container">
            <div className="bus-body"></div>
            <div className="bus-hood"></div>
            
            <div className="bus-door">
              <div className="bus-door-glass">
                <div className="bus-door-handle"></div>
                <div className="bus-door-line-1"></div>
                <div className="bus-door-line-2"></div>
              </div>
            </div>
            
            <div className="bus-windows">
              <div className="bus-windows-flex">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`bus-window ${i < 4 ? 'bus-window-border' : ''}`}>
                    {i % 2 === 0 && <div className="bus-passenger"></div>}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bus-roof"></div>
            
            <div className="bus-destination">
              <div className="bus-destination-text">කොළඹ</div>
            </div>
            
            <div className="bus-headlight">
              <div className="bus-headlight-glow"></div>
            </div>
            
            <div className="bus-light-beam"></div>
            
            <div className="animate-light-blink animation-delay-300 bus-turn-signal"></div>
            <div className="animate-light-blink animation-delay-700 bus-rear-light"></div>
            
            <div className="bus-logo">
              <div className="bus-logo-text">
                <div>ශ්‍රී</div>
                <div className="bus-logo-line-2">EXPRESS</div>
              </div>
            </div>
            
            <div className="animate-wheels bus-wheel bus-wheel-front">
              <div className="bus-wheel-inner"></div>
            </div>
            <div className="animate-wheels bus-wheel bus-wheel-middle">
              <div className="bus-wheel-inner"></div>
            </div>
            <div className="animate-wheels bus-wheel bus-wheel-rear">
              <div className="bus-wheel-inner"></div>
            </div>
            
            <div className="bus-wheel-arch bus-wheel-arch-front"></div>
            <div className="bus-wheel-arch bus-wheel-arch-middle"></div>
            <div className="bus-wheel-arch bus-wheel-arch-rear"></div>
            
            <div className="bus-license-plate">
              <div className="bus-license-text">NA-5432</div>
            </div>
            
            <div className="bus-roof-rack">
              <div className="bus-luggage-1"></div>
              <div className="bus-luggage-2"></div>
              <div className="bus-luggage-3"></div>
            </div>
            
            <div className="bus-wiper"></div>
            
            <div className="bus-driver">
              <div className="bus-driver-eye-1"></div>
              <div className="bus-driver-eye-2"></div>
            </div>
            
            <div className="bus-exhaust-pipe"></div>
            <div className="bus-exhaust-smoke-1"></div>
            <div className="bus-exhaust-smoke-2"></div>
            <div className="bus-exhaust-smoke-3"></div>
          </div>
        </div>

        {/* Enhanced Minibus */}
        <div className="animate-car-left animation-delay-2000 enhanced-minibus">
          <div className="minibus-container">
            <div className="minibus-body"></div>
            <div className="minibus-hood"></div>
            
            <div className="minibus-windows">
              <div className="minibus-windows-flex">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`minibus-window ${i < 3 ? 'minibus-window-border' : ''}`}>
                    {(i === 0 || i === 2) && <div className="minibus-passenger"></div>}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="minibus-windshield">
              <div className="minibus-windshield-reflection"></div>
            </div>
            
            <div className="minibus-driver">
              <div className="minibus-driver-eye-1"></div>
              <div className="minibus-driver-eye-2"></div>
            </div>
            
            <div className="minibus-door">
              <div className="minibus-door-handle"></div>
              <div className="minibus-door-line-1"></div>
              <div className="minibus-door-line-2"></div>
            </div>
            
            <div className="minibus-route-display">
              <div className="minibus-route-text">154</div>
            </div>
            
            <div className="animate-wheels minibus-wheel minibus-wheel-front">
              <div className="minibus-wheel-inner"></div>
            </div>
            <div className="animate-wheels minibus-wheel minibus-wheel-rear">
              <div className="minibus-wheel-inner"></div>
            </div>
            
            <div className="minibus-wheel-arch minibus-wheel-arch-front"></div>
            <div className="minibus-wheel-arch minibus-wheel-arch-rear"></div>
            
            <div className="minibus-headlight">
              <div className="minibus-headlight-glow"></div>
            </div>
            
            <div className="minibus-light-beam"></div>
            
            <div className="animate-light-blink animation-delay-400 minibus-turn-signal"></div>
            <div className="animate-light-blink animation-delay-500 minibus-tail-light"></div>
            
            <div className="minibus-license-plate">
              <div className="minibus-license-text">NC-3214</div>
            </div>
            
            <div className="minibus-company-logo">
              <div className="minibus-company-text">බස් සේවා</div>
            </div>
            
            <div className="minibus-roof-rack">
              <div className="minibus-luggage-1"></div>
              <div className="minibus-luggage-2"></div>
            </div>
            
            <div className="minibus-exhaust-pipe"></div>
            <div className="minibus-exhaust-smoke-1"></div>
            <div className="minibus-exhaust-smoke-2"></div>
          </div>
        </div>

        {/* Vertical Roads */}
        <div className="vertical-road-left"></div>
        <div className="vertical-road-right"></div>

        {/* Traffic Lights */}
        <div className="traffic-light traffic-light-1">
          <div className="traffic-light-red"></div>
          <div className="traffic-light-yellow"></div>
          <div className="traffic-light-green"></div>
        </div>

        <div className="traffic-light traffic-light-2">
          <div className="traffic-light-red-small"></div>
          <div className="traffic-light-yellow-small"></div>
          <div className="traffic-light-green-small"></div>
        </div>

        {/* Pedestrian Crossings */}
        <div className="pedestrian-crossing pedestrian-crossing-1">
          <div className="crossing-stripe"></div>
          <div className="crossing-stripe"></div>
          <div className="crossing-stripe"></div>
          <div className="crossing-stripe"></div>
        </div>

        <div className="pedestrian-crossing pedestrian-crossing-2">
          <div className="crossing-stripe-small"></div>
          <div className="crossing-stripe-small"></div>
          <div className="crossing-stripe-small"></div>
          <div className="crossing-stripe-small"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="navigation">
        <div className="nav-container">
          <div className="nav-logo">
            <div className="nav-sinhala">{t('nav.logo.sinhala', 'ශ්‍රී')}</div>
            <div className="nav-english">{t('nav.logo.english', 'Express')}</div>
          </div>
          
          <div className="nav-links">
            <a href="#home" className="nav-link">{t('nav.home', 'Home')}</a>
            <a href="#features" className="nav-link-secondary">{t('nav.features', 'Features')}</a>
            <a href="#services" className="nav-link-secondary">{t('nav.services', 'Services')}</a>
            <Link href="/contact" className="nav-link-secondary">{t('nav.contact', 'Contact')}</Link>
            <LanguageSwitcher />
            <Link href="/login" className="nav-button button-hover">{t('nav.login', 'Login')}</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section section" aria-labelledby="hero-title">
        <div className="container">
          <div className="animate-fade-in-down">
            <h1 id="hero-title" className="hero-title">
              <span className="hero-title-sinhala">{t('hero.title.sinhala', 'ශ්‍රී')}</span> {t('hero.title.english', 'Express')}
              <br />
              <span className="hero-subtitle-line">{t('hero.title.subtitle', 'Transportation Management')}</span>
            </h1>
          </div>
          
          <div className="animate-fade-in-up animation-delay-300">
            <p className="hero-subtitle">
              {t('hero.description', 'Experience the future of public transportation in Sri Lanka. Real-time tracking, smart booking, and AI-powered journey planning.')}
            </p>
          </div>
          
          <div className="animate-fade-in-up animation-delay-500">
            <div className="hero-buttons">
              <Link href="/register" className="hero-button-primary button-hover" rel="prefetch">
                {t('hero.buttons.getStarted', 'Get Started')}
                <ArrowRightIcon width={20} height={20} aria-hidden="true" />
              </Link>
              <Link href="/login" className="hero-button-secondary" rel="prefetch">
                {t('hero.buttons.signIn', 'Sign In')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding section-white" aria-labelledby="features-title">
        <div className="container">
          <div className="section-header">
            <h2 id="features-title" className="section-title">{t('features.title', 'Why Choose Sri Express?')}</h2>
            <p className="section-subtitle">
              {t('features.subtitle', 'Advanced technology meets reliable transportation for a seamless travel experience.')}
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="feature-icon" style={{ backgroundColor: feature.color, boxShadow: `0 10px 20px ${feature.color}40` }}>
                  <feature.icon width={40} height={40} color="white" />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section-padding section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title section-title-white">{t('services.title', 'Our Services')}</h2>
            <p className="section-subtitle section-subtitle-box">
              {t('services.subtitle', 'Comprehensive transportation solutions for every need')}
            </p>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-header">
                <TruckIcon width={32} height={32} color="#F59E0B" />
                <h3 className="service-title">{t('services.publicTransport.title', 'Public Transport')}</h3>
              </div>
              <p className="service-description">
                {t('services.publicTransport.description', 'Reliable city-wide bus services with real-time tracking and digital ticketing.')}
              </p>
              <ul className="service-features">
                {t('services.publicTransport.features', ['Real-time GPS tracking', 'Digital payment options', 'Route optimization', 'Accessibility features']).map((item: string, i: number) => (
                  <li key={i} className="service-feature">
                    <CheckCircleIcon width={16} height={16} color="#10B981" className="service-feature-icon" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="service-card">
              <div className="service-header">
                <UserGroupIcon width={32} height={32} color="#3B82F6" />
                <h3 className="service-title">{t('services.fleetManagement.title', 'Private Fleet Management')}</h3>
              </div>
              <p className="service-description">
                {t('services.fleetManagement.description', 'Complete fleet management solutions for schools, offices, and private companies.')}
              </p>
              <ul className="service-features">
                {t('services.fleetManagement.features', ['Fleet monitoring', 'Driver management', 'Maintenance scheduling', 'Cost analytics']).map((item: string, i: number) => (
                  <li key={i} className="service-feature">
                    <CheckCircleIcon width={16} height={16} color="#10B981" className="service-feature-icon" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding section-white">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('testimonials.title', 'What Our Users Say')}</h2>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      width={20}
                      height={20}
                      color={i < testimonial.rating ? "#F59E0B" : "#E5E7EB"}
                      fill={i < testimonial.rating ? "#F59E0B" : "#E5E7EB"}
                    />
                  ))}
                </div>
                <p className="testimonial-comment">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>
                <div>
                  <div className="testimonial-name">{testimonial.name}</div>
                  <div className="testimonial-role">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding section">
        <div className="container-small">
          <h2 className="contact-section-title">{t('contact.title', 'Get in Touch')}</h2>
          
          <div className="contact-card">
            <div className="contact-grid">
              <div className="contact-item">
                <PhoneIcon width={32} height={32} color="#F59E0B" className="contact-icon" />
                <div className="contact-label">{t('contact.phone', 'Phone')}</div>
                <div className="contact-value">{t('contact.values.phone', '+94 11 234 5678')}</div>
              </div>
              <div className="contact-item">
                <EnvelopeIcon width={32} height={32} color="#F59E0B" className="contact-icon" />
                <div className="contact-label">{t('contact.email', 'Email')}</div>
                <div className="contact-value">{t('contact.values.email', 'info@sriexpress.lk')}</div>
              </div>
              <div className="contact-item">
                <MapPinIcon width={32} height={32} color="#F59E0B" className="contact-icon" />
                <div className="contact-label">{t('contact.address', 'Address')}</div>
                <div className="contact-value">{t('contact.values.address', 'Colombo, Sri Lanka')}</div>
              </div>
            </div>
            
            <Link href="/register" className="hero-button-primary button-hover" rel="prefetch">
              {t('contact.button', 'Start Your Journey')}
              <ArrowRightIcon width={20} height={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            <div className="footer-logo-sinhala">{t('footer.logo.sinhala', 'ශ්‍රී')}</div>
            <div className="footer-logo-english">{t('footer.logo.english', 'Express')}</div>
          </div>
          
          <div className="footer-grid">
            <div className="footer-section">
              <h4>{t('footer.services.title', 'Services')}</h4>
              <ul>
                <li><Link href="/services" className="footer-link">{t('footer.services.items.0', 'Public Transport')}</Link></li>
                <li><Link href="/services" className="footer-link">{t('footer.services.items.1', 'Fleet Management')}</Link></li>
                <li><Link href="/services" className="footer-link">{t('footer.services.items.2', 'Route Planning')}</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>{t('footer.support.title', 'Support')}</h4>
              <ul>
                <li><Link href="/help" className="footer-link">{t('footer.support.items.0', 'Help Center')}</Link></li>
                <li><Link href="/lost-found" className="footer-link">Lost & Found</Link></li>
                <li><Link href="/contact" className="footer-link">{t('footer.support.items.1', 'Contact Us')}</Link></li>
                <li><Link href="/privacy" className="footer-link">{t('footer.support.items.2', 'Privacy Policy')}</Link></li>
                <li><Link href="/terms" className="footer-link">{t('footer.support.items.3', 'Terms of Service')}</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>{t('footer.company.title', 'Company')}</h4>
              <ul>
                <li><Link href="/about" className="footer-link">{t('footer.company.items.0', 'About Us')}</Link></li>
                <li><a href="#" className="footer-link">{t('footer.company.items.1', 'Careers')}</a></li>
                <li><a href="#" className="footer-link">{t('footer.company.items.2', 'News')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>{t('footer.copyright', '© 2025 Sri Express. All rights reserved. | Transforming transportation in Sri Lanka')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}