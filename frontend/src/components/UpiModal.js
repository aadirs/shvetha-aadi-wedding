import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { createUpiSession, confirmBlessing, getConfig } from "../lib/api";
import { useCart } from "../context/CartContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { X, Smartphone, HelpCircle, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_UPI_ID = "8618052253@ybl";
const DEFAULT_UPI_NAME = "Shvetha%20%26%20Aadi%20Wedding%20Gift";

function fireGoldenConfetti() {
  const colors = ["#D4AF37", "#F5D78E", "#C9A55C", "#FFE4C4", "#FFDAB9", "#E8C991"];
  confetti({ particleCount: 60, spread: 80, startVelocity: 20, gravity: 0.6, ticks: 200, origin: { y: 0.6 }, colors, shapes: ["circle", "square"], scalar: 0.9 });
  setTimeout(() => confetti({ particleCount: 30, spread: 60, startVelocity: 15, gravity: 0.5, ticks: 180, origin: { y: 0.5, x: 0.3 }, colors, scalar: 0.8 }), 400);
  setTimeout(() => confetti({ particleCount: 30, spread: 60, startVelocity: 15, gravity: 0.5, ticks: 180, origin: { y: 0.5, x: 0.7 }, colors, scalar: 0.8 }), 700);
}

// Phone validation: Indian mobile numbers
function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  // Accept: +91XXXXXXXXXX, 91XXXXXXXXXX, or XXXXXXXXXX (10 digits starting with 6-9)
  return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned);
}

