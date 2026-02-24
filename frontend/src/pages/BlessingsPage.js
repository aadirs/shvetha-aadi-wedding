import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchPots, fetchAllBlessings } from "../lib/api";
import { useDataPrefetch } from "../context/DataPrefetchContext";
import PotCard from "../components/PotCard";
import { Separator } from "../components/ui/separator";
import HeritageNav from "../components/HeritageNav";
import { Heart, Quote } from "lucide-react";

// Wishes Wall Component
function WishesWall({ wishes, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!wishes || wishes.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-10 h-10 text-gold/30 mx-auto mb-3" />
        <p className="text-muted-foreground font-serif italic">Be the first to wish the couple</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {wishes.map((wish, i) => (
        <div 
          key={i} 
          className="group relative bg-white/80 backdrop-blur-sm rounded-lg p-5 shadow-sm border border-gold/10 hover:border-gold/30 hover:shadow-md transition-all duration-300"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          {/* Decorative quote icon */}
          <Quote className="absolute top-3 right-3 w-5 h-5 text-gold/20 group-hover:text-gold/40 transition-colors" />
          
          {/* Avatar and Name */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-crimson to-crimson/70 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-sm font-bold text-white">
                {wish.donor_name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <div>
              <p className="font-serif font-medium text-foreground">{wish.donor_name}</p>
              {wish.paid_at && (
                <p className="text-xs text-muted-foreground/70">
                  {new Date(wish.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          
          {/* Message */}
          {wish.donor_message && (
            <p className="text-sm text-muted-foreground leading-relaxed italic pl-1 border-l-2 border-gold/30">
              "{wish.donor_message}"
            </p>
          )}
          
          {/* No message state */}
          {!wish.donor_message && (
            <div className="flex items-center gap-2 text-gold/60">
              <Heart className="w-4 h-4" />
              <span className="text-sm italic">Sent their wishes</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function BlessingsPage() {
  // Use prefetched data from context
  const { 
    potsData, 
    wishesData, 
    potsLoading, 
    wishesLoading, 
    potsError,
    refreshData 
  } = useDataPrefetch();

  // Local state for fallback (in case context data is stale)
  const [pots, setPots] = useState(potsData || []);
  const [wishes, setWishes] = useState(wishesData || []);
  const [loading, setLoading] = useState(!potsData);
  const [wishesLoadingLocal, setWishesLoadingLocal] = useState(!wishesData);
  const [error, setError] = useState(potsError);

  // Sync with prefetch context when data arrives
  useEffect(() => {
    if (potsData) {
      setPots(potsData);
      setLoading(false);
    }
    if (wishesData) {
      setWishes(wishesData);
      setWishesLoadingLocal(false);
    }
    if (potsError) {
      setError(potsError);
    }
  }, [potsData, wishesData, potsError]);

  // Fallback fetch if context doesn't have data (shouldn't happen normally)
  useEffect(() => {
    if (!potsData && !potsLoading) {
      fetchPots()
        .then(r => { setPots(r.data); setLoading(false); })
        .catch(e => { setError(e.response?.data?.detail || "Could not load pots"); setLoading(false); });
    }
    if (!wishesData && !wishesLoading) {
      fetchAllBlessings()
        .then(r => { setWishes(r.data); setWishesLoadingLocal(false); })
        .catch(() => setWishesLoadingLocal(false));
    }
  }, [potsData, wishesData, potsLoading, wishesLoading]);

  return (
    <div className="min-h-screen mandala-bg">
      <div className="sticky top-0 z-30">
        <HeritageNav />
      </div>
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
            With Love & Gratitude
          </p>
          <h1 className="font-signature text-5xl sm:text-7xl lg:text-8xl text-white mb-4 leading-tight" data-testid="couple-names">
            Gifts & Wishes
          </h1>
          <p className="text-champagne/80 font-serif italic text-base sm:text-lg mb-6">
            As we begin our journey together, your wishes mean the world to us
          </p>
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

        {/* Wishes Wall Section */}
        <section className="mt-16 pt-12 border-t border-gold/20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/50" />
              <Heart className="w-5 h-5 text-crimson" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/50" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">Wall of Wishes</h2>
            <p className="text-muted-foreground text-sm sm:text-base font-sans">
              Heartfelt wishes from our loved ones
            </p>
            {wishes.length > 0 && (
              <p className="text-gold text-sm mt-2 font-serif">
                {wishes.length} {wishes.length === 1 ? 'wish' : 'wishes'} received
              </p>
            )}
          </div>
          
          <WishesWall wishes={wishes} loading={wishesLoading} />
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center bg-crimson">
        <p className="font-serif text-sm text-gold/70">
          Shvetha & Aadi • March 2026
        </p>
      </footer>
    </div>
  );
}
