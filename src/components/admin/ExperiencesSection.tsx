import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  experiences: any[];
  onRefresh: () => void;
}

const emptyForm = { title: "", description: "", short_description: "", location: "", image_url: "", duration: "", price: 0, is_active: true };

export default function ExperiencesSection({ experiences, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const save = async () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    if (editing) {
      const { error } = await supabase.from("experiences").update(form).eq("id", editing.id);
      if (error) toast.error(error.message); else toast.success("Updated");
    } else {
      const { error } = await supabase.from("experiences").insert(form);
      if (error) toast.error(error.message); else toast.success("Created");
    }
    setShowForm(false); setEditing(null); setForm(emptyForm); onRefresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this experience?")) return;
    const { error } = await supabase.from("experiences").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); onRefresh(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Experiences Management</h2>
        <Button size="sm" onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Experience
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card p-5 rounded-lg border border-border mb-6 space-y-3">
          <h3 className="font-heading font-semibold">{editing ? "Edit Experience" : "New Experience"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={200} />
            <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={200} />
            <Input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} maxLength={500} />
            <Input placeholder="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} maxLength={100} />
            <Input type="number" placeholder="Price (KSh)" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
          </div>
          <Input placeholder="Short Description" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} maxLength={300} />
          <Textarea placeholder="Full Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} maxLength={2000} />
          <div className="flex gap-2">
            <Button onClick={save}>{editing ? "Update" : "Create"}</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {experiences.map((ex) => (
          <div key={ex.id} className="bg-card p-4 rounded-lg border border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{ex.title}</h3>
              <p className="text-sm text-muted-foreground">{ex.location} • {ex.duration} • KSh {Number(ex.price).toLocaleString()}</p>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => {
                setEditing(ex);
                setForm({ title: ex.title, description: ex.description || "", short_description: ex.short_description || "", location: ex.location || "", image_url: ex.image_url || "", duration: ex.duration || "", price: ex.price, is_active: ex.is_active });
                setShowForm(true);
              }}><Edit className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(ex.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
        {experiences.length === 0 && <p className="text-center text-muted-foreground py-8">No experiences yet</p>}
      </div>
    </div>
  );
}
