import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Briefcase, GraduationCap, Handshake, Trash2, Edit, Eye, EyeOff, ChevronDown, ChevronUp, ExternalLink, Loader2, FileText, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  opportunities: any[];
  applications: any[];
  onRefresh: () => void;
}

const typeIcons: Record<string, any> = { vacancy: Briefcase, internship: GraduationCap, partnership: Handshake };

export default function OpportunitiesSection({ opportunities, applications, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", type: "vacancy", description: "", requirements: "", location: "", is_paid: false, salary_range: "", deadline: "" });

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const { error } = await supabase.from("opportunities").insert({
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim(),
      requirements: form.requirements.trim(),
      location: form.location.trim(),
      is_paid: form.is_paid,
      salary_range: form.salary_range.trim(),
      deadline: form.deadline || null,
    });
    if (error) toast.error("Failed to create"); else { toast.success("Opportunity posted!"); setShowForm(false); setForm({ title: "", type: "vacancy", description: "", requirements: "", location: "", is_paid: false, salary_range: "", deadline: "" }); onRefresh(); }
    setSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("opportunities").update({ is_active: !current }).eq("id", id);
    onRefresh();
  };

  const deleteOpp = async (id: string) => {
    if (!confirm("Delete this opportunity and all its applications?")) return;
    await supabase.from("opportunities").delete().eq("id", id);
    toast.success("Deleted"); onRefresh();
  };

  const updateAppStatus = async (id: string, status: string) => {
    await supabase.from("applications").update({ status }).eq("id", id);
    toast.success("Status updated"); onRefresh();
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-blue-100 text-blue-800",
    shortlisted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    accepted: "bg-emerald-100 text-emerald-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold">Opportunities</h2>
          <p className="text-sm text-muted-foreground">{opportunities.length} posted · {applications.length} applications</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> Post Opportunity
        </Button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Title *</Label><Input value={form.title} onChange={(e) => update("title", e.target.value)} maxLength={200} /></div>
                <div><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => update("type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacancy">Vacancy</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} maxLength={3000} /></div>
              <div><Label>Requirements</Label><Textarea value={form.requirements} onChange={(e) => update("requirements", e.target.value)} rows={3} maxLength={2000} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><Label>Location</Label><Input value={form.location} onChange={(e) => update("location", e.target.value)} /></div>
                <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} /></div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.is_paid} onChange={(e) => update("is_paid", e.target.checked)} className="rounded" />
                    Paid role
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Publish
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listings */}
      {opportunities.map((opp) => {
        const Icon = typeIcons[opp.type] || Briefcase;
        const oppApps = applications.filter((a: any) => a.opportunity_id === opp.id);
        return (
          <div key={opp.id} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{opp.title}</h3>
                  <p className="text-xs text-muted-foreground">{opp.type} · {opp.location || "Remote"} · {oppApps.length} applications</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={opp.is_active ? "default" : "secondary"}>{opp.is_active ? "Active" : "Inactive"}</Badge>
                <Button size="icon" variant="ghost" onClick={() => toggleActive(opp.id, opp.is_active)}>
                  {opp.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteOpp(opp.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Applications */}
            {oppApps.length > 0 && (
              <div className="border-t border-border">
                <div className="px-5 py-2 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Applications ({oppApps.length})
                </div>
                {oppApps.map((app: any) => (
                  <div key={app.id} className="border-t border-border">
                    <button
                      className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-muted/20 transition-colors"
                      onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {app.full_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{app.full_name}</p>
                          <p className="text-xs text-muted-foreground">{app.email} · {new Date(app.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[app.status] || ""}>{app.status}</Badge>
                        {expandedApp === app.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedApp === app.id && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-5 pb-4 space-y-3">
                            {app.phone && <p className="text-sm"><strong>Phone:</strong> {app.phone}</p>}
                            {app.cover_letter && <div><p className="text-sm font-semibold mb-1">Cover Letter:</p><p className="text-sm text-muted-foreground whitespace-pre-line">{app.cover_letter}</p></div>}
                            {app.resume_url && (
                              <button
                                onClick={async () => {
                                  const { data } = await supabase.storage.from("applications").createSignedUrl(app.resume_url, 3600);
                                  if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                                  else toast.error("Could not generate download link");
                                }}
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                <FileText className="w-4 h-4" /> View Uploaded Document
                              </button>
                            )}
                            {app.portfolio_url && (
                              <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline ml-4">
                                <ExternalLink className="w-4 h-4" /> Portfolio
                              </a>
                            )}
                            {/* Socials */}
                            {(app.social_instagram || app.social_tiktok || app.social_youtube || app.social_twitter || app.social_other) && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {app.social_instagram && <Badge variant="outline"><Instagram className="w-3 h-3 mr-1" /> {app.social_instagram}</Badge>}
                                {app.social_tiktok && <Badge variant="outline">TikTok: {app.social_tiktok}</Badge>}
                                {app.social_youtube && <Badge variant="outline">YT: {app.social_youtube}</Badge>}
                                {app.social_twitter && <Badge variant="outline">X: {app.social_twitter}</Badge>}
                                {app.social_other && <Badge variant="outline">{app.social_other}</Badge>}
                              </div>
                            )}
                            <div className="flex gap-2 mt-3">
                              <Select value={app.status} onValueChange={(v) => updateAppStatus(app.id, v)}>
                                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="reviewed">Reviewed</SelectItem>
                                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                  <SelectItem value="accepted">Accepted</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
