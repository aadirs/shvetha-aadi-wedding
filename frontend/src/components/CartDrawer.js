import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createSession, createOrder } from "../lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { Trash2, CreditCard, Loader2, Heart, Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";
import UpiModal from "./UpiModal";

// South Indian style gift box - decorated box with traditional aesthetic
function GiftBoxIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {/* Box base */}
      <rect x="3" y="10" width="18" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {/* Box lid */}
      <path d="M2 8.5C2 7.67 2.67 7 3.5 7h17c.83 0 1.5.67 1.5 1.5V10H2V8.5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {/* Vertical ribbon */}
      <rect x="10.5" y="7" width="3" height="14" fill="currentColor" opacity="0.3" />
      {/* Horizontal ribbon */}
      <rect x="2" y="13" width="20" height="3" fill="currentColor" opacity="0.3" />
      {/* Bow - left loop */}
      <path d="M9 7C9 5.5 7.5 4 6 4.5C4.5 5 5 6.5 6 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Bow - right loop */}
      <path d="M15 7C15 5.5 16.5 4 18 4.5C19.5 5 19 6.5 18 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Bow center knot */}
      <circle cx="12" cy="6" r="1.5" fill="currentColor" />
      {/* Decorative dots on box */}
      <circle cx="6" cy="16" r="0.75" fill="currentColor" opacity="0.5" />
      <circle cx="18" cy="16" r="0.75" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

const PAYMENT_PROVIDER = process.env.REACT_APP_PAYMENT_PROVIDER || "razorpay";

