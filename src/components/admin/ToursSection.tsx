import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit, Eye, EyeOff, ChevronDown, ChevronUp, X, Save, Loader2, MapPin, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  tours: any[];
  onRefresh: () => void;
}

const categories = [
  { id: "wildlife", label: "Wildlife Safaris" },
  { id: "beach", label: "Beach Holidays" },
  { id: "cultural", label: "Cultural Tours" },
  { id: "adventure", label: "Adventure" },
  { id: "custom", label: "Custom & Luxury" },
];

const categoryColors: Record<string, string> = {
  wildlife: "bg-chart-1/10 text-chart-1",
  beach: "bg-chart-2/10 text-chart-2",
  cultural: "bg-chart-3/10 text-chart-3",
  adventure: "bg-chart-4/10 text-chart-4",
  custom: "bg-chart-5/10 text-chart-5",
};

export default function ToursSection({ tours, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState("all");

  const emptyForm = {
    title: "", category: "wildlife", duration: "", price_label: "", price_ksh: 0,
    image_url: "", short_description: "", description: "",
    highlights: "" as string, included: "" as string, excluded: "" as string,
    itinerary: [{ day: "Day 1", title: "", description: "" }] as { day: string; title: string; description: string }[],
    is_active: true,
  };
  const [form, setForm] = useState(emptyForm);

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const startEdit = (tour: any) => {
    setEditingId(tour.id);
    setForm({
      title: tour.title || "",
      category: tour.category || "wildlife",
      duration: tour.duration || "",
      price_label: tour.price_label || "",
      price_ksh: tour.price_ksh || 0,
      image_url: tour.image_url || "",
      short_description: tour.short_description || "",
      description: tour.description || "",
      highlights: (tour.highlights || []).join("\n"),
      included: (tour.included || []).join("\n"),
      excluded: (tour.excluded || []).join("\n"),
      itinerary: tour.itinerary || [{ day: "Day 1", title: "", description: "" }],
      is_active: tour.is_active !== false,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      category: form.category,
      duration: form.duration.trim(),
      price_label: form.price_label.trim(),
      price_ksh: form.price_ksh,
      image_url: form.image_url.trim(),
      short_description: form.short_description.trim(),
      description: form.description.trim(),
      highlights: form.highlights.split("\n").map((s) => s.trim()).filter(Boolean),
      included: form.included.split("\n").map((s) => s.trim()).filter(Boolean),
      excluded: form.excluded.split("\n").map((s) => s.trim()).filter(Boolean),
      itinerary: form.itinerary.filter((d) => d.title.trim()),
      is_active: form.is_active,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("tours").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("tours").insert(payload));
    }

    if (error) toast.error("Failed: " + error.message);
    else { toast.success(editingId ? "Tour updated!" : "Tour created!"); resetForm(); onRefresh(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tour?")) return;
    const { error } = await supabase.from("tours").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); onRefresh(); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("tours").update({ is_active: !current }).eq("id", id);
    onRefresh();
  };

  const addDay = () => update("itinerary", [...form.itinerary, { day: `Day ${form.itinerary.length + 1}`, title: "", description: "" }]);
  const removeDay = (i: number) => update("itinerary", form.itinerary.filter((_, idx) => idx !== i));
  const updateDay = (i: number, k: string, v: string) => {
    const copy = [...form.itinerary];
    copy[i] = { ...copy[i], [k]: v };
    update("itinerary", copy);
  };

  const filtered = filterCat === "all" ? tours : tours.filter((t) => t.category === filterCat);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold">Tours & Safaris</h2>
          <p className="text-sm text-muted-foreground">{tours.length} tours total</p>
        </div>
        <div className="flex gap-2">
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-1">
            <Plus className="w-4 h-4" /> Add Tour
          </Button>
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-card border border-border rounded-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg">{editingId ? "Edit Tour" : "New Tour"}</h3>
              <Button size="icon" variant="ghost" onClick={resetForm}><X className="w-4 h-4" /></Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Masai Mara Safari" />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duration</Label>
                <Input value={form.duration} onChange={(e) => update("duration", e.target.value)} placeholder="4 Days / 3 Nights" />
              </div>
              <div>
                <Label>Price Label</Label>
                <Input value={form.price_label} onChange={(e) => update("price_label", e.target.value)} placeholder="From KSh 162,500" />
              </div>
              <div>
                <Label>Price (KSh)</Label>
                <Input type="number" value={form.price_ksh} onChange={(e) => update("price_ksh", parseFloat(e.target.value) || 0)} />
              </div>
              <div className="md:col-span-2">
                <Label>Image Key / URL</Label>
                <Input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="masai-mara or https://..." />
              </div>
              <div className="md:col-span-2">
                <Label>Short Description</Label>
                <Textarea value={form.short_description} onChange={(e) => update("short_description", e.target.value)} rows={2} />
              </div>
              <div className="md:col-span-2">
                <Label>Full Description</Label>
                <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} />
              </div>
              <div>
                <Label>Highlights (one per line)</Label>
                <Textarea value={form.highlights} onChange={(e) => update("highlights", e.target.value)} rows={4} placeholder="Big Five game viewing&#10;Great Migration" />
              </div>
              <div>
                <Label>What's Included (one per line)</Label>
                <Textarea value={form.included} onChange={(e) => update("included", e.target.value)} rows={4} placeholder="Transport in 4x4&#10;Full board accommodation" />
              </div>
              <div className="md:col-span-2">
                <Label>What's Excluded (one per line)</Label>
                <Textarea value={form.excluded} onChange={(e) => update("excluded", e.target.value)} rows={3} placeholder="International flights&#10;Visa fees" />
              </div>
            </div>

            {/* Itinerary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Itinerary</Label>
                <Button size="sm" variant="outline" onClick={addDay}><Plus className="w-3 h-3 mr-1" /> Add Day</Button>
              </div>
              {form.itinerary.map((day, i) => (
                <div key={i} className="flex gap-2 items-start bg-muted/50 p-3 rounded-md">
                  <div className="shrink-0 w-16">
                    <Input value={day.day} onChange={(e) => updateDay(i, "day", e.target.value)} className="text-xs" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Input value={day.title} onChange={(e) => updateDay(i, "title", e.target.value)} placeholder="Day title" />
                    <Textarea value={day.description} onChange={(e) => updateDay(i, "description", e.target.value)} placeholder="Description" rows={2} />
                  </div>
                  {form.itinerary.length > 1 && (
                    <Button size="icon" variant="ghost" onClick={() => removeDay(i)} className="shrink-0 text-destructive"><X className="w-3 h-3" /></Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} className="rounded" />
                Active (visible on website)
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} className="gap-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? "Update Tour" : "Create Tour"}
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour List */}
      <div className="space-y-3">
        {filtered.map((tour: any) => (
          <div key={tour.id} className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(expanded === tour.id ? null : tour.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold truncate">{tour.title}</h4>
                  <Badge variant="secondary" className={`text-[10px] ${categoryColors[tour.category] || ""}`}>
                    {categories.find((c) => c.id === tour.category)?.label || tour.category}
                  </Badge>
                  {!tour.is_active && <Badge variant="outline" className="text-[10px] text-muted-foreground">Hidden</Badge>}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{tour.duration}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />KSh {Number(tour.price_ksh).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); toggleActive(tour.id, tour.is_active); }}>
                  {tour.is_active ? <Eye className="w-4 h-4 text-secondary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); startEdit(tour); }}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(tour.id); }}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
                {expanded === tour.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
            <AnimatePresence>
              {expanded === tour.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-3 text-sm border-t border-border pt-3">
                    {tour.short_description && <p className="text-muted-foreground">{tour.short_description}</p>}
                    {tour.description && <p className="text-muted-foreground">{tour.description}</p>}
                    {tour.highlights?.length > 0 && (
                      <div>
                        <p className="font-semibold mb-1">Highlights:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                          {tour.highlights.map((h: string, i: number) => <li key={i}>{h}</li>)}
                        </ul>
                      </div>
                    )}
                    {tour.itinerary?.length > 0 && (
                      <div>
                        <p className="font-semibold mb-1">Itinerary:</p>
                        {tour.itinerary.map((d: any, i: number) => (
                          <div key={i} className="ml-2 mb-1">
                            <span className="font-medium">{d.day}: {d.title}</span>
                            <span className="text-muted-foreground"> — {d.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No tours found.</p>}
      </div>
    </div>
  );
}
