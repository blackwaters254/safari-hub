import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search, Phone, Mail, Car } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  staff: any[];
  onRefresh: () => void;
}

const emptyForm = { full_name: "", role: "driver", phone: "", email: "", id_number: "", vehicle_plate: "", notes: "", is_active: true };

export default function StaffSection({ staff, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const save = async () => {
    if (!form.full_name.trim()) { toast.error("Name required"); return; }
    if (editing) {
      const { error } = await supabase.from("staff_members").update(form).eq("id", editing.id);
      if (error) toast.error(error.message); else toast.success("Updated");
    } else {
      const { error } = await supabase.from("staff_members").insert(form);
      if (error) toast.error(error.message); else toast.success("Staff added");
    }
    setShowForm(false); setEditing(null); setForm(emptyForm); onRefresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this staff member?")) return;
    const { error } = await supabase.from("staff_members").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); onRefresh(); }
  };

  const filtered = staff.filter((s) =>
    `${s.full_name} ${s.role} ${s.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string, string> = {
    driver: "bg-primary/20 text-primary",
    guide: "bg-secondary/20 text-secondary",
    manager: "bg-accent/20 text-accent",
    coordinator: "bg-muted text-muted-foreground",
    other: "bg-muted text-muted-foreground",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Staff & Drivers</h2>
        <Button size="sm" onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Staff
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card p-5 rounded-lg border border-border mb-6 space-y-3">
          <h3 className="font-heading font-semibold">{editing ? "Edit Staff" : "New Staff Member"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Full Name *" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={200} />
            <select className="border border-border rounded px-3 py-2 bg-background text-foreground text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="driver">Driver</option>
              <option value="guide">Tour Guide</option>
              <option value="manager">Manager</option>
              <option value="coordinator">Coordinator</option>
              <option value="other">Other</option>
            </select>
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={200} />
            <Input placeholder="ID Number" value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} maxLength={50} />
            <Input placeholder="Vehicle Plate" value={form.vehicle_plate} onChange={(e) => setForm({ ...form, vehicle_plate: e.target.value })} maxLength={20} />
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
        <Input placeholder="Search staff..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="space-y-2">
        {filtered.map((s) => (
          <div key={s.id} className="bg-card p-4 rounded-lg border border-border flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{s.full_name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${roleColors[s.role] || ""}`}>{s.role}</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                {s.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {s.phone}</span>}
                {s.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {s.email}</span>}
                {s.vehicle_plate && <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {s.vehicle_plate}</span>}
              </div>
              {s.notes && <p className="text-xs text-muted-foreground mt-1 italic">{s.notes}</p>}
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => {
                setEditing(s);
                setForm({ full_name: s.full_name, role: s.role, phone: s.phone || "", email: s.email || "", id_number: s.id_number || "", vehicle_plate: s.vehicle_plate || "", notes: s.notes || "", is_active: s.is_active });
                setShowForm(true);
              }}><Edit className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No staff members found</p>}
      </div>
    </div>
  );
}
