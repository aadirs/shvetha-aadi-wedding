import { useState, useRef, useEffect } from "react";
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
      audioRef.current.volume = 0.35;
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
      {/* Temple bell audio */}
      <audio ref={audioRef} src="/temple-bell.mp3" preload="auto" />

      {/* Initial Emblem View */}
      {!showMenu && (
        <div
          className={`fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
          style={{
            background: "linear-gradient(180deg, #F5F0E6 0%, #EDE4D3 50%, #E8DCC8 100%)",
          }}
        >
          {/* Parchment texture overlay */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
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
            
            {/* Names */}
            <h1 
              className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-wide mb-10"
              style={{ 
                color: "#5C4033",
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: "0.15em"
              }}
            >
              Shvetha & Aadi
            </h1>

            {/* Begin Button */}
            <button
              onClick={handleBegin}
              className="group relative px-10 py-3 border transition-all duration-300 hover:shadow-lg"
              style={{
                borderColor: "#B8860B",
                borderWidth: "1px",
                background: "transparent",
                color: "#8B7355",
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: "0.2em",
                fontSize: "0.875rem",
              }}
              data-testid="begin-btn"
            >
              <span className="relative z-10">Begin</span>
              {/* Hover glow effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow: "0 0 20px rgba(184, 134, 11, 0.3)",
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
          <div className="absolute inset-0 bg-black/25" />

          {/* Sanskrit yantra watermark */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in-slow"
            style={{ animationDelay: "0.3s" }}
          >
            <svg 
              viewBox="0 0 400 400" 
              className="w-[500px] h-[500px] sm:w-[600px] sm:h-[600px]"
              style={{ opacity: 0.06 }}
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
                  <div className="flex items-center justify-center my-4 sm:my-5">
                    <span 
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: "#D4AF37", opacity: 0.6 }}
                    />
                  </div>
                )}
                
                <button
                  onClick={() => navigate(item.path)}
                  className="group relative text-center py-2 px-4"
                  data-testid={`menu-${item.path.slice(1)}`}
                >
                  <span 
                    className="font-serif text-xl sm:text-2xl lg:text-3xl transition-all duration-300"
                    style={{
                      color: "#FFF8E7",
                      fontFamily: "'Playfair Display', Georgia, serif",
                      letterSpacing: "0.1em",
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    {item.label}
                  </span>
                  {/* Gold underline on hover */}
                  <span 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 group-hover:w-full transition-all duration-300"
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
          to { opacity: 0.06; }
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
