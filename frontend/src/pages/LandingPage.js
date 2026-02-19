import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [showMenu, setShowMenu] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  // Preload the background image
  useEffect(() => {
    const img = new Image();
    img.src = '/temple-courtyard-bg.png';
    img.onload = () => setBgLoaded(true);
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
      // Stagger menu items appearance
      setTimeout(() => setMenuVisible(true), 100);
    }, 800);
  };

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

      {/* Preload background image (hidden) */}
      <link rel="preload" as="image" href="/temple-courtyard-bg.png" />

      {/* Initial Emblem View - matching blessings page crimson theme */}
      {!showMenu && (
        <div
          className={`fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
          style={{
            backgroundColor: "#8B0000", // crimson from blessings
          }}
        >
          {/* Mandala pattern overlay - matching blessings page */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='30' fill='none' stroke='%23D4AF37' stroke-width='0.5'/%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='%23D4AF37' stroke-width='0.3'/%3E%3Ccircle cx='40' cy='40' r='10' fill='none' stroke='%23D4AF37' stroke-width='0.3'/%3E%3C/svg%3E")`,
            }}
          />

          {/* SA Emblem */}
          <div className="relative z-10 flex flex-col items-center">
            <img
              src="/sa-emblem.png"
              alt="S&A Emblem"
              className="w-72 h-auto sm:w-96 lg:w-[450px] object-contain mb-8"
              data-testid="sa-emblem"
            />
            
            {/* Names - using font-signature like blessings page */}
            <h1 
              className="font-signature text-5xl sm:text-6xl lg:text-7xl text-white mb-10"
              data-testid="couple-names-landing"
            >
              Shvetha & Aadi
            </h1>

            {/* Begin Button - gold border, elegant */}
            <button
              onClick={handleBegin}
              className="group relative px-12 py-3 border-2 transition-all duration-300"
              style={{
                borderColor: "#D4AF37",
                background: "transparent",
                color: "#D4AF37",
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: "0.25em",
                fontSize: "0.875rem",
              }}
              data-testid="begin-btn"
            >
              <span className="relative z-10">Begin</span>
              {/* Hover glow effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow: "0 0 30px rgba(212, 175, 55, 0.4), inset 0 0 20px rgba(212, 175, 55, 0.1)",
                }}
              />
            </button>
          </div>
        </div>
      )}

      {/* Courtyard Menu View */}
      {showMenu && (
        <div
          className={`fixed inset-0 flex items-center justify-center ${bgLoaded ? 'animate-fade-in' : ''}`}
          style={{
            backgroundImage: bgLoaded ? `url('/temple-courtyard-bg.png')` : 'none',
            backgroundColor: '#5C4033',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark gradient overlay for better readability */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.7) 100%)',
            }}
          />

          {/* Menu Container with semi-transparent background */}
          <div 
            className="relative z-10 px-12 py-10 sm:px-16 sm:py-12 rounded-lg"
            style={{
              backgroundColor: 'rgba(139, 0, 0, 0.85)', // crimson with transparency
              backdropFilter: 'blur(8px)',
              boxShadow: '0 0 60px rgba(0,0,0,0.5), inset 0 0 30px rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
          >
            {/* Decorative top line */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-px bg-gold/50" />
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col items-center">
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
                      <span className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                    </div>
                  )}
                  
                  <button
                    onClick={() => navigate(item.path)}
                    className="group relative text-center py-2 px-4"
                    data-testid={`menu-${item.path.slice(1)}`}
                  >
                    {/* Using font-signature (Great Vibes) like blessings page titles */}
                    <span 
                      className="font-signature text-3xl sm:text-4xl lg:text-5xl transition-all duration-300 text-white group-hover:text-gold"
                    >
                      {item.label}
                    </span>
                    {/* Gold underline on hover */}
                    <span 
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-full transition-all duration-300 bg-gold"
                    />
                  </button>
                </div>
              ))}
            </nav>

            {/* Decorative bottom line */}
            <div className="flex justify-center mt-8">
              <div className="w-20 h-px bg-gold/50" />
            </div>
          </div>
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
      `}</style>
    </div>
  );
}
