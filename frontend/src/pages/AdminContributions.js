import { useState, useEffect } from "react";
import { fetchContributions, exportContributions, updateContributionStatus } from "../lib/api";
import AdminMenu from "../components/AdminMenu";
import { Button } from "../components/ui/button";
import { Download, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminContributions() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  async function load() {
    try {
      const res = await fetchContributions();
      setContributions(res.data);
    } catch { toast.error("Failed to load contributions"); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleExport() {
    try {
      const res = await exportContributions();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a"); a.href = url;
      a.download = `contributions-${new Date().toISOString().split("T")[0]}.csv`;
      a.click(); window.URL.revokeObjectURL(url);
    } catch { toast.error("Export failed"); }
  }

  async function handleStatusChange(sessionId, status) {
    setUpdating(sessionId + status);
    try {
      await updateContributionStatus(sessionId, status);
      toast.success(`Marked as ${status}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to update");
    }
    setUpdating(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminMenu />
      <main className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" data-testid="admin-contributions-title">Contributions</h1>
          <Button onClick={handleExport} variant="outline" size="sm" data-testid="export-csv-btn">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : contributions.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No contributions yet</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm" data-testid="contributions-table">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Donor</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Message</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {contributions.map(c => (
                  <tr key={c.id} data-testid={`contribution-row-${c.id}`}>
                    <td className="p-3">
                      <p className="font-medium">{c.donor_name || "—"}</p>
                      <p className="text-xs text-gray-400">{c.donor_email || c.donor_phone || ""}</p>
                    </td>
                    <td className="p-3 font-medium">₹{(c.total_amount_paise / 100).toLocaleString("en-IN")}</td>
                    <td className="p-3 text-xs text-gray-600 max-w-[200px] truncate">{c.donor_message || "—"}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                        ${c.status === "paid" ? "bg-green-100 text-green-700" :
                          c.status === "failed" ? "bg-red-100 text-red-700" :
                          c.status === "created" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-600"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                      {c.paid_at ? new Date(c.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {c.status !== "paid" && (
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 px-2 text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => handleStatusChange(c.id, "received")}
                            disabled={updating === c.id + "received"}
                            data-testid={`mark-received-${c.id}`}
                          >
                            {updating === c.id + "received" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            <span className="ml-1 text-xs">Received</span>
                          </Button>
                        )}
                        {c.status !== "failed" && (
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleStatusChange(c.id, "failed")}
                            disabled={updating === c.id + "failed"}
                            data-testid={`mark-failed-${c.id}`}
                          >
                            {updating === c.id + "failed" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span className="ml-1 text-xs">Failed</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
