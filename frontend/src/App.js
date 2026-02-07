import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider, useCart } from "./context/CartContext";
import { Toaster } from "./components/ui/sonner";
import Home from "./pages/Home";
import PotPage from "./pages/PotPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPots from "./pages/AdminPots";
import AdminContributions from "./pages/AdminContributions";
import CartDrawer from "./components/CartDrawer";
import { ShoppingBag } from "lucide-react";
import { Badge } from "./components/ui/badge";

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
      <ShoppingBag className="w-6 h-6" />
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
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/pots" element={<AdminPots />} />
            <Route path="/admin/contributions" element={<AdminContributions />} />
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
