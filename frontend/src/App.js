import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "./components/ui/sonner";
import Home from "./pages/Home";
import PotPage from "./pages/PotPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPots from "./pages/AdminPots";
import AdminContributions from "./pages/AdminContributions";
import CartDrawer from "./components/CartDrawer";

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
          <CartDrawer />
          <Toaster position="top-center" richColors />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
