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
import { Trash2, ShoppingBag, CreditCard, Loader2, Heart } from "lucide-react";
import { toast } from "sonner";
import UpiModal from "./UpiModal";

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
        <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-[#FFF8F0] border-l border-[#D4AF37]/20" data-testid="cart-drawer">
          <SheetHeader className="p-5 pb-3 border-b border-[#D4AF37]/15">
            <SheetTitle className="font-serif text-[#5C3A1E] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8B0000]" />
              Your Offering
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-5 space-y-5">
              {items.length === 0 ? (
                <div className="text-center py-16" data-testid="empty-cart">
                  <Heart className="w-12 h-12 mx-auto text-[#D4AF37]/30 mb-3" />
                  <p className="font-serif text-[#5C3A1E]/60 text-lg">Your basket is empty</p>
                  <p className="text-sm text-[#5C3A1E]/40 mt-1">Choose a gift to bless the couple</p>
                </div>
              ) : (
                <>
                  {/* Items grouped by pot */}
                  {Object.entries(potGroups).map(([potId, group]) => (
                    <div key={potId} className="bg-white/70 rounded-xl p-4 border border-[#D4AF37]/10">
                      <p className="font-serif text-sm text-[#8B0000] mb-2">{group.potTitle}</p>
                      {group.items.map((item) => (
                        <div key={item.cartId} className="flex items-center justify-between py-1.5" data-testid={`cart-item-${item.cartId}`}>
                          <div>
                            <p className="text-sm text-[#5C3A1E]">{item.itemTitle}</p>
                            <p className="text-xs text-[#5C3A1E]/50">₹{(item.amountPaise / 100).toLocaleString("en-IN")}</p>
                          </div>
                          <button onClick={() => removeItem(item.cartId)} className="p-1.5 rounded-full hover:bg-red-50 transition" data-testid={`remove-item-${item.cartId}`}>
                            <Trash2 className="w-4 h-4 text-[#8B0000]/50 hover:text-[#8B0000]" />
                          </button>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-[#D4AF37]/10 mt-2">
                        <span className="text-xs text-[#5C3A1E]/60">Subtotal</span>
                        <span className="text-sm font-medium text-[#5C3A1E]">₹{(group.total / 100).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ))}

                  <Separator className="bg-[#D4AF37]/15" />

                  {/* Razorpay mode: show donor form + fees */}
                  {PAYMENT_PROVIDER === "razorpay" && (
                    <>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-[#5C3A1E] font-serif text-xs">Your Name *</Label>
                          <Input data-testid="donor-name-input" value={donor.name} onChange={e => setDonor({ ...donor, name: e.target.value })}
                            placeholder="Full name" className="mt-1 bg-white border-[#D4AF37]/30 rounded-lg text-sm h-9" />
                        </div>
                        <div>
                          <Label className="text-[#5C3A1E] font-serif text-xs">Email *</Label>
                          <Input data-testid="donor-email-input" value={donor.email} onChange={e => setDonor({ ...donor, email: e.target.value })}
                            placeholder="Email address" className="mt-1 bg-white border-[#D4AF37]/30 rounded-lg text-sm h-9" />
                        </div>
                        <div>
                          <Label className="text-[#5C3A1E] font-serif text-xs">Phone *</Label>
                          <Input data-testid="donor-phone-input" value={donor.phone} onChange={e => setDonor({ ...donor, phone: e.target.value })}
                            placeholder="+91 XXXXX XXXXX" className="mt-1 bg-white border-[#D4AF37]/30 rounded-lg text-sm h-9" />
                        </div>
                        <div>
                          <Label className="text-[#5C3A1E] font-serif text-xs">Message</Label>
                          <Textarea data-testid="donor-message-input" value={donor.message} onChange={e => setDonor({ ...donor, message: e.target.value })}
                            placeholder="Your blessing..." className="mt-1 bg-white border-[#D4AF37]/30 rounded-lg text-sm min-h-[60px]" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-white/60 rounded-lg p-3 border border-[#D4AF37]/10">
                        <div>
                          <p className="text-sm text-[#5C3A1E]">Cover processing fees</p>
                          <p className="text-xs text-[#5C3A1E]/50">2.36% gateway fee</p>
                        </div>
                        <Switch checked={coverFees} onCheckedChange={setCoverFees} data-testid="cover-fees-toggle" />
                      </div>
                    </>
                  )}

                  {/* Totals */}
                  <div className="bg-white/80 rounded-xl p-4 border border-[#D4AF37]/15 space-y-2">
                    <div className="flex justify-between text-sm text-[#5C3A1E]/70">
                      <span>Gift Total</span>
                      <span>₹{(totalPaise / 100).toLocaleString("en-IN")}</span>
                    </div>
                    {PAYMENT_PROVIDER === "razorpay" && feePaise > 0 && (
                      <div className="flex justify-between text-sm text-[#5C3A1E]/50">
                        <span>Processing Fee</span>
                        <span>₹{(feePaise / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <Separator className="bg-[#D4AF37]/15" />
                    <div className="flex justify-between font-serif text-lg text-[#5C3A1E]" data-testid="cart-total">
                      <span>Total</span>
                      <span>₹{(grandTotalPaise / 100).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Action button */}
                  {PAYMENT_PROVIDER === "upi" ? (
                    <Button
                      onClick={handlePayUpi}
                      className="w-full h-12 bg-[#8B0000] hover:bg-[#6B0000] text-white font-serif text-base rounded-xl shadow-lg"
                      data-testid="proceed-blessing-btn"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Proceed to Blessing
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePayRazorpay}
                      disabled={paying}
                      className="w-full h-12 bg-[#8B0000] hover:bg-[#6B0000] text-white font-serif text-base rounded-xl shadow-lg"
                      data-testid="pay-btn"
                    >
                      {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <><CreditCard className="w-4 h-4 mr-2" /> Pay ₹{(grandTotalPaise / 100).toLocaleString("en-IN")}</>
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