export default function UpiModal({ isOpen, onClose, allocations, totalPaise, potSlug }) {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const scrollRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [phoneError, setPhoneError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", message: "", utr: "" });
  const [upiConfig, setUpiConfig] = useState({ upi_id: DEFAULT_UPI_ID, upi_name: DEFAULT_UPI_NAME });

  const totalRupees = (totalPaise / 100).toLocaleString("en-IN");

  // Fetch UPI config when modal opens
  useEffect(() => {
    if (isOpen) {
      getConfig()
        .then(res => {
          if (res.data.upi_id) {
            setUpiConfig({
              upi_id: res.data.upi_id,
              upi_name: encodeURIComponent(res.data.upi_name || "Wedding Gift")
            });
          }
        })
        .catch(() => {}); // Use defaults on error
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !sessionId && !creating) {
      setCreating(true);
      createUpiSession({ allocations })
        .then(res => setSessionId(res.data.session_id))
        .catch(() => { toast.error("Could not start. Please try again."); onClose(); })
        .finally(() => setCreating(false));
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSessionId(null);
      setSuccess(false);
      setSubmitting(false);
      setShowScrollHint(true);
      setPhoneError("");
      setForm({ name: "", phone: "", message: "", utr: "" });
    }
  }, [isOpen]);

  // Hide scroll hint when user scrolls
  const handleScroll = (e) => {
    if (e.target.scrollTop > 20) setShowScrollHint(false);
  };

  // Phone validation on blur
  const handlePhoneBlur = () => {
    if (form.phone.trim() && !isValidPhone(form.phone)) {
      setPhoneError("Please enter a valid Indian mobile number");
    } else {
      setPhoneError("");
    }
  };

  const shortId = sessionId ? sessionId.split("-")[0] : "";
  const baseUpiLink = `upi://pay?pa=${upiConfig.upi_id}&pn=${upiConfig.upi_name}&am=${totalPaise / 100}&cu=INR&tn=Wedding%20Gift&tr=${shortId}`;
  
  // Detect platform
  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  
  // Android: Use intent:// to open app chooser and prevent WhatsApp interception
  // iOS: We'll show specific app buttons instead
  const upiLink = isAndroid 
    ? `intent://pay?pa=${upiConfig.upi_id}&pn=${upiConfig.upi_name}&am=${totalPaise / 100}&cu=INR&tn=Wedding%20Gift&tr=${shortId}#Intent;scheme=upi;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end`
    : baseUpiLink;
  
  // For QR code, always use the standard upi:// link (scanned by UPI apps directly)
  const qrLink = baseUpiLink;
  
  // App-specific deep links for iOS (to avoid WhatsApp interception)
  const gpayLink = `gpay://upi/pay?pa=${upiConfig.upi_id}&pn=${upiConfig.upi_name}&am=${totalPaise / 100}&cu=INR&tn=Wedding%20Gift&tr=${shortId}`;
  const phonepeLink = `phonepe://pay?pa=${upiConfig.upi_id}&pn=${upiConfig.upi_name}&am=${totalPaise / 100}&cu=INR&tn=Wedding%20Gift&tr=${shortId}`;
  const paytmLink = `paytmmp://pay?pa=${upiConfig.upi_id}&pn=${upiConfig.upi_name}&am=${totalPaise / 100}&cu=INR&tn=Wedding%20Gift&tr=${shortId}`;

  async function handleSubmit() {
    if (!form.name.trim()) { toast.error("Please enter your name"); return; }
    if (!form.phone.trim()) { toast.error("Please enter your phone number"); return; }
    if (!isValidPhone(form.phone)) { toast.error("Please enter a valid phone number"); setPhoneError("Please enter a valid Indian mobile number"); return; }
    if (!form.message.trim()) { toast.error("Please write a blessing for the couple"); return; }

    setSubmitting(true);
    try {
      await confirmBlessing({
        session_id: sessionId,
        donor_name: form.name.trim(),
        donor_phone: form.phone.trim(),
        donor_message: form.message.trim(),
        utr: form.utr.trim() || undefined,
      });

      setSuccess(true);
      fireGoldenConfetti();
      clearCart();

      setTimeout(() => {
        onClose();
        navigate(`/thank-you?session=${sessionId}&pot=${potSlug || ""}&name=${encodeURIComponent(form.name.trim())}`);
      }, 2200);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" data-testid="upi-modal">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!submitting && !success ? onClose : undefined} />

      <div className="relative w-full sm:w-[440px] max-h-[94vh] overflow-hidden rounded-t-3xl sm:rounded-2xl bg-gradient-to-b from-[#FFFBF5] to-[#FFF8F0] shadow-2xl"
           style={{ animation: "slideUp 0.35s ease-out" }}>

        {/* Top decorative border */}
        <div className="h-1.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

        {/* Scrollable content with visible scrollbar */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto max-h-[calc(94vh-6px)] upi-scroll-container"
        >
          {/* Close button */}
          {!submitting && !success && (
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm z-10 transition-all" data-testid="upi-modal-close">
              <X className="w-4 h-4 text-[#5C3A1E]/70" />
            </button>
          )}

          {creating ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
              </div>
              <p className="text-[#5C3A1E]/70 font-serif text-sm">Preparing your blessing...</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center py-20 gap-4 px-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8B0000]/10 to-[#D4AF37]/10 flex items-center justify-center mb-2 shadow-inner">
                <svg className="w-10 h-10 text-[#8B0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl text-[#5C3A1E]">Thank You</h2>
              <p className="text-[#5C3A1E]/60 text-sm text-center">Your blessing means the world to us</p>
            </div>
          ) : (
            <div className="px-6 pt-6 pb-8">
              {/* Header */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="w-8 h-px bg-[#D4AF37]/40" />
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#8B0000]/50 font-medium">Wedding Gift</span>
                  <span className="w-8 h-px bg-[#D4AF37]/40" />
                </div>
                <h2 className="font-serif text-2xl text-[#5C3A1E] leading-tight mb-3">Send Your Blessing</h2>
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#8B0000]/5 via-[#8B0000]/10 to-[#8B0000]/5 border border-[#8B0000]/10">
                  <span className="font-serif text-[#8B0000] text-xl font-semibold">₹{totalRupees}</span>
                </div>
              </div>

              {/* MOBILE: Pay button first (prominent), then OR, then QR */}
              <div className="sm:hidden mb-5">
                {/* iOS: Show app-specific buttons to avoid WhatsApp interception */}
                {isIOS ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-[#5C3A1E]/60 text-center mb-3 font-medium">Choose your UPI app</p>
                    <a href={gpayLink} className="block" data-testid="upi-gpay-btn">
                      <Button className="w-full h-12 bg-white hover:bg-gray-50 text-[#5C3A1E] font-medium text-sm rounded-xl border border-[#E8DDD0] shadow-sm transition-all active:scale-[0.98] justify-start px-4 gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100">
                          <svg viewBox="0 0 24 24" className="w-5 h-5">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        </div>
                        Google Pay
                      </Button>
                    </a>
                    <a href={phonepeLink} className="block" data-testid="upi-phonepe-btn">
                      <Button className="w-full h-12 bg-white hover:bg-gray-50 text-[#5C3A1E] font-medium text-sm rounded-xl border border-[#E8DDD0] shadow-sm transition-all active:scale-[0.98] justify-start px-4 gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#5f259f] flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-xs">Pe</span>
                        </div>
                        PhonePe
                      </Button>
                    </a>
                    <a href={paytmLink} className="block" data-testid="upi-paytm-btn">
                      <Button className="w-full h-12 bg-white hover:bg-gray-50 text-[#5C3A1E] font-medium text-sm rounded-xl border border-[#E8DDD0] shadow-sm transition-all active:scale-[0.98] justify-start px-4 gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#00baf2] flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-[10px]">Paytm</span>
                        </div>
                        Paytm
                      </Button>
                    </a>
                  </div>
                ) : (
                  /* Android/Other: Single UPI button */
                  <a href={upiLink} className="block" data-testid="upi-pay-btn-mobile">
                    <Button className="w-full h-14 bg-gradient-to-r from-[#8B0000] to-[#6B0000] hover:from-[#7B0000] hover:to-[#5B0000] text-white font-serif text-base rounded-2xl gap-3 shadow-lg transition-all active:scale-[0.98]">
                      <Smartphone className="w-5 h-5" />
                      Pay ₹{totalRupees} via UPI App
                    </Button>
                  </a>
                )}
                
                {/* OR Divider - Mobile */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-[#D4AF37]/30" />
                  <span className="text-xs font-medium text-[#5C3A1E]/50 px-2">OR</span>
                  <div className="flex-1 h-px bg-[#D4AF37]/30" />
                </div>
                
                {/* QR Code for Mobile */}
                <div className="bg-white rounded-2xl p-4 border border-[#E8DDD0]/80 shadow-sm">
                  <div className="flex flex-col items-center">
                    <p className="text-[11px] text-[#5C3A1E]/50 mb-3 font-medium">Scan QR Code</p>
                    <div className="p-2 bg-white rounded-xl border border-gray-100" data-testid="upi-qr-code-mobile">
                      <QRCodeSVG value={qrLink} size={140} level="M" bgColor="#FFFFFF" fgColor="#000000" marginSize={2} />
                    </div>
                    <p className="text-[10px] text-[#5C3A1E]/30 mt-2">Works with any UPI app</p>
                  </div>
                </div>
              </div>

              {/* DESKTOP: QR Code first (prominent), then OR, then Pay button */}
              <div className="hidden sm:block mb-5">
                <div className="bg-white rounded-2xl p-5 border border-[#E8DDD0]/80 shadow-sm">
                  <div className="flex flex-col items-center">
                    <p className="text-[11px] text-[#5C3A1E]/50 mb-3 font-medium">Scan QR Code to Pay</p>
                    <div className="p-3 bg-white rounded-xl border border-gray-100" data-testid="upi-qr-code">
                      <QRCodeSVG value={qrLink} size={180} level="M" bgColor="#FFFFFF" fgColor="#000000" marginSize={3} />
                    </div>
                    <p className="text-[10px] text-[#5C3A1E]/30 mt-3">Works with any UPI app</p>
                  </div>
                </div>
                
                {/* OR Divider - Desktop */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-[#D4AF37]/30" />
                  <span className="text-xs font-medium text-[#5C3A1E]/50 px-2">OR</span>
                  <div className="flex-1 h-px bg-[#D4AF37]/30" />
                </div>
                
                {/* Pay button for Desktop */}
                <a href={upiLink} className="block" data-testid="upi-pay-btn">
                  <Button className="w-full h-12 bg-gradient-to-r from-[#8B0000] to-[#6B0000] hover:from-[#7B0000] hover:to-[#5B0000] text-white font-serif text-sm rounded-xl gap-2 shadow-md transition-all">
                    <Smartphone className="w-4 h-4" />
                    Pay via UPI App
                  </Button>
                </a>
              </div>

              {/* Instruction with ornate divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
                <span className="text-[10px] text-[#5C3A1E]/40 uppercase tracking-[0.15em] whitespace-nowrap">After payment</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <div>
                  <Label className="text-[#5C3A1E]/80 text-xs font-medium">Your Name <span className="text-[#8B0000]">*</span></Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="mt-1.5 h-11 bg-white border-[#E8DDD0] focus:border-[#8B0000] focus:ring-[#8B0000]/10 rounded-xl text-sm"
                    data-testid="blessing-name-input"
                  />
                </div>
                <div>
                  <Label className="text-[#5C3A1E]/80 text-xs font-medium">Phone Number <span className="text-[#8B0000]">*</span></Label>
                  <Input
                    value={form.phone}
                    onChange={e => { setForm({ ...form, phone: e.target.value }); setPhoneError(""); }}
                    onBlur={handlePhoneBlur}
                    placeholder="+91 98765 43210"
                    className={`mt-1.5 h-11 bg-white border-[#E8DDD0] focus:border-[#8B0000] focus:ring-[#8B0000]/10 rounded-xl text-sm ${phoneError ? 'border-red-400 focus:border-red-400' : ''}`}
                    data-testid="blessing-phone-input"
                  />
                  {phoneError && <p className="text-red-500 text-[11px] mt-1">{phoneError}</p>}
                </div>
                <div>
                  <Label className="text-[#5C3A1E]/80 text-xs font-medium">Your Blessing <span className="text-[#8B0000]">*</span></Label>
                  <Textarea
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Wishing Shvetha & Aadi a lifetime of love and happiness..."
                    className="mt-1.5 bg-white border-[#E8DDD0] focus:border-[#8B0000] focus:ring-[#8B0000]/10 rounded-xl text-sm min-h-[80px] resize-none"
                    data-testid="blessing-message-input"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Label className="text-[#5C3A1E]/80 text-xs font-medium">UTR / Reference</Label>
                    <span className="text-[10px] text-[#5C3A1E]/30">(optional)</span>
                    <button
                      className="relative"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      onClick={() => setShowTooltip(!showTooltip)}
                      type="button"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-[#5C3A1E]/30" />
                      {showTooltip && (
                        <div className="absolute left-5 -top-1 w-56 p-3 bg-white rounded-xl shadow-lg border border-[#E8DDD0] text-left z-10">
                          <p className="text-[11px] text-[#5C3A1E]/70 leading-relaxed">
                            Find the UTR/Reference number in your UPI app's transaction history or payment confirmation message.
                          </p>
                        </div>
                      )}
                    </button>
                  </div>
                  <Input
                    value={form.utr}
                    onChange={e => setForm({ ...form, utr: e.target.value })}
                    placeholder="12-digit transaction reference"
                    className="mt-1.5 h-11 bg-white border-[#E8DDD0] focus:border-[#8B0000] focus:ring-[#8B0000]/10 rounded-xl text-sm"
                    data-testid="blessing-utr-input"
                  />
                </div>
              </div>

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-6 h-14 bg-gradient-to-r from-[#8B0000] to-[#6B0000] hover:from-[#7B0000] hover:to-[#5B0000] text-white font-serif text-base rounded-2xl shadow-lg transition-all active:scale-[0.98]"
                data-testid="submit-blessing-btn"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm My Blessing"}
              </Button>

              {/* Bottom padding for scroll */}
              <div className="h-2" />
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        {showScrollHint && !creating && !success && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce pointer-events-none">
            <span className="text-[9px] text-[#5C3A1E]/30 uppercase tracking-wider mb-1">Scroll</span>
            <ChevronDown className="w-4 h-4 text-[#5C3A1E]/30" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .upi-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .upi-scroll-container::-webkit-scrollbar-track {
          background: rgba(212, 175, 55, 0.1);
          border-radius: 3px;
        }
        .upi-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(139, 0, 0, 0.2);
          border-radius: 3px;
        }
        .upi-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
