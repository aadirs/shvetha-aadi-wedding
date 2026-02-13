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
import { Separator } from "../components/ui/separator";
import { X, Smartphone, HelpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const UPI_ID = "861805225@ybl";
const UPI_NAME = "Shvetha%20%26%20Aadi%20Wedding%20Gift";

function fireGoldenConfetti() {
  const colors = ["#D4AF37", "#F5D78E", "#C9A55C", "#FFE4C4", "#FFDAB9", "#E8C991"];
  confetti({
    particleCount: 60,
    spread: 80,
    startVelocity: 20,
    gravity: 0.6,
    ticks: 200,
    origin: { y: 0.6 },
    colors,
    shapes: ["circle", "square"],
    scalar: 0.9,
  });
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 60,
      startVelocity: 15,
      gravity: 0.5,
      ticks: 180,
      origin: { y: 0.5, x: 0.3 },
      colors,
      scalar: 0.8,
    });
  }, 400);
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 60,
      startVelocity: 15,
      gravity: 0.5,
      ticks: 180,
      origin: { y: 0.5, x: 0.7 },
      colors,
      scalar: 0.8,
    });
  }, 700);
}

export default function UpiModal({ isOpen, onClose, allocations, totalPaise, potSlug }) {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [step, setStep] = useState("payment"); // "payment" | "blessing"
  const [sessionId, setSessionId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "", utr: "" });

  const totalRupees = (totalPaise / 100).toLocaleString("en-IN");

  useEffect(() => {
    if (isOpen && !sessionId) {
      createSession();
    }
  }, [isOpen]);

  async function createSession() {
    setCreating(true);
    try {
      const res = await createUpiSession({ allocations });
      setSessionId(res.data.session_id);
    } catch (e) {
      toast.error("Could not create session. Please try again.");
      onClose();
    } finally {
      setCreating(false);
    }
  }

  const shortSessionId = sessionId ? sessionId.split("-")[0] : "";
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${totalPaise / 100}&cu=INR&tn=Wedding%20Gift&tr=${shortSessionId}`;

  async function handleSubmitBlessing() {
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.error("Please fill in your name, phone, and blessing message");
      return;
    }
    setSubmitting(true);
    try {
      await confirmBlessing({
        session_id: sessionId,
        donor_name: form.name.trim(),
        donor_phone: form.phone.trim(),
        donor_message: form.message.trim(),
        utr: form.utr.trim() || undefined,
      });
      fireGoldenConfetti();
      clearCart();
      toast.success("Your blessing has been received!");
      setTimeout(() => {
        navigate(`/thank-you?session=${sessionId}&pot=${potSlug || ""}&name=${encodeURIComponent(form.name.trim())}`);
      }, 2000);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Something went wrong");
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="upi-modal">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-[95vw] max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#FFF8F0] shadow-2xl border border-[#D4AF37]/30"
           style={{ scrollbarWidth: "none" }}>
        {/* Header ornament */}
        <div className="h-1.5 bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#8B0000]" />

        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 z-10" data-testid="upi-modal-close">
          <X className="w-5 h-5 text-[#5C3A1E]" />
        </button>

        <div className="p-6 pt-5">
          {creating ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#8B0000]" />
              <p className="text-[#5C3A1E] font-serif">Preparing your blessing...</p>
            </div>
          ) : step === "payment" ? (
            <>
              {/* Payment step */}
              <div className="text-center mb-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8B0000]/70 mb-1">Wedding Gift</p>
                <h2 className="font-serif text-2xl text-[#5C3A1E]">Send Your Blessing</h2>
                <p className="text-[#8B0000] font-serif text-xl mt-2 font-semibold">
                  ₹{totalRupees}
                </p>
              </div>

              <Separator className="bg-[#D4AF37]/20 my-4" />

              {/* UPI Deep Link Button */}
              <a href={upiLink} className="block w-full" data-testid="upi-pay-btn">
                <Button className="w-full h-12 bg-[#8B0000] hover:bg-[#6B0000] text-white font-serif text-base rounded-xl gap-2">
                  <Smartphone className="w-5 h-5" />
                  Pay via UPI App
                </Button>
              </a>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#D4AF37]/20" />
                <span className="text-xs text-[#5C3A1E]/50 uppercase tracking-wider">or scan</span>
                <div className="flex-1 h-px bg-[#D4AF37]/20" />
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-xl border-2 border-[#D4AF37]/30 shadow-inner" data-testid="upi-qr-code">
                  <QRCodeSVG
                    value={upiLink}
                    size={240}
                    level="M"
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    marginSize={4}
                  />
                </div>
              </div>

              <p className="text-center text-sm text-[#5C3A1E]/70 mt-5 leading-relaxed italic px-2">
                After completing payment in your UPI app, please return here and confirm your blessing.
              </p>

              <Button
                onClick={() => setStep("blessing")}
                variant="outline"
                className="w-full mt-4 h-11 border-[#D4AF37]/40 text-[#5C3A1E] font-serif rounded-xl hover:bg-[#D4AF37]/10"
                data-testid="upi-proceed-confirm"
              >
                I've completed the payment
              </Button>
            </>
          ) : (
            <>
              {/* Blessing confirmation step */}
              <div className="text-center mb-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8B0000]/70 mb-1">Almost done</p>
                <h2 className="font-serif text-2xl text-[#5C3A1E]">Confirm Your Blessing</h2>
              </div>

              <Separator className="bg-[#D4AF37]/20 my-4" />

              <div className="space-y-4">
                <div>
                  <Label className="text-[#5C3A1E] font-serif text-sm">Your Name *</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your name"
                    className="mt-1 bg-white border-[#D4AF37]/30 focus:border-[#8B0000] rounded-lg"
                    data-testid="blessing-name-input"
                  />
                </div>
                <div>
                  <Label className="text-[#5C3A1E] font-serif text-sm">Phone Number *</Label>
                  <Input
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="mt-1 bg-white border-[#D4AF37]/30 focus:border-[#8B0000] rounded-lg"
                    data-testid="blessing-phone-input"
                  />
                </div>
                <div>
                  <Label className="text-[#5C3A1E] font-serif text-sm">Your Blessing *</Label>
                  <Textarea
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Write your heartfelt blessing for the couple..."
                    className="mt-1 bg-white border-[#D4AF37]/30 focus:border-[#8B0000] rounded-lg min-h-[80px]"
                    data-testid="blessing-message-input"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Label className="text-[#5C3A1E] font-serif text-sm">UTR Number</Label>
                    <span className="text-[#5C3A1E]/40 text-xs">(optional)</span>
                    <button
                      className="relative"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      onClick={() => setShowTooltip(!showTooltip)}
                      type="button"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-[#5C3A1E]/40" />
                      {showTooltip && (
                        <div className="absolute left-6 -top-2 w-56 p-2.5 bg-white rounded-lg shadow-lg border border-[#D4AF37]/20 text-left z-10">
                          <p className="text-xs text-[#5C3A1E]/80 leading-relaxed">
                            The UTR (Unique Transaction Reference) number can be found in your UPI app's transaction history or payment confirmation screen.
                          </p>
                        </div>
                      )}
                    </button>
                  </div>
                  <Input
                    value={form.utr}
                    onChange={e => setForm({ ...form, utr: e.target.value })}
                    placeholder="12-digit UTR number"
                    className="mt-1 bg-white border-[#D4AF37]/30 focus:border-[#8B0000] rounded-lg"
                    data-testid="blessing-utr-input"
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmitBlessing}
                disabled={submitting}
                className="w-full mt-6 h-12 bg-[#8B0000] hover:bg-[#6B0000] text-white font-serif text-base rounded-xl"
                data-testid="submit-blessing-btn"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "I've sent my blessing ✨"
                )}
              </Button>

              <button
                onClick={() => setStep("payment")}
                className="w-full mt-2 text-center text-sm text-[#5C3A1E]/50 hover:text-[#5C3A1E]/70"
              >
                ← Back to payment
              </button>
            </>
          )}
        </div>

        {/* Footer ornament */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
      </div>
    </div>
  );
}
