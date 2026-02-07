import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchPots } from "../lib/api";
import PotCard from "../components/PotCard";
import { Separator } from "../components/ui/separator";

export default function Home() {
  const [pots, setPots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { items, setIsOpen } = useCart();

  useEffect(() => {
    fetchPots()
      .then(r => { setPots(r.data); setLoading(false); })
      .catch(e => { setError(e.response?.data?.detail || "Could not load pots"); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen mandala-bg">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-crimson text-white" data-testid="wedding-header">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='30' fill='none' stroke='%23D4AF37' stroke-width='0.5'/%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='%23D4AF37' stroke-width='0.3'/%3E%3Ccircle cx='40' cy='40' r='10' fill='none' stroke='%23D4AF37' stroke-width='0.3'/%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center py-16 px-6 sm:py-24">
          <div className="mb-2">
            <Separator className="mx-auto w-20 bg-gold/40 mb-6" />
          </div>
          <p className="text-gold uppercase tracking-[0.3em] text-xs font-sans font-semibold mb-4" data-testid="header-subtitle">
            You are invited to celebrate
          </p>
          <h1 className="font-signature text-5xl sm:text-7xl lg:text-8xl text-white mb-4 leading-tight" data-testid="couple-names">
            Shvetha & Aadi
          </h1>
          <p className="text-champagne/80 font-serif italic text-base sm:text-lg mb-6">
            As we begin our journey together, your blessings mean the world to us
          </p>
          <div className="flex items-center justify-center gap-3 text-gold/70 text-sm font-sans">
            <span className="w-8 h-px bg-gold/40" />
            <span>Wedding Gift Collection</span>
            <span className="w-8 h-px bg-gold/40" />
          </div>
        </div>
      </header>

      {/* Pots Grid */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">Our Gift Collections</h2>
          <p className="text-muted-foreground text-sm sm:text-base font-sans">
            Choose a collection to contribute towards our new life together
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-20" data-testid="loading-indicator">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-muted-foreground" data-testid="error-message">
            <p className="font-serif text-lg mb-2">Oops!</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && pots.length === 0 && (
          <div className="text-center py-20 text-muted-foreground" data-testid="empty-state">
            <p className="font-serif text-lg mb-2">Collections coming soon</p>
            <p className="text-sm">Check back later for gift options</p>
          </div>
        )}

        {!loading && !error && pots.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-stagger" data-testid="pots-grid">
            {pots.map(pot => (
              <PotCard key={pot.id} pot={pot} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-border/40">
        <p className="font-signature text-2xl text-crimson mb-1">Shvetha & Aadi</p>
        <p className="text-muted-foreground text-xs font-sans">Made with love</p>
        <Link to="/admin/login" className="text-muted-foreground/30 text-xs mt-4 inline-block hover:text-muted-foreground/60 transition-colors">
          Admin
        </Link>
      </footer>
    </div>
  );
}
