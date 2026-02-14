import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider, useCart } from "./context/CartContext";
import { Toaster } from "./components/ui/sonner";
import Home from "./pages/Home";
import PotPage from "./pages/PotPage";
import ThankYou from "./pages/ThankYou";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPots from "./pages/AdminPots";
import AdminContributions from "./pages/AdminContributions";
import AdminSettings from "./pages/AdminSettings";
import CartDrawer from "./components/CartDrawer";
import { Badge } from "./components/ui/badge";

// Custom Kalash/Pot icon - traditional South Indian ceremonial pot
function KalashIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Pot body */}
      <path d="M6 20h12c0 0 1-2 1-4s-1-4-1-4H6s-1 2-1 4 1 4 1 4z" />
      {/* Pot neck */}
      <path d="M8 12V9c0-1 1-2 4-2s4 1 4 2v3" />
      {/* Coconut on top */}
      <circle cx="12" cy="5" r="2" />
      {/* Mango leaves */}
      <path d="M10 5c-1-1-2-1-3 0" />
      <path d="M14 5c1-1 2-1 3 0" />
      {/* Decorative band */}
      <path d="M7 14h10" />
    </svg>
  );
}

function FloatingCartButton() {
  const { items, setIsOpen } = useCart();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  if (isAdmin || items.length === 0) return null;
  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-20 right-6 z-50 bg-crimson text-white rounded-full p-4 shadow-lg hover:scale-105 transition-transform"
      data-testid="floating-cart-btn"
    >
      <KalashIcon className="w-6 h-6" />
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
