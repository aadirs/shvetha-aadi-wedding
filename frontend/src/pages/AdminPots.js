import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAdminPots, createPot, updatePot, archivePot, addPotItem, deletePotItem } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { LayoutDashboard, Package, Users, Plus, Pencil, Archive, Trash2, LogOut } from "lucide-react";

export default function AdminPots() {
  const [pots, setPots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editPot, setEditPot] = useState(null);
  const [form, setForm] = useState({ title: "", slug: "", story_text: "", cover_image_url: "", goal_amount: "" });
  const [itemForm, setItemForm] = useState({ title: "", description: "" });
  const [addingItemTo, setAddingItemTo] = useState(null);
  const navigate = useNavigate();

  const load = () => {
    fetchAdminPots()
      .then(r => setPots(r.data))
      .catch(() => { localStorage.removeItem("admin_token"); navigate("/admin/login"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) { navigate("/admin/login"); return; }
    load();
  }, [navigate]);

  const handleCreate = async () => {
    if (!form.title || !form.slug) { toast.error("Title and slug required"); return; }
    try {
      await createPot({
        title: form.title, slug: form.slug, story_text: form.story_text,
        cover_image_url: form.cover_image_url,
        goal_amount_paise: form.goal_amount ? parseInt(form.goal_amount) * 100 : null
      });
      toast.success("Pot created!");
      setShowCreate(false);
      setForm({ title: "", slug: "", story_text: "", cover_image_url: "", goal_amount: "" });
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create pot");
    }
  };

  const handleUpdate = async () => {
    if (!editPot) return;
    try {
      await updatePot(editPot.id, {
        title: form.title, story_text: form.story_text,
        cover_image_url: form.cover_image_url,
        goal_amount_paise: form.goal_amount ? parseInt(form.goal_amount) * 100 : null
      });
      toast.success("Pot updated!");
      setEditPot(null);
      load();
    } catch (e) {
      toast.error("Failed to update");
    }
  };

  const handleArchive = async (id) => {
    try {
      await archivePot(id);
      toast.success("Pot archived");
      load();
    } catch { toast.error("Failed to archive"); }
  };

  const handleAddItem = async () => {
    if (!itemForm.title) { toast.error("Item title required"); return; }
    try {
      await addPotItem(addingItemTo, { title: itemForm.title, description: itemForm.description });
      toast.success("Item added!");
      setAddingItemTo(null);
      setItemForm({ title: "", description: "" });
      load();
    } catch (e) { toast.error("Failed to add item"); }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deletePotItem(itemId);
      toast.success("Item deleted");
      load();
    } catch { toast.error("Failed to delete"); }
  };

  const openEdit = (pot) => {
    setForm({
      title: pot.title, slug: pot.slug, story_text: pot.story_text || "",
      cover_image_url: pot.cover_image_url || "",
      goal_amount: pot.goal_amount_paise ? (pot.goal_amount_paise / 100).toString() : ""
    });
    setEditPot(pot);
  };

  const logout = () => { localStorage.removeItem("admin_token"); navigate("/admin/login"); };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-30 bg-crimson text-white" data-testid="admin-nav">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="text-white/70 hover:text-white text-sm font-sans flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link to="/admin/pots" className="font-serif text-lg flex items-center gap-2">
              <Package className="w-5 h-5" /> Pots
            </Link>
            <Link to="/admin/contributions" className="text-white/70 hover:text-white text-sm font-sans flex items-center gap-1">
              <Users className="w-4 h-4" /> Contributions
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
          <h1 className="font-serif text-2xl text-foreground" data-testid="pots-page-title">Manage Pots</h1>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="bg-crimson hover:bg-crimson/90 text-white rounded-full font-sans text-sm" data-testid="create-pot-btn">
                <Plus className="w-4 h-4 mr-1" /> New Pot
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-gold/30">
              <DialogHeader><DialogTitle className="font-serif">Create New Pot</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label className="font-sans text-sm">Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="mt-1" data-testid="pot-title-input" /></div>
                <div><Label className="font-sans text-sm">Slug (URL-friendly)</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="mt-1" data-testid="pot-slug-input" /></div>
                <div><Label className="font-sans text-sm">Story</Label><Textarea value={form.story_text} onChange={e => setForm({...form, story_text: e.target.value})} className="mt-1" data-testid="pot-story-input" /></div>
                <div><Label className="font-sans text-sm">Cover Image URL</Label><Input value={form.cover_image_url} onChange={e => setForm({...form, cover_image_url: e.target.value})} className="mt-1" /></div>
                <div><Label className="font-sans text-sm">Goal Amount (INR)</Label><Input type="number" value={form.goal_amount} onChange={e => setForm({...form, goal_amount: e.target.value})} className="mt-1" data-testid="pot-goal-input" /></div>
                <Button onClick={handleCreate} className="w-full bg-crimson hover:bg-crimson/90 text-white rounded-full font-sans" data-testid="save-pot-btn">Create Pot</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editPot} onOpenChange={(o) => !o && setEditPot(null)}>
          <DialogContent className="bg-card border-gold/30">
            <DialogHeader><DialogTitle className="font-serif">Edit Pot</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label className="font-sans text-sm">Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="mt-1" /></div>
              <div><Label className="font-sans text-sm">Story</Label><Textarea value={form.story_text} onChange={e => setForm({...form, story_text: e.target.value})} className="mt-1" /></div>
              <div><Label className="font-sans text-sm">Cover Image URL</Label><Input value={form.cover_image_url} onChange={e => setForm({...form, cover_image_url: e.target.value})} className="mt-1" /></div>
              <div><Label className="font-sans text-sm">Goal Amount (INR)</Label><Input type="number" value={form.goal_amount} onChange={e => setForm({...form, goal_amount: e.target.value})} className="mt-1" /></div>
              <Button onClick={handleUpdate} className="w-full bg-crimson hover:bg-crimson/90 text-white rounded-full font-sans">Update Pot</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Item Dialog */}
        <Dialog open={!!addingItemTo} onOpenChange={(o) => !o && setAddingItemTo(null)}>
          <DialogContent className="bg-card border-gold/30">
            <DialogHeader><DialogTitle className="font-serif">Add Item</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label className="font-sans text-sm">Item Title</Label><Input value={itemForm.title} onChange={e => setItemForm({...itemForm, title: e.target.value})} className="mt-1" data-testid="item-title-input" /></div>
              <div><Label className="font-sans text-sm">Description</Label><Input value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} className="mt-1" /></div>
              <Button onClick={handleAddItem} className="w-full bg-crimson hover:bg-crimson/90 text-white rounded-full font-sans" data-testid="save-item-btn">Add Item</Button>
            </div>
          </DialogContent>
        </Dialog>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>
        ) : pots.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground"><p className="font-serif text-lg">No pots yet</p><p className="text-sm">Create your first gift collection</p></div>
        ) : (
          <div className="space-y-4" data-testid="pots-list">
            {pots.map(pot => (
              <div key={pot.id} className="bg-card rounded-xl gold-border p-5" data-testid={`admin-pot-${pot.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif text-lg text-foreground">{pot.title}</h3>
                      <Badge variant={pot.is_active ? "default" : "secondary"} className="text-xs">
                        {pot.is_active ? "Active" : "Archived"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-sans">/p/{pot.slug}</p>
                    <p className="text-sm font-sans mt-1">
                      Raised: <span className="font-medium">{"\u20B9"}{((pot.total_raised_paise || 0) / 100).toLocaleString('en-IN')}</span>
                      {pot.goal_amount_paise && <span className="text-muted-foreground"> / {"\u20B9"}{(pot.goal_amount_paise / 100).toLocaleString('en-IN')}</span>}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(pot)} className="text-xs" data-testid={`edit-pot-${pot.id}`}>
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    {pot.is_active && (
                      <Button variant="outline" size="sm" onClick={() => handleArchive(pot.id)} className="text-xs text-destructive" data-testid={`archive-pot-${pot.id}`}>
                        <Archive className="w-3 h-3 mr-1" /> Archive
                      </Button>
                    )}
                  </div>
                </div>

                {/* Items */}
                {pot.items?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-sans font-medium text-muted-foreground uppercase tracking-wide">Items</p>
                    {pot.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-background/50 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-sm font-sans">{item.title}</p>
                          {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)} className="text-destructive/60 hover:text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button variant="outline" size="sm" onClick={() => setAddingItemTo(pot.id)} className="mt-3 text-xs" data-testid={`add-item-${pot.id}`}>
                  <Plus className="w-3 h-3 mr-1" /> Add Item
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
