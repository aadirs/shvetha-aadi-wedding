import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPot, fetchContributors } from "../lib/api";
import { useCart } from "../context/CartContext";
import ContributorFeed from "../components/ContributorFeed";
import HeritageNav from "../components/HeritageNav";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import { ArrowLeft, Heart, Gift, Check } from "lucide-react";
import { toast } from "sonner";

// South Indian style gift box icon
function GiftBoxIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="10" width="18" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M2 8.5C2 7.67 2.67 7 3.5 7h17c.83 0 1.5.67 1.5 1.5V10H2V8.5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="10.5" y="7" width="3" height="14" fill="currentColor" opacity="0.3" />
      <rect x="2" y="13" width="20" height="3" fill="currentColor" opacity="0.3" />
      <path d="M9 7C9 5.5 7.5 4 6 4.5C4.5 5 5 6.5 6 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M15 7C15 5.5 16.5 4 18 4.5C19.5 5 19 6.5 18 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="6" r="1.5" fill="currentColor" />
      <circle cx="6" cy="16" r="0.75" fill="currentColor" opacity="0.5" />
      <circle cx="18" cy="16" r="0.75" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000, 20000];

export default function PotPage() {
  const { slug } = useParams();
  const [pot, setPot] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [added, setAdded] = useState(false);
  const { addItem, items, setIsOpen } = useCart();

  useEffect(() => {
    Promise.all([
      fetchPot(slug).then(r => setPot(r.data)),
      fetchContributors(slug).then(r => setContributors(r.data))
    ])
      .catch(() => toast.error("Could not load this collection"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    const amountRupees = selectedAmount || parseInt(customAmount);
    if (!amountRupees || amountRupees < 1) {
      toast.error("Please select or enter an amount");
      return;
    }
    addItem(pot.id, pot.title, amountRupees * 100, selectedItem?.id, selectedItem?.title);
    setAdded(true);
    toast.success(`Added to your gift basket`);
    setTimeout(() => setAdded(false), 2000);
    setSelectedAmount(null);
    setCustomAmount("");
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mandala-bg">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!pot) {
    return (
      <div className="min-h-screen flex items-center justify-center mandala-bg">
        <div className="text-center">
          <p className="font-serif text-xl text-foreground mb-4">Collection not found</p>
          <Link to="/" className="text-crimson underline text-sm">Go back home</Link>
        </div>
      </div>
    );
  }

  const totalRupees = pot.total_raised_paise / 100;
  const goalRupees = pot.goal_amount_paise ? pot.goal_amount_paise / 100 : null;
  const progressPct = goalRupees ? Math.min((totalRupees / goalRupees) * 100, 100) : 0;

  return (
    <div className="min-h-screen mandala-bg">
      {/* Heritage Navigation */}
      <HeritageNav />
      
      {/* Secondary Nav */}
      <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/blessings" className="flex items-center gap-2 text-foreground hover:text-crimson transition-colors" data-testid="back-to-home">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-sans">Back</span>
          </Link>
          {items.length > 0 && (
            <button onClick={() => setIsOpen(true)} className="relative" data-testid="nav-cart-btn">
              <GiftBoxIcon className="w-5 h-5 text-foreground" />
              <Badge className="absolute -top-1 -right-2 bg-crimson text-white text-xs w-4 h-4 flex items-center justify-center p-0 rounded-full">
                {items.length}
              </Badge>
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Cover Image */}
        {pot.cover_image_url && (
          <div className="rounded-xl overflow-hidden mb-8 gold-border" data-testid="pot-cover-image">
            <img src={pot.cover_image_url} alt={pot.title} className="w-full h-48 sm:h-64 object-cover" />
          </div>
        )}

        {/* Title & Story */}
        <div className="mb-8 animate-fade-up" data-testid="pot-details">
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">{pot.title}</h1>
          {pot.story_text && (
            <p className="text-muted-foreground leading-relaxed font-sans text-sm sm:text-base">{pot.story_text}</p>
          )}
        </div>

        {/* Progress */}
        <div className="bg-card rounded-xl p-5 gold-border mb-8" data-testid="pot-progress">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-2xl font-serif font-bold text-foreground">
                {"\u20B9"}{totalRupees.toLocaleString('en-IN')}
              </span>
              <span className="text-muted-foreground text-sm ml-1">raised</span>
            </div>
            {goalRupees && totalRupees < goalRupees && (
              <span className="text-muted-foreground text-sm">
                of {"\u20B9"}{goalRupees.toLocaleString('en-IN')}
              </span>
            )}
            {goalRupees && totalRupees >= goalRupees && totalRupees > goalRupees && (
              <span className="text-gold text-sm font-sans font-medium">
                {"\u20B9"}{(totalRupees - goalRupees).toLocaleString('en-IN')} over goal
              </span>
            )}
            {goalRupees && totalRupees === goalRupees && (
              <span className="text-gold text-sm font-sans font-medium">
                Goal reached
              </span>
            )}
          </div>
          {goalRupees && (
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <div className="absolute inset-0 h-full progress-gold rounded-full transition-all duration-700" style={{ width: `${Math.min(progressPct, 100)}%` }} />
            </div>
          )}
        </div>

        {/* Items */}
        {pot.items && pot.items.length > 0 && (
          <div className="mb-8" data-testid="pot-items-section">
            <h3 className="font-serif text-lg text-foreground mb-4 flex items-center gap-2">
              <Gift className="w-4 h-4 text-gold" />
              Gift Items
            </h3>
            <div className="grid gap-3">
              {pot.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                  className={`text-left p-4 rounded-xl border-2 transition-all duration-200 group cursor-pointer ${
                    selectedItem?.id === item.id
                      ? 'border-gold bg-gold/10 shadow-md shadow-gold/10'
                      : 'border-border/30 bg-card hover:border-gold/50 hover:bg-gold/5 hover:shadow-sm'
                  }`}
                  data-testid={`pot-item-${item.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        selectedItem?.id === item.id 
                          ? 'bg-gold/20' 
                          : 'bg-muted group-hover:bg-gold/10'
                      }`}>
                        <Gift className={`w-4 h-4 transition-colors ${
                          selectedItem?.id === item.id 
                            ? 'text-gold' 
                            : 'text-muted-foreground group-hover:text-gold/70'
                        }`} />
                      </div>
                      <div>
                        <p className={`font-sans font-medium text-sm transition-colors ${
                          selectedItem?.id === item.id 
                            ? 'text-foreground' 
                            : 'text-foreground group-hover:text-foreground'
                        }`}>{item.title}</p>
                        {item.description && <p className="text-muted-foreground text-xs mt-0.5">{item.description}</p>}
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedItem?.id === item.id 
                        ? 'border-gold bg-gold' 
                        : 'border-border/50 group-hover:border-gold/50'
                    }`}>
                      {selectedItem?.id === item.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-2 text-center italic">Tap to select a specific item</p>
          </div>
        )}

        <Separator className="bg-border/40 my-8" />

        {/* Add to Cart */}
        <div className="mb-8" data-testid="add-to-cart-section">
          <h3 className="font-serif text-lg text-foreground mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-crimson" />
            Choose Your Gift Amount
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
            {PRESET_AMOUNTS.map(amt => (
              <button
                key={amt}
                onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                className={`py-3 px-2 rounded-lg font-sans text-sm font-medium transition-all ${
                  selectedAmount === amt
                    ? 'bg-crimson text-white shadow-md'
                    : 'bg-card border border-border/40 text-foreground hover:border-crimson/30'
                }`}
                data-testid={`preset-amount-${amt}`}
              >
                {"\u20B9"}{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{"\u20B9"}</span>
              <Input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                className="pl-7 bg-card border-border/40 font-sans"
                data-testid="custom-amount-input"
              />
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={added}
              className={`rounded-full px-6 font-sans font-medium ${
                added ? 'bg-green-700 hover:bg-green-700' : 'bg-crimson hover:bg-crimson/90'
              } text-white`}
              data-testid="add-to-cart-btn"
            >
              {added ? <><Check className="w-4 h-4 mr-1" /> Added</> : <><GiftBoxIcon className="w-4 h-4 mr-1" /> Add</>}
            </Button>
          </div>
        </div>

        <Separator className="bg-border/40 my-8" />

        {/* Contributors */}
        <ContributorFeed contributors={contributors} />
      </div>
    </div>
  );
}
