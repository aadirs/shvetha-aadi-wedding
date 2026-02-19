import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider, useCart } from "./context/CartContext";
import { Toaster } from "./components/ui/sonner";
import LandingPage from "./pages/LandingPage";
import StoryPage from "./pages/StoryPage";
import RitualsPage from "./pages/RitualsPage";
import CelebrationPage from "./pages/CelebrationPage";
import BlessingsPage from "./pages/BlessingsPage";
import PotPage from "./pages/PotPage";
import ThankYou from "./pages/ThankYou";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPots from "./pages/AdminPots";
import AdminContributions from "./pages/AdminContributions";
import AdminSettings from "./pages/AdminSettings";
import CartDrawer from "./components/CartDrawer";
import { Badge } from "./components/ui/badge";

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

function FloatingCartButton() {
  const { items, setIsOpen } = useCart();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isLanding = location.pathname === "/";
  // Hide on admin pages, landing page, or when cart is empty
  if (isAdmin || isLanding || items.length === 0) return null;
  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-20 right-6 z-50 bg-crimson text-white rounded-full p-4 shadow-lg hover:scale-105 transition-transform"
      data-testid="floating-cart-btn"
    >
      <GiftBoxIcon className="w-6 h-6" />
      <Badge className="absolute -top-1 -right-1 bg-gold text-crimson text-xs w-5 h-5 flex items-center justify-center p-0 rounded-full">
        {items.length}
      </Badge>
    </button>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/p/:slug" element={<PotPage />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/pots" element={<AdminPots />} />
            <Route path="/admin/contributions" element={<AdminContributions />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Routes>
          <FloatingCartButton />
          <CartDrawer />
          <Toaster position="top-center" richColors />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
