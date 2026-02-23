import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// South Indian style loading spinner component
const LotusLoader = () => (
  <div className="flex flex-col items-center justify-center">
    <div className="relative w-16 h-16">
      {/* Rotating outer petals */}
      <div className="absolute inset-0 animate-spin-slow">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-6 rounded-full"
            style={{
              background: 'linear-gradient(to top, #D4AF37, #F5DEB3)',
              left: '50%',
              top: '50%',
              transformOrigin: '50% 0%',
              transform: `translateX(-50%) rotate(${i * 45}deg) translateY(-12px)`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>
      {/* Center circle */}
      <div 
        className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ background: 'linear-gradient(135deg, #8B0000, #CD5C5C)' }}
      />
    </div>
    <p 
      className="mt-4 text-sm tracking-widest"
      style={{ 
        color: '#D4AF37', 
        fontFamily: "'Playfair Display', serif",
        animation: 'pulse 1.5s ease-in-out infinite'
      }}
    >
      Loading...
    </p>
  </div>
);

export default function LandingPage() {
  const [showMenu, setShowMenu] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [landingBgLoaded, setLandingBgLoaded] = useState(false);
  const [menuBgLoaded, setMenuBgLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  // Detect mobile vs desktop
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preload landing page background
  useEffect(() => {
    const img = new Image();
    img.src = isMobile ? '/landing-mobile.jpg' : '/landing-desktop.jpg';
    img.onload = () => setLandingBgLoaded(true);
  }, [isMobile]);

  // Preload the courtyard background image
  useEffect(() => {
    const img = new Image();
    img.src = '/temple-courtyard-bg.png';
    img.onload = () => setMenuBgLoaded(true);
  }, []);

  const handleBegin = () => {
    // Play temple bell sound (user-triggered) with fade out
    try {
      const bellSound = new Audio('/temple-bell.mp3');
      bellSound.volume = 0.6;
      bellSound.play().catch(err => console.log('Audio play error:', err));
      
      // After 5 seconds, start fading out over 2 seconds
      setTimeout(() => {
        const fadeOut = setInterval(() => {
          if (bellSound.volume > 0.05) {
            bellSound.volume = Math.max(0, bellSound.volume - 0.05);
          } else {
            bellSound.pause();
            clearInterval(fadeOut);
          }
        }, 100); // Fade step every 100ms
      }, 5000);
    } catch (err) {
      console.log('Audio error:', err);
    }
    
    // Start transition
    setIsTransitioning(true);
    
    // After fade out, show courtyard menu
    setTimeout(() => {
      setShowMenu(true);
      // Stagger menu items appearance only after bg is loaded
      if (menuBgLoaded) {
        setTimeout(() => setMenuVisible(true), 100);
      }
    }, 800);
  };

  // When menu bg loads and we're on menu screen, show items
  useEffect(() => {
    if (showMenu && menuBgLoaded && !menuVisible) {
      setTimeout(() => setMenuVisible(true), 100);
    }
  }, [showMenu, menuBgLoaded, menuVisible]);

  const menuItems = [
    { label: "The Couple", path: "/story" },
    { label: "The Celebration", path: "/celebration" },
    { label: "Sacred Ceremonies", path: "/rituals" },
    { label: "Gifts & Blessings", path: "/blessings" },
  ];

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {/* Temple bell audio - deep, resonant sound */}
      <audio ref={audioRef} src="/temple-bell.mp3" preload="auto" />

      {/* Preload courtyard background */}
      <link rel="preload" as="image" href="/temple-courtyard-bg.png" />

      {/* Initial Full-Page Cover View */}
      {!showMenu && (
        <div
          className={`fixed inset-0 transition-opacity duration-700 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
          style={{
            backgroundImage: landingBgLoaded ? `url('${isMobile ? '/landing-mobile.jpg' : '/landing-desktop.jpg'}')` : 'none',
            backgroundColor: '#5C4033',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Loading state for landing page */}
          {!landingBgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LotusLoader />
            </div>
          )}

          {/* Begin Button - only show after background loads */}
          {landingBgLoaded && (
            <button
              onClick={handleBegin}
              className="group absolute left-1/2 -translate-x-1/2 px-12 py-3 transition-all duration-500 animate-fade-in"
              style={{
                top: isMobile ? '78%' : '82%',
                background: '#FFFAF0',
                border: '2px solid #D4AF37',
                borderRadius: '4px',
                color: "#8B4513",
                fontFamily: "'Great Vibes', cursive",
                fontSize: isMobile ? "1.5rem" : "1.8rem",
                boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
              }}
              data-testid="begin-btn"
            >
              <span className="relative z-10">Begin the Journey</span>
              {/* Golden glow on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
              style={{
                borderRadius: '4px',
                boxShadow: '0 0 30px rgba(212, 175, 55, 0.6), 0 0 60px rgba(212, 175, 55, 0.3)',
              }}
            />
            </button>
          )}
        </div>
      )}

      {/* Courtyard Menu View */}
      {showMenu && (
        <div
          className={`fixed inset-0 flex items-center justify-center ${menuBgLoaded ? 'animate-fade-in' : ''}`}
          style={{
            backgroundImage: menuBgLoaded ? `url('/temple-courtyard-bg.png')` : 'none',
            backgroundColor: '#5C4033',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Loading state for menu */}
          {!menuBgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LotusLoader />
            </div>
          )}

          {/* Subtle center vignette - not too dark */}
          {menuBgLoaded && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.3) 100%)',
              }}
            />
          )}

          {/* Menu Items - only show after background loads */}
          {menuBgLoaded && (
            <nav className="relative z-10 flex flex-col items-center px-6">
              {menuItems.map((item, index) => (
                <div
                  key={item.path}
                  className={`transition-all duration-500 ${
                    menuVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Divider (except before first item) */}
                  {index > 0 && (
                    <div className="flex items-center justify-center my-2 sm:my-3">
                      <span 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ 
                          backgroundColor: "#D4AF37",
                          boxShadow: "0 0 10px rgba(212, 175, 55, 0.8)",
                        }}
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={() => navigate(item.path)}
                    className="group relative text-center py-2 px-8 menu-button-mobile"
                    data-testid={`menu-${item.path.slice(1)}`}
                  >
                    {/* Subtle visible button shape on mobile - golden ghost button effect */}
                    <span 
                      className="absolute inset-0 rounded-lg transition-all duration-300 
                        menu-btn-glow sm:opacity-0 group-hover:opacity-100"
                      style={{
                        backgroundColor: 'rgba(255, 250, 240, 0.12)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        boxShadow: '0 0 12px rgba(212, 175, 55, 0.25), inset 0 0 8px rgba(212, 175, 55, 0.1)',
                      }}
                    />
                    {/* Full cream backdrop on hover */}
                    <span 
                      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                      style={{
                        backgroundColor: '#FFFAF0',
                        boxShadow: '0 0 30px rgba(212, 175, 55, 0.8), 0 0 60px rgba(212, 175, 55, 0.5)',
                      }}
                    />
                    {/* Text with shadow, gold color on hover */}
                    <span 
                      className="relative z-10 text-xl sm:text-2xl lg:text-3xl transition-all duration-300"
                      style={{
                        color: "#FFFAF0",
                        fontFamily: "'Playfair Display', Georgia, serif",
                        letterSpacing: "0.1em",
                        textShadow: `
                          0 0 20px rgba(0,0,0,0.9),
                          0 0 40px rgba(0,0,0,0.8),
                          0 2px 4px rgba(0,0,0,0.9),
                          0 4px 8px rgba(0,0,0,0.7)
                        `,
                      }}
                    >
                      <span className="group-hover:hidden">{item.label}</span>
                      <span 
                        className="hidden group-hover:inline"
                        style={{ 
                          color: '#8B4513',
                          textShadow: '0 0 20px rgba(212, 175, 55, 0.8), 0 0 40px rgba(212, 175, 55, 0.6)'
                        }}
                      >
                        {item.label}
                      </span>
                    </span>
                  </button>
                </div>
              ))}
            </nav>
          )}
        </div>
      )}

      <style jsx="true">{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        /* Mobile menu button glow - subtle golden ghost button effect */
        @media (max-width: 639px) {
          .menu-btn-glow {
            opacity: 1 !important;
            background-color: rgba(255, 250, 240, 0.15) !important;
            border: 1px solid rgba(212, 175, 55, 0.5) !important;
            animation: subtle-glow 3s ease-in-out infinite;
          }
          @keyframes subtle-glow {
            0%, 100% { 
              box-shadow: 0 0 12px rgba(212, 175, 55, 0.25), inset 0 0 8px rgba(212, 175, 55, 0.1);
            }
            50% { 
              box-shadow: 0 0 18px rgba(212, 175, 55, 0.35), inset 0 0 12px rgba(212, 175, 55, 0.15);
            }
          }
        }
      `}</style>
    </div>
  );
}
