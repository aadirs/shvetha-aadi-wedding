import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "The Couple", path: "/story" },
  { label: "The Celebration", path: "/celebration" },
  { label: "Sacred Ceremonies", path: "/rituals" },
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
          {/* Overlay - matching landing page */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.3) 100%)',
            }}
          />
          
          {/* Close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-champagne p-2 z-10 hover:text-gold transition-colors"
            data-testid="close-mobile-menu"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Menu Items - matching landing page styling */}
          <div className="relative z-10 flex flex-col items-center">
            {navItems.map((item, index) => (
              <div 
                key={item.path} 
                className="text-center"
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
                
                <Link
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="group relative text-center py-2 px-8 block"
                  data-testid={`mobile-nav-${item.path.slice(1)}`}
                >
                  {/* Subtle visible button shape - golden ghost button effect */}
                  <span 
                    className="absolute inset-0 rounded-lg transition-all duration-300 menu-btn-glow group-hover:opacity-100"
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
                    className="relative z-10 text-xl sm:text-2xl transition-all duration-300"
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
        /* Mobile menu button glow - matching landing page */
        .menu-btn-glow {
          opacity: 1;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(255, 250, 240, 0.2) 50%, rgba(212, 175, 55, 0.12) 100%);
          border: 1px solid rgba(212, 175, 55, 0.6);
          animation: subtle-glow 2.5s ease-in-out infinite;
        }
        @keyframes subtle-glow {
          0%, 100% { 
            box-shadow: 0 0 18px rgba(212, 175, 55, 0.4), 0 0 6px rgba(212, 175, 55, 0.25), inset 0 0 12px rgba(212, 175, 55, 0.15);
            border-color: rgba(212, 175, 55, 0.55);
          }
          50% { 
            box-shadow: 0 0 25px rgba(212, 175, 55, 0.5), 0 0 10px rgba(212, 175, 55, 0.3), inset 0 0 18px rgba(212, 175, 55, 0.22);
            border-color: rgba(212, 175, 55, 0.7);
          }
        }
      `}</style>
    </>
  );
}
