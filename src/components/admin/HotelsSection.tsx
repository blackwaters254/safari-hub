import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search, Phone, Mail, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  hotels: any[];
  onRefresh: () => void;
}

const emptyForm = { name: "", location: "", contact_person: "", phone: "", email: "", website: "", category: "hotel", notes: "", is_active: true };

export default function HotelsSection({ hotels, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const save = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    if (editing) {
      const { error } = await supabase.from("hotel_contacts").update(form).eq("id", editing.id);
      if (error) toast.error(error.message); else toast.success("Updated");
    } else {
      const { error } = await supabase.from("hotel_contacts").insert(form);
      if (error) toast.error(error.message); else toast.success("Hotel added");
    }
    setShowForm(false); setEditing(null); setForm(emptyForm); onRefresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    const { error } = await supabase.from("hotel_contacts").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); onRefresh(); }
  };

  const filtered = hotels.filter((h) =>
    `${h.name} ${h.location} ${h.category}`.toLowerCase().includes(search.toLowerCase())
  );

  const categoryColors: Record<string, string> = {
    hotel: "bg-primary/20 text-primary",
    lodge: "bg-secondary/20 text-secondary",
    camp: "bg-accent/20 text-accent",
    resort: "bg-primary/20 text-primary",
    guesthouse: "bg-muted text-muted-foreground",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Hotels & Partners</h2>
        <Button size="sm" onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Hotel
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card p-5 rounded-lg border border-border mb-6 space-y-3">
          <h3 className="font-heading font-semibold">{editing ? "Edit Hotel" : "New Hotel/Partner"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Hotel Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={200} />
            <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={200} />
            <Input placeholder="Contact Person" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} maxLength={200} />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={200} />
            <Input placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} maxLength={300} />
            <select className="border border-border rounded px-3 py-2 bg-background text-foreground text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="hotel">Hotel</option>
              <option value="lodge">Lodge</option>
              <option value="camp">Camp</option>
              <option value="resort">Resort</option>
              <option value="guesthouse">Guesthouse</option>
            </select>
          </div>
          <Textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} maxLength={500} />
          <div className="flex gap-2">
            <Button onClick={save}>{editing ? "Update" : "Add"}</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
          </div>
        </motion.div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search hotels..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="space-y-2">
        {filtered.map((h) => (
          <div key={h.id} className="bg-card p-4 rounded-lg border border-border flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{h.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${categoryColors[h.category] || ""}`}>{h.category}</span>
              </div>
              {h.location && <p className="text-sm text-muted-foreground">{h.location}</p>}
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                {h.contact_person && <span>{h.contact_person}</span>}
                {h.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {h.phone}</span>}
                {h.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {h.email}</span>}
                {h.website && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {h.website}</span>}
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => {
                setEditing(h);
                setForm({ name: h.name, location: h.location || "", contact_person: h.contact_person || "", phone: h.phone || "", email: h.email || "", website: h.website || "", category: h.category, notes: h.notes || "", is_active: h.is_active });
                setShowForm(true);
              }}><Edit className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(h.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No hotels found</p>}
      </div>
    </div>
  );
}