export default function CartDrawer() {
  const { items, removeItem, clearCart, totalPaise, isOpen, setIsOpen } = useCart();
  const [donor, setDonor] = useState({ name: "", email: "", phone: "", message: "" });
  const [coverFees, setCoverFees] = useState(true);
  const [paying, setPaying] = useState(false);
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const rzpPendingRef = useRef(null);

  const feePaise = PAYMENT_PROVIDER === "razorpay" && coverFees ? Math.ceil(totalPaise * 0.0236) : 0;
  const grandTotalPaise = totalPaise + feePaise;
  const potSlug = location.pathname.startsWith("/p/") ? location.pathname.split("/p/")[1] : null;

  // Open Razorpay ONLY after Sheet has fully closed (for Razorpay mode)
  useEffect(() => {
    if (!isOpen && rzpPendingRef.current) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
        document.body.removeAttribute('data-scroll-locked');
        document.documentElement.removeAttribute('data-scroll-locked');
        const options = rzpPendingRef.current;
        rzpPendingRef.current = null;
        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          toast.error("Payment gateway not loaded. Please refresh.");
          setPaying(false);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Aggregate items by pot
  const potGroups = items.reduce((acc, item) => {
    const key = item.potId;
    if (!acc[key]) acc[key] = { potTitle: item.potTitle, items: [], total: 0 };
    acc[key].items.push(item);
    acc[key].total += item.amountPaise;
    return acc;
  }, {});

  const handlePayUpi = () => {
    if (items.length === 0) { toast.error("Your basket is empty"); return; }
    const allocations = items.map(item => ({
      pot_id: item.potId,
      pot_item_id: item.itemId,
      amount_paise: item.amountPaise,
    }));
    setIsOpen(false);
    setTimeout(() => setUpiModalOpen(true), 300);
  };

  const handlePayRazorpay = async () => {
    if (!donor.name || !donor.email || !donor.phone) {
      toast.error("Please fill in your name, email, and phone");
      return;
    }
    if (items.length === 0) { toast.error("Cart is empty"); return; }

    setPaying(true);
    try {
      const allocations = items.map(item => ({
        pot_id: item.potId, pot_item_id: item.itemId, amount_paise: item.amountPaise
      }));
      const sessionRes = await createSession({
        donor_name: donor.name, donor_email: donor.email,
        donor_phone: donor.phone, donor_message: donor.message,
        allocations, cover_fees: coverFees
      });
      const orderRes = await createOrder({ session_id: sessionRes.data.session_id });
      const od = orderRes.data;
      const savedDonorName = donor.name;
      const savedSessionId = sessionRes.data.session_id;

      rzpPendingRef.current = {
        key: od.key_id, amount: od.amount, currency: od.currency,
        order_id: od.order_id, name: "Shvetha & Aadi",
        description: "Wedding Gift Contribution",
        prefill: od.prefill, theme: { color: "#8B0000" },
        handler: function () {
          clearCart();
          navigate(`/thank-you?session=${savedSessionId}&pot=${potSlug || ""}&name=${encodeURIComponent(savedDonorName)}`);
        },
        modal: { ondismiss: function () { setPaying(false); toast.info("Payment was cancelled"); } }
      };
      setIsOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Something went wrong");
      setPaying(false);
    }
  };

  const upiAllocations = items.map(item => ({
    pot_id: item.potId, pot_item_id: item.itemId, amount_paise: item.amountPaise,
  }));

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-gradient-to-b from-[#FFFBF5] to-[#FFF5EB] border-l border-[#D4AF37]/20" data-testid="cart-drawer">
          {/* Decorative top border */}
          <div className="h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          
          <SheetHeader className="px-5 pt-5 pb-3">
            <SheetTitle className="font-serif text-xl text-[#5C3A1E] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B0000]/10 to-[#D4AF37]/10 flex items-center justify-center">
                <GiftBoxIcon className="w-5 h-5 text-[#8B0000]" />
              </div>
              <div>
                <span>Your Wish</span>
                {items.length > 0 && (
                  <span className="block text-xs font-sans font-normal text-[#5C3A1E]/50">
                    {items.length} {items.length === 1 ? 'wish' : 'wishes'} selected
                  </span>
                )}
              </div>
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-90px)]">
            <div className="px-5 pb-8 space-y-5">
              {items.length === 0 ? (
                <div className="text-center py-16" data-testid="empty-cart">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#8B0000]/5 flex items-center justify-center">
                    <Heart className="w-10 h-10 text-[#D4AF37]/40" />
                  </div>
                  <p className="font-serif text-lg text-[#5C3A1E]/70">Your basket is empty</p>
                  <p className="text-sm text-[#5C3A1E]/40 mt-2 max-w-[200px] mx-auto">Choose a gift to bless the couple's new beginning</p>
                </div>
              ) : (
                <>
                  {/* Visual pot cards */}
                  <div className="space-y-4">
                    {Object.entries(potGroups).map(([potId, group]) => (
                      <div key={potId} className="relative bg-white rounded-2xl overflow-hidden border border-[#D4AF37]/15 shadow-sm">
                        {/* Pot header with gradient accent */}
                        <div className="bg-gradient-to-r from-[#8B0000]/5 via-[#D4AF37]/10 to-[#8B0000]/5 px-4 py-3 border-b border-[#D4AF37]/10">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                            <p className="font-serif text-sm text-[#8B0000] font-medium">{group.potTitle}</p>
                          </div>
                        </div>
                        
                        {/* Items list */}
                        <div className="p-3 space-y-2">
                          {group.items.map((item) => (
                            <div key={item.cartId} className="flex items-center justify-between p-2 rounded-xl bg-[#FFF8F0] hover:bg-[#FFF5EB] transition-colors group" data-testid={`cart-item-${item.cartId}`}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center">
                                  <Gift className="w-3.5 h-3.5 text-[#D4AF37]" />
                                </div>
                                <div>
                                  <p className="text-sm text-[#5C3A1E] font-medium">{item.itemTitle}</p>
                                  <p className="text-xs text-[#D4AF37] font-semibold">₹{(item.amountPaise / 100).toLocaleString("en-IN")}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => removeItem(item.cartId)} 
                                className="p-2 rounded-full opacity-50 group-hover:opacity-100 hover:bg-red-50 transition-all" 
                                data-testid={`remove-item-${item.cartId}`}
                              >
                                <Trash2 className="w-4 h-4 text-[#8B0000]/70 hover:text-[#8B0000]" />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        {/* Pot subtotal */}
                        <div className="px-4 py-2.5 bg-[#FFF8F0] border-t border-[#D4AF37]/10 flex justify-between items-center">
                          <span className="text-xs text-[#5C3A1E]/50 uppercase tracking-wide">Subtotal</span>
                          <span className="text-sm font-serif font-semibold text-[#5C3A1E]">₹{(group.total / 100).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add more hint */}
                  <p className="text-center text-[11px] text-[#5C3A1E]/40 italic">
                    You can add blessings to multiple pots
                  </p>

                  <Separator className="bg-[#D4AF37]/15" />

                  {/* Razorpay mode: show donor form + fees */}
                  {PAYMENT_PROVIDER === "razorpay" && (
                    <>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-[#5C3A1E]/80 font-serif text-xs">Your Name <span className="text-[#8B0000]">*</span></Label>
                          <Input data-testid="donor-name-input" value={donor.name} onChange={e => setDonor({ ...donor, name: e.target.value })}
                            placeholder="Full name" className="mt-1.5 bg-white border-[#D4AF37]/30 rounded-xl text-sm h-10" />
                        </div>
                        <div>
                          <Label className="text-[#5C3A1E]/80 font-serif text-xs">Email <span className="text-[#8B0000]">*</span></Label>
                          <Input data-testid="donor-email-input" value={donor.email} onChange={e => setDonor({ ...donor, email: e.target.value })}
                            placeholder="Email address" className="mt-1.5 bg-white border-[#D4AF37]/30 rounded-xl text-sm h-10" />
                        </div>
                        <div>
                          <Label className="text-[#5C3A1E]/80 font-serif text-xs">Phone <span className="text-[#8B0000]">*</span></Label>
                          <Input data-testid="donor-phone-input" value={donor.phone} onChange={e => setDonor({ ...donor, phone: e.target.value })}
                            placeholder="+91 98765 43210" className="mt-1.5 bg-white border-[#D4AF37]/30 rounded-xl text-sm h-10" />
                        </div>
                        <div>
                          <Label className="text-[#5C3A1E]/80 font-serif text-xs">Your Blessing</Label>
                          <Textarea data-testid="donor-message-input" value={donor.message} onChange={e => setDonor({ ...donor, message: e.target.value })}
                            placeholder="Wishing Shvetha & Aadi a lifetime of happiness..." className="mt-1.5 bg-white border-[#D4AF37]/30 rounded-xl text-sm min-h-[70px]" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-[#D4AF37]/15">
                        <div>
                          <p className="text-sm text-[#5C3A1E] font-medium">Cover processing fees</p>
                          <p className="text-xs text-[#5C3A1E]/50">2.36% gateway fee</p>
                        </div>
                        <Switch checked={coverFees} onCheckedChange={setCoverFees} data-testid="cover-fees-toggle" />
                      </div>
                    </>
                  )}

                  {/* Grand Total Card */}
                  <div className="bg-gradient-to-br from-white to-[#FFF8F0] rounded-2xl p-5 border border-[#D4AF37]/20 shadow-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-[#5C3A1E]/60">
                        <span>Gift Total</span>
                        <span>₹{(totalPaise / 100).toLocaleString("en-IN")}</span>
                      </div>
                      {PAYMENT_PROVIDER === "razorpay" && feePaise > 0 && (
                        <div className="flex justify-between text-sm text-[#5C3A1E]/40">
                          <span>Processing Fee</span>
                          <span>₹{(feePaise / 100).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <Separator className="my-3 bg-[#D4AF37]/20" />
                    <div className="flex justify-between items-baseline" data-testid="cart-total">
                      <span className="font-serif text-[#5C3A1E] text-sm">Total Blessing</span>
                      <span className="font-serif text-2xl font-semibold text-[#8B0000]">₹{(grandTotalPaise / 100).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Action button */}
                  {PAYMENT_PROVIDER === "upi" ? (
                    <Button
                      onClick={handlePayUpi}
                      className="w-full h-14 bg-gradient-to-r from-[#8B0000] to-[#6B0000] hover:from-[#7B0000] hover:to-[#5B0000] text-white font-serif text-base rounded-2xl shadow-lg transition-all active:scale-[0.98]"
                      data-testid="proceed-blessing-btn"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      Proceed to Blessing
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePayRazorpay}
                      disabled={paying}
                      className="w-full h-14 bg-gradient-to-r from-[#8B0000] to-[#6B0000] hover:from-[#7B0000] hover:to-[#5B0000] text-white font-serif text-base rounded-2xl shadow-lg transition-all"
                      data-testid="pay-btn"
                    >
                      {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <><CreditCard className="w-5 h-5 mr-2" /> Pay ₹{(grandTotalPaise / 100).toLocaleString("en-IN")}</>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* UPI Modal - renders outside Sheet */}
      <UpiModal
        isOpen={upiModalOpen}
        onClose={() => setUpiModalOpen(false)}
        allocations={upiAllocations}
        totalPaise={totalPaise}
        potSlug={potSlug}
      />
    </>
  );
}
