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
import { X, HelpCircle, Loader2, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_UPI_ID = "8618052253@ybl";
const DEFAULT_UPI_NAME = "Shvetha & Aadi";

function fireGoldenConfetti() {
  const colors = ["#D4AF37", "#F5D78E", "#C9A55C", "#FFE4C4", "#FFDAB9", "#E8C991"];
  confetti({ particleCount: 60, spread: 80, startVelocity: 20, gravity: 0.6, ticks: 200, origin: { y: 0.6 }, colors, shapes: ["circle", "square"], scalar: 0.9 });
  setTimeout(() => confetti({ particleCount: 30, spread: 60, startVelocity: 15, gravity: 0.5, ticks: 180, origin: { y: 0.5, x: 0.3 }, colors, scalar: 0.8 }), 400);
  setTimeout(() => confetti({ particleCount: 30, spread: 60, startVelocity: 15, gravity: 0.5, ticks: 180, origin: { y: 0.5, x: 0.7 }, colors, scalar: 0.8 }), 700);
}

// Phone validation: Indian mobile numbers
function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
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
  const [phoneError, setPhoneError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "", utr: "" });
  const [upiConfig, setUpiConfig] = useState({ upi_id: DEFAULT_UPI_ID, upi_name: DEFAULT_UPI_NAME });

  const totalRupees = (totalPaise / 100).toLocaleString("en-IN");
  const amountForQr = (totalPaise / 100).toFixed(2);

  // Platform detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const ua = navigator.userAgent;
    const mobile = /android|iphone|ipad|ipod/i.test(ua);
    setIsMobile(mobile);
  }, []);

  // Fetch UPI config when modal opens
  useEffect(() => {
    if (isOpen) {
      getConfig()
        .then(res => {
          if (res.data.upi_id) {
            setUpiConfig({
              upi_id: res.data.upi_id,
              upi_name: res.data.upi_name || "Wedding Gift"
            });
          }
        })
        .catch(() => {});
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
      setPhoneError("");
      setCopied(false);
      setShowQrCode(false);
      setForm({ name: "", phone: "", message: "", utr: "" });
    }
  }, [isOpen]);

  // Phone validation on blur
  const handlePhoneBlur = () => {
    if (form.phone.trim() && !isValidPhone(form.phone)) {
      setPhoneError("Please enter a valid Indian mobile number");
    } else {
      setPhoneError("");
    }
  };

  // Copy UPI ID to clipboard
  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(upiConfig.upi_id);
      setCopied(true);
      toast.success("UPI ID copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Please copy manually.");
    }
  };

  // Build QR code UPI link
  const payeeName = encodeURIComponent(upiConfig.upi_name);
  const qrLink = `upi://pay?pa=${upiConfig.upi_id}&pn=${payeeName}&am=${amountForQr}&cu=INR&tn=Wedding%20Gift`;

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

  // Big OR Divider component
  const OrDivider = () => (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-[#D4AF37]/20" />
      <div className="px-4 py-2 bg-[#FFF8F0] border-2 border-[#D4AF37]/30 rounded-full shadow-sm">
        <span className="text-sm font-bold text-[#8B0000] tracking-wide">OR</span>
      </div>
      <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent via-[#D4AF37]/50 to-[#D4AF37]/20" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" data-testid="upi-modal">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!submitting && !success ? onClose : undefined} />

      <div className="relative w-full sm:w-[440px] max-h-[94vh] overflow-hidden rounded-t-3xl sm:rounded-2xl bg-gradient-to-b from-[#FFFBF5] to-[#FFF8F0] shadow-2xl"
           style={{ animation: "slideUp 0.35s ease-out" }}>

        {/* Top decorative border */}
        <div className="h-1.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

        {/* Scrollable content */}
        <div 
          ref={scrollRef}
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
              <div className="text-center mb-6">
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

              {/* Step 1: Make Payment */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#8B0000] text-white text-xs font-bold shadow-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#5C3A1E]">Make Payment</h3>
                    <p className="text-[10px] text-[#5C3A1E]/50">Pay using UPI</p>
                  </div>
                </div>

                {/* MOBILE VIEW - Copy UPI ID Primary */}
                {isMobile && (
                  <div className="space-y-0">
                    {/* Copy UPI ID - Primary on mobile - Sleek design */}
                    <div className="bg-white rounded-2xl border border-[#E8DDD0] shadow-sm overflow-hidden">
                      {/* UPI ID Display */}
                      <div className="px-5 pt-5 pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[11px] uppercase tracking-wider text-[#5C3A1E]/40 font-medium">UPI ID</p>
                          <div className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-[#FFF8F0] text-[#5C3A1E]/50'}`}>
                            {copied ? '✓ Copied' : 'Tap to copy'}
                          </div>
                        </div>
                        
                        <button
                          onClick={copyUpiId}
                          className="w-full text-left group"
                          data-testid="copy-upi-btn"
                        >
                          <div className="flex items-center justify-between gap-5 p-4 bg-gradient-to-r from-[#FFF8F0] to-[#FFFBF5] rounded-xl border border-[#E8DDD0] group-hover:border-[#8B0000]/30 group-active:scale-[0.99] transition-all">
                            <p className="text-sm font-mono font-semibold text-[#8B0000] tracking-wide">{upiConfig.upi_id}</p>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${copied ? 'bg-green-500' : 'bg-[#8B0000]'}`}>
                              {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
                            </div>
                          </div>
                        </button>
                      </div>
                      
                      {/* Simple Instructions */}
                      <div className="px-5 pb-5">
                        <div className="flex items-start gap-3 text-[#5C3A1E]/60">
                          <div className="w-5 h-5 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-[#D4AF37]">?</span>
                          </div>
                          <p className="text-[12px] leading-relaxed">
                            Open your UPI app → Pay → Paste ID → <span className="font-semibold text-[#8B0000]">₹{totalRupees}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <OrDivider />

                    {/* QR Code - Expandable on mobile - Minimal design */}
                    <button 
                      onClick={() => setShowQrCode(!showQrCode)}
                      className="w-full flex items-center justify-center gap-2 py-3 text-[#5C3A1E]/50 hover:text-[#5C3A1E]/70 transition-colors"
                      data-testid="qr-toggle-btn"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="3" height="3" />
                      </svg>
                      <span className="text-xs font-medium">
                        {showQrCode ? 'Hide QR Code' : 'Show QR Code'}
                      </span>
                      {showQrCode ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    {showQrCode && (
                      <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 mt-2">
                        <div className="flex flex-col items-center">
                          <div className="p-3 bg-white rounded-xl border border-[#E8DDD0]" data-testid="upi-qr-code-mobile">
                            <QRCodeSVG value={qrLink} size={140} level="M" bgColor="#FFFFFF" fgColor="#000000" marginSize={2} />
                          </div>
                          <p className="text-[11px] text-[#5C3A1E]/40 mt-3 text-center">
                            Scan from another device
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* DESKTOP VIEW - QR Code on top (collapsible), Copy UPI ID below */}
                {!isMobile && (
                  <div className="space-y-0">
                    {/* QR Code - Collapsible, on top for desktop */}
                    <div className="bg-white rounded-2xl border border-[#E8DDD0] shadow-sm overflow-hidden">
                      <button 
                        onClick={() => setShowQrCode(!showQrCode)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FFF8F0]/50 transition-colors"
                        data-testid="qr-toggle-btn-desktop"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#FFF8F0] flex items-center justify-center border border-[#E8DDD0]">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#5C3A1E]/60" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="7" height="7" rx="1" />
                              <rect x="14" y="3" width="7" height="7" rx="1" />
                              <rect x="3" y="14" width="7" height="7" rx="1" />
                              <rect x="14" y="14" width="3" height="3" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-[#5C3A1E]">Scan QR Code</p>
                            <p className="text-[11px] text-[#5C3A1E]/50">Pay using any UPI app</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#5C3A1E]/40">{showQrCode ? 'Hide' : 'Show'}</span>
                          {showQrCode ? (
                            <ChevronUp className="w-5 h-5 text-[#5C3A1E]/40" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#5C3A1E]/40" />
                          )}
                        </div>
                      </button>
                      
                      {/* Collapsible QR Code Content */}
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showQrCode ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-5 pb-5 pt-2 border-t border-[#E8DDD0]">
                          <div className="flex flex-col items-center">
                            <div className="p-3 bg-white rounded-xl border-2 border-dashed border-[#D4AF37]/30" data-testid="upi-qr-code">
                              <QRCodeSVG 
                                value={qrLink} 
                                size={160} 
                                level="M" 
                                bgColor="#FFFFFF" 
                                fgColor="#000000" 
                                marginSize={2}
                              />
                            </div>
                            <div className="bg-[#8B0000]/5 border border-[#8B0000]/10 rounded-full px-4 py-1.5 mt-3">
                              <span className="text-sm font-semibold text-[#8B0000]">Pay ₹{totalRupees}</span>
                            </div>
                            <p className="text-[10px] text-[#5C3A1E]/40 mt-2">Open GPay, PhonePe or Paytm and scan</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <OrDivider />

                    {/* Copy UPI ID - Below QR on desktop */}
                    <div className="bg-white rounded-2xl border border-[#E8DDD0] shadow-sm overflow-hidden">
                      {/* UPI ID Display */}
                      <div className="px-5 pt-5 pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[11px] uppercase tracking-wider text-[#5C3A1E]/40 font-medium">UPI ID</p>
                          <div className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-[#FFF8F0] text-[#5C3A1E]/50'}`}>
                            {copied ? '✓ Copied' : 'Click to copy'}
                          </div>
                        </div>
                        
                        <button
                          onClick={copyUpiId}
                          className="w-full text-left group"
                          data-testid="copy-upi-btn"
                        >
                          <div className="flex items-center justify-between gap-5 p-4 bg-gradient-to-r from-[#FFF8F0] to-[#FFFBF5] rounded-xl border border-[#E8DDD0] group-hover:border-[#8B0000]/30 group-active:scale-[0.99] transition-all">
                            <p className="text-sm font-mono font-semibold text-[#8B0000] tracking-wide">{upiConfig.upi_id}</p>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${copied ? 'bg-green-500' : 'bg-[#8B0000]'}`}>
                              {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
                            </div>
                          </div>
                        </button>
                      </div>
                      
                      {/* Instructions */}
                      <div className="px-5 pb-5">
                        <div className="flex items-start gap-3 text-[#5C3A1E]/60">
                          <div className="w-5 h-5 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-[#D4AF37]">?</span>
                          </div>
                          <p className="text-[12px] leading-relaxed">
                            Open your UPI app → Pay → Paste ID → <span className="font-semibold text-[#8B0000]">₹{totalRupees}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: After Payment */}
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-gradient-to-b from-[#8B0000]/5 via-[#D4AF37]/5 to-transparent rounded-2xl -mx-2 -mt-2" />
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#8B0000] text-white text-xs font-bold shadow-sm">
                      2
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#5C3A1E]">After Payment</h3>
                      <p className="text-[10px] text-[#5C3A1E]/50">Complete your blessing details</p>
                    </div>
                  </div>
                </div>
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

              {/* Bottom padding */}
              <div className="h-2" />
            </div>
          )}
        </div>
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
