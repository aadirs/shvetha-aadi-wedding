import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [showMenu, setShowMenu] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

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
            
            {/* Names - matching blessings page typography */}
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
          className="fixed inset-0 flex items-center justify-center animate-fade-in"
          style={{
            backgroundImage: `url('/temple-courtyard-bg.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Sanskrit yantra watermark */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in-slow"
            style={{ animationDelay: "0.3s" }}
          >
            <svg 
              viewBox="0 0 400 400" 
              className="w-[500px] h-[500px] sm:w-[600px] sm:h-[600px]"
              style={{ opacity: 0.07 }}
            >
              {/* Outer circle */}
              <circle cx="200" cy="200" r="180" fill="none" stroke="#D4AF37" strokeWidth="1" />
              <circle cx="200" cy="200" r="160" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
              <circle cx="200" cy="200" r="140" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
              {/* Inner geometric pattern */}
              <circle cx="200" cy="200" r="100" fill="none" stroke="#D4AF37" strokeWidth="1" />
              <circle cx="200" cy="200" r="60" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
              {/* Triangles forming Sri Yantra style */}
              <polygon points="200,80 280,260 120,260" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
              <polygon points="200,320 120,140 280,140" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
              {/* Center */}
              <circle cx="200" cy="200" r="10" fill="#D4AF37" fillOpacity="0.3" />
            </svg>
          </div>

          {/* Menu Content */}
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
                  <div className="flex items-center justify-center my-5 sm:my-6">
                    <span 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "#D4AF37", opacity: 0.7 }}
                    />
                  </div>
                )}
                
                <button
                  onClick={() => navigate(item.path)}
                  className="group relative text-center py-2 px-4"
                  data-testid={`menu-${item.path.slice(1)}`}
                >
                  <span 
                    className="font-serif text-2xl sm:text-3xl lg:text-4xl transition-all duration-300"
                    style={{
                      color: "#FFF8E7",
                      fontFamily: "'Playfair Display', Georgia, serif",
                      letterSpacing: "0.08em",
                      textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                    }}
                  >
                    {item.label}
                  </span>
                  {/* Gold underline on hover */}
                  <span 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-full transition-all duration-300"
                    style={{ backgroundColor: "#D4AF37" }}
                  />
                </button>
              </div>
            ))}
          </nav>
        </div>
      )}

      <style jsx="true">{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-slow {
          from { opacity: 0; }
          to { opacity: 0.07; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-fade-in-slow {
          animation: fade-in-slow 1.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
