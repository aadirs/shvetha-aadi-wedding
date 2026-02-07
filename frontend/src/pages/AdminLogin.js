import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminLogin({ username, password });
      localStorage.setItem("admin_token", res.data.token);
      toast.success("Welcome back!");
      navigate("/admin");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mandala-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-crimson/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-crimson" />
          </div>
          <h1 className="font-serif text-2xl text-foreground mb-1" data-testid="admin-login-title">Admin Login</h1>
          <p className="text-muted-foreground text-sm font-sans">Manage gift collections</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 gold-border space-y-5" data-testid="admin-login-form">
          <div className="space-y-2">
            <Label htmlFor="username" className="font-sans text-sm">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              className="bg-background border-border/40 font-sans"
              data-testid="admin-username-input"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-sans text-sm">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              className="bg-background border-border/40 font-sans"
              data-testid="admin-password-input"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-crimson hover:bg-crimson/90 text-white rounded-full font-sans"
            data-testid="admin-login-submit"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
