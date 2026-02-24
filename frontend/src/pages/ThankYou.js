import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { pollSession, getSessionProgress } from "../lib/api";
import { Heart } from "lucide-react";

// Format number in Indian style (₹2,45,000)
function formatIndianCurrency(paise) {
  const rupees = Math.round(paise / 100);
  return rupees.toLocaleString('en-IN');
}

export default function ThankYou() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session");
  const potSlug = params.get("pot");
  const donorName = params.get("name") || "Guest";
  const [confirmed, setConfirmed] = useState(false);
  const [highlightButton, setHighlightButton] = useState(false);
  
  // Progress animation state
  const [progressData, setProgressData] = useState(null);
  const [animatedRaised, setAnimatedRaised] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  const pollRef = useRef(null);

  // Fetch progress data for animation
  useEffect(() => {
    if (!sessionId) return;
    
    const fetchProgress = async () => {
      try {
        const res = await getSessionProgress(sessionId);
        setProgressData(res.data);
        // Initialize animated value to "before" amount
        setAnimatedRaised(res.data.raised_before_paise);
        
        // Calculate initial progress percent
        const goal = res.data.goal_amount_paise;
        if (goal > 0) {
          const initialPercent = Math.min((res.data.raised_before_paise / goal) * 100, 100);
          setProgressPercent(initialPercent);
        }
      } catch (err) {
        console.error("Could not fetch progress data:", err);
      }
    };
    
    fetchProgress();
  }, [sessionId]);

  // Animate the raised amount counting up
  useEffect(() => {
    if (!progressData) return;
    
    const { raised_before_paise, session_contribution_paise, goal_amount_paise } = progressData;
    const targetRaised = raised_before_paise + session_contribution_paise;
    const duration = 2500; // 2.5 seconds animation
    const startTime = Date.now();
    const startValue = raised_before_paise;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentRaised = Math.round(startValue + (targetRaised - startValue) * easeOut);
      setAnimatedRaised(currentRaised);
      
      // Update progress bar (capped at 100%)
      if (goal_amount_paise > 0) {
        const percent = Math.min((currentRaised / goal_amount_paise) * 100, 100);
        setProgressPercent(percent);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimationComplete(true);
      }
    };
    
    // Start animation after a brief delay
    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [progressData]);

  // Poll for payment confirmation
  useEffect(() => {
    if (!sessionId) return;
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await pollSession(sessionId);
        if (res.data.status === "paid") {
          setConfirmed(true);
          clearInterval(pollRef.current);
        }
      } catch { /* ignore */ }
      if (attempts > 15) clearInterval(pollRef.current);
    }, 2000);
    return () => clearInterval(pollRef.current);
  }, [sessionId]);

  // Highlight the back button after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setHighlightButton(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Determine if goal was already met before this contribution
  const goalAlreadyMet = progressData && progressData.goal_amount_paise > 0 && 
    progressData.raised_before_paise >= progressData.goal_amount_paise;

  return (
    <div className="min-h-screen bg-crimson relative overflow-hidden flex items-center justify-center">
      {/* Floating mandala rings */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="mandala-ring mandala-ring-1" />
        <div className="mandala-ring mandala-ring-2" />
        <div className="mandala-ring mandala-ring-3" />
      </div>

      {/* Floating petals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="petal" style={{
            left: `${8 + (i * 7.5) % 90}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${5 + (i % 3) * 2}s`,
          }} />
        ))}
      </div>

      {/* Diya glow at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full bg-amber-400/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 diya-container">
        <div className="diya-flame" />
        <div className="diya-base" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-lg mx-auto thankyou-content">
        {/* Decorative top border */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="w-12 h-px bg-gold/40" />
          <div className="w-2 h-2 rotate-45 border border-gold/60" />
          <span className="w-12 h-px bg-gold/40" />
        </div>

        {/* Lotus icon */}
        <div className="lotus-bloom mx-auto mb-6">
          <svg viewBox="0 0 100 100" className="w-20 h-20 mx-auto" fill="none">
            <g className="lotus-petals">
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                <ellipse key={i} cx="50" cy="50" rx="8" ry="22"
                  transform={`rotate(${angle} 50 50)`}
                  fill={i % 2 === 0 ? "rgba(212,175,55,0.4)" : "rgba(212,175,55,0.2)"}
                  stroke="rgba(212,175,55,0.6)" strokeWidth="0.5"
                  className="lotus-petal-anim"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </g>
            <circle cx="50" cy="50" r="8" fill="rgba(212,175,55,0.6)" />
          </svg>
        </div>

        {/* Thank you text */}
        <p className="text-gold/70 uppercase tracking-[0.25em] text-xs font-sans font-semibold mb-3 thankyou-label">
          Your wishes are received
        </p>

        <h1 className="font-signature text-5xl sm:text-6xl text-white mb-3 thankyou-heading">
          Dhanyavaad
        </h1>

        <p className="text-champagne/60 font-serif italic text-base sm:text-lg mb-6 leading-relaxed thankyou-sub">
          {donorName}, your generosity lights up our journey together
        </p>

        {/* Animated Progress Bar */}
        <div className="mb-8 thankyou-progress">
          {progressData && progressData.goal_amount_paise > 0 ? (
            <>
              <div className="flex items-center justify-center text-sm text-gold/70 mb-2 font-sans">
                <span className="font-semibold text-gold">
                  ₹{formatIndianCurrency(animatedRaised)}
                </span>
                <span className="mx-1.5 text-gold/40">of</span>
                <span className="text-gold/60">
                  ₹{formatIndianCurrency(progressData.goal_amount_paise)}
                </span>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold/60 via-gold to-gold/60 rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
                {/* Shimmer effect */}
                {!animationComplete && (
                  <div 
                    className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                    style={{ left: `${Math.max(0, progressPercent - 10)}%` }}
                  />
                )}
              </div>
              {/* Goal already met message */}
              {goalAlreadyMet && animationComplete && (
                <p className="text-gold/50 text-xs mt-2 animate-fade-in italic">
                  Goal reached — your wish still adds to our journey ✨
                </p>
              )}
              {/* Normal completion message */}
              {!goalAlreadyMet && animationComplete && (
                <p className="text-gold/60 text-xs mt-2 animate-fade-in">
                  Wish received with gratitude
                </p>
              )}
            </>
          ) : (
            // Fallback: no goal set, just show processing
            <>
              <div className="flex items-center justify-center text-xs text-gold/50 mb-2 font-sans">
                <span>Processing your wish</span>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold/60 via-gold to-gold/60 rounded-full animate-pulse"
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-gold/60 text-xs mt-2 animate-fade-in">Wish received with gratitude</p>
            </>
          )}
        </div>

        {/* Couple names */}
        <div className="mb-8 thankyou-couple">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="w-8 h-px bg-gold/30" />
            <Heart className="w-4 h-4 text-gold/50" />
            <span className="w-8 h-px bg-gold/30" />
          </div>
          <p className="font-signature text-3xl text-champagne/70">Shvetha & Aadi</p>
        </div>

        {/* Status indicator */}
        <div className="thankyou-status mb-6">
          {confirmed ? (
            <div className="flex items-center justify-center gap-2 text-green-300/80 text-sm font-sans">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Gift confirmed
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-gold/50 text-sm font-sans">
              <div className="w-2 h-2 rounded-full bg-gold/60 animate-pulse" />
              Confirming your gift...
            </div>
          )}
        </div>

        {/* Back to Collections Button */}
        <div className="thankyou-redirect">
          <Link
            to="/blessings"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-sans text-sm transition-all duration-500 ${
              highlightButton 
                ? 'bg-gold text-[#5C3A1E] shadow-lg shadow-gold/30 scale-105 animate-pulse-subtle' 
                : 'bg-white/10 text-gold/70 hover:bg-white/20 hover:text-gold'
            }`}
            data-testid="back-to-collections-btn"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Collections
          </Link>
          {highlightButton && (
            <p className="text-gold/50 text-xs mt-3 animate-fade-in">
              Click above to explore more gift collections
            </p>
          )}
        </div>

        {/* Decorative bottom border */}
        <div className="flex items-center justify-center gap-3 mt-10">
          <span className="w-12 h-px bg-gold/40" />
          <div className="w-2 h-2 rotate-45 border border-gold/60" />
          <span className="w-12 h-px bg-gold/40" />
        </div>
      </div>

      {/* Add shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes pulse-subtle {
          0%, 100% { 
            transform: scale(1.05);
            box-shadow: 0 10px 25px -5px rgba(212, 175, 55, 0.3);
          }
          50% { 
            transform: scale(1.08);
            box-shadow: 0 15px 35px -5px rgba(212, 175, 55, 0.4);
          }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
