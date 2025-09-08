// D:/SRI_EXPRESS/PublicPage/src/app/sysadmin/components/AnimatedBackground.tsx
'use client';
import React from 'react';

// --- Type Definition for Theme Styles ---
// It's good practice to define the shape of the props your component expects.
interface ThemeStyles {
  bgGradient: string;
}

interface AnimatedBackgroundProps {
  currentThemeStyles: ThemeStyles;
}

// --- Animation Styles ---
// All the keyframes and animation classes are kept here.
const animationStyles = `
  @keyframes road-marking { 0% { transform: translateX(-200%); } 100% { transform: translateX(500%); } }
  .animate-road-marking { animation: road-marking 10s linear infinite; }
  @keyframes car-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(100vw); } }
  .animate-car-right { animation: car-right 25s linear infinite; }
  .animate-car-right-slow { animation: car-right 30s linear infinite; }
  .animate-car-right-slower { animation: car-right 35s linear infinite; }
    .animate-car-right-slowest { animation: car-right 50s linear infinite; }
  @keyframes car-left { 0% { transform: translateX(0px) scaleX(-1); } 100% { transform: translateX(-2000px) scaleX(-1); } }
  .animate-car-left { animation: car-left 30s linear infinite; }
  @keyframes light-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } }
  .animate-light-blink { animation: light-blink 1s infinite; }
  @keyframes trainMove { from { left: 100%; } to { left: -300px; } }
  @keyframes slight-bounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-1px); } }
  .animate-slight-bounce { animation: slight-bounce 2s ease-in-out infinite; }
  @keyframes steam { 0% { opacity: 0.8; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-20px) scale(2.5); } }
  .animate-steam { animation: steam 2s ease-out infinite; }
  @keyframes wheels { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
  .animate-wheels { animation: wheels 2s linear infinite; }
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
  .animation-delay-3500 { animation-delay: 3.5s; }
  .animation-delay-4000 { animation-delay: 4s; }
  .animation-delay-5000 { animation-delay: 5s; }
  .animation-delay-6000 { animation-delay: 6s; }
  .animation-delay-8000 { animation-delay: 8s; }
  .animation-delay-10000 { animation-delay: 10s; }
  .animation-delay-12000 { animation-delay: 12s; }
  .animation-delay-15000 { animation-delay: 15s; }
  .animation-delay-16000 { animation-delay: 16s; }
  .animation-delay-20000 { animation-delay: 20s; }
  .animation-delay-25000 { animation-delay: 25s; }
  .animation-delay-30000 { animation-delay: 30s; }
  .animation-delay-35000 { animation-delay: 35s; }
`;

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ currentThemeStyles }) => {
  return (
    <>
      <style jsx>{animationStyles}</style>
      <div style={{ position: 'absolute', inset: 0, background: currentThemeStyles.bgGradient, zIndex: 0, overflow: 'visible' }}>
        {/* --- Top Road --- */}
        <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', backgroundColor: '#1f2937', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', zIndex: 2, overflow: 'visible' }}></div>
        <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', zIndex: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'visible' }}>
          <div style={{ width: '100%', height: '5px', background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 30px, transparent 30px, transparent 60px)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}></div>
        </div>

        {/* --- Middle Road --- */}
        <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '80px', backgroundColor: '#1f2937', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)', zIndex: 2, overflow: 'visible' }}></div>
        <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '80px', zIndex: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'visible' }}>
            <div style={{ width: '100%', height: '4px', background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 20px, transparent 20px, transparent 40px)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}></div>
        </div>

        {/* --- Railway --- */}
        <div style={{ position: 'absolute', top: '85%', left: 0, right: 0, height: '50px', background: 'linear-gradient(to bottom, #4b5563 0%, #374151 100%)', boxShadow: '0 5px 10px -3px rgba(0, 0, 0, 0.3)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', top: '85%', left: 0, right: 0, height: '50px', overflow: 'visible', zIndex: 3 }}>
            <div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: '6px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', zIndex: 4 }}></div>
            <div style={{ position: 'absolute', top: '65%', left: 0, right: 0, height: '6px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', zIndex: 4 }}></div>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', display: 'flex', gap: '15px', zIndex: 3 }}>
                {Array(30).fill(0).map((_, i) => (<div key={i} style={{ width: '20px', height: '100%', background: 'linear-gradient(to bottom, #92400e 0%, #7c2d12 70%, #713f12 100%)', marginLeft: `${i * 30}px`, boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.5)', border: '1px solid #78350f' }}></div>))}
            </div>
        </div>

        {/* --- Animated Vehicles --- */}
        {/* Train */}
        <div className="animate-slight-bounce" style={{ position: 'absolute', top: '85%', marginTop: '-15px', left: '100%', height: '70px', width: '300px', zIndex: 6, pointerEvents: 'none', display: 'flex', animation: 'trainMove 25s linear infinite', filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.2))' }}>
            <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                {/* Engine */}
                <div style={{ position: 'relative', width: '110px', height: '60px', marginRight: '5px' }}>
                    <div style={{ position: 'absolute', bottom: '12px', left: '8px', width: '85%', height: '30px', background: 'linear-gradient(to bottom, #b91c1c 0%, #9f1239 60%, #7f1d1d 100%)', borderRadius: '8px 5px 5px 5px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', border: '1px solid #7f1d1d' }}></div>
                    <div style={{ position: 'absolute', bottom: '42px', right: '10px', width: '60px', height: '30px', background: 'linear-gradient(to bottom, #7f1d1d 0%, #681e1e 100%)', borderRadius: '6px 6px 0 0', border: '1px solid #601414', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}></div>
                    <div style={{ position: 'absolute', bottom: '72px', right: '8px', width: '65px', height: '5px', background: '#4c1d95', borderRadius: '2px', boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)' }}></div>
                    <div style={{ position: 'absolute', bottom: '5px', left: '0', width: '15px', height: '18px', background: 'linear-gradient(135deg, #9f1239 0%, #7f1d1d 100%)', clipPath: 'polygon(0 0, 100% 0, 100% 35%, 50% 100%, 0 35%)', borderRadius: '2px' }}></div>
                    <div style={{ position: 'absolute', bottom: '15px', left: '3px', width: '10px', height: '4px', backgroundColor: '#64748b', borderRadius: '1px', border: '1px solid #475569' }}></div>
                    <div style={{ position: 'absolute', top: '3px', left: '40px', padding: '3px 5px', backgroundColor: '#fef3c7', borderRadius: '3px', border: '1px solid #7f1d1d', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)', fontSize: '9px', fontWeight: 'bold', color: '#7f1d1d', whiteSpace: 'nowrap', fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif", zIndex: 10, transform: 'rotate(-2deg)' }}>දුම්රිය සේවය</div>
                    <div style={{ position: 'absolute', bottom: '42px', left: '22px', width: '14px', height: '18px', background: 'linear-gradient(to bottom, #27272a 0%, #18181b 100%)', borderRadius: '4px 4px 0 0', border: '1px solid #111', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '16px', height: '4px', background: 'linear-gradient(to bottom, #cbd5e1 0%, #94a3b8 100%)', borderRadius: '4px 4px 0 0', border: '1px solid #64748b' }}></div>
                        <div className="animate-steam" style={{ position: 'absolute', top: '-15px', left: '-2px', width: '18px', height: '15px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.9 }}></div>
                        <div className="animate-steam animation-delay-200" style={{ position: 'absolute', top: '-12px', left: '4px', width: '16px', height: '14px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.85 }}></div>
                        <div className="animate-steam animation-delay-400" style={{ position: 'absolute', top: '-18px', left: '2px', width: '20px', height: '18px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.9 }}></div>
                        <div className="animate-steam animation-delay-600" style={{ position: 'absolute', top: '-14px', left: '-4px', width: '17px', height: '15px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.8 }}></div>
                        <div className="animate-steam animation-delay-800" style={{ position: 'absolute', top: '-22px', left: '1px', width: '22px', height: '20px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.7 }}></div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '42px', left: '45px', width: '8px', height: '10px', background: 'linear-gradient(to bottom, #fbbf24 0%, #d97706 100%)', borderRadius: '4px 4px 8px 8px', border: '1px solid #b45309' }}></div>
                    <div style={{ position: 'absolute', bottom: '42px', left: '60px', width: '6px', height: '8px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', borderRadius: '3px 3px 0 0', border: '1px solid #475569' }}></div>
                    <div className="animate-wheels" style={{ position: 'absolute', bottom: '0', left: '15px', width: '24px', height: '24px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}>
                        <div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div>
                        <div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #cbd5e1 10deg, #cbd5e1 15deg, transparent 15deg, transparent 55deg, #cbd5e1 55deg, #cbd5e1 60deg, transparent 60deg, transparent 100deg, #cbd5e1 100deg, #cbd5e1 105deg, transparent 105deg, transparent 145deg, #cbd5e1 145deg, #cbd5e1 150deg, transparent 150deg, transparent 190deg, #cbd5e1 190deg, #cbd5e1 195deg, transparent 195deg, transparent 235deg, #cbd5e1 235deg, #cbd5e1 240deg, transparent 240deg, transparent 280deg, #cbd5e1 280deg, #cbd5e1 285deg, transparent 285deg, transparent 325deg, #cbd5e1 325deg, #cbd5e1 330deg, transparent 330deg)', borderRadius: '50%' }}></div>
                        <div style={{ position: 'absolute', top: 'calc(50% - 4px)', left: 'calc(50% - 4px)', width: '8px', height: '8px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div>
                    </div>
                    <div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '25px', width: '24px', height: '24px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}>
                        <div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div>
                        <div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #cbd5e1 10deg, #cbd5e1 15deg, transparent 15deg, transparent 55deg, #cbd5e1 55deg, #cbd5e1 60deg, transparent 60deg, transparent 100deg, #cbd5e1 100deg, #cbd5e1 105deg, transparent 105deg, transparent 145deg, #cbd5e1 145deg, #cbd5e1 150deg, transparent 150deg, transparent 190deg, #cbd5e1 190deg, #cbd5e1 195deg, transparent 195deg, transparent 235deg, #cbd5e1 235deg, #cbd5e1 240deg, transparent 240deg, transparent 280deg, #cbd5e1 280deg, #cbd5e1 285deg, transparent 285deg, transparent 325deg, #cbd5e1 325deg, #cbd5e1 330deg, transparent 330deg)', borderRadius: '50%' }}></div>
                        <div style={{ position: 'absolute', top: 'calc(50% - 4px)', left: 'calc(50% - 4px)', width: '8px', height: '8px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div>
                    </div>
                    <div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '60px', width: '24px', height: '24px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}>
                        <div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div>
                        <div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #cbd5e1 10deg, #cbd5e1 15deg, transparent 15deg, transparent 55deg, #cbd5e1 55deg, #cbd5e1 60deg, transparent 60deg, transparent 100deg, #cbd5e1 100deg, #cbd5e1 105deg, transparent 105deg, transparent 145deg, #cbd5e1 145deg, #cbd5e1 150deg, transparent 150deg, transparent 190deg, #cbd5e1 190deg, #cbd5e1 195deg, transparent 195deg, transparent 235deg, #cbd5e1 235deg, #cbd5e1 240deg, transparent 240deg, transparent 280deg, #cbd5e1 280deg, #cbd5e1 285deg, transparent 285deg, transparent 325deg, #cbd5e1 325deg, #cbd5e1 330deg, transparent 330deg)', borderRadius: '50%' }}></div>
                        <div style={{ position: 'absolute', top: 'calc(50% - 4px)', left: 'calc(50% - 4px)', width: '8px', height: '8px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '24px', left: '22px', width: '30px', height: '8px', backgroundColor: '#64748b', borderRadius: '4px', border: '1px solid #475569', zIndex: 3 }}></div>
                    <div style={{ position: 'absolute', bottom: '47px', right: '15px', width: '15px', height: '12px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '2px solid #7f1d1d', boxShadow: 'inset 0 0 4px rgba(255, 255, 255, 0.5)' }}></div>
                    <div style={{ position: 'absolute', bottom: '47px', right: '40px', width: '15px', height: '12px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '2px solid #7f1d1d', boxShadow: 'inset 0 0 4px rgba(255, 255, 255, 0.5)' }}></div>
                    <div className="animate-light-blink" style={{ position: 'absolute', bottom: '22px', left: '3px', width: '10px', height: '10px', background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', boxShadow: '0 0 15px #fcd34d, 0 0 5px #fef3c7', border: '1px solid #b45309' }}></div>
                </div>
                {/* Carriage 1 */}
                <div style={{ position: 'relative', width: '90px', height: '40px', marginTop: '15px', marginRight: '5px' }}>
                    <div style={{ position: 'absolute', bottom: '5px', width: '100%', height: '28px', background: 'linear-gradient(to bottom, #dc2626 0%, #be123c 60%, #9f1239 100%)', borderRadius: '4px', boxSizing: 'border-box', border: '1px solid #881337', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
                        <div style={{ position: 'absolute', top: '18px', left: '0', width: '100%', height: '3px', backgroundColor: '#fbbf24', opacity: 0.8 }}></div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '33px', left: '2px', width: '96%', height: '4px', background: 'linear-gradient(to bottom, #7f1d1d 0%, #881337 100%)', borderRadius: '40% 40% 0 0 / 100% 100% 0 0', boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)' }}></div>
                    <div style={{ position: 'absolute', top: '5px', left: '10px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #881337', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div>
                    <div style={{ position: 'absolute', top: '5px', left: '35px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #881337', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div>
                    <div style={{ position: 'absolute', top: '5px', left: '60px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #881337', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div>
                    <div className="animate-wheels" style={{ position: 'absolute', bottom: '0', left: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}>
                        <div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div>
                        <div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div>
                    </div>
                    <div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}>
                        <div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div>
                        <div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div>
                    </div>
                </div>
                {/* Carriage 2 */}
                <div style={{ position: 'relative', width: '90px', height: '40px', marginTop: '15px' }}>
                    <div style={{ position: 'absolute', bottom: '5px', width: '100%', height: '28px', background: 'linear-gradient(to bottom, #c026d3 0%, #a21caf 60%, #86198f 100%)', borderRadius: '4px', boxSizing: 'border-box', border: '1px solid #701a75', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
                        <div style={{ position: 'absolute', top: '18px', left: '0', width: '100%', height: '3px', backgroundColor: '#fbbf24', opacity: 0.8 }}></div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '33px', left: '2px', width: '96%', height: '4px', background: 'linear-gradient(to bottom, #701a75 0%, #86198f 100%)', borderRadius: '40% 40% 0 0 / 100% 100% 0 0', boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)' }}></div>
                    <div style={{ position: 'absolute', top: '5px', left: '10px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #701a75', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div>
                    <div style={{ position: 'absolute', top: '5px', left: '35px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #701a75', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div>
                    <div style={{ position: 'absolute', top: '5px', left: '60px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #701a75', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div>
                    <div className="animate-light-blink animation-delay-500" style={{ position: 'absolute', bottom: '15px', right: '3px', width: '6px', height: '6px', background: 'radial-gradient(circle, #fef3c7 0%, #f87171 100%)', borderRadius: '50%', boxShadow: '0 0 8px #f87171', border: '1px solid #7f1d1d' }}></div>
                    <div className="animate-wheels" style={{ position: 'absolute', bottom: '0', left: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}>
                        <div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div>
                        <div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div>
                    </div>
                    <div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}>
                        <div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div>
                        <div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div>
                        <div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '15px', left: '-8px', width: '10px', height: '4px', backgroundColor: '#64748b', borderRadius: '1px', zIndex: 1 }}></div>
                </div>
            </div>
        </div>
        {/* School Bus */}
        <div className="animate-car-right animation-delay-8000" style={{ position: 'absolute', top: '15%', marginTop: '-20px', left: '-700px', width: '140px', height: '65px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* Main body */}
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '40px', background: 'linear-gradient(to bottom, #f97316 0%, #ea580c 70%, #c2410c 100%)', borderRadius: '10px 12px 6px 6px', border: '1px solid #9a3412', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.2), inset 2px 0 6px rgba(255, 255, 255, 0.3)' }}></div>
                {/* Roof */}
                <div style={{ position: 'absolute', top: '0', left: '8px', right: '8px', height: '14px', background: 'linear-gradient(to bottom, #ea580c 0%, #f97316 50%, #ea580c 100%)', borderRadius: '8px 10px 4px 4px', border: '1px solid #9a3412', boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)' }}></div>
                {/* Roof emergency hatch */}
                <div style={{ position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '6px', background: 'linear-gradient(to bottom, #c2410c 0%, #9a3412 100%)', borderRadius: '3px', border: '1px solid #9a3412', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)' }}></div>
                {/* Roof ventilation */}
                <div style={{ position: 'absolute', top: '3px', left: '20px', width: '80px', height: '4px', background: 'linear-gradient(to right, #c2410c 0%, #ea580c 50%, #c2410c 100%)', borderRadius: '2px', border: '1px solid #9a3412', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)' }}></div>
                <div style={{ position: 'absolute', bottom: '5px', left: '0', width: '35px', height: '35px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', borderRadius: '10px 4px 0 6px', boxShadow: 'inset 1px 1px 5px rgba(255, 255, 255, 0.4)' }}></div>
                <div style={{ position: 'absolute', top: '8px', left: '40px', right: '8px', height: '25px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '4px', border: '2px solid #c2410c', boxShadow: 'inset 0 0 8px rgba(255, 255, 255, 0.6)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
                        {[...Array(4)].map((_, i) => (<div key={i} style={{ flex: '1', height: '100%', borderRight: i < 3 ? '2px solid #c2410c' : 'none', position: 'relative' }}>{i % 2 === 1 && (<div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '6px', height: '8px', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '3px 3px 0 0' }}></div>)}</div>))}
                    </div>
                </div>
                <div style={{ position: 'absolute', top: '8px', left: '8px', width: '25px', height: '25px', background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '4px', border: '2px solid #c2410c', boxShadow: 'inset 0 0 6px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', top: '3px', left: '3px', width: '15px', height: '2px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)', borderRadius: '50%' }}></div></div>
                <div style={{ position: 'absolute', top: '35px', left: '50%', transform: 'translateX(-50%)', width: '40px', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #c2410c', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '4px', fontWeight: 'bold', color: '#c2410c' }}>SCHOOL BUS</div></div>
                <div style={{ position: 'absolute', bottom: '25px', left: '18px', width: '8px', height: '10px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '4px 4px 0 0' }}><div style={{ position: 'absolute', top: '2px', left: '1px', width: '2px', height: '1px', backgroundColor: '#f8fafc', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: '2px', right: '1px', width: '2px', height: '1px', backgroundColor: '#f8fafc', borderRadius: '50%' }}></div></div>
                <div style={{ position: 'absolute', bottom: '8px', left: '3px', width: '8px', height: '6px', background: 'linear-gradient(to right, #fef3c7 0%, #fcd34d 100%)', borderRadius: '40%', border: '1px solid #9a3412', boxShadow: '0 0 8px rgba(252, 211, 77, 0.7)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', width: '3px', height: '3px', background: 'radial-gradient(circle, #fef9c3 0%, #fef3c7 100%)', borderRadius: '50%' }}></div></div>
                <div style={{ position: 'absolute', bottom: '20px', left: '40px', width: '15px', height: '8px', background: 'linear-gradient(to bottom, #dc2626 0%, #b91c1c 100%)', borderRadius: '2px', border: '1px solid #7f1d1d' }}><div style={{ position: 'absolute', top: '1px', left: '2px', fontSize: '3px', fontWeight: 'bold', color: 'white' }}>STOP</div></div>
                <div style={{ position: 'absolute', bottom: '-7px', left: '18px', width: '18px', height: '18px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div>
                <div style={{ position: 'absolute', bottom: '-7px', right: '18px', width: '18px', height: '18px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div>
                <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '22px', height: '6px', backgroundColor: 'white', borderRadius: '2px', border: '1px solid #c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '3px', fontWeight: 'bold', color: '#1f2937' }}>SCH-321</div></div>
                <div style={{ position: 'absolute', bottom: '4px', right: '8px', width: '5px', height: '3px', background: 'linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%)', borderRadius: '0 2px 2px 0', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)' }}></div>
                <div className="animate-light-blink animation-delay-100" style={{ position: 'absolute', top: '3px', left: '5px', width: '6px', height: '6px', background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%', border: '1px solid #9a3412', boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}></div>
                <div className="animate-light-blink animation-delay-600" style={{ position: 'absolute', top: '3px', right: '5px', width: '6px', height: '6px', background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%', border: '1px solid #9a3412', boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}></div>
            </div>
        </div>
        {/* Double Decker Bus */}
        <div className="animate-car-right animation-delay-5000" style={{ position: 'absolute', top: '15%', marginTop: '-40px', left: '-180px', width: '180px', height: '96px', zIndex: 5, filter: 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.4))' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* Base shadow */}
                <div style={{ position: 'absolute', bottom: '-12px', left: '10px', right: '10px', height: '8px', background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, transparent 70%)', borderRadius: '50%', opacity: 0.3 }}></div>
                
                {/* Lower deck main body */}
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '44px', background: 'linear-gradient(145deg, #dc2626 0%, #b91c1c 40%, #991b1b 70%, #7f1d1d 100%)', borderRadius: '16px 12px 8px 8px', border: '1px solid #991b1b', boxShadow: 'inset 0 -4px 12px rgba(0, 0, 0, 0.3), inset 3px 0 8px rgba(255, 255, 255, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.1)' }}>
                    {/* Body panels */}
                    <div style={{ position: 'absolute', top: '8px', left: '32px', right: '32px', bottom: '8px', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(185, 28, 28, 0.1) 100%)', borderRadius: '8px', border: '1px solid #b91c1c', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}></div>
                </div>
                
                {/* Upper deck */}
                <div style={{ position: 'absolute', bottom: '44px', left: '18px', right: '18px', height: '36px', background: 'linear-gradient(145deg, #dc2626 0%, #b91c1c 40%, #991b1b 70%, #7f1d1d 100%)', borderRadius: '14px 14px 0 0', border: '1px solid #991b1b', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.3), inset 2px 0 6px rgba(255, 255, 255, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.1)' }}>
                    {/* Upper deck panels */}
                    <div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', bottom: '8px', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(185, 28, 28, 0.1) 100%)', borderRadius: '8px', border: '1px solid #b91c1c', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}></div>
                </div>
                
                {/* Roof with ventilation */}
                <div style={{ position: 'absolute', top: 0, left: '20px', right: '20px', height: '10px', background: 'linear-gradient(to bottom, #991b1b 0%, #dc2626 30%, #b91c1c 70%, #991b1b 100%)', borderRadius: '12px 12px 6px 6px', border: '1px solid #991b1b', boxShadow: 'inset 0 3px 6px rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                    {/* Roof vents */}
                    <div style={{ position: 'absolute', top: '4px', left: '16px', right: '16px', height: '4px', backgroundColor: '#991b1b', borderRadius: '2px', opacity: 0.6 }}></div>
                    <div style={{ position: 'absolute', top: '12px', left: '24px', right: '24px', height: '4px', backgroundColor: '#991b1b', borderRadius: '2px', opacity: 0.4 }}></div>
                </div>
                
                {/* Driver's cab */}
                <div style={{ position: 'absolute', bottom: '12px', left: 0, width: '36px', height: '36px', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)', borderRadius: '16px 10px 0 8px', boxShadow: 'inset 2px 2px 6px rgba(255, 255, 255, 0.3), inset -1px -1px 4px rgba(0, 0, 0, 0.2)' }}>
                    {/* Cab door outline */}
                    <div style={{ position: 'absolute', top: '4px', left: '4px', right: '4px', bottom: '24px', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, transparent 100%)', borderRadius: '8px', border: '1px solid #b91c1c' }}></div>
                </div>
                
                {/* Lower deck windows */}
                <div style={{ position: 'absolute', top: '38px', left: '42px', right: '22px', height: '20px', background: 'linear-gradient(160deg, rgba(135, 206, 235, 0.9) 0%, rgba(176, 224, 230, 0.7) 30%, rgba(219, 234, 254, 0.6) 70%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '6px', border: '2px solid #7f1d1d', boxShadow: 'inset 0 0 12px rgba(255, 255, 255, 0.7), 0 2px 4px rgba(0, 0, 0, 0.2)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
                        {Array(7).fill(0).map((_, i) => (
                            <div key={i} style={{ flex: '1', height: '100%', position: 'relative', borderRight: i < 6 ? '2px solid #7f1d1d' : 'none' }}>
                                {/* Window reflections */}
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '33%', background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.6) 0%, transparent 100%)' }}></div>
                                {/* Passenger silhouettes */}
                                {i % 3 === 1 && (
                                    <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '6px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '2px 2px 0 0' }}></div>
                                )}
                                {/* Interior details */}
                                {i % 2 === 0 && (
                                    <div style={{ position: 'absolute', bottom: '4px', left: '4px', width: '4px', height: '4px', background: '#fef3c7', borderRadius: '50%', opacity: 0.7 }}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Upper deck windows */}
                <div style={{ position: 'absolute', top: '12px', left: '32px', right: '32px', height: '22px', background: 'linear-gradient(160deg, rgba(135, 206, 235, 0.9) 0%, rgba(176, 224, 230, 0.7) 30%, rgba(219, 234, 254, 0.6) 70%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '6px', border: '2px solid #7f1d1d', boxShadow: 'inset 0 0 12px rgba(255, 255, 255, 0.7), 0 2px 4px rgba(0, 0, 0, 0.2)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} style={{ flex: '1', height: '100%', position: 'relative', borderRight: i < 5 ? '2px solid #7f1d1d' : 'none' }}>
                                {/* Window reflections */}
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '33%', background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.6) 0%, transparent 100%)' }}></div>
                                {/* Passenger silhouettes */}
                                {i % 2 === 1 && (
                                    <div style={{ position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '7px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '2px 2px 0 0' }}></div>
                                )}
                                {/* Upper deck interior lights */}
                                {i % 3 === 0 && (
                                    <div style={{ position: 'absolute', top: '4px', left: '4px', width: '4px', height: '4px', background: '#fef3c7', borderRadius: '50%', opacity: 0.8 }}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Driver window */}
                <div style={{ position: 'absolute', top: '18px', left: '6px', width: '24px', height: '28px', background: 'linear-gradient(160deg, rgba(135, 206, 235, 0.9) 0%, rgba(176, 224, 230, 0.7) 30%, rgba(219, 234, 254, 0.6) 70%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '6px', border: '2px solid #7f1d1d', boxShadow: 'inset 0 0 8px rgba(255, 255, 255, 0.7), 0 2px 4px rgba(0, 0, 0, 0.2)' }}>
                    {/* Window reflection */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '33%', background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.7) 0%, transparent 100%)', borderRadius: '4px 4px 0 0' }}></div>
                    {/* Windshield wipers */}
                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '16px', height: '2px', background: '#374151', borderRadius: '2px', opacity: 0.6, transform: 'rotate(15deg)' }}></div>
                </div>
                
                {/* Route displays */}
                <div style={{ position: 'absolute', top: '64px', left: '50%', transform: 'translateX(-50%)', width: '70px', height: '12px', backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: '4px', border: '2px solid #7f1d1d', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '6px', fontWeight: 'bold', color: '#7f1d1d', fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif", textAlign: 'center' }}>255 කොට්ටාව-ගල්කිස්ස</div>
                </div>
                
                {/* Front route number */}
                <div className="animate-light-blink" style={{ position: 'absolute', top: '24px', left: '2px', width: '18px', height: '14px', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '3px', border: '2px solid #7f1d1d', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 0 4px rgba(255, 255, 0, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#7f1d1d', textShadow: '0 0 2px rgba(255, 255, 0, 0.5)' }}>255</div>
                </div>
                
                {/* Side route number */}
                <div style={{ position: 'absolute', top: '45px', right: '2px', width: '16px', height: '10px', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '2px', border: '1px solid #7f1d1d', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '5px', fontWeight: 'bold', color: '#7f1d1d' }}>255</div>
                </div>
                
                {/* Driver silhouette */}
                <div style={{ position: 'absolute', bottom: '28px', left: '16px', width: '10px', height: '12px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '5px 5px 0 0' }}>
                    {/* Driver's head */}
                    <div style={{ position: 'absolute', top: '-4px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '12px', background: '#a16207', borderRadius: '50%', opacity: 0.9 }}></div>
                    {/* Driver's hands on steering wheel */}
                    <div style={{ position: 'absolute', top: '8px', left: '4px', width: '4px', height: '4px', background: '#a16207', borderRadius: '50%', opacity: 0.7 }}></div>
                    <div style={{ position: 'absolute', top: '8px', right: '4px', width: '4px', height: '4px', background: '#a16207', borderRadius: '50%', opacity: 0.7 }}></div>
                </div>
                
                {/* Side mirrors */}
                <div style={{ position: 'absolute', top: '32px', left: '-2px', width: '3px', height: '2px', background: 'linear-gradient(45deg, #64748b 0%, #94a3b8 100%)', borderRadius: '1px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}></div>
                
                {/* Headlights */}
                <div className="animate-light-blink" style={{ position: 'absolute', bottom: '22px', left: '2px', width: '10px', height: '8px', background: 'radial-gradient(circle, #fef9c3 0%, #fef3c7 30%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #7f1d1d', boxShadow: '0 0 12px rgba(252, 211, 77, 0.8), inset 0 0 4px rgba(255, 255, 255, 0.6)' }}>
                    <div style={{ position: 'absolute', top: '1px', left: '1px', width: '4px', height: '4px', background: 'radial-gradient(circle, #ffffff 0%, #fef9c3 100%)', borderRadius: '50%' }}></div>
                </div>
                
                <div className="animate-light-blink animation-delay-100" style={{ position: 'absolute', bottom: '12px', left: '2px', width: '10px', height: '8px', background: 'radial-gradient(circle, #fef9c3 0%, #fef3c7 30%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #7f1d1d', boxShadow: '0 0 12px rgba(252, 211, 77, 0.8), inset 0 0 4px rgba(255, 255, 255, 0.6)' }}>
                    <div style={{ position: 'absolute', top: '1px', left: '1px', width: '4px', height: '4px', background: 'radial-gradient(circle, #ffffff 0%, #fef9c3 100%)', borderRadius: '50%' }}></div>
                </div>
                
                {/* Wheels */}
                <div style={{ position: 'absolute', bottom: '-10px', left: '24px', width: '24px', height: '24px', backgroundColor: '#0f172a', borderRadius: '50%', border: '4px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.6)', overflow: 'hidden' }}>
                    <div className="animate-wheels" style={{ position: 'absolute', inset: '2px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #f8fafc 10%, #e2e8f0 20%, transparent 25%), conic-gradient(#cbd5e1 0deg, #cbd5e1 15deg, transparent 15deg, transparent 30deg, #cbd5e1 30deg, #cbd5e1 45deg, transparent 45deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 75deg, transparent 75deg, transparent 90deg, #cbd5e1 90deg, #cbd5e1 105deg, transparent 105deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 135deg, transparent 135deg, transparent 150deg, #cbd5e1 150deg, #cbd5e1 165deg, transparent 165deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 195deg, transparent 195deg, transparent 210deg, #cbd5e1 210deg, #cbd5e1 225deg, transparent 225deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 255deg, transparent 255deg, transparent 270deg, #cbd5e1 270deg, #cbd5e1 285deg, transparent 285deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 315deg, transparent 315deg, transparent 330deg, #cbd5e1 330deg, #cbd5e1 345deg, transparent 345deg, transparent 360deg)' }}>
                        {/* Center cap */}
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '8px', height: '8px', background: '#e2e8f0', borderRadius: '50%', border: '1px solid #64748b' }}></div>
                    </div>
                </div>
                
                <div style={{ position: 'absolute', bottom: '-10px', right: '24px', width: '24px', height: '24px', backgroundColor: '#0f172a', borderRadius: '50%', border: '4px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.6)', overflow: 'hidden' }}>
                    <div className="animate-wheels" style={{ position: 'absolute', inset: '2px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #f8fafc 10%, #e2e8f0 20%, transparent 25%), conic-gradient(#cbd5e1 0deg, #cbd5e1 15deg, transparent 15deg, transparent 30deg, #cbd5e1 30deg, #cbd5e1 45deg, transparent 45deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 75deg, transparent 75deg, transparent 90deg, #cbd5e1 90deg, #cbd5e1 105deg, transparent 105deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 135deg, transparent 135deg, transparent 150deg, #cbd5e1 150deg, #cbd5e1 165deg, transparent 165deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 195deg, transparent 195deg, transparent 210deg, #cbd5e1 210deg, #cbd5e1 225deg, transparent 225deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 255deg, transparent 255deg, transparent 270deg, #cbd5e1 270deg, #cbd5e1 285deg, transparent 285deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 315deg, transparent 315deg, transparent 330deg, #cbd5e1 330deg, #cbd5e1 345deg, transparent 345deg, transparent 360deg)' }}>
                        {/* Center cap */}
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '8px', height: '8px', background: '#e2e8f0', borderRadius: '50%', border: '1px solid #64748b' }}></div>
                    </div>
                </div>
                
                {/* License plate */}
                <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '32px', height: '8px', backgroundColor: 'white', borderRadius: '2px', border: '2px solid #7f1d1d', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '4px', fontWeight: 'bold', color: '#1f2937', letterSpacing: '0.5px' }}>WP BUS-255</div>
                </div>
                
                {/* Door handle */}
                <div style={{ position: 'absolute', bottom: '28px', right: '38px', width: '4px', height: '14px', background: 'linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%)', borderRadius: '2px', border: '1px solid #64748b', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.3)' }}></div>
                
                {/* Bus steps */}
                <div style={{ position: 'absolute', bottom: '8px', right: '35px', width: '8px', height: '3px', background: 'linear-gradient(to bottom, #64748b 0%, #475569 100%)', borderRadius: '1px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}></div>
                
                {/* Taillights */}
                <div className="animate-light-blink animation-delay-300" style={{ position: 'absolute', bottom: '18px', right: '2px', width: '8px', height: '6px', background: 'radial-gradient(circle, #fca5a5 0%, #f87171 50%, #ef4444 100%)', borderRadius: '3px', border: '1px solid #7f1d1d', boxShadow: '0 0 8px rgba(239, 68, 68, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.3)' }}></div>
                
                <div className="animate-light-blink animation-delay-800" style={{ position: 'absolute', bottom: '26px', right: '2px', width: '8px', height: '6px', background: 'radial-gradient(circle, #fca5a5 0%, #f87171 50%, #ef4444 100%)', borderRadius: '3px', border: '1px solid #7f1d1d', boxShadow: '0 0 8px rgba(239, 68, 68, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.3)' }}></div>
                
                {/* Indicator lights */}
                <div className="animate-light-blink animation-delay-1200" style={{ position: 'absolute', bottom: '34px', right: '2px', width: '6px', height: '4px', background: 'radial-gradient(circle, #fed7aa 0%, #fb923c 50%, #f59e0b 100%)', borderRadius: '2px', border: '1px solid #d97706', boxShadow: '0 0 6px rgba(245, 158, 11, 0.6)' }}></div>
                
                {/* Exhaust pipe */}
                <div style={{ position: 'absolute', bottom: '6px', right: '8px', width: '8px', height: '5px', background: 'linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%)', borderRadius: '0 3px 3px 0', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)' }}></div>
                
                {/* Exhaust smoke */}
                <div style={{ position: 'absolute', bottom: '8px', right: '4px', width: '8px', height: '8px', background: 'radial-gradient(circle, rgba(209, 213, 219, 0.7) 0%, rgba(209, 213, 219, 0) 70%)', borderRadius: '50%', opacity: 0.6, animation: 'steam 1.5s ease-out infinite' }}></div>
            </div>
        </div>
        {/* Motorcycle */}
        <div className="animate-car-right animation-delay-1000" style={{ position: 'absolute', top: '60%', marginTop: '40px', left: '-60px', width: '60px', height: '35px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <div style={{ position: 'absolute', bottom: '8px', left: '15px', width: '30px', height: '3px', background: 'linear-gradient(to bottom, #059669 0%, #047857 100%)', borderRadius: '2px', transform: 'rotate(10deg)', transformOrigin: 'left center' }}></div>
                <div style={{ position: 'absolute', bottom: '12px', left: '20px', width: '20px', height: '3px', background: 'linear-gradient(to bottom, #059669 0%, #047857 100%)', borderRadius: '2px', transform: 'rotate(-20deg)', transformOrigin: 'left center' }}></div>
                <div style={{ position: 'absolute', bottom: '18px', left: '22px', width: '8px', height: '3px', background: 'linear-gradient(to bottom, #1f2937 0%, #111827 100%)', borderRadius: '2px' }}></div>
                <div style={{ position: 'absolute', bottom: '20px', right: '15px', width: '10px', height: '2px', background: 'linear-gradient(to bottom, #6b7280 0%, #4b5563 100%)', borderRadius: '1px' }}></div>
                <div style={{ position: 'absolute', bottom: '22px', right: '18px', width: '2px', height: '8px', background: 'linear-gradient(to bottom, #6b7280 0%, #4b5563 100%)', borderRadius: '1px' }}></div>
                <div style={{ position: 'absolute', bottom: '0', right: '10px', width: '16px', height: '16px', backgroundColor: '#0f172a', borderRadius: '50%', border: '2px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, transparent 40%, #cbd5e1 40%, #cbd5e1 45%, transparent 45%), conic-gradient(#cbd5e1 0deg, #cbd5e1 10deg, transparent 10deg, transparent 80deg, #cbd5e1 80deg, #cbd5e1 90deg, transparent 90deg, transparent 170deg, #cbd5e1 170deg, #cbd5e1 180deg, transparent 180deg, transparent 260deg, #cbd5e1 260deg, #cbd5e1 270deg, transparent 270deg, transparent 350deg, #cbd5e1 350deg, #cbd5e1 360deg)' }}></div></div>
                <div style={{ position: 'absolute', bottom: '0', left: '8px', width: '16px', height: '16px', backgroundColor: '#0f172a', borderRadius: '50%', border: '2px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, transparent 40%, #cbd5e1 40%, #cbd5e1 45%, transparent 45%), conic-gradient(#cbd5e1 0deg, #cbd5e1 10deg, transparent 10deg, transparent 80deg, #cbd5e1 80deg, #cbd5e1 90deg, transparent 90deg, transparent 170deg, #cbd5e1 170deg, #cbd5e1 180deg, transparent 180deg, transparent 260deg, #cbd5e1 260deg, #cbd5e1 270deg, transparent 270deg, transparent 350deg, #cbd5e1 350deg, #cbd5e1 360deg)' }}></div></div>
                <div style={{ position: 'absolute', bottom: '16px', left: '18px', width: '8px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '4px 4px 0 0' }}><div style={{ position: 'absolute', top: '-6px', left: '1px', width: '6px', height: '6px', background: 'linear-gradient(to bottom, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%' }}><div style={{ position: 'absolute', top: '2px', left: '1px', width: '1px', height: '1px', backgroundColor: '#111827', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: '2px', right: '1px', width: '1px', height: '1px', backgroundColor: '#111827', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', top: '2px', right: '-6px', width: '8px', height: '2px', backgroundColor: '#3b82f6', borderRadius: '1px', transform: 'rotate(-15deg)' }}></div></div>
                <div style={{ position: 'absolute', bottom: '12px', right: '8px', width: '4px', height: '3px', background: 'linear-gradient(to left, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #047857', boxShadow: '0 0 6px rgba(252, 211, 77, 0.6)' }}></div>
                <div className="animate-light-blink animation-delay-800" style={{ position: 'absolute', bottom: '8px', left: '5px', width: '3px', height: '2px', background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', borderRadius: '1px', border: '1px solid #047857', boxShadow: '0 0 4px rgba(239, 68, 68, 0.6)' }}></div>
            </div>
        </div>
        {/* Taxi Cab */}
        <div className="animate-car-right animation-delay-15000" style={{ position: 'absolute', top: '60%', marginTop: '10px', left: '-110px', width: '110px', height: '50px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* Main body */}
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '28px', background: 'linear-gradient(to bottom, #fbbf24 0%, #f59e0b 70%, #d97706 100%)', borderRadius: '15px 10px 5px 5px', border: '1px solid #b45309' }}>
                    {/* Checker pattern */}
                    <div style={{ position: 'absolute', top: '8px', left: '5px', width: '15px', height: '10px', background: 'repeating-linear-gradient(45deg, #1f2937 0px, #1f2937 3px, #fbbf24 3px, #fbbf24 6px)', borderRadius: '2px' }}></div>
                    <div style={{ position: 'absolute', top: '8px', right: '25px', width: '15px', height: '10px', background: 'repeating-linear-gradient(45deg, #1f2937 0px, #1f2937 3px, #fbbf24 3px, #fbbf24 6px)', borderRadius: '2px' }}></div>
                </div>
                {/* Roof */}
                <div style={{ position: 'absolute', bottom: '28px', left: '20px', right: '25px', height: '15px', background: 'linear-gradient(to bottom, #d97706 0%, #f59e0b 100%)', borderRadius: '8px 8px 0 0', border: '1px solid #b45309' }}>
                    {/* Taxi sign */}
                    <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', width: '25px', height: '8px', background: 'linear-gradient(to bottom, #fef3c7 0%, #fbbf24 100%)', borderRadius: '3px', border: '1px solid #b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}>
                        <div style={{ fontSize: '4px', fontWeight: 'bold', color: '#1f2937' }}>TAXI</div>
                    </div>
                </div>
                {/* Windows */}
                <div style={{ position: 'absolute', top: '12px', right: '12px', width: '18px', height: '12px', background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '3px', border: '1px solid #b45309' }}></div>
                <div style={{ position: 'absolute', top: '12px', left: '28px', right: '35px', height: '12px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '3px 0 0 0', border: '1px solid #b45309' }}></div>
                {/* Headlight */}
                <div style={{ position: 'absolute', bottom: '10px', right: '3px', width: '8px', height: '6px', background: 'linear-gradient(to left, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #b45309', boxShadow: '0 0 8px rgba(252, 211, 77, 0.6)' }}></div>
                {/* Wheels */}
                <div className="animate-wheels" style={{ position: 'absolute', bottom: '-6px', right: '20px', width: '18px', height: '18px', background: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: '2px', borderRadius: '50%', background: 'radial-gradient(circle at center, #e2e8f0 20%, transparent 20%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 90deg, #cbd5e1 90deg, #cbd5e1 120deg, transparent 120deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 270deg, #cbd5e1 270deg, #cbd5e1 300deg, transparent 300deg)' }}></div>
                </div>
                <div className="animate-wheels" style={{ position: 'absolute', bottom: '-6px', left: '20px', width: '18px', height: '18px', background: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: '2px', borderRadius: '50%', background: 'radial-gradient(circle at center, #e2e8f0 20%, transparent 20%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 90deg, #cbd5e1 90deg, #cbd5e1 120deg, transparent 120deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 270deg, #cbd5e1 270deg, #cbd5e1 300deg, transparent 300deg)' }}></div>
                </div>
                {/* License plate */}
                <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '22px', height: '6px', background: 'white', borderRadius: '1px', border: '1px solid #b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
                    <div style={{ fontSize: '3px', fontWeight: 'bold', color: '#1f2937' }}>TAXI-123</div>
                </div>
                {/* Meter */}
                <div style={{ position: 'absolute', top: '18px', left: '35px', width: '8px', height: '6px', background: '#1f2937', borderRadius: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '2px', color: '#10b981' }}>$$$</div>
                </div>
                {/* Taillights */}
                <div className="animate-light-blink animation-delay-100" style={{ position: 'absolute', bottom: '8px', left: '3px', width: '6px', height: '4px', background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', borderRadius: '2px', border: '1px solid #b45309', boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)' }}></div>
                {/* Door handle */}
                <div style={{ position: 'absolute', bottom: '15px', right: '30px', width: '3px', height: '4px', background: 'linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%)', borderRadius: '1px', border: '1px solid #4b5563' }}></div>
                {/* Exhaust */}
                <div style={{ position: 'absolute', bottom: '4px', left: '8px', width: '5px', height: '3px', background: 'linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%)', borderRadius: '0 2px 2px 0', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)' }}></div>
                <div style={{ position: 'absolute', bottom: '4px', left: '3px', width: '6px', height: '6px', background: 'radial-gradient(circle, rgba(209, 213, 219, 0.8) 0%, rgba(209, 213, 219, 0) 70%)', borderRadius: '50%', opacity: 0.6, animation: 'steam 1.3s ease-out infinite' }}></div>
            </div>
        </div>
        {/* City Bus */}
        <div className="animate-car-right animation-delay-3000" style={{ position: 'absolute', top: '60%', marginTop: '5px', left: '-130px', width: '130px', height: '60px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* Main body */}
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '38px', background: 'linear-gradient(to bottom, #059669 0%, #047857 70%, #065f46 100%)', borderRadius: '12px 8px 6px 6px', border: '1px solid #064e3b', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.2), inset 2px 0 6px rgba(255, 255, 255, 0.3)' }}></div>
                {/* Roof */}
                <div style={{ position: 'absolute', top: '0', left: '8px', right: '8px', height: '12px', background: 'linear-gradient(to bottom, #047857 0%, #059669 50%, #047857 100%)', borderRadius: '8px 8px 4px 4px', border: '1px solid #064e3b', boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)' }}></div>
                {/* Roof ventilation */}
                <div style={{ position: 'absolute', top: '2px', left: '20px', width: '80px', height: '4px', background: 'linear-gradient(to right, #065f46 0%, #047857 50%, #065f46 100%)', borderRadius: '2px', border: '1px solid #064e3b', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)' }}></div>
                {/* Roof air conditioning unit */}
                <div style={{ position: 'absolute', top: '1px', right: '15px', width: '12px', height: '6px', background: 'linear-gradient(to bottom, #6b7280 0%, #4b5563 100%)', borderRadius: '2px', border: '1px solid #374151', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}></div>
                <div style={{ position: 'absolute', bottom: '5px', left: '0', width: '30px', height: '33px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', borderRadius: '12px 4px 0 6px', boxShadow: 'inset 1px 1px 5px rgba(255, 255, 255, 0.4)' }}></div>
                <div style={{ position: 'absolute', top: '8px', left: '35px', right: '8px', height: '22px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '4px', border: '2px solid #064e3b', boxShadow: 'inset 0 0 8px rgba(255, 255, 255, 0.6)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
                        {[...Array(5)].map((_, i) => (<div key={i} style={{ flex: '1', height: '100%', borderRight: i < 4 ? '2px solid #064e3b' : 'none', position: 'relative' }}>{i % 2 === 1 && (<div style={{ position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)', width: '5px', height: '6px', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '2px 2px 0 0' }}></div>)}</div>))}
                    </div>
                </div>
                <div style={{ position: 'absolute', top: '8px', left: '8px', width: '22px', height: '22px', background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '4px', border: '2px solid #064e3b', boxShadow: 'inset 0 0 6px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', top: '3px', left: '3px', width: '12px', height: '2px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)', borderRadius: '50%' }}></div></div>
                <div style={{ position: 'absolute', top: '32px', left: '50%', transform: 'translateX(-50%)', width: '45px', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #064e3b', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '4px', fontWeight: 'bold', color: '#064e3b', fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif" }}>නගර බස්</div></div>
                <div style={{ position: 'absolute', bottom: '25px', left: '15px', width: '8px', height: '8px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '4px 4px 0 0' }}><div style={{ position: 'absolute', top: '2px', left: '1px', width: '2px', height: '1px', backgroundColor: '#f8fafc', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: '2px', right: '1px', width: '2px', height: '1px', backgroundColor: '#f8fafc', borderRadius: '50%' }}></div></div>
                <div style={{ position: 'absolute', bottom: '8px', left: '3px', width: '8px', height: '6px', background: 'linear-gradient(to right, #fef3c7 0%, #fcd34d 100%)', borderRadius: '40%', border: '1px solid #064e3b', boxShadow: '0 0 8px rgba(252, 211, 77, 0.7)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', width: '3px', height: '3px', background: 'radial-gradient(circle, #fef9c3 0%, #fef3c7 100%)', borderRadius: '50%' }}></div></div>
                <div style={{ position: 'absolute', bottom: '20px', left: '40px', width: '12px', height: '6px', background: 'linear-gradient(to bottom, #1e40af 0%, #1d4ed8 100%)', borderRadius: '2px', border: '1px solid #1e3a8a' }}><div style={{ position: 'absolute', top: '1px', left: '1px', fontSize: '2px', fontWeight: 'bold', color: 'white' }}>CITY</div></div>
                <div style={{ position: 'absolute', bottom: '-7px', left: '15px', width: '18px', height: '18px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div>
                <div style={{ position: 'absolute', bottom: '-7px', right: '15px', width: '18px', height: '18px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div>
                <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '25px', height: '6px', backgroundColor: 'white', borderRadius: '2px', border: '1px solid #064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '3px', fontWeight: 'bold', color: '#1f2937' }}>CTB-456</div></div>
                <div style={{ position: 'absolute', bottom: '4px', right: '8px', width: '5px', height: '3px', background: 'linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%)', borderRadius: '0 2px 2px 0', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)' }}></div>
                <div className="animate-light-blink animation-delay-200" style={{ position: 'absolute', top: '3px', left: '5px', width: '6px', height: '6px', background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%', border: '1px solid #064e3b', boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}></div>
                <div className="animate-light-blink animation-delay-700" style={{ position: 'absolute', top: '3px', right: '5px', width: '6px', height: '6px', background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%', border: '1px solid #064e3b', boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}></div>
                <div style={{ position: 'absolute', bottom: '45px', left: '45px', width: '8px', height: '8px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '2px', border: '1px solid #064e3b', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div>
                <div style={{ position: 'absolute', bottom: '45px', right: '15px', width: '8px', height: '8px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '2px', border: '1px solid #064e3b', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div>
            </div>
        </div>

      </div>
    </>
  );
};

export default AnimatedBackground;
