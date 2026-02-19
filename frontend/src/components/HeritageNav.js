import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Our Story", path: "/story" },
  { label: "Sacred Ceremonies", path: "/rituals" },
  { label: "The Celebration", path: "/celebration" },
  { label: "Gifts & Blessings", path: "/blessings" },
];

export default function HeritageNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Desktop Navigation - crimson background matching blessings */}
      <nav 
        className="hidden md:flex items-center justify-center gap-8 py-4 px-6 bg-crimson"
        style={{ 
          borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
        }}
        data-testid="heritage-nav"
      >
        {navItems.map((item, index) => (
          <div key={item.path} className="flex items-center">
            {index > 0 && (
              <span 
                className="w-1 h-1 rounded-full mr-8 bg-gold"
                style={{ opacity: 0.5 }}
              />
            )}
            <Link
              to={item.path}
              className="group relative py-1"
              data-testid={`nav-${item.path.slice(1)}`}
            >
              <span 
                className={`font-serif text-sm tracking-wider transition-colors duration-300 ${
                  location.pathname === item.path ? "text-gold" : "text-champagne/90 hover:text-gold"
                }`}
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {item.label}
              </span>
              <span 
                className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
                  location.pathname === item.path ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          </div>
        ))}
      </nav>

      {/* Mobile Navigation - crimson background */}
      <nav 
        className="md:hidden flex items-center justify-between py-3 px-4 bg-crimson"
        style={{ 
          borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
        }}
      >
        <Link to="/" className="font-signature text-gold text-2xl">
          S & A
        </Link>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="text-champagne p-2"
          data-testid="mobile-menu-btn"
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center md:hidden animate-fade-in"
          style={{
            backgroundImage: `url('/temple-courtyard-bg.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60" />
          
          {/* Close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-champagne p-2 z-10"
            data-testid="close-mobile-menu"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Menu Items */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {navItems.map((item, index) => (
              <div key={item.path} className="text-center">
                {index > 0 && (
                  <div className="flex items-center justify-center mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" style={{ opacity: 0.7 }} />
                  </div>
                )}
                <Link
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                  data-testid={`mobile-nav-${item.path.slice(1)}`}
                >
                  <span 
                    className={`font-serif text-2xl tracking-wider ${
                      location.pathname === item.path ? "text-gold" : "text-champagne"
                    }`}
                    style={{ 
                      fontFamily: "'Playfair Display', Georgia, serif",
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx="true">{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
