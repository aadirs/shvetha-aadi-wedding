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
import { X, HelpCircle, Loader2, QrCode, Copy, Check } from "lucide-react";
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
  const [form, setForm] = useState({ name: "", phone: "", message: "", utr: "" });
  const [upiConfig, setUpiConfig] = useState({ upi_id: DEFAULT_UPI_ID, upi_name: DEFAULT_UPI_NAME });

  const totalRupees = (totalPaise / 100).toLocaleString("en-IN");
  const amountForQr = (totalPaise / 100).toFixed(2);

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

  // Build QR code UPI link - use simple, clean format for maximum compatibility
  // Note: For personal UPI IDs, QR scanning is the ONLY reliable method
  // Deep links/intents are restricted by Google Pay and other apps for personal VPAs
  const shortId = sessionId ? sessionId.split("-")[0].toUpperCase() : "GIFT";
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

              {/* Step 1: Make Payment */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#8B0000] text-white text-xs font-bold shadow-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#5C3A1E]">Make Payment</h3>
                    <p className="text-[10px] text-[#5C3A1E]/50">Scan QR with any UPI app</p>
                  </div>
                </div>

                {/* QR Code - Primary payment method */}
                <div className="bg-white rounded-2xl p-5 border border-[#E8DDD0]/80 shadow-sm">
                  <div className="flex flex-col items-center">
                    {/* QR Code */}
                    <div className="p-3 bg-white rounded-xl border-2 border-dashed border-[#D4AF37]/30 mb-3" data-testid="upi-qr-code">
                      <QRCodeSVG 
                        value={qrLink} 
                        size={180} 
                        level="M" 
                        bgColor="#FFFFFF" 
                        fgColor="#000000" 
                        marginSize={2}
                      />
                    </div>
                    
                    {/* Amount badge */}
                    <div className="bg-[#8B0000]/5 border border-[#8B0000]/10 rounded-full px-4 py-1.5 mb-3">
                      <span className="text-sm font-semibold text-[#8B0000]">Pay ₹{totalRupees}</span>
                    </div>
                    
                    {/* Instructions */}
                    <div className="text-center space-y-1">
                      <p className="text-[11px] text-[#5C3A1E]/60">
                        Open <span className="font-medium">GPay, PhonePe, Paytm</span> or any UPI app
                      </p>
                      <p className="text-[10px] text-[#5C3A1E]/40">
                        Tap "Scan QR" and scan the code above
                      </p>
                    </div>
                    
                    {/* Divider */}
                    <div className="flex items-center gap-3 w-full my-4">
                      <div className="flex-1 h-px bg-[#E8DDD0]" />
                      <span className="text-[10px] text-[#5C3A1E]/40 uppercase">or pay manually</span>
                      <div className="flex-1 h-px bg-[#E8DDD0]" />
                    </div>
                    
                    {/* Manual UPI ID */}
                    <div className="w-full">
                      <p className="text-[10px] text-[#5C3A1E]/50 mb-2 text-center">Send to this UPI ID:</p>
                      <div className="flex items-center gap-2 bg-[#FFF8F0] rounded-xl px-4 py-3 border border-[#E8DDD0]">
                        <div className="flex-1">
                          <p className="text-sm font-mono font-medium text-[#5C3A1E]">{upiConfig.upi_id}</p>
                          <p className="text-[10px] text-[#5C3A1E]/40">{upiConfig.upi_name}</p>
                        </div>
                        <button
                          onClick={copyUpiId}
                          className="p-2 rounded-lg bg-white border border-[#E8DDD0] hover:bg-[#8B0000]/5 transition-colors"
                          data-testid="copy-upi-btn"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-[#5C3A1E]/60" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
