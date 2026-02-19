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
    // Play temple bell sound (user-triggered)
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {});
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
    { label: "Our Story", path: "/story" },
    { label: "Sacred Ceremonies", path: "/rituals" },
    { label: "The Celebration", path: "/celebration" },
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
              <span className="relative z-10">Begin</span>
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
            backgroundSize: "contain",
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
                    <div className="flex items-center justify-center my-4 sm:my-5">
                      <span 
                        className="w-2 h-2 rounded-full"
                        style={{ 
                          backgroundColor: "#D4AF37",
                          boxShadow: "0 0 10px rgba(212, 175, 55, 0.8)",
                        }}
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={() => navigate(item.path)}
                    className="group relative text-center py-2 px-6"
                    data-testid={`menu-${item.path.slice(1)}`}
                  >
                    {/* Subtle backdrop behind each item */}
                    <span 
                      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        backgroundColor: 'rgba(139, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                    {/* Text with strong shadow for readability */}
                    <span 
                      className="relative z-10 font-signature text-3xl sm:text-4xl lg:text-5xl transition-all duration-300 group-hover:text-gold"
                      style={{
                        color: "#FFFAF0",
                        textShadow: `
                          0 0 20px rgba(0,0,0,0.9),
                          0 0 40px rgba(0,0,0,0.8),
                          0 2px 4px rgba(0,0,0,0.9),
                          0 4px 8px rgba(0,0,0,0.7),
                          2px 2px 8px rgba(0,0,0,0.8),
                          -2px -2px 8px rgba(0,0,0,0.8)
                        `,
                      }}
                    >
                      {item.label}
                    </span>
                    {/* Gold underline on hover */}
                    <span 
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-4/5 transition-all duration-300 bg-gold"
                      style={{
                        boxShadow: "0 0 10px rgba(212, 175, 55, 0.8)",
                      }}
                    />
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
      `}</style>
    </div>
  );
}
