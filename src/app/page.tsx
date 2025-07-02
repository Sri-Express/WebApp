
"use client";
// FIX: Removed 'useState' from the import as it was unused.
import Link from 'next/link';
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

export default function LandingPage() {
  // Removed unused useState: const [activeFeature, setActiveFeature] = useState(0);

  // Animation keyframes - same as login page
  const animationStyles = `
    @keyframes road-marking {
      0% { transform: translateX(-200%); }
      100% { transform: translateX(500%); }
    }
    .animate-road-marking {
      animation: road-marking 10s linear infinite;
    }

    @keyframes car-right {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100vw); }
    }
    .animate-car-right {
      animation: car-right 15s linear infinite;
    }

    @keyframes car-left {
      0% { transform: translateX(100vw) scaleX(-1); }
      100% { transform: translateX(-100%) scaleX(-1); }
    }
    .animate-car-left {
      animation: car-left 16s linear infinite;
    }

    @keyframes light-blink {
      0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; }
      50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; }
    }
    .animate-light-blink {
      animation: light-blink 1s infinite;
    }

    @keyframes fade-in-down {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-down {
      animation: fade-in-down 0.8s ease-out forwards;
    }

    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.8s ease-out forwards;
    }
    
    @keyframes trainMove {
      from { left: 100%; }
      to { left: -300px; }
    }
    
    @keyframes slight-bounce {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-1px); }
    }
    .animate-slight-bounce {
      animation: slight-bounce 2s ease-in-out infinite;
    }
    
    @keyframes steam {
      0% { opacity: 0.8; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-20px) scale(2.5); }
    }
    .animate-steam {
      animation: steam 2s ease-out infinite;
    }
    
    @keyframes wheels {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(-360deg); }
    }
    .animate-wheels {
      animation: wheels 2s linear infinite;
    }
    
    @keyframes connecting-rod {
      0% { transform: translateX(-1px) rotate(0deg); }
      50% { transform: translateX(1px) rotate(180deg); }
      100% { transform: translateX(-1px) rotate(360deg); }
    }
    .animate-connecting-rod {
      animation: connecting-rod 2s linear infinite;
    }
    
    @keyframes piston-move {
      0% { transform: translateX(-2px); }
      50% { transform: translateX(2px); }
      100% { transform: translateX(-2px); }
    }
    .animate-piston {
      animation: piston-move 2s linear infinite;
    }
    
    /* Animation delay utilities */
    .animation-delay-100 { animation-delay: 0.1s; }
    .animation-delay-200 { animation-delay: 0.2s; }
    .animation-delay-300 { animation-delay: 0.3s; }
    .animation-delay-400 { animation-delay: 0.4s; }
    .animation-delay-500 { animation-delay: 0.5s; }
    .animation-delay-600 { animation-delay: 0.6s; }
    .animation-delay-700 { animation-delay: 0.7s; }
    .animation-delay-800 { animation-delay: 0.8s; }
    .animation-delay-1000 { animation-delay: 1s; }
    .animation-delay-1200 { animation-delay: 1.2s; }
    .animation-delay-1500 { animation-delay: 1.5s; }
    .animation-delay-2000 { animation-delay: 2s; }
    .animation-delay-2500 { animation-delay: 2.5s; } 
    .animation-delay-3000 { animation-delay: 3s; }
    
    /* Button hover effects */
    @keyframes button-pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }
    .button-hover:hover {
      animation: button-pulse 1s infinite;
      background-color: #E9A200 !important; 
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4) !important;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    @keyframes scroll-fade {
      0% { opacity: 0; transform: translateY(30px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .scroll-fade {
      animation: scroll-fade 0.8s ease-out forwards;
    }

    /* Responsive adjustments */
    @media (max-width: 380px) {
      .hero-title {
        font-size: 2.5rem !important;
      }
      .hero-subtitle {
        font-size: 1rem !important;
      }
      .feature-card {
        padding: 1rem !important;
      }
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 3rem !important;
      }
      .section-padding {
        padding: 2rem 1rem !important;
      }
    }
  `;

  const features = [
    {
      icon: MapIcon,
      title: "Real-time Tracking",
      description: "Track your bus live on the map with accurate ETAs and route updates.",
      color: "#10B981"
    },
    {
      icon: CreditCardIcon,
      title: "Easy Booking",
      description: "Book tickets instantly with secure payment options and digital receipts.",
      color: "#3B82F6"
    },
    {
      icon: ClockIcon,
      title: "Smart Scheduling",
      description: "AI-powered arrival predictions and optimized route planning.",
      color: "#F59E0B"
    },
    {
      icon: ChatBubbleLeftIcon,
      title: "24/7 Support",
      description: "Get instant help with our AI chatbot and dedicated support team.",
      color: "#8B5CF6"
    }
  ];

  const testimonials = [
    {
      name: "සුනිල් පෙරේරා",
      role: "Daily Commuter",
      rating: 5,
      comment: "ශ්‍රී එක්ස්ප්‍රෙස් මගේ දිනපතා ගමන් පහසු කර ගත්තා. සැමවිටම වේලාවට බස් එකේ තියෙන තැන දන්න පුළුවන්."
    },
    {
      name: "Priya Wickramasinghe",
      role: "University Student",
      rating: 5,
      comment: "The app is amazing! I can plan my trips perfectly and never miss a bus. The real-time tracking is so accurate."
    },
    {
      name: "රාජ් ගුණවර්ධන",
      role: "Business Executive",
      rating: 4,
      comment: "Great service for business travel. Professional, reliable, and always on time. Highly recommend!"
    }
  ];

  return (
    <div
      style={{
        backgroundColor: '#fffbeb',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <style jsx>{animationStyles}</style>
      
      {/* Complete animated background - EXACTLY same as login page */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)'
      }}>
        {/* Main Road */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: 0,
          right: 0,
          height: '100px',
          backgroundColor: '#1f2937',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          zIndex: 2
        }}></div>
        
        <div style={{
          position: 'absolute',
          top: '15%',
          left: 0,
          right: 0,
          height: '100px',
          zIndex: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            width: '100%',
            height: '5px',
            background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 30px, transparent 30px, transparent 60px)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
          }}></div>
        </div>
        
        <div style={{
          position: 'absolute',
          top: '15%',
          left: 0,
          right: 0,
          height: '100px',
          overflow: 'hidden',
          zIndex: 3
        }}>
          <div style={{
            position: 'absolute',
            top: '25%',
            left: 0,
            right: 0,
            height: '8px',
            display: 'flex',
            transform: 'translateY(-50%)'
          }}>
            <div className="animate-road-marking" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '10%' }}></div>
            <div className="animate-road-marking animation-delay-200" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '30%' }}></div>
            <div className="animate-road-marking animation-delay-500" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '50%' }}></div>
            <div className="animate-road-marking animation-delay-700" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '70%' }}></div>
          </div>
          
          <div style={{
            position: 'absolute',
            top: '75%',
            left: 0,
            right: 0,
            height: '8px',
            display: 'flex',
            transform: 'translateY(-50%)'
          }}>
            <div className="animate-road-marking animation-delay-300" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '20%' }}></div>
            <div className="animate-road-marking animation-delay-400" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '40%' }}></div>
            <div className="animate-road-marking animation-delay-600" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '60%' }}></div>
            <div className="animate-road-marking animation-delay-800" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '80%' }}></div>
          </div>
        </div>

        {/* Secondary Road */}
        <div style={{
          position: 'absolute',
          top: '60%',
          left: 0,
          right: 0,
          height: '80px',
          backgroundColor: '#1f2937',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
          zIndex: 2
        }}></div>
        
        <div style={{
          position: 'absolute',
          top: '60%',
          left: 0,
          right: 0,
          height: '80px',
          zIndex: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            width: '100%',
            height: '4px',
            background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 20px, transparent 20px, transparent 40px)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
          }}></div>
        </div>
        
        <div style={{
          position: 'absolute',
          top: '60%',
          left: 0,
          right: 0,
          height: '80px',
          overflow: 'hidden',
          zIndex: 3
        }}>
          <div style={{
            position: 'absolute',
            top: '25%',
            left: 0,
            right: 0,
            height: '6px',
            display: 'flex',
            transform: 'translateY(-50%)'
          }}>
            <div className="animate-road-marking animation-delay-300" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '15%' }}></div>
            <div className="animate-road-marking animation-delay-500" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '45%' }}></div>
            <div className="animate-road-marking animation-delay-700" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '75%' }}></div>
          </div>
          
          <div style={{
            position: 'absolute',
            top: '75%',
            left: 0,
            right: 0,
            height: '6px',
            display: 'flex',
            transform: 'translateY(-50%)'
          }}>
            <div className="animate-road-marking animation-delay-200" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '25%' }}></div>
            <div className="animate-road-marking animation-delay-400" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '55%' }}></div>
            <div className="animate-road-marking animation-delay-600" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '85%' }}></div>
          </div>
        </div>
        
        {/* Enhanced Railway */}
        <div style={{
          position: 'absolute',
          top: '85%',
          left: 0,
          right: 0,
          height: '50px',
          background: 'linear-gradient(to bottom, #4b5563 0%, #374151 100%)',
          boxShadow: '0 5px 10px -3px rgba(0, 0, 0, 0.3)',
          zIndex: 2
        }}></div>
        
        <div style={{
          position: 'absolute',
          top: '85%',
          left: 0,
          right: 0,
          height: '50px',
          overflow: 'visible',
          zIndex: 3
        }}>
          <div style={{
            position: 'absolute',
            top: '35%',
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            zIndex: 4
          }}></div>
          
          <div style={{
            position: 'absolute',
            top: '65%',
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            zIndex: 4
          }}></div>
          
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            display: 'flex',
            gap: '15px',
            zIndex: 3
          }}>
            {Array(30).fill(0).map((_, i) => (
              <div key={i} style={{
                width: '20px',
                height: '100%',
                background: 'linear-gradient(to bottom, #92400e 0%, #7c2d12 70%, #713f12 100%)',
                marginLeft: `${i * 30}px`,
                boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.5)',
                border: '1px solid #78350f'
              }}></div>
            ))}
          </div>
          
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            backgroundImage: 'radial-gradient(circle, #6b7280 2px, transparent 2px), radial-gradient(circle, #9ca3af 1px, transparent 1px)',
            backgroundSize: '8px 8px, 6px 6px',
            opacity: 0.5,
            zIndex: 2
          }}></div>
        </div>

        {/* Enhanced Train on Railway */}
        <div className="animate-slight-bounce" style={{
          position: 'absolute',
          top: '85%',
          marginTop: '-15px',
          left: '100%', 
          height: '70px',
          width: '300px',
          zIndex: 6,
          pointerEvents: 'none',
          display: 'flex',
          animation: 'trainMove 15s linear infinite',
          filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.2))'
        }}>
          <div style={{
            display: 'flex',
            width: '100%',
            height: '100%'
          }}>
            <div style={{ position: 'relative', width: '110px', height: '60px', marginRight: '5px' }}>
              <div style={{ 
                position: 'absolute', 
                bottom: '12px', 
                left: '8px',
                width: '85%', 
                height: '30px', 
                background: 'linear-gradient(to bottom, #b91c1c 0%, #9f1239 60%, #7f1d1d 100%)', 
                borderRadius: '8px 5px 5px 5px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                border: '1px solid #7f1d1d'
              }}></div>
              
              <div style={{ 
                position: 'absolute', 
                bottom: '42px', 
                right: '10px',
                width: '60px', 
                height: '30px', 
                background: 'linear-gradient(to bottom, #7f1d1d 0%, #681e1e 100%)', 
                borderRadius: '6px 6px 0 0',
                border: '1px solid #601414',
                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)'
              }}></div>
              
              <div style={{ 
                position: 'absolute', 
                bottom: '72px', 
                right: '8px',
                width: '65px', 
                height: '5px', 
                background: '#4c1d95',
                borderRadius: '2px',
                boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)'
              }}></div>
              
              <div style={{ 
                position: 'absolute', 
                bottom: '5px', 
                left: '0', 
                width: '15px', 
                height: '18px',
                background: 'linear-gradient(135deg, #9f1239 0%, #7f1d1d 100%)',
                clipPath: 'polygon(0 0, 100% 0, 100% 35%, 50% 100%, 0 35%)',
                borderRadius: '2px'
              }}></div>
              
              <div style={{ 
                position: 'absolute', 
                bottom: '15px', 
                left: '3px', 
                width: '10px', 
                height: '4px', 
                backgroundColor: '#64748b',
                borderRadius: '1px',
                border: '1px solid #475569'
              }}></div>
              
              <div style={{ 
                position: 'absolute', 
                top: '3px', 
                left: '40px', 
                padding: '3px 5px',
                backgroundColor: '#fef3c7', 
                borderRadius: '3px',
                border: '1px solid #7f1d1d',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                fontSize: '9px',
                fontWeight: 'bold',
                color: '#7f1d1d',
                whiteSpace: 'nowrap',
                fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif",
                zIndex: 10,
                transform: 'rotate(-2deg)'
              }}>
                දුම්රිය සේවය
              </div>
              
              <div style={{ 
                position: 'absolute', 
                bottom: '42px', 
                left: '22px', 
                width: '14px', 
                height: '18px', 
                background: 'linear-gradient(to bottom, #27272a 0%, #18181b 100%)', 
                borderRadius: '4px 4px 0 0',
                border: '1px solid #111',
                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-2px',
                  left: '-2px',
                  width: '16px', 
                  height: '4px', 
                  background: 'linear-gradient(to bottom, #cbd5e1 0%, #94a3b8 100%)', 
                  borderRadius: '4px 4px 0 0',
                  border: '1px solid #64748b'
                }}></div>
                
                <div className="animate-steam" style={{ 
                  position: 'absolute', 
                  top: '-15px', 
                  left: '-2px', 
                  width: '18px', 
                  height: '15px', 
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', 
                  borderRadius: '50%',
                  opacity: 0.9
                }}></div>
                <div className="animate-steam animation-delay-200" style={{ 
                  position: 'absolute', 
                  top: '-12px', 
                  left: '4px', 
                  width: '16px', 
                  height: '14px', 
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', 
                  borderRadius: '50%',
                  opacity: 0.85
                }}></div>
                <div className="animate-steam animation-delay-400" style={{ 
                  position: 'absolute', 
                  top: '-18px', 
                  left: '2px', 
                  width: '20px', 
                  height: '18px', 
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', 
                  borderRadius: '50%',
                  opacity: 0.9
                }}></div>
                <div className="animate-steam animation-delay-600" style={{ 
                  position: 'absolute', 
                  top: '-14px', 
                  left: '-4px', 
                  width: '17px', 
                  height: '15px', 
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', 
                  borderRadius: '50%',
                  opacity: 0.8
                }}></div>
                <div className="animate-steam animation-delay-800" style={{ 
                  position: 'absolute', 
                  top: '-22px', 
                  left: '1px', 
                  width: '22px', 
                  height: '20px', 
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', 
                  borderRadius: '50%',
                  opacity: 0.7
                }}></div>
              </div>
              
              <div style={{ 
                position: 'absolute', 
                bottom: '42px', 
                left: '45px', 
                width: '8px', 
                height: '10px', 
                background: 'linear-gradient(to bottom, #fbbf24 0%, #d97706 100%)', 
                borderRadius: '4px 4px 8px 8px',
                border: '1px solid #b45309'
              }}></div>
              
              <div style={{ 
                position: 'absolute', 
                bottom: '42px', 
                left: '60px', 
                width: '6px', 
                height: '8px', 
                background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', 
                borderRadius: '3px 3px 0 0',
                border: '1px solid #475569'
              }}></div>
              
              <div className="animate-wheels" style={{ 
                position: 'absolute', 
                bottom: '0', 
                left: '15px',
                width: '24px', 
                height: '24px', 
                background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', 
                borderRadius: '50%',
                border: '3px solid #cbd5e1',
                boxSizing: 'border-box',
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '1px', 
                  left: '1px',
                  right: '1px',
                  bottom: '1px',
                  borderRadius: '50%',
                  border: '2px solid #94a3b8'
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(50% - 1px)', 
                  left: '0', 
                  width: '100%', 
                  height: '2px', 
                  backgroundColor: '#cbd5e1' 
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: '0', 
                  left: 'calc(50% - 1px)', 
                  width: '2px', 
                  height: '100%', 
                  backgroundColor: '#cbd5e1' 
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: '0', 
                  left: '0', 
                  width: '100%', 
                  height: '100%', 
                  background: 'conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #cbd5e1 10deg, #cbd5e1 15deg, transparent 15deg, transparent 55deg, #cbd5e1 55deg, #cbd5e1 60deg, transparent 60deg, transparent 100deg, #cbd5e1 100deg, #cbd5e1 105deg, transparent 105deg, transparent 145deg, #cbd5e1 145deg, #cbd5e1 150deg, transparent 150deg, transparent 190deg, #cbd5e1 190deg, #cbd5e1 195deg, transparent 195deg, transparent 235deg, #cbd5e1 235deg, #cbd5e1 240deg, transparent 240deg, transparent 280deg, #cbd5e1 280deg, #cbd5e1 285deg, transparent 285deg, transparent 325deg, #cbd5e1 325deg, #cbd5e1 330deg, transparent 330deg)',
                  borderRadius: '50%'
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(50% - 4px)', 
                  left: 'calc(50% - 4px)', 
                  width: '8px', 
                  height: '8px', 
                  background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', 
                  borderRadius: '50%',
                  border: '1px solid #64748b',
                  boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)'
                }}></div>
              </div>
              
              <div className="animate-wheels" style={{ 
                position: 'absolute', 
                bottom: '0', 
                right: '25px',
                width: '24px', 
                height: '24px', 
                background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', 
                borderRadius: '50%',
                border: '3px solid #cbd5e1',
                boxSizing: 'border-box',
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '1px', 
                  left: '1px',
                  right: '1px',
                  bottom: '1px',
                  borderRadius: '50%',
                  border: '2px solid #94a3b8'
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(50% - 1px)', 
                  left: '0', 
                  width: '100%', 
                  height: '2px', 
                  backgroundColor: '#cbd5e1' 
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: '0', 
                  left: 'calc(50% - 1px)', 
                  width: '2px', 
                  height: '100%', 
                  backgroundColor: '#cbd5e1' 
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: '0', 
                  left: '0', 
                  width: '100%', 
                  height: '100%', 
                  background: 'conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #cbd5e1 10deg, #cbd5e1 15deg, transparent 15deg, transparent 55deg, #cbd5e1 55deg, #cbd5e1 60deg, transparent 60deg, transparent 100deg, #cbd5e1 100deg, #cbd5e1 105deg, transparent 105deg, transparent 145deg, #cbd5e1 145deg, #cbd5e1 150deg, transparent 150deg, transparent 190deg, #cbd5e1 190deg, #cbd5e1 195deg, transparent 195deg, transparent 235deg, #cbd5e1 235deg, #cbd5e1 240deg, transparent 240deg, transparent 280deg, #cbd5e1 280deg, #cbd5e1 285deg, transparent 285deg, transparent 325deg, #cbd5e1 325deg, #cbd5e1 330deg, transparent 330deg)',
                  borderRadius: '50%'
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(50% - 4px)', 
                  left: 'calc(50% - 4px)', 
                  width: '8px', 
                  height: '8px', 
                  background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', 
                  borderRadius: '50%',
                  border: '1px solid #64748b',
                  boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)'
                }}></div>
              </div>
              
              <div className="animate-wheels" style={{ 
                position: 'absolute', 
                bottom: '0', 
                right: '60px',
                width: '24px', 
                height: '24px', 
                background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', 
                borderRadius: '50%',
                border: '3px solid #cbd5e1',
                boxSizing: 'border-box',
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '1px', 
                  left: '1px',
                  right: '1px',
                  bottom: '1px',
                  borderRadius: '50%',
                  border: '2px solid #94a3b8'
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(50% - 1px)', 
                  left: '0', 
                  width: '100%', 
                  height: '2px', 
                  backgroundColor: '#cbd5e1' 
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: '0', 
                  left: 'calc(50% - 1px)', 
                  width: '2px', 
                  height: '100%', 
                  backgroundColor: '#cbd5e1' 
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: '0', 
                  left: '0', 
                  width: '100%', 
                  height: '100%', 
                  background: 'conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #cbd5e1 10deg, #cbd5e1 15deg, transparent 15deg, transparent 55deg, #cbd5e1 55deg, #cbd5e1 60deg, transparent 60deg, transparent 100deg, #cbd5e1 100deg, #cbd5e1 105deg, transparent 105deg, transparent 145deg, #cbd5e1 145deg, #cbd5e1 150deg, transparent 150deg, transparent 190deg, #cbd5e1 190deg, #cbd5e1 195deg, transparent 195deg, transparent 235deg, #cbd5e1 235deg, #cbd5e1 240deg, transparent 240deg, transparent 280deg, #cbd5e1 280deg, #cbd5e1 285deg, transparent 285deg, transparent 325deg, #cbd5e1 325deg, #cbd5e1 330deg, transparent 330deg)',
                  borderRadius: '50%'
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(50% - 4px)', 
                  left: 'calc(50% - 4px)', 
                  width: '8px', 
                  height: '8px', 
                  background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', 
                  borderRadius: '50%',
                  border: '1px solid #64748b',
                  boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)'
                }}></div>
              </div>
              
              <div style={{ 
                position: 'absolute', 
                bottom: '24px', 
                left: '22px',
                width: '30px', 
                height: '8px', 
                backgroundColor: '#64748b',
                borderRadius: '4px',
                border: '1px solid #475569',
                zIndex: 3
              }}>
                <div className="animate-piston" style={{ 
                  position: 'absolute', 
                  top: '2px', 
                  left: '3px',
                  width: '22px', 
                  height: '2px', 
                  backgroundColor: '#94a3b8',
                  borderRadius: '1px'
                }}></div>
              </div>
              
              <div style={{ 
                position: 'absolute', 
                bottom: '47px', 
                right: '15px',
                width: '15px', 
                height: '12px', 
                background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', 
                borderRadius: '2px',
                border: '2px solid #7f1d1d',
                boxShadow: 'inset 0 0 4px rgba(255, 255, 255, 0.5)'
              }}></div>
              <div style={{ 
                position: 'absolute', 
                bottom: '47px', 
                right: '40px',
                width: '15px', 
                height: '12px', 
                background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', 
                borderRadius: '2px',
                border: '2px solid #7f1d1d',
                boxShadow: 'inset 0 0 4px rgba(255, 255, 255, 0.5)'
              }}></div>
              
              <div className="animate-light-blink" style={{ 
                position: 'absolute', 
                bottom: '22px', 
                left: '3px', 
                width: '10px', 
                height: '10px', 
                background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', 
                borderRadius: '50%',
                boxShadow: '0 0 15px #fcd34d, 0 0 5px #fef3c7',
                border: '1px solid #b45309'
              }}></div>
            </div>
            
            <div style={{ 
              position: 'relative',
              width: '90px', 
              height: '40px', 
              marginTop: '15px',
              marginRight: '5px'
            }}>
              <div style={{ 
                position: 'absolute', 
                bottom: '5px', 
                width: '100%', 
                height: '28px', 
                background: 'linear-gradient(to bottom, #dc2626 0%, #be123c 60%, #9f1239 100%)', 
                borderRadius: '4px',
                boxSizing: 'border-box',
                border: '1px solid #881337',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}>
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
              
              <div style={{ 
                position: 'absolute', 
                bottom: '33px', 
                left: '2px', 
                width: '96%', 
                height: '4px', 
                background: 'linear-gradient(to bottom, #7f1d1d 0%, #881337 100%)', 
                borderRadius: '40% 40% 0 0 / 100% 100% 0 0',
                boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)'
              }}></div>
              
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '10px',
                width: '15px',
                height: '10px',
                background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', 
                borderRadius: '2px',
                border: '1px solid #881337',
                boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '35px',
                width: '15px',
                height: '10px',
                background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', 
                borderRadius: '2px',
                border: '1px solid #881337',
                boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '60px',
                width: '15px',
                height: '10px',
                background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', 
                borderRadius: '2px',
                border: '1px solid #881337',
                boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)'
              }}></div>
              
              <div className="animate-wheels" style={{ 
                position: 'absolute', 
                bottom: '0', 
                left: '20px',
                width: '20px', 
                height: '20px', 
                background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', 
                borderRadius: '50%',
                border: '3px solid #cbd5e1',
                boxSizing: 'border-box',
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '1px', 
                  left: '1px',
                  right: '1px',
                  bottom: '1px',
                  borderRadius: '50%',
                  border: '2px solid #94a3b8'
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(50% - 1px)', 
                  left: '0', 
                  width: '100%', 
                  height: '2px', 
                  backgroundColor: '#cbd5e1' 
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: '0', 
                  left: 'calc(50% - 1px)', 
                  width: '2px', 
                  height: '100%', 
                  backgroundColor: '#cbd5e1' 
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(50% - 3px)', 
                  left: 'calc(50% - 3px)', 
                  width: '6px', 
                  height: '6px', 
                  background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', 
                  borderRadius: '50%',
                  border: '1px solid #64748b',
                  boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)'
                }}></div>
              </div>
              
              <div className="animate-wheels" style={{ 
                position: 'absolute', 
                bottom: '0', 
                right: '20px',
                width: '20px', 
                height: '20px', 
                background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', 
                borderRadius: '50%',
                border: '3px solid #cbd5e1',
                boxSizing: 'border-box',
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '1px', 
                  left: '1px',
                  right: '1px',
                  bottom: '1px',
                  borderRadius: '50%',
                  border: '2px solid #94a3b8'
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(50% - 1px)', 
                  left: '0', 
                  width: '100%', 
                  height: '2px', 
                  backgroundColor: '#cbd5e1' 
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: '0', 
                  left: 'calc(50% - 1px)', 
                  width: '2px', 
                  height: '100%', 
                  backgroundColor: '#cbd5e1' 
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(50% - 3px)', 
                  left: 'calc(50% - 3px)', 
                  width: '6px', 
                  height: '6px', 
                  background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', 
                  borderRadius: '50%',
                  border: '1px solid #64748b',
                  boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)'
                }}></div>
              </div>
            </div>
            
            <div style={{ 
              position: 'relative',
              width: '90px', 
              height: '40px', 
              marginTop: '15px'
            }}>
              <div style={{ 
                position: 'absolute', 
                bottom: '5px', 
                width: '100%', 
                height: '28px', 
                background: 'linear-gradient(to bottom, #c026d3 0%, #a21caf 60%, #86198f 100%)', 
                borderRadius: '4px',
                boxSizing: 'border-box',
                border: '1px solid #701a75',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}>
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
              
              <div style={{ 
                position: 'absolute', 
                bottom: '33px', 
                left: '2px', 
                width: '96%', 
                height: '4px', 
                background: 'linear-gradient(to bottom, #701a75 0%, #86198f 100%)', 
                borderRadius: '40% 40% 0 0 / 100% 100% 0 0',
                boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)'
              }}></div>
              
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '10px',
                width: '15px',
                height: '10px',
                background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', 
                borderRadius: '2px',
                border: '1px solid #701a75',
                boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '35px',
                width: '15px',
                height: '10px',
                background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', 
                borderRadius: '2px',
                border: '1px solid #701a75',
                boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '60px',
                width: '15px',
                height: '10px',
                background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', 
                borderRadius: '2px',
                border: '1px solid #701a75',
                boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)'
              }}></div>
              
              <div className="animate-light-blink animation-delay-500" style={{ 
                position: 'absolute', 
                bottom: '15px', 
                right: '3px', 
                width: '6px', 
                height: '6px', 
                background: 'radial-gradient(circle, #fef3c7 0%, #f87171 100%)', 
                borderRadius: '50%',
                boxShadow: '0 0 8px #f87171',
                border: '1px solid #7f1d1d'
              }}></div>
              
              <div className="animate-wheels" style={{ 
                position: 'absolute',
                bottom: '0', 
                left: '20px',
                width: '20px', 
                height: '20px', 
                background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', 
                borderRadius: '50%',
                border: '3px solid #cbd5e1',
                boxSizing: 'border-box',
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '1px', 
                  left: '1px',
                  right: '1px',
                  bottom: '1px',
                  borderRadius: '50%',
                  border: '2px solid #94a3b8'
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(50% - 1px)', 
                  left: '0', 
                  width: '100%', 
                  height: '2px', 
                  backgroundColor: '#cbd5e1' 
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: '0', 
                  left: 'calc(50% - 1px)', 
                  width: '2px', 
                  height: '100%', 
                  backgroundColor: '#cbd5e1' 
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(50% - 3px)', 
                  left: 'calc(50% - 3px)', 
                  width: '6px', 
                  height: '6px', 
                  background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', 
                  borderRadius: '50%',
                  border: '1px solid #64748b',
                  boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)'
                }}></div>
              </div>
              
              <div className="animate-wheels" style={{ 
                position: 'absolute', 
                bottom: '0', 
                right: '20px',
                width: '20px', 
                height: '20px', 
                background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', 
                borderRadius: '50%',
                border: '3px solid #cbd5e1',
                boxSizing: 'border-box',
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '1px', 
                  left: '1px',
                  right: '1px',
                  bottom: '1px',
                  borderRadius: '50%',
                  border: '2px solid #94a3b8'
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(50% - 1px)', 
                  left: '0', 
                  width: '100%', 
                  height: '2px', 
                  backgroundColor: '#cbd5e1' 
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: '0', 
                  left: 'calc(50% - 1px)', 
                  width: '2px', 
                  height: '100%', 
                  backgroundColor: '#cbd5e1' 
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(50% - 3px)', 
                  left: 'calc(50% - 3px)', 
                  width: '6px', 
                  height: '6px', 
                  background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', 
                  borderRadius: '50%',
                  border: '1px solid #64748b',
                  boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)'
                }}></div>
              </div>
              
              <div style={{ 
                position: 'absolute', 
                bottom: '15px', 
                left: '-8px', 
                width: '10px', 
                height: '4px', 
                backgroundColor: '#64748b', 
                borderRadius: '1px',
                zIndex: 1
              }}></div>
            </div>
          </div>
        </div>

        {/* Enhanced Yellow Public Bus - Main Road */}
        <div className="animate-car-right animation-delay-1000" style={{
          position: 'absolute',
          top: '15%',
          marginTop: '10px',
          left: '-180px',
          width: '180px',
          height: '80px',
          zIndex: 5,
          filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))'
        }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Bus body base */}
            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              width: '100%', 
              height: '50px', 
              background: 'linear-gradient(to bottom, #fbbf24 0%, #f59e0b 70%, #d97706 100%)', 
              borderRadius: '12px 15px 8px 8px',
              border: '1px solid #b45309',
              boxShadow: 'inset 0 -4px 10px rgba(0, 0, 0, 0.2), inset 2px 0 8px rgba(255, 255, 255, 0.3)' 
            }}></div>
            
            {/* Bus front/hood */}
            <div style={{ 
              position: 'absolute', 
              bottom: '6px', 
              left: '0', 
              width: '40px', 
              height: '44px', 
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', 
              borderRadius: '12px 5px 0 8px',
              boxShadow: 'inset 1px 1px 5px rgba(255, 255, 255, 0.4)'
            }}></div>
            
            {/* Bus front steps/entry */}
            <div style={{ 
              position: 'absolute', 
              bottom: '0', 
              left: '40px', 
              width: '25px', 
              height: '48px', 
              background: 'linear-gradient(to right, #f59e0b 0%, #fbbf24 100%)', 
              borderLeft: '2px solid #b45309',
              borderRight: '2px solid #b45309',
              boxShadow: 'inset 0 -3px 6px rgba(0, 0, 0, 0.15)'
            }}>
              {/* Entry door with glass */}
              <div style={{ 
                position: 'absolute', 
                top: '6px', 
                left: '0', 
                right: '0', 
                height: '42px', 
                background: 'linear-gradient(to right, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', 
                borderRadius: '3px',
                border: '1px solid #d97706',
                boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.6)',
                overflow: 'hidden'
              }}>
                {/* Door handle */}
                <div style={{ 
                  position: 'absolute', 
                  top: '20px', 
                  right: '3px', 
                  width: '4px', 
                  height: '8px', 
                  background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', 
                  borderRadius: '4px',
                  border: '1px solid #475569'
                }}></div>
                
                {/* Door divider/steps */}
                <div style={{ 
                  position: 'absolute', 
                  top: '18px', 
                  left: '0', 
                  right: '0', 
                  height: '1px', 
                  backgroundColor: '#d97706' 
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: '28px', 
                  left: '0', 
                  right: '0', 
                  height: '1px', 
                  backgroundColor: '#d97706' 
                }}></div>
              </div>
            </div>
            
            {/* Windows section */}
            <div style={{ 
              position: 'absolute', 
              top: '8px', 
              left: '70px', 
              right: '10px', 
              height: '32px', 
              background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', 
              borderRadius: '5px',
              border: '2px solid #d97706',
              boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.6)',
              overflow: 'hidden'
            }}>
              {/* Window dividers */}
              <div style={{ 
                display: 'flex', 
                height: '100%', 
                width: '100%'
              }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ 
                    flex: '1', 
                    height: '100%', 
                    borderRight: i < 4 ? '2px solid #d97706' : 'none',
                    position: 'relative'
                  }}>
                    {/* Passenger silhouettes in windows */}
                    {i % 2 === 0 && (
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '5px', 
                        left: '50%', 
                        transform: 'translateX(-50%)', 
                        width: '8px', 
                        height: '10px', 
                        backgroundColor: 'rgba(0,0,0,0.7)', 
                        borderRadius: '4px 4px 0 0'
                      }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bus roof */}
            <div style={{
              position: 'absolute',
              bottom: '50px',
              left: '5px',
              right: '5px',
              height: '8px',
              background: 'linear-gradient(to bottom, #f59e0b 0%, #fbbf24 100%)',
              borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
              border: '1px solid #b45309',
              borderBottom: 'none',
              boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)'
            }}></div>
            
            {/* Bus destination board */}
            <div style={{
              position: 'absolute',
              top: '5px',
              left: '40px',
              width: '25px',
              height: '13px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #b45309',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ 
                fontSize: '5px', 
                fontWeight: 'bold', 
                color: '#1f2937',
                fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif",
                transform: 'scaleY(0.9)'
              }}>
                කොළඹ
              </div>
            </div>
            
            {/* Front lights */}
            <div style={{ 
              position: 'absolute', 
              bottom: '8px', 
              left: '5px', 
              width: '12px', 
              height: '8px', 
              background: 'linear-gradient(to right, #fef3c7 0%, #fcd34d 100%)', 
              borderRadius: '40% 60% 60% 40% / 50% 50% 50% 50%',
              border: '1px solid #b45309',
              boxShadow: '0 0 10px rgba(252, 211, 77, 0.7)',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '1px', 
                left: '1px', 
                width: '4px', 
                height: '4px', 
                background: 'radial-gradient(circle, #fef9c3 0%, #fef3c7 100%)', 
                borderRadius: '50%' 
              }}></div>
            </div>
            
            {/* Front light beam effect */}
            <div style={{ 
              position: 'absolute', 
              bottom: '8px', 
              left: '-20px', 
              width: '30px', 
              height: '12px', 
              background: 'linear-gradient(to left, rgba(252, 211, 77, 0.2) 0%, rgba(252, 211, 77, 0) 100%)', 
              borderRadius: '50%',
              transform: 'scaleX(2)'
            }}></div>
            
            {/* Turn signals */}
            <div className="animate-light-blink animation-delay-300" style={{ 
              position: 'absolute', 
              bottom: '18px', 
              left: '5px', 
              width: '6px', 
              height: '6px', 
              background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', 
              borderRadius: '50%',
              border: '1px solid #b45309',
              boxShadow: '0 0 8px rgba(252, 211, 77, 0.6)'
            }}></div>
            
            {/* Rear lights */}
            <div className="animate-light-blink animation-delay-700" style={{ 
              position: 'absolute', 
              bottom: '18px', 
              right: '5px', 
              width: '10px', 
              height: '6px', 
              background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', 
              borderRadius: '2px',
              border: '1px solid #7f1d1d',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
            }}></div>
            
            {/* Bus Company Logo */}
            <div style={{ 
              position: 'absolute', 
              bottom: '30px', 
              right: '20px', 
              width: '25px', 
              height: '15px', 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: '8px',
              border: '1px solid #b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ 
                fontSize: '4px', 
                fontWeight: 'bold', 
                color: '#b45309',
                lineHeight: '1',
                textAlign: 'center'
              }}>
                <div>ශ්‍රී</div>
                <div style={{ marginTop: '1px' }}>EXPRESS</div>
              </div>
            </div>
            
            {/* Front wheel with detailed rim */}
            <div style={{ 
              position: 'absolute', 
              bottom: '-9px', 
              left: '20px', 
              width: '22px', 
              height: '22px', 
              backgroundColor: '#0f172a', 
              borderRadius: '50%',
              border: '4px solid #94a3b8',
              boxSizing: 'border-box',
              boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}>
              <div className="animate-wheels" style={{
                position: 'absolute',
                inset: '1px',
                borderRadius: '50%',
                border: '2px solid #64748b',
                background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)'
              }}></div>
            </div>
            
            {/* Middle wheel with detailed rim */}
            <div style={{ 
              position: 'absolute', 
              bottom: '-9px', 
              left: '90px', 
              width: '22px', 
              height: '22px', 
              backgroundColor: '#0f172a', 
              borderRadius: '50%',
              border: '4px solid #94a3b8',
              boxSizing: 'border-box',
              boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}>
              <div className="animate-wheels" style={{
                position: 'absolute',
                inset: '1px',
                borderRadius: '50%',
                border: '2px solid #64748b',
                background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)'
              }}></div>
            </div>
            
            {/* Rear wheel with detailed rim */}
            <div style={{ 
              position: 'absolute', 
              bottom: '-9px', 
              right: '20px', 
              width: '22px', 
              height: '22px', 
              backgroundColor: '#0f172a', 
              borderRadius: '50%',
              border: '4px solid #94a3b8',
              boxSizing: 'border-box',
              boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}>
              <div className="animate-wheels" style={{
                position: 'absolute',
                inset: '1px',
                borderRadius: '50%',
                border: '2px solid #64748b',
                background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)'
              }}></div>
            </div>
            
            {/* Wheel arches */}
            <div style={{ 
              position: 'absolute', 
              bottom: '22px', 
              left: '20px', 
              width: '26px', 
              height: '12px', 
              borderTop: '2px solid #b45309', 
              borderLeft: '2px solid #b45309', 
              borderRight: '2px solid #b45309', 
              borderRadius: '50% 50% 0 0',
              borderBottom: 'none'
            }}></div>
            
            <div style={{ 
              position: 'absolute', 
              bottom: '22px', 
              left: '90px', 
              width: '26px', 
              height: '12px', 
              borderTop: '2px solid #b45309', 
              borderLeft: '2px solid #b45309', 
              borderRight: '2px solid #b45309', 
              borderRadius: '50% 50% 0 0',
              borderBottom: 'none'
            }}></div>
            
            <div style={{ 
              position: 'absolute', 
              bottom: '22px', 
              right: '20px', 
              width: '26px', 
              height: '12px', 
              borderTop: '2px solid #b45309', 
              borderLeft: '2px solid #b45309', 
              borderRight: '2px solid #b45309', 
              borderRadius: '50% 50% 0 0',
              borderBottom: 'none'
            }}></div>
            
            {/* Bus number plate */}
            <div style={{ 
              position: 'absolute', 
              bottom: '5px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              width: '35px', 
              height: '12px', 
              backgroundColor: 'white', 
              borderRadius: '2px',
              border: '1px solid #d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ fontSize: '6px', fontWeight: 'bold', color: '#1f2937' }}>NA-5432</div>
            </div>
            
            {/* Roof rack/luggage */}
            <div style={{ 
              position: 'absolute', 
              bottom: '58px', 
              left: '40px', 
              right: '20px', 
              height: '8px', 
              background: 'linear-gradient(to bottom, #64748b 0%, #475569 100%)', 
              borderRadius: '3px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              {/* Luggage items */}
              <div style={{ 
                position: 'absolute', 
                top: '-4px', 
                left: '10px', 
                width: '15px', 
                height: '8px', 
                background: 'linear-gradient(to bottom, #78716c 0%, #57534e 100%)', 
                borderRadius: '2px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
              }}></div>
              <div style={{ 
                position: 'absolute', 
                top: '-6px', 
                left: '35px', 
                width: '20px', 
                height: '10px', 
                background: 'linear-gradient(to bottom, #a1a1aa 0%, #71717a 100%)', 
                borderRadius: '2px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
              }}></div>
              <div style={{ 
                position: 'absolute', 
                top: '-3px', 
                right: '15px', 
                width: '12px', 
                height: '7px', 
                background: 'linear-gradient(to bottom, #4b5563 0%, #374151 100%)', 
                borderRadius: '2px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
              }}></div>
            </div>
            
            {/* Wipers */}
            <div style={{ 
              position: 'absolute', 
              bottom: '35px', 
              left: '15px', 
              width: '15px', 
              height: '2px', 
              backgroundColor: '#334155', 
              borderRadius: '1px',
              transformOrigin: 'left center',
              transform: 'rotate(-10deg)'
            }}></div>
            
            {/* Driver */}
            <div style={{ 
              position: 'absolute', 
              bottom: '30px', 
              left: '25px', 
              width: '12px', 
              height: '12px', 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              borderRadius: '6px 6px 0 0'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '3px', 
                left: '2px', 
                width: '3px', 
                height: '2px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '50%'
              }}></div>
              <div style={{ 
                position: 'absolute', 
                top: '3px', 
                right: '2px', 
                width: '3px', 
                height: '2px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '50%'
              }}></div>
            </div>
            
            {/* Exhaust pipe */}
            <div style={{ 
              position: 'absolute', 
              bottom: '5px', 
              right: '5px', 
              width: '8px', 
              height: '4px', 
              background: 'linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%)', 
              borderRadius: '0 2px 2px 0',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)'
            }}></div>
            
            {/* Exhaust smoke */}
            <div style={{ 
              position: 'absolute', 
              bottom: '5px', 
              right: '-8px', 
              width: '10px', 
              height: '10px', 
              background: 'radial-gradient(circle, rgba(209, 213, 219, 0.8) 0%, rgba(209, 213, 219, 0) 70%)', 
              borderRadius: '50%',
              opacity: 0.6,
              animation: 'steam 1.2s ease-out infinite'
            }}></div>
            <div style={{ 
              position: 'absolute', 
              bottom: '8px', 
              right: '-15px', 
              width: '12px', 
              height: '12px', 
              background: 'radial-gradient(circle, rgba(209, 213, 219, 0.6) 0%, rgba(209, 213, 219, 0) 70%)', 
              borderRadius: '50%',
              opacity: 0.5,
              animation: 'steam 1.5s ease-out infinite'
            }}></div>
            <div style={{ 
              position: 'absolute', 
              bottom: '12px', 
              right: '-22px', 
              width: '15px', 
              height: '15px', 
              background: 'radial-gradient(circle, rgba(209, 213, 219, 0.4) 0%, rgba(209, 213, 219, 0) 70%)', 
              borderRadius: '50%',
              opacity: 0.4,
              animation: 'steam 1.8s ease-out infinite'
            }}></div>
          </div>
        </div>

        {/* Enhanced Yellow Minibus - Secondary Road */}
        <div className="animate-car-left animation-delay-2000" style={{
          position: 'absolute',
          top: '60%',
          marginTop: '5px',
          right: '-120px',
          width: '120px',
          height: '55px',
          zIndex: 5,
          filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))'
        }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Minibus body base */}
            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              width: '100%', 
              height: '35px', 
              background: 'linear-gradient(to bottom, #fbbf24 0%, #f59e0b 70%, #d97706 100%)', 
              borderRadius: '15px 10px 8px 8px',
              border: '1px solid #b45309',
              boxShadow: 'inset 0 -4px 10px rgba(0, 0, 0, 0.2), inset -2px 0 8px rgba(255, 255, 255, 0.3)' 
            }}></div>
            
            {/* Minibus hood */}
            <div style={{ 
              position: 'absolute', 
              bottom: '8px', 
              right: '0', 
              width: '30px', 
              height: '27px', 
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', 
              borderRadius: '5px 10px 8px 0',
              boxShadow: 'inset 1px 1px 5px rgba(255, 255, 255, 0.4)'
            }}></div>
            
            {/* Minibus cabin/windows */}
            <div style={{ 
              position: 'absolute', 
              top: '8px', 
              left: '10px', 
              right: '35px', 
              height: '20px', 
              background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', 
              borderRadius: '5px 0 0 0',
              border: '2px solid #d97706',
              boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.6)',
              overflow: 'hidden'
            }}>
              {/* Window dividers */}
              <div style={{ 
                display: 'flex', 
                height: '100%', 
                width: '100%'
              }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ 
                    flex: '1', 
                    height: '100%', 
                    borderRight: i < 3 ? '2px solid #d97706' : 'none',
                    position: 'relative'
                  }}>
                    {/* Passenger silhouettes in windows */}
                    {(i === 0 || i === 2) && (
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '3px', 
                        left: '50%', 
                        transform: 'translateX(-50%)', 
                        width: '6px', 
                        height: '7px', 
                        backgroundColor: 'rgba(0,0,0,0.7)', 
                        borderRadius: '3px 3px 0 0'
                      }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Windshield */}
            <div style={{ 
              position: 'absolute', 
              top: '8px', 
              right: '10px', 
              width: '25px', 
              height: '20px', 
              background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', 
              borderRadius: '0 5px 0 0',
              border: '2px solid #d97706',
              boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.6)'
            }}>
              {/* Windshield reflection */}
              <div style={{ 
                position: 'absolute', 
                top: '3px', 
                left: '5px', 
                width: '15px', 
                height: '2px', 
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)', 
                borderRadius: '50%',
                transform: 'rotate(10deg)'
              }}></div>
            </div>
            
            {/* Driver silhouette */}
            <div style={{ 
              position: 'absolute', 
              top: '15px', 
              right: '22px', 
              width: '8px', 
              height: '8px', 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              borderRadius: '4px 4px 0 0'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '2px', 
                left: '1px', 
                width: '2px', 
                height: '1px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '50%'
              }}></div>
              <div style={{ 
                position: 'absolute', 
                top: '2px', 
                right: '1px', 
                width: '2px', 
                height: '1px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '50%'
              }}></div>
            </div>
            
            {/* Entry door */}
            <div style={{ 
              position: 'absolute', 
              bottom: '0px', 
              left: '25px', 
              width: '20px', 
              height: '28px', 
              backgroundColor: 'rgba(219, 234, 254, 0.7)', 
              borderRadius: '3px 3px 0 0',
              border: '2px solid #d97706',
              borderBottom: 'none',
              boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.6)'
            }}>
              {/* Door handle */}
              <div style={{ 
                position: 'absolute', 
                top: '14px', 
                right: '2px', 
                width: '3px', 
                height: '6px', 
                background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', 
                borderRadius: '3px',
                border: '1px solid #475569'
              }}></div>
              
              {/* Door steps */}
              <div style={{ 
                position: 'absolute', 
                top: '18px', 
                left: '0', 
                right: '0', 
                height: '1px', 
                backgroundColor: '#d97706' 
              }}></div>
              <div style={{ 
                position: 'absolute', 
                top: '23px', 
                left: '0', 
                right: '0', 
                height: '1px', 
                backgroundColor: '#d97706' 
              }}></div>
            </div>
            
            {/* Minibus route number display */}
            <div style={{
              position: 'absolute',
              top: '3px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '18px',
              height: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #b45309',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ 
                fontSize: '5px', 
                fontWeight: 'bold', 
                color: '#1f2937' 
              }}>154</div>
            </div>
            
            {/* Front wheel with detailed rim */}
            <div style={{ 
              position: 'absolute', 
              bottom: '-7px', 
              right: '20px', 
              width: '18px', 
              height: '18px', 
              backgroundColor: '#0f172a', 
              borderRadius: '50%',
              border: '3px solid #94a3b8',
              boxSizing: 'border-box',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}>
              <div className="animate-wheels" style={{
                position: 'absolute',
                inset: '1px',
                borderRadius: '50%',
                border: '1px solid #64748b',
                background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)'
              }}></div>
            </div>
            
            {/* Rear wheel with detailed rim */}
            <div style={{ 
              position: 'absolute', 
              bottom: '0', 
              left: '20px', 
              width: '18px', 
              height: '18px', 
              backgroundColor: '#0f172a', 
              borderRadius: '50%',
              border: '3px solid #94a3b8',
              boxSizing: 'border-box',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}>
              <div className="animate-wheels" style={{
                position: 'absolute',
                inset: '1px',
                borderRadius: '50%',
                border: '1px solid #64748b',
                background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)'
              }}></div>
            </div>
            
            {/* Wheel arches */}
            <div style={{ 
              position: 'absolute', 
              bottom: '18px', 
              right: '20px', 
              width: '22px', 
              height: '10px', 
              borderTop: '2px solid #b45309', 
              borderLeft: '2px solid #b45309', 
              borderRight: '2px solid #b45309', 
              borderRadius: '50% 50% 0 0',
              borderBottom: 'none'
            }}></div>
            
            <div style={{ 
              position: 'absolute', 
              bottom: '18px', 
              left: '20px', 
              width: '22px', 
              height: '10px', 
              borderTop: '2px solid #b45309', 
              borderLeft: '2px solid #b45309', 
              borderRight: '2px solid #b45309', 
              borderRadius: '50% 50% 0 0',
              borderBottom: 'none'
            }}></div>
            
            {/* Front headlight */}
            <div style={{ 
              position: 'absolute', 
              bottom: '12px', 
              right: '5px', 
              width: '10px', 
              height: '6px', 
              background: 'linear-gradient(to left, #fef3c7 0%, #fcd34d 100%)', 
              borderRadius: '60% 40% 40% 60% / 50% 50% 50% 50%',
              border: '1px solid #b45309',
              boxShadow: '0 0 8px rgba(252, 211, 77, 0.6)',
              transform: 'rotate(5deg)'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '1px', 
                right: '1px', 
                width: '3px', 
                height: '2px', 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                borderRadius: '50%' 
              }}></div>
            </div>
            
            {/* Front light beam effect */}
            <div style={{ 
              position: 'absolute', 
              bottom: '10px', 
              right: '-20px', 
              width: '30px', 
              height: '12px', 
              background: 'linear-gradient(to right, rgba(252, 211, 77, 0.2) 0%, rgba(252, 211, 77, 0) 100%)', 
              borderRadius: '50%',
              transform: 'rotate(5deg) scaleX(2)'
            }}></div>
            
            {/* Turn signals */}
            <div className="animate-light-blink animation-delay-400" style={{ 
              position: 'absolute', 
              bottom: '23px', 
              right: '8px', 
              width: '5px', 
              height: '5px', 
              background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', 
              borderRadius: '50%',
              border: '1px solid #b45309',
              boxShadow: '0 0 6px rgba(252, 211, 77, 0.6)'
            }}></div>
            
            {/* Tail lights */}
            <div className="animate-light-blink animation-delay-500" style={{ 
              position: 'absolute', 
              bottom: '12px', 
              left: '5px', 
              width: '8px', 
              height: '5px', 
              background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', 
              borderRadius: '2px',
              border: '1px solid #7f1d1d',
              boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)'
            }}></div>
            
            {/* License plate */}
            <div style={{ 
              position: 'absolute', 
              bottom: '3px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              width: '25px', 
              height: '8px', 
              backgroundColor: 'white', 
              borderRadius: '2px',
              border: '1px solid #d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ fontSize: '4px', fontWeight: 'bold', color: '#1f2937' }}>NC-3214</div>
            </div>
            
            {/* Minibus company logo */}
            <div style={{ 
              position: 'absolute', 
              bottom: '20px', 
              right: '40px', 
              width: '18px', 
              height: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: '5px',
              border: '1px solid #b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ 
                fontSize: '3px', 
                fontWeight: 'bold', 
                color: '#b45309',
                fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif",
              }}>
                බස් සේවා
              </div>
            </div>
            
            {/* Roof luggage rack */}
            <div style={{ 
              position: 'absolute', 
              top: '0', 
              left: '20px', 
              right: '35px', 
              height: '5px', 
              background: 'linear-gradient(to bottom, #64748b 0%, #475569 100%)', 
              borderRadius: '2px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
            }}>
              {/* Luggage items */}
              <div style={{ 
                position: 'absolute', 
                top: '-3px', 
                left: '5px', 
                width: '10px', 
                height: '5px', 
                background: 'linear-gradient(to bottom, #78716c 0%, #57534e 100%)', 
                borderRadius: '1px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
              }}></div>
              <div style={{ 
                position: 'absolute', 
                top: '-4px', 
                right: '10px', 
                width: '15px', 
                height: '6px', 
                background: 'linear-gradient(to bottom, #a1a1aa 0%, #71717a 100%)', 
                borderRadius: '1px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
              }}></div>
            </div>
            
            {/* Exhaust pipe */}
            <div style={{ 
              position: 'absolute', 
              bottom: '3px', 
              left: '5px', 
              width: '6px', 
              height: '3px', 
              background: 'linear-gradient(to right, #9ca3af 0%, #6b7280 100%)', 
              borderRadius: '2px 0 0 2px',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)'
            }}></div>
            
            {/* Exhaust smoke */}
            <div style={{ 
              position: 'absolute', 
              bottom: '3px', 
              left: '-8px', 
              width: '8px', 
              height: '8px', 
              background: 'radial-gradient(circle, rgba(209, 213, 219, 0.8) 0%, rgba(209, 213, 219, 0) 70%)', 
              borderRadius: '50%',
              opacity: 0.6,
              animation: 'steam 1.2s ease-out infinite'
            }}></div>
            <div style={{ 
              position: 'absolute', 
              bottom: '6px', 
              left: '-15px', 
              width: '10px', 
              height: '10px', 
              background: 'radial-gradient(circle, rgba(209, 213, 219, 0.6) 0%, rgba(209, 213, 219, 0) 70%)', 
              borderRadius: '50%',
              opacity: 0.5,
              animation: 'steam 1.5s ease-out infinite'
            }}></div>
          </div>
        </div>

        {/* Enhanced 3-Wheeler Tuk-Tuk - Secondary Road */}
        <div className="animate-car-right animation-delay-1500" style={{
          position: 'absolute',
          top: '60%',
          marginTop: '30px',
          left: '-70px',
          width: '70px',
          height: '45px',
          zIndex: 5,
          filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))'
        }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Tuk-tuk top/canopy */}
            <div style={{ 
              position: 'absolute', 
              bottom: '20px', 
              left: '10px', 
              width: '50px', 
              height: '22px', 
              background: 'linear-gradient(to bottom, #0ea5e9 0%, #0284c7 100%)', 
              borderRadius: '10px 10px 0 0',
              border: '1px solid #0369a1',
              boxShadow: 'inset 0 1px 5px rgba(255, 255, 255, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2)'
            }}></div>
            
            {/* Tuk-tuk body */}
            <div style={{ 
              position: 'absolute', 
              bottom: '0', 
              left: '0', 
              width: '100%', 
              height: '20px', 
              background: 'linear-gradient(to bottom, #0369a1 0%, #075985 100%)', 
              borderRadius: '5px 15px 5px 5px',
              border: '1px solid #0c4a6e',
              boxShadow: 'inset 0 -2px 6px rgba(0, 0, 0, 0.2)'
            }}></div>
            
            {/* Front section */}
            <div style={{ 
              position: 'absolute', 
              bottom: '5px', 
              right: '0', 
              width: '25px', 
              height: '15px', 
              background: 'linear-gradient(to right, #0369a1 0%, #075985 100%)', 
              borderRadius: '5px 15px 5px 5px',
              boxShadow: 'inset 1px 1px 3px rgba(255, 255, 255, 0.2)'
            }}></div>
            
            {/* Windshield */}
            <div style={{ 
              position: 'absolute', 
              bottom: '20px', 
              right: '5px', 
              width: '20px', 
              height: '15px', 
              background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', 
              borderRadius: '5px 5px 0 0',
              border: '1px solid #0369a1',
              boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.6)'
            }}>
              {/* Windshield reflection */}
              <div style={{ 
                position: 'absolute', 
                top: '2px', 
                left: '3px', 
                width: '12px', 
                height: '2px', 
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)', 
                borderRadius: '50%'
              }}></div>
            </div>
            
            {/* Driver silhouette */}
            <div style={{ 
              position: 'absolute', 
              bottom: '25px', 
              right: '12px', 
              width: '8px', 
              height: '8px', 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              borderRadius: '4px 4px 0 0'
            }}></div>
            
            {/* Passenger compartment open sides */}
            <div style={{ 
              position: 'absolute', 
              bottom: '20px', 
              left: '10px', 
              width: '45px', 
              height: '15px', 
              background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.5) 0%, rgba(147, 197, 253, 0.5) 100%)', 
              borderRadius: '5px 5px 0 0',
              border: '1px solid #0369a1',
              borderBottom: 'none',
              boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.4)'
            }}>
              {/* Passenger silhouette */}
              <div style={{ 
                position: 'absolute', 
                bottom: '2px', 
                left: '15px', 
                width: '7px', 
                height: '7px', 
                backgroundColor: 'rgba(0,0,0,0.7)', 
                borderRadius: '3px 3px 0 0'
              }}></div>
              
              {/* Passenger silhouette */}
              <div style={{ 
                position: 'absolute', 
                bottom: '2px', 
                right: '15px', 
                width: '7px', 
                height: '7px', 
                backgroundColor: 'rgba(0,0,0,0.7)', 
                borderRadius: '3px 3px 0 0'
              }}></div>
            </div>
            
            {/* Front wheel */}
            <div style={{ 
              position: 'absolute', 
              bottom: '0', 
              right: '10px', 
              width: '14px', 
              height: '14px', 
              backgroundColor: '#0f172a', 
              borderRadius: '50%',
              border: '3px solid #94a3b8',
              boxSizing: 'border-box',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}>
              <div className="animate-wheels" style={{
                position: 'absolute',
                inset: '1px',
                borderRadius: '50%',
                border: '1px solid #64748b',
                background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)'
              }}></div>
            </div>
            
            {/* Rear wheels (2x) */}
            <div style={{ 
              position: 'absolute', 
              bottom: '0', 
              left: '8px', 
              width: '14px', 
              height: '14px', 
              backgroundColor: '#0f172a', 
              borderRadius: '50%',
              border: '3px solid #94a3b8',
              boxSizing: 'border-box',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}>
              <div className="animate-wheels" style={{
                position: 'absolute',
                inset: '1px',
                borderRadius: '50%',
                border: '1px solid #64748b',
                background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)'
              }}></div>
            </div>
            
            <div style={{ 
              position: 'absolute', 
              bottom: '0', 
              left: '28px', 
              width: '14px', 
              height: '14px', 
              backgroundColor: '#0f172a', 
              borderRadius: '50%',
              border: '3px solid #94a3b8',
              boxSizing: 'border-box',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}>
              <div className="animate-wheels" style={{
                position: 'absolute',
                inset: '1px',
                borderRadius: '50%',
                border: '1px solid #64748b',
                background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)'
              }}></div>
            </div>
            
            {/* Handle bars */}
            <div style={{ 
              position: 'absolute', 
              bottom: '26px', 
              right: '15px', 
              width: '8px', 
              height: '3px', 
              backgroundColor: '#94a3b8', 
              borderRadius: '1px',
              transform: 'rotate(-10deg)'
            }}></div>
            
            {/* Front headlight */}
            <div style={{ 
              position: 'absolute', 
              bottom: '10px', 
              right: '3px', 
              width: '6px', 
              height: '5px', 
              background: 'linear-gradient(to left, #fef3c7 0%, #fcd34d 100%)', 
              borderRadius: '50%',
              border: '1px solid #b45309',
              boxShadow: '0 0 8px rgba(252, 211, 77, 0.6)'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '1px', 
                right: '1px', 
                width: '2px', 
                height: '2px', 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                borderRadius: '50%' 
              }}></div>
            </div>
            
            {/* Front light beam effect */}
            <div style={{ 
              position: 'absolute', 
              bottom: '8px', 
              right: '-12px', 
              width: '15px', 
              height: '8px', 
              background: 'linear-gradient(to right, rgba(252, 211, 77, 0.2) 0%, rgba(252, 211, 77, 0) 100%)', 
              borderRadius: '50%',
              transform: 'scaleX(2)'
            }}></div>
            
            {/* Tuk-tuk meter */}
            <div style={{ 
              position: 'absolute', 
              bottom: '14px', 
              right: '15px', 
              width: '6px', 
              height: '4px', 
              background: 'linear-gradient(to bottom, #334155 0%, #1e293b 100%)', 
              borderRadius: '1px',
              border: '1px solid #0c4a6e',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>
              <div className="animate-light-blink animation-delay-1000" style={{ 
                position: 'absolute', 
                top: '1px', 
                right: '1px', 
                width: '1px', 
                height: '1px', 
                backgroundColor: '#f87171', 
                borderRadius: '50%'
              }}></div>
            </div>
            
            {/* Rear light */}
            <div className="animate-light-blink animation-delay-800" style={{ 
              position: 'absolute', 
              bottom: '8px', 
              left: '3px', 
              width: '5px', 
              height: '3px', 
              background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', 
              borderRadius: '2px',
              border: '1px solid #7f1d1d',
              boxShadow: '0 0 5px rgba(239, 68, 68, 0.6)'
            }}></div>
            
            {/* License plate */}
            <div style={{ 
              position: 'absolute', 
              bottom: '4px', 
              left: '15px', 
              width: '20px', 
              height: '5px', 
              backgroundColor: 'white', 
              borderRadius: '1px',
              border: '1px solid #0369a1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ fontSize: '3px', fontWeight: 'bold', color: '#1f2937' }}>TK-123</div>
            </div>
            
            {/* Tuk-tuk decorative trim */}
            <div style={{ 
              position: 'absolute', 
              bottom: '17px', 
              left: '5px', 
              right: '30px', 
              height: '2px', 
              background: 'linear-gradient(to right, #fcd34d 0%, #fbbf24 100%)', 
              borderRadius: '1px'
            }}></div>
            
            {/* Frame connecting driver to passenger compartment */}
            <div style={{ 
              position: 'absolute', 
              bottom: '20px', 
              right: '25px', 
              width: '5px', 
              height: '18px', 
              background: 'linear-gradient(to bottom, #0c4a6e 0%, #0369a1 100%)', 
              transform: 'rotate(45deg)',
              transformOrigin: 'bottom center'
            }}></div>
            
            {/* Exhaust pipe */}
            <div style={{ 
              position: 'absolute', 
              bottom: '3px', 
              left: '45px', 
              width: '5px', 
              height: '3px', 
              background: 'linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%)', 
              borderRadius: '0 1px 1px 0',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)'
            }}></div>
            
            {/* Exhaust smoke */}
            <div style={{ 
              position: 'absolute', 
              bottom: '3px', 
              left: '48px', 
              width: '5px', 
              height: '5px', 
              background: 'radial-gradient(circle, rgba(209, 213, 219, 0.8) 0%, rgba(209, 213, 219, 0) 70%)', 
              borderRadius: '50%',
              opacity: 0.6,
              animation: 'steam 0.8s ease-out infinite'
            }}></div>
            <div style={{ 
              position: 'absolute', 
              bottom: '5px', 
              left: '52px', 
              width: '6px', 
              height: '6px', 
              background: 'radial-gradient(circle, rgba(209, 213, 219, 0.6) 0%, rgba(209, 213, 219, 0) 70%)', 
              borderRadius: '50%',
              opacity: 0.5,
              animation: 'steam 1s ease-out infinite'
            }}></div>
          </div>
        </div>

        {/* Enhanced Motorcycle - Main Road */}
        <div className="animate-car-left animation-delay-1200" style={{
          position: 'absolute',
          top: '15%',
          marginTop: '40px',
          right: '-80px',
          width: '80px',
          height: '45px',
          zIndex: 5,
          filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))'
        }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Main frame */}
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
            
            {/* Fuel tank */}
            <div style={{ 
              position: 'absolute', 
              bottom: '14px', 
              left: '35px', 
              width: '20px', 
              height: '10px', 
              background: 'linear-gradient(to bottom, #dc2626 0%, #b91c1c 100%)', 
              borderRadius: '5px 8px 5px 5px',
              boxShadow: 'inset 2px 2px 5px rgba(255, 255, 255, 0.3)',
              transform: 'rotate(5deg)'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '2px', 
                left: '5px', 
                width: '8px', 
                height: '2px', 
                background: 'linear-gradient(to right, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 100%)', 
                borderRadius: '2px',
                transform: 'rotate(-5deg)'
              }}></div>
            </div>
            
            {/* Seat */}
            <div style={{ 
              position: 'absolute', 
              bottom: '14px', 
              left: '18px', 
              width: '18px', 
              height: '6px', 
              background: 'linear-gradient(to bottom, #111827 0%, #1f2937 100%)', 
              borderRadius: '2px 5px 2px 2px',
              boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)'
            }}></div>
            
            {/* Rear fender */}
            <div style={{ 
              position: 'absolute', 
              bottom: '10px', 
              left: '10px', 
              width: '10px', 
              height: '8px', 
              background: 'linear-gradient(to bottom, #4b5563 0%, #374151 100%)', 
              borderRadius: '5px 2px 2px 2px',
              transform: 'rotate(-15deg)'
            }}></div>
            
            {/* Front forks */}
            <div style={{ 
              position: 'absolute', 
              bottom: '12px', 
              right: '25px', 
              width: '3px', 
              height: '16px', 
              background: 'linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%)', 
              borderRadius: '2px',
              transform: 'rotate(20deg)',
              transformOrigin: 'bottom center',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}></div>
            
            {/* Handlebar */}
            <div style={{ 
              position: 'absolute', 
              bottom: '27px', 
              right: '22px', 
              width: '12px', 
              height: '3px', 
              background: 'linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%)', 
              borderRadius: '2px',
              transform: 'rotate(15deg)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}></div>
            
            {/* Engine block */}
            <div style={{ 
              position: 'absolute', 
              bottom: '3px', 
              left: '25px', 
              width: '16px', 
              height: '10px', 
              background: 'linear-gradient(to bottom, #1f2937 0%, #111827 100%)', 
              borderRadius: '3px',
              boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.1), 0 1px 2px rgba(0, 0, 0, 0.3)'
            }}></div>
            
            {/* Exhaust pipe */}
            <div style={{ 
              position: 'absolute', 
              bottom: '4px', 
              left: '15px', 
              width: '12px', 
              height: '3px', 
              background: 'linear-gradient(to right, #6b7280 0%, #4b5563 100%)', 
              borderRadius: '1px',
              transform: 'rotate(5deg)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}></div>
            
            {/* Exhaust smoke */}
            <div style={{ 
              position: 'absolute', 
              bottom: '4px', 
              left: '10px', 
              width: '5px', 
              height: '5px', 
              background: 'radial-gradient(circle, rgba(209, 213, 219, 0.8) 0%, rgba(209, 213, 219, 0) 70%)', 
              borderRadius: '50%',
              opacity: 0.6,
              animation: 'steam 0.7s ease-out infinite'
            }}></div>
            <div style={{ 
              position: 'absolute', 
              bottom: '6px', 
              left: '5px', 
              width: '6px', 
              height: '6px', 
              background: 'radial-gradient(circle, rgba(209, 213, 219, 0.6) 0%, rgba(209, 213, 219, 0) 70%)', 
              borderRadius: '50%',
              opacity: 0.5,
              animation: 'steam 0.9s ease-out infinite'
            }}></div>
            
            {/* Front wheel with detailed rim */}
            <div style={{ 
              position: 'absolute', 
              bottom: '-7px', 
              right: '15px', 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#0f172a', 
              borderRadius: '50%',
              border: '3px solid #94a3b8',
              boxSizing: 'border-box',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}>
              <div className="animate-wheels" style={{
                position: 'absolute',
                inset: '1px',
                borderRadius: '50%',
                border: '1px solid #64748b',
                background: 'radial-gradient(circle at center, #e2e8f0 10%, transparent 10%), conic-gradient(#cbd5e1 0deg, #cbd5e1 22.5deg, transparent 22.5deg, transparent 45deg, #cbd5e1 45deg, #cbd5e1 67.5deg, transparent 67.5deg, transparent 90deg, #cbd5e1 90deg, #cbd5e1 112.5deg, transparent 112.5deg, transparent 135deg, #cbd5e1 135deg, #cbd5e1 157.5deg, transparent 157.5deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 202.5deg, transparent 202.5deg, transparent 225deg, #cbd5e1 225deg, #cbd5e1 247.5deg, transparent 247.5deg, transparent 270deg, #cbd5e1 270deg, #cbd5e1 292.5deg, transparent 292.5deg, transparent 315deg, #cbd5e1 315deg, #cbd5e1 337.5deg, transparent 337.5deg, transparent 360deg)'
              }}></div>
            </div>
            
            {/* Rear wheel with detailed rim */}
            <div style={{ 
              position: 'absolute', 
              bottom: '0', 
              left: '15px', 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#0f172a', 
              borderRadius: '50%',
              border: '3px solid #94a3b8',
              boxSizing: 'border-box',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}>
              <div className="animate-wheels" style={{
                position: 'absolute',
                inset: '1px',
                borderRadius: '50%',
                border: '1px solid #64748b',
                background: 'radial-gradient(circle at center, #e2e8f0 10%, transparent 10%), conic-gradient(#cbd5e1 0deg, #cbd5e1 22.5deg, transparent 22.5deg, transparent 45deg, #cbd5e1 45deg, #cbd5e1 67.5deg, transparent 67.5deg, transparent 90deg, #cbd5e1 90deg, #cbd5e1 112.5deg, transparent 112.5deg, transparent 135deg, #cbd5e1 135deg, #cbd5e1 157.5deg, transparent 157.5deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 202.5deg, transparent 202.5deg, transparent 225deg, #cbd5e1 225deg, #cbd5e1 247.5deg, transparent 247.5deg, transparent 270deg, #cbd5e1 270deg, #cbd5e1 292.5deg, transparent 292.5deg, transparent 315deg, #cbd5e1 315deg, #cbd5e1 337.5deg, transparent 337.5deg, transparent 360deg)'
              }}></div>
            </div>
            
            {/* Headlight */}
            <div style={{ 
              position: 'absolute', 
              bottom: '25px', 
              right: '15px', 
              width: '8px', 
              height: '6px', 
              background: 'linear-gradient(to left, #fef3c7 0%, #fcd34d 100%)', 
              borderRadius: '50%',
              border: '1px solid #b45309',
              boxShadow: '0 0 8px rgba(252, 211, 77, 0.6)',
              transform: 'rotate(10deg)'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '1px', 
                right: '1px', 
                width: '3px', 
                height: '1px', 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                borderRadius: '50%' 
              }}></div>
            </div>
            
            {/* Light beam effect */}
            <div style={{ 
              position: 'absolute', 
              bottom: '25px', 
              right: '-20px', 
              width: '30px', 
              height: '10px', 
              background: 'linear-gradient(to right, rgba(252, 211, 77, 0.2) 0%, rgba(252, 211, 77, 0) 100%)', 
              borderRadius: '50%',
              transform: 'rotate(10deg) scaleX(2)'
            }}></div>
            
            {/* Tail light */}
            <div className="animate-light-blink animation-delay-100" style={{ 
              position: 'absolute', 
              bottom: '14px', 
              left: '8px', 
              width: '5px', 
              height: '3px', 
              background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', 
              borderRadius: '40% 60% 60% 40% / 50% 50% 50% 50%',
              border: '1px solid #7f1d1d',
              boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
              transform: 'rotate(-15deg)'
            }}></div>
            
            {/* Rider */}
            <div style={{ 
              position: 'absolute', 
              bottom: '18px', 
              left: '25px', 
              width: '10px', 
              height: '14px', 
              backgroundColor: '#374151', 
              borderRadius: '5px 5px 0 0',
              transform: 'rotate(5deg)'
            }}>
              {/* Helmet */}
              <div style={{ 
                position: 'absolute', 
                top: '-8px', 
                left: '0', 
                width: '10px', 
                height: '10px', 
                background: 'linear-gradient(to bottom, #334155 0%, #1e293b 100%)', 
                borderRadius: '50% 50% 25% 25%',
                boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.1)'
              }}>
                {/* Visor */}
                <div style={{ 
                  position: 'absolute', 
                  top: '3px', 
                  left: '2px', 
                  width: '6px', 
                  height: '3px', 
                  background: 'linear-gradient(to bottom, #38bdf8 0%, #0ea5e9 100%)', 
                  borderRadius: '2px',
                  boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.3)'
                }}></div>
              </div>
              
              {/* Arm */}
              <div style={{ 
                position: 'absolute', 
                top: '2px', 
                right: '-5px', 
                width: '8px', 
                height: '3px', 
                backgroundColor: '#374151', 
                borderRadius: '2px',
                transform: 'rotate(-20deg)'
              }}></div>
            </div>
            
            {/* License plate */}
            <div style={{ 
              position: 'absolute', 
              bottom: '3px', 
              left: '17px', 
              width: '10px', 
              height: '4px', 
              backgroundColor: 'white', 
              borderRadius: '1px',
              border: '1px solid #4b5563',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ fontSize: '2px', fontWeight: 'bold', color: '#1f2937' }}>MC</div>
            </div>
          </div>
        </div>

        {/* Vertical Roads */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '20%',
          width: '60px',
          backgroundColor: '#1f2937',
          boxShadow: '5px 0 15px -3px rgba(0, 0, 0, 0.2)',
          zIndex: 2
        }}></div>

        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: '20%',
          width: '60px',
          backgroundColor: '#1f2937',
          boxShadow: '-5px 0 15px -3px rgba(0, 0, 0, 0.2)',
          zIndex: 2
        }}></div>

        {/* Pedestrian Crossings */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          height: '100px',
          width: '60px',
          zIndex: 4
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            height: '100%'
          }}>
            <div style={{ width: '100%', height: '12px', backgroundColor: 'white' }}></div>
            <div style={{ width: '100%', height: '12px', backgroundColor: 'white' }}></div>
            <div style={{ width: '100%', height: '12px', backgroundColor: 'white' }}></div>
            <div style={{ width: '100%', height: '12px', backgroundColor: 'white' }}></div>
          </div>
        </div>

        <div style={{
          position: 'absolute',
          top: '60%',
          right: '20%',
          height: '80px',
          width: '60px',
          zIndex: 4
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            height: '100%'
          }}>
            <div style={{ width: '100%', height: '10px', backgroundColor: 'white' }}></div>
            <div style={{ width: '100%', height: '10px', backgroundColor: 'white' }}></div>
            <div style={{ width: '100%', height: '10px', backgroundColor: 'white' }}></div>
            <div style={{ width: '100%', height: '10px', backgroundColor: 'white' }}></div>
          </div>
        </div>
        
        <div style={{
          position: 'absolute',
          top: '85%',
          right: '20%',
          height: '50px',
          width: '60px',
          zIndex: 4,
          backgroundColor: '#4b5563'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            height: '100%'
          }}>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundImage: 'linear-gradient(45deg, #f87171 25%, #fef3c7 25%, #fef3c7 50%, #f87171 50%, #f87171 75%, #fef3c7 75%, #fef3c7 100%)',
              backgroundSize: '8px 8px'
            }}></div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundImage: 'linear-gradient(45deg, #fef3c7 25%, #f87171 25%, #f87171 50%, #fef3c7 50%, #fef3c7 75%, #f87171 75%, #f87171 100%)',
              backgroundSize: '8px 8px'
            }}></div>
          </div>
        </div>

        {/* Traffic Lights */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '20%', 
          marginTop: '-50px',
          marginLeft: '-30px',
          width: '20px',
          height: '70px',
          backgroundColor: '#4B5563',
          borderRadius: '4px 4px 0 0',
          zIndex: 4
        }}>
          <div style={{ width: '100%', height: '20px', backgroundColor: 'red', borderRadius: '4px 4px 0 0' }}></div>
          <div style={{ width: '100%', height: '20px', backgroundColor: 'yellow' }}></div>
          <div style={{ width: '100%', height: '20px', backgroundColor: 'green' }}></div>
        </div>

        <div style={{
          position: 'absolute',
          top: '60%',
          right: '20%', 
          marginTop: '-40px',
          marginRight: '-30px',
          width: '16px',
          height: '60px',
          backgroundColor: '#4B5563',
          borderRadius: '4px 4px 0 0',
          zIndex: 4
        }}>
          <div style={{ width: '100%', height: '16px', backgroundColor: 'red', borderRadius: '4px 4px 0 0' }}></div>
          <div style={{ width: '100%', height: '16px', backgroundColor: 'yellow' }}></div>
          <div style={{ width: '100%', height: '16px', backgroundColor: 'green' }}></div>
        </div>
        
        <div style={{
          position: 'absolute',
          top: '85%',
          right: '20%', 
          marginTop: '-40px',
          marginRight: '-40px',
          width: '16px',
          height: '70px',
          backgroundColor: '#4B5563',
          zIndex: 4
        }}>
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: '-15px',
            width: '45px',
            height: '45px',
            backgroundColor: '#fef3c7',
            border: '3px solid #ef4444',
            borderRadius: '3px',
            transform: 'rotate(45deg)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              color: '#ef4444',
              fontWeight: 'bold',
              fontSize: '8px',
              transform: 'rotate(-45deg)'
            }}>RR</div>
          </div>
          
          <div className="animate-light-blink" style={{ 
            position: 'absolute', 
            top: '50px',
            left: '-15px',
            width: '14px', 
            height: '14px', 
            backgroundColor: '#ef4444', 
            borderRadius: '50%',
            boxShadow: '0 0 10px #ef4444'
          }}></div>
          <div className="animate-light-blink animation-delay-500" style={{ 
            position: 'absolute', 
            top: '50px',
            left: '17px',
            width: '14px', 
            height: '14px', 
            backgroundColor: '#ef4444', 
            borderRadius: '50%',
            boxShadow: '0 0 10px #ef4444'
          }}></div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
        zIndex: 50,
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#F59E0B'
            }}>
              ශ්‍රී
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1F2937'
            }}>
              Express
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center'
          }}>
            <a href="#home" style={{ color: '#1F2937', textDecoration: 'none', fontWeight: '500' }}>Home</a>
            <a href="#features" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>Features</a>
            <a href="#services" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>Services</a>
            <a href="#contact" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>Contact</a>
            <Link
              href="/login"
              className="button-hover"
              style={{
                backgroundColor: '#F59E0B',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 4px 6px rgba(245, 158, 11, 0.3)'
              }}
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" style={{
        padding: '8rem 1.5rem 4rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div className="animate-fade-in-down">
            <h1 className="hero-title" style={{
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '1.5rem',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.7)',
              lineHeight: '1.1'
            }}>
              <span style={{ 
                color: '#fcd34d',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.7), 0 0 30px rgba(250, 204, 21, 0.4)'
              }}>ශ්‍රී</span> Express
              <br />
              <span style={{ fontSize: '0.7em', color: '#1F2937' }}>
                Transportation Management
              </span>
            </h1>
          </div>
          
          <div className="animate-fade-in-up animation-delay-300">
            <p className="hero-subtitle" style={{
              fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
              color: '#1F2937',
              marginBottom: '3rem',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '1rem 2rem',
              borderRadius: '1rem',
              display: 'inline-block',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              maxWidth: '800px'
            }}>
              Experience the future of public transportation in Sri Lanka. 
              Real-time tracking, smart booking, and AI-powered journey planning.
            </p>
          </div>
          
          <div className="animate-fade-in-up animation-delay-500">
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link
                href="/register"
                className="button-hover"
                style={{
                  backgroundColor: '#F59E0B',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 6px rgba(245, 158, 11, 0.5)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                Get Started
                <ArrowRightIcon width={20} height={20} />
              </Link>
              <Link
                href="/login"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#1F2937',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  border: '2px solid #F59E0B',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#F59E0B';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.color = '#1F2937';
                }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding" style={{
        padding: '4rem 1.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontWeight: 'bold',
              color: '#1F2937',
              marginBottom: '1rem'
            }}>
              Why Choose Sri Express?
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#6B7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Advanced technology meets reliable transportation for a seamless travel experience.
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card animate-float"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '2rem',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  cursor: 'pointer',
                  animationDelay: `${index * 0.2}s`
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: feature.color,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  boxShadow: `0 10px 20px ${feature.color}40`
                }}>
                  <feature.icon width={40} height={40} color="white" />
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#1F2937',
                  marginBottom: '1rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: '#6B7280',
                  lineHeight: '1.6'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{
        padding: '4rem 1.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '1rem',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.7)'
            }}>
              Our Services
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#1F2937',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '1rem 2rem',
              borderRadius: '1rem',
              display: 'inline-block',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              Comprehensive transportation solutions for every need
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <TruckIcon width={32} height={32} color="#F59E0B" />
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#1F2937',
                  marginLeft: '1rem'
                }}>
                  Public Transport
                </h3>
              </div>
              <p style={{ color: '#6B7280', marginBottom: '1rem' }}>
                Reliable city-wide bus services with real-time tracking and digital ticketing.
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['Real-time GPS tracking', 'Digital payment options', 'Route optimization', 'Accessibility features'].map((item, i) => (
                  <li key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    color: '#4B5563'
                  }}>
                    <CheckCircleIcon width={16} height={16} color="#10B981" style={{ marginRight: '0.5rem' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <UserGroupIcon width={32} height={32} color="#3B82F6" />
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#1F2937',
                  marginLeft: '1rem'
                }}>
                  Private Fleet Management
                </h3>
              </div>
              <p style={{ color: '#6B7280', marginBottom: '1rem' }}>
                Complete fleet management solutions for schools, offices, and private companies.
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['Fleet monitoring', 'Driver management', 'Maintenance scheduling', 'Cost analytics'].map((item, i) => (
                  <li key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    color: '#4B5563'
                  }}>
                    <CheckCircleIcon width={16} height={16} color="#10B981" style={{ marginRight: '0.5rem' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{
        padding: '4rem 1.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontWeight: 'bold',
              color: '#1F2937',
              marginBottom: '1rem'
            }}>
              What Our Users Say
            </h2>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '2rem',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.2)'
                }}
              >
                <div style={{ display: 'flex', marginBottom: '1rem' }}>
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
                <p style={{
                  color: '#4B5563',
                  fontStyle: 'italic',
                  marginBottom: '1.5rem',
                  lineHeight: '1.6'
                }}>
                  {/* FIX: Replaced " with HTML entities */}
                  &ldquo;{testimonial.comment}&rdquo;
                </p>
                <div>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#1F2937'
                  }}>
                    {testimonial.name}
                  </div>
                  <div style={{
                    color: '#6B7280',
                    fontSize: '0.9rem'
                  }}>
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{
        padding: '4rem 1.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '2rem',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.7)'
          }}>
            Get in Touch
          </h2>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '3rem',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(251, 191, 36, 0.3)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <PhoneIcon width={32} height={32} color="#F59E0B" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: '600', color: '#1F2937' }}>Phone</div>
                <div style={{ color: '#6B7280' }}>+94 11 234 5678</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <EnvelopeIcon width={32} height={32} color="#F59E0B" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: '600', color: '#1F2937' }}>Email</div>
                <div style={{ color: '#6B7280' }}>info@sriexpress.lk</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <MapPinIcon width={32} height={32} color="#F59E0B" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: '600', color: '#1F2937' }}>Address</div>
                <div style={{ color: '#6B7280' }}>Colombo, Sri Lanka</div>
              </div>
            </div>
            
            <Link
              href="/register"
              className="button-hover"
              style={{
                backgroundColor: '#F59E0B',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '1.1rem',
                boxShadow: '0 4px 6px rgba(245, 158, 11, 0.5)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Start Your Journey
              <ArrowRightIcon width={20} height={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        color: 'white',
        padding: '3rem 1.5rem 1.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#F59E0B',
              marginRight: '0.5rem'
            }}>
              ශ්‍රී
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              Express
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            <div>
              <h4 style={{ marginBottom: '1rem', color: '#F59E0B' }}>Services</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#D1D5DB', textDecoration: 'none' }}>Public Transport</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#D1D5DB', textDecoration: 'none' }}>Fleet Management</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#D1D5DB', textDecoration: 'none' }}>Route Planning</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem', color: '#F59E0B' }}>Support</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#D1D5DB', textDecoration: 'none' }}>Help Center</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#D1D5DB', textDecoration: 'none' }}>Contact Us</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#D1D5DB', textDecoration: 'none' }}>Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem', color: '#F59E0B' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#D1D5DB', textDecoration: 'none' }}>About Us</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#D1D5DB', textDecoration: 'none' }}>Careers</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#D1D5DB', textDecoration: 'none' }}>News</a></li>
              </ul>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '1.5rem',
            color: '#9CA3AF'
          }}>
            <p>&copy; 2025 Sri Express. All rights reserved. | Transforming transportation in Sri Lanka</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
