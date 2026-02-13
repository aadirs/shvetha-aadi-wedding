import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { createUpiSession, confirmBlessing } from "../lib/api";
import { useCart } from "../context/CartContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { X, Smartphone, HelpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const UPI_ID = "8618052253@ybl";
const UPI_NAME = "Shvetha%20%26%20Aadi%20Wedding%20Gift";

function fireGoldenConfetti() {
  const colors = ["#D4AF37", "#F5D78E", "#C9A55C", "#FFE4C4", "#FFDAB9", "#E8C991"];
  confetti({ particleCount: 60, spread: 80, startVelocity: 20, gravity: 0.6, ticks: 200, origin: { y: 0.6 }, colors, shapes: ["circle", "square"], scalar: 0.9 });
  setTimeout(() => confetti({ particleCount: 30, spread: 60, startVelocity: 15, gravity: 0.5, ticks: 180, origin: { y: 0.5, x: 0.3 }, colors, scalar: 0.8 }), 400);
  setTimeout(() => confetti({ particleCount: 30, spread: 60, startVelocity: 15, gravity: 0.5, ticks: 180, origin: { y: 0.5, x: 0.7 }, colors, scalar: 0.8 }), 700);
}

export default function UpiModal({ isOpen, onClose, allocations, totalPaise, potSlug }) {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [sessionId, setSessionId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "", utr: "" });

  const totalRupees = (totalPaise / 100).toLocaleString("en-IN");

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
      setForm({ name: "", phone: "", message: "", utr: "" });
    }
  }, [isOpen]);

  const shortId = sessionId ? sessionId.split("-")[0] : "";
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${totalPaise / 100}&cu=INR&tn=Wedding%20Gift&tr=${shortId}`;

  async function handleSubmit() {
    if (!form.name.trim()) { toast.error("Please enter your name"); return; }
    if (!form.phone.trim()) { toast.error("Please enter your phone number"); return; }
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
      toast.success("Your blessing has been received!");

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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={!submitting && !success ? onClose : undefined} />

      <div className="relative w-full sm:w-[420px] max-h-[92vh] overflow-hidden rounded-t-3xl sm:rounded-2xl bg-[#FFFBF5] shadow-2xl"
           style={{ animation: "slideUp 0.35s ease-out" }}>

        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#8B0000]" />

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(92vh-4px)]" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>

          {/* Close button */}
          {!submitting && !success && (
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 z-10" data-testid="upi-modal-close">
              <X className="w-4 h-4 text-[#5C3A1E]/60" />
            </button>
          )}

          {creating ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-[#8B0000]" />
              <p className="text-[#5C3A1E]/70 font-serif text-sm">Preparing your blessing...</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center py-20 gap-3 px-6">
              <div className="w-16 h-16 rounded-full bg-[#8B0000]/10 flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-[#8B0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#8B0000]/60 mb-1.5 font-medium">Wedding Gift</p>
                <h2 className="font-serif text-[22px] text-[#5C3A1E] leading-tight">Send Your Blessing</h2>
                <div className="mt-2 inline-block px-4 py-1 rounded-full bg-[#8B0000]/5">
                  <span className="font-serif text-[#8B0000] text-lg font-semibold">₹{totalRupees}</span>
                </div>
              </div>

              {/* QR + Pay button — compact */}
              <div className="bg-white rounded-2xl p-5 border border-[#E8DDD0] mb-6">
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100" data-testid="upi-qr-code">
                    <QRCodeSVG value={upiLink} size={180} level="M" bgColor="#FFFFFF" fgColor="#000000" marginSize={4} />
                  </div>

                  <p className="text-[11px] text-[#5C3A1E]/40 mt-3 mb-3">Scan with any UPI app</p>

                  <a href={upiLink} className="w-full" data-testid="upi-pay-btn">
                    <Button className="w-full h-10 bg-[#8B0000] hover:bg-[#6B0000] text-white font-serif text-sm rounded-xl gap-2 shadow-sm">
                      <Smartphone className="w-4 h-4" />
                      Pay via UPI App
                    </Button>
                  </a>
                </div>
              </div>

              {/* Instruction */}
              <p className="text-center text-[12px] text-[#5C3A1E]/50 mb-5 leading-relaxed italic">
                After completing payment, fill in your details below
              </p>

              {/* Thin divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[#D4AF37]/15" />
                <span className="text-[10px] text-[#5C3A1E]/30 uppercase tracking-[0.15em]">your details</span>
                <div className="flex-1 h-px bg-[#D4AF37]/15" />
              </div>

              {/* Form fields — compact */}
              <div className="space-y-3.5">
                <div>
                  <Label className="text-[#5C3A1E]/80 text-xs font-medium">Name <span className="text-[#8B0000]">*</span></Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="mt-1 h-10 bg-white border-[#E8DDD0] focus:border-[#8B0000] focus:ring-[#8B0000]/10 rounded-xl text-sm"
                    data-testid="blessing-name-input"
                  />
                </div>
                <div>
                  <Label className="text-[#5C3A1E]/80 text-xs font-medium">Phone <span className="text-[#8B0000]">*</span></Label>
                  <Input
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="mt-1 h-10 bg-white border-[#E8DDD0] focus:border-[#8B0000] focus:ring-[#8B0000]/10 rounded-xl text-sm"
                    data-testid="blessing-phone-input"
                  />
                </div>
                <div>
                  <Label className="text-[#5C3A1E]/80 text-xs font-medium">Your Blessing <span className="text-[#8B0000]">*</span></Label>
                  <Textarea
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Write your heartfelt blessing..."
                    className="mt-1 bg-white border-[#E8DDD0] focus:border-[#8B0000] focus:ring-[#8B0000]/10 rounded-xl text-sm min-h-[70px] resize-none"
                    data-testid="blessing-message-input"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Label className="text-[#5C3A1E]/80 text-xs font-medium">UTR</Label>
                    <span className="text-[10px] text-[#5C3A1E]/30">(optional)</span>
                    <button
                      className="relative"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      onClick={() => setShowTooltip(!showTooltip)}
                      type="button"
                    >
                      <HelpCircle className="w-3 h-3 text-[#5C3A1E]/30" />
                      {showTooltip && (
                        <div className="absolute left-5 -top-1 w-52 p-2.5 bg-white rounded-lg shadow-lg border border-[#E8DDD0] text-left z-10">
                          <p className="text-[11px] text-[#5C3A1E]/70 leading-relaxed">
                            Find the UTR number in your UPI app's transaction history or payment confirmation.
                          </p>
                        </div>
                      )}
                    </button>
                  </div>
                  <Input
                    value={form.utr}
                    onChange={e => setForm({ ...form, utr: e.target.value })}
                    placeholder="12-digit UTR number"
                    className="mt-1 h-10 bg-white border-[#E8DDD0] focus:border-[#8B0000] focus:ring-[#8B0000]/10 rounded-xl text-sm"
                    data-testid="blessing-utr-input"
                  />
                </div>
              </div>

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-6 h-12 bg-[#8B0000] hover:bg-[#6B0000] text-white font-serif text-[15px] rounded-xl shadow-md transition-all"
                data-testid="submit-blessing-btn"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "I've sent my blessing ✨"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
