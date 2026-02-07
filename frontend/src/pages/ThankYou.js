import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { pollSession } from "../lib/api";
import { Heart } from "lucide-react";

export default function ThankYou() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session");
  const potSlug = params.get("pot");
  const donorName = params.get("name") || "Guest";
  const [confirmed, setConfirmed] = useState(false);
  const [countdown, setCountdown] = useState(12);
  const pollRef = useRef(null);

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

  // Countdown & redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(potSlug ? `/p/${potSlug}` : "/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate, potSlug]);

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
          Your blessings are received
        </p>

        <h1 className="font-signature text-5xl sm:text-6xl text-white mb-3 thankyou-heading">
          Dhanyavaad
        </h1>

        <p className="text-champagne/60 font-serif italic text-base sm:text-lg mb-8 leading-relaxed thankyou-sub">
          {donorName}, your generosity lights up our journey together
        </p>

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

        {/* Countdown */}
        <div className="thankyou-redirect">
          <p className="text-white/25 text-xs font-sans tracking-wide">
            Returning to collection in {countdown}s
          </p>
          <div className="mt-2 mx-auto w-32 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold/40 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((12 - countdown) / 12) * 100}%` }}
            />
          </div>
          <Link
            to={potSlug ? `/p/${potSlug}` : "/"}
            className="inline-block mt-4 text-gold/40 text-xs font-sans hover:text-gold/70 transition-colors underline underline-offset-4"
          >
            Go now
          </Link>
        </div>

        {/* Decorative bottom border */}
        <div className="flex items-center justify-center gap-3 mt-10">
          <span className="w-12 h-px bg-gold/40" />
          <div className="w-2 h-2 rotate-45 border border-gold/60" />
          <span className="w-12 h-px bg-gold/40" />
        </div>
      </div>
    </div>
  );
}
