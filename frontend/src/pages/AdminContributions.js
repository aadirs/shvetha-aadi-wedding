import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchContributions, exportContributions } from "../lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { LayoutDashboard, Package, Users, Download, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function AdminContributions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) { navigate("/admin/login"); return; }
    fetchContributions()
      .then(r => setSessions(r.data))
      .catch(() => { localStorage.removeItem("admin_token"); navigate("/admin/login"); })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleExport = async () => {
    try {
      const res = await exportContributions();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "contributions.csv";
      a.click();
      toast.success("CSV downloaded");
    } catch { toast.error("Export failed"); }
  };

  const logout = () => { localStorage.removeItem("admin_token"); navigate("/admin/login"); };

  const statusColor = (s) => {
    if (s === "paid") return "default";
    if (s === "pending") return "secondary";
    if (s === "failed") return "destructive";
    return "outline";
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-30 bg-crimson text-white" data-testid="admin-nav">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="text-white/70 hover:text-white text-sm font-sans flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link to="/admin/pots" className="text-white/70 hover:text-white text-sm font-sans flex items-center gap-1">
              <Package className="w-4 h-4" /> Pots
            </Link>
            <Link to="/admin/contributions" className="font-serif text-lg flex items-center gap-2">
              <Users className="w-5 h-5" /> Contributions
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/60 text-xs hover:text-white">View Site</Link>
            <button onClick={logout} data-testid="admin-logout-btn"><LogOut className="w-4 h-4 text-white/60 hover:text-white" /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl text-foreground" data-testid="contributions-page-title">Contributions</h1>
          <Button onClick={handleExport} variant="outline" className="font-sans text-sm rounded-full" data-testid="export-csv-btn">
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground"><p className="font-serif text-lg">No contributions yet</p></div>
        ) : (
          <div className="bg-card rounded-xl gold-border overflow-x-auto" data-testid="contributions-table">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40">
                  <TableHead className="font-sans text-xs">Donor</TableHead>
                  <TableHead className="font-sans text-xs">Email</TableHead>
                  <TableHead className="font-sans text-xs">Phone</TableHead>
                  <TableHead className="font-sans text-xs">Amount</TableHead>
                  <TableHead className="font-sans text-xs">Fee</TableHead>
                  <TableHead className="font-sans text-xs">Status</TableHead>
                  <TableHead className="font-sans text-xs">Pots</TableHead>
                  <TableHead className="font-sans text-xs">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map(s => (
                  <TableRow key={s.id} className="border-border/20" data-testid={`contribution-${s.id}`}>
                    <TableCell className="font-sans text-sm">{s.donor_name}</TableCell>
                    <TableCell className="font-sans text-xs text-muted-foreground">{s.donor_email}</TableCell>
                    <TableCell className="font-sans text-xs text-muted-foreground">{s.donor_phone}</TableCell>
                    <TableCell className="font-sans text-sm font-medium">{"\u20B9"}{(s.total_amount_paise / 100).toLocaleString('en-IN')}</TableCell>
                    <TableCell className="font-sans text-xs text-muted-foreground">{"\u20B9"}{((s.fee_amount_paise || 0) / 100).toLocaleString('en-IN')}</TableCell>
                    <TableCell><Badge variant={statusColor(s.status)} className="text-xs capitalize">{s.status}</Badge></TableCell>
                    <TableCell className="font-sans text-xs">
                      {s.allocations?.map(a => a.pot_title).filter(Boolean).join(", ") || "-"}
                    </TableCell>
                    <TableCell className="font-sans text-xs text-muted-foreground">
                      {s.paid_at ? new Date(s.paid_at).toLocaleDateString('en-IN') : new Date(s.created_at).toLocaleDateString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
