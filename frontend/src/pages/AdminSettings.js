import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchSettings, updateSettings } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { ArrowLeft, Settings, Save, Loader2, Wallet, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [settings, setSettings] = useState({ upi_id: "", upi_name: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      navigate("/admin/login");
      return;
    }
    loadSettings();
  }, [navigate]);

  async function loadSettings() {
    try {
      const res = await fetchSettings();
      setSettings(res.data);
    } catch (e) {
      if (e.response?.status === 401) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
      } else {
        toast.error("Failed to load settings");
      }
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!settings.upi_id.trim()) {
      toast.error("UPI ID is required");
      return;
    }
    if (!settings.upi_id.includes("@")) {
      toast.error("Invalid UPI ID format. Must contain @");
      return;
    }

    setSaving(true);
    try {
      await updateSettings(settings);
      setSaved(true);
      toast.success("Settings saved successfully");
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to save settings");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b px-6 py-3 flex items-center gap-4">
        <Link to="/admin" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h1 className="font-semibold text-lg">Settings</h1>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-6">
        <Card data-testid="upi-settings-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#8B0000]" />
              UPI Payment Settings
            </CardTitle>
            <CardDescription>
              Configure your UPI ID for receiving wedding gift payments. This will be displayed in the QR code and payment link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label htmlFor="upi_id" className="text-sm font-medium">
                UPI ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="upi_id"
                value={settings.upi_id}
                onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
                placeholder="yourname@upi"
                className="mt-1.5"
                data-testid="upi-id-input"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Enter your UPI ID (e.g., 9876543210@paytm, name@oksbi, phone@ybl)
              </p>
            </div>

            <div>
              <Label htmlFor="upi_name" className="text-sm font-medium">
                Display Name
              </Label>
              <Input
                id="upi_name"
                value={settings.upi_name}
                onChange={(e) => setSettings({ ...settings, upi_name: e.target.value })}
                placeholder="Shvetha & Aadi Wedding Gift"
                className="mt-1.5"
                data-testid="upi-name-input"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                This name appears on the payment screen in UPI apps
              </p>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto bg-[#8B0000] hover:bg-[#6B0000]"
                data-testid="save-settings-btn"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : saved ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saved ? "Saved!" : "Save Settings"}
              </Button>
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Preview</p>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-sm font-medium text-gray-800">
                  UPI: <span className="font-mono text-[#8B0000]">{settings.upi_id || "yourname@upi"}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Name: {settings.upi_name || "Wedding Gift"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <h3 className="font-medium text-amber-800 mb-2">Important Notes</h3>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>Changes take effect immediately for new payments</li>
              <li>Existing QR codes on open modals will update on page refresh</li>
              <li>Make sure your UPI ID is active and can receive payments</li>
              <li>Test with a small amount before sharing with guests</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
