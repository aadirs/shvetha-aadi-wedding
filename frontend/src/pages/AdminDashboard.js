import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchDashboard } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { LayoutDashboard, Package, Users, IndianRupee, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) { navigate("/admin/login"); return; }
    fetchDashboard()
      .then(r => setData(r.data))
      .catch(() => { localStorage.removeItem("admin_token"); navigate("/admin/login"); })
      .finally(() => setLoading(false));
  }, [navigate]);

  const logout = () => { localStorage.removeItem("admin_token"); navigate("/admin/login"); };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Nav */}
      <nav className="sticky top-0 z-30 bg-crimson text-white" data-testid="admin-nav">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="font-serif text-lg flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </Link>
            <Link to="/admin/pots" className="text-white/70 hover:text-white text-sm font-sans flex items-center gap-1">
              <Package className="w-4 h-4" /> Pots
            </Link>
            <Link to="/admin/contributions" className="text-white/70 hover:text-white text-sm font-sans flex items-center gap-1">
              <Users className="w-4 h-4" /> Contributions
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/60 text-xs hover:text-white">View Site</Link>
            <button onClick={logout} className="text-white/60 hover:text-white" data-testid="admin-logout-btn">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-serif text-2xl text-foreground mb-6" data-testid="dashboard-title">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="gold-border bg-card" data-testid="total-collected-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-sans font-medium text-muted-foreground flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-gold" /> Total Collected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-serif font-bold text-foreground">
                {"\u20B9"}{((data?.total_collected_paise || 0) / 100).toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>
          <Card className="gold-border bg-card" data-testid="total-pots-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-sans font-medium text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-gold" /> Active Pots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-serif font-bold text-foreground">{data?.active_pots || 0}</p>
              <p className="text-xs text-muted-foreground">{data?.total_pots || 0} total</p>
            </CardContent>
          </Card>
          <Card className="gold-border bg-card" data-testid="recent-count-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-sans font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-gold" /> Recent Gifts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-serif font-bold text-foreground">{data?.recent_contributions?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Per-Pot Breakdown */}
        {data?.pot_stats?.length > 0 && (
          <div className="mb-8">
            <h2 className="font-serif text-lg text-foreground mb-4">Per-Pot Totals</h2>
            <div className="grid gap-3">
              {data.pot_stats.map(ps => (
                <div key={ps.pot_id} className="bg-card rounded-lg p-4 gold-border flex items-center justify-between" data-testid={`pot-stat-${ps.pot_id}`}>
                  <div>
                    <p className="font-sans font-medium text-foreground text-sm">{ps.title}</p>
                    {ps.goal_amount_paise && (
                      <p className="text-xs text-muted-foreground">
                        Goal: {"\u20B9"}{(ps.goal_amount_paise / 100).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-serif font-bold text-foreground">
                      {"\u20B9"}{(ps.total_raised_paise / 100).toLocaleString('en-IN')}
                    </p>
                    <Badge variant={ps.is_active ? "default" : "secondary"} className="text-xs">
                      {ps.is_active ? "Active" : "Archived"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Recent Contributions */}
        <h2 className="font-serif text-lg text-foreground mb-4">Recent Contributions</h2>
        {data?.recent_contributions?.length > 0 ? (
          <div className="bg-card rounded-xl gold-border overflow-hidden" data-testid="recent-contributions-table">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40">
                  <TableHead className="font-sans text-xs">Donor</TableHead>
                  <TableHead className="font-sans text-xs">Amount</TableHead>
                  <TableHead className="font-sans text-xs">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recent_contributions.map(c => (
                  <TableRow key={c.id} className="border-border/20">
                    <TableCell className="font-sans text-sm">{c.donor_name}</TableCell>
                    <TableCell className="font-sans text-sm font-medium">
                      {"\u20B9"}{(c.total_amount_paise / 100).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="font-sans text-xs text-muted-foreground">
                      {c.paid_at ? new Date(c.paid_at).toLocaleDateString('en-IN') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm font-sans">No contributions yet</p>
        )}
      </main>
    </div>
  );
}
