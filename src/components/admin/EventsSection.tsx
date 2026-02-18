import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  events: any[];
  onRefresh: () => void;
}

const emptyForm = { title: "", description: "", short_description: "", location: "", image_url: "", start_date: "", end_date: "", price: 0, capacity: 0, is_active: true };

export default function EventsSection({ events, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const save = async () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    const payload = { ...form, start_date: form.start_date || null, end_date: form.end_date || null };
    if (editing) {
      const { error } = await supabase.from("events").update(payload).eq("id", editing.id);
      if (error) toast.error(error.message); else toast.success("Event updated");
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) toast.error(error.message); else toast.success("Event created");
    }
    setShowForm(false); setEditing(null); setForm(emptyForm); onRefresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); onRefresh(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Events Management</h2>
        <Button size="sm" onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Event
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card p-5 rounded-lg border border-border mb-6 space-y-3">
          <h3 className="font-heading font-semibold">{editing ? "Edit Event" : "New Event"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={200} />
            <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={200} />
            <Input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} maxLength={500} />
            <Input type="number" placeholder="Price (KSh)" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
            <Input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <Input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            <Input type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} />
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
        {events.map((ev) => (
          <div key={ev.id} className="bg-card p-4 rounded-lg border border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{ev.title}</h3>
              <p className="text-sm text-muted-foreground">{ev.location} • KSh {Number(ev.price).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{ev.is_active ? "Active" : "Inactive"} • Cap: {ev.capacity}</p>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => {
                setEditing(ev);
                setForm({
                  title: ev.title, description: ev.description || "", short_description: ev.short_description || "",
                  location: ev.location || "", image_url: ev.image_url || "",
                  start_date: ev.start_date ? new Date(ev.start_date).toISOString().slice(0, 16) : "",
                  end_date: ev.end_date ? new Date(ev.end_date).toISOString().slice(0, 16) : "",
                  price: ev.price, capacity: ev.capacity || 0, is_active: ev.is_active,
                });
                setShowForm(true);
              }}><Edit className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(ev.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-center text-muted-foreground py-8">No events yet</p>}
      </div>
    </div>
  );
}
