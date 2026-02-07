import { useState } from "react";
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
import { Trash2, ShoppingBag, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CartDrawer() {
  const { items, removeItem, clearCart, totalPaise, isOpen, setIsOpen } = useCart();
  const [donor, setDonor] = useState({ name: "", email: "", phone: "", message: "" });
  const [coverFees, setCoverFees] = useState(true);
  const [paying, setPaying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const feePaise = coverFees ? Math.ceil(totalPaise * 0.0236) : 0;
  const grandTotalPaise = totalPaise + feePaise;

  // Derive pot slug from current path for redirect
  const potSlug = location.pathname.startsWith("/p/") ? location.pathname.split("/p/")[1] : null;

  const handlePay = async () => {
    if (!donor.name || !donor.email || !donor.phone) {
      toast.error("Please fill in your name, email, and phone");
      return;
    }
    if (items.length === 0) { toast.error("Cart is empty"); return; }

    setPaying(true);
    try {
      const allocations = items.map(item => ({
        pot_id: item.potId,
        pot_item_id: item.itemId,
        amount_paise: item.amountPaise
      }));

      const sessionRes = await createSession({
        donor_name: donor.name, donor_email: donor.email,
        donor_phone: donor.phone, donor_message: donor.message,
        allocations, cover_fees: coverFees
      });

      const orderRes = await createOrder({ session_id: sessionRes.data.session_id });
      const od = orderRes.data;

      const options = {
        key: od.key_id,
        amount: od.amount,
        currency: od.currency,
        order_id: od.order_id,
        name: "Shvetha & Aadi",
        description: "Wedding Gift Contribution",
        prefill: od.prefill,
        theme: { color: "#8B0000" },
        handler: async function () {
          // Redirect to thank-you page
          const donorName = encodeURIComponent(donor.name);
          const slug = potSlug || items[0]?.potId || "";
          clearCart();
          setDonor({ name: "", email: "", phone: "", message: "" });
          setIsOpen(false);
          setPaying(false);
          navigate(`/thank-you?session=${sessionRes.data.session_id}&pot=${slug}&name=${donorName}`);
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
            toast.info("Payment was cancelled");
          }
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error("Payment gateway not loaded. Please refresh the page.");
        setPaying(false);
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Something went wrong");
      setPaying(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (success) setSuccess(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="bg-card border-l border-gold/20 w-full sm:max-w-md p-0" data-testid="cart-drawer">
        <SheetHeader className="p-5 pb-0">
          <SheetTitle className="font-serif text-xl flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold" />
            Your Gift Basket
          </SheetTitle>
        </SheetHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center" data-testid="payment-success">
            <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
            <h3 className="font-serif text-2xl text-foreground mb-2">Thank You!</h3>
            <p className="text-muted-foreground font-sans text-sm mb-6">
              Your generous gift has been received. Shvetha & Aadi are grateful for your blessings.
            </p>
            <Button onClick={handleClose} className="bg-crimson text-white rounded-full font-sans">
              Close
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-5 space-y-5">
              {/* Cart Items */}
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-10 font-sans text-sm" data-testid="empty-cart">
                  Your basket is empty
                </p>
              ) : (
                <div className="space-y-3" data-testid="cart-items">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-background/50 rounded-lg p-3 border border-border/30" data-testid={`cart-item-${item.id}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-sans font-medium text-foreground truncate">{item.potTitle}</p>
                        {item.itemTitle && <p className="text-xs text-muted-foreground truncate">{item.itemTitle}</p>}
                        <p className="text-sm font-sans font-bold text-foreground mt-1">
                          {"\u20B9"}{(item.amountPaise / 100).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-destructive/50 hover:text-destructive ml-2 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <>
                  <Separator className="bg-border/40" />

                  {/* Donor Form */}
                  <div className="space-y-4" data-testid="donor-form">
                    <h4 className="font-serif text-base text-foreground">Your Details</h4>
                    <div>
                      <Label className="font-sans text-xs text-muted-foreground">Name *</Label>
                      <Input
                        value={donor.name} onChange={e => setDonor({...donor, name: e.target.value})}
                        placeholder="Your name"
                        className="mt-1 bg-background border-border/40 font-sans text-sm"
                        data-testid="donor-name-input"
                      />
                    </div>
                    <div>
                      <Label className="font-sans text-xs text-muted-foreground">Email *</Label>
                      <Input
                        type="email" value={donor.email} onChange={e => setDonor({...donor, email: e.target.value})}
                        placeholder="your@email.com"
                        className="mt-1 bg-background border-border/40 font-sans text-sm"
                        data-testid="donor-email-input"
                      />
                    </div>
                    <div>
                      <Label className="font-sans text-xs text-muted-foreground">Phone *</Label>
                      <Input
                        type="tel" value={donor.phone} onChange={e => setDonor({...donor, phone: e.target.value})}
                        placeholder="+91 98765 43210"
                        className="mt-1 bg-background border-border/40 font-sans text-sm"
                        data-testid="donor-phone-input"
                      />
                    </div>
                    <div>
                      <Label className="font-sans text-xs text-muted-foreground">Message (optional)</Label>
                      <Textarea
                        value={donor.message} onChange={e => setDonor({...donor, message: e.target.value})}
                        placeholder="Your blessings for the couple..."
                        className="mt-1 bg-background border-border/40 font-sans text-sm resize-none"
                        rows={2}
                        data-testid="donor-message-input"
                      />
                    </div>
                  </div>

                  <Separator className="bg-border/40" />

                  {/* Fee Toggle */}
                  <div className="flex items-center justify-between" data-testid="fee-toggle">
                    <div>
                      <p className="font-sans text-sm text-foreground">Cover payment fees</p>
                      <p className="text-xs text-muted-foreground">+{"\u20B9"}{(feePaise / 100).toFixed(2)} (2.36%)</p>
                    </div>
                    <Switch checked={coverFees} onCheckedChange={setCoverFees} />
                  </div>

                  {/* Totals */}
                  <div className="bg-crimson/5 rounded-lg p-4 space-y-2" data-testid="cart-totals">
                    <div className="flex justify-between text-sm font-sans">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{"\u20B9"}{(totalPaise / 100).toLocaleString('en-IN')}</span>
                    </div>
                    {coverFees && (
                      <div className="flex justify-between text-sm font-sans">
                        <span className="text-muted-foreground">Gateway fees</span>
                        <span className="text-foreground">{"\u20B9"}{(feePaise / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <Separator className="bg-border/40" />
                    <div className="flex justify-between font-serif">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="font-bold text-foreground text-lg">
                        {"\u20B9"}{(grandTotalPaise / 100).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <Button
                    onClick={handlePay}
                    disabled={paying}
                    className="w-full bg-crimson hover:bg-crimson/90 text-white rounded-full font-sans py-6 text-base"
                    data-testid="pay-btn"
                  >
                    {paying ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      <><CreditCard className="w-5 h-5 mr-2" /> Pay {"\u20B9"}{(grandTotalPaise / 100).toLocaleString('en-IN')}</>
                    )}
                  </Button>
                </>
              )}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
