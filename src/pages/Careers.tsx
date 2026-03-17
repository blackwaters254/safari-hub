import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Briefcase, MapPin, Clock, Upload, Instagram, ExternalLink, Send, Loader2, ChevronRight, Users, Handshake, GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import culturalTour from "@/assets/cultural-tour.jpg";

interface Opportunity {
  id: string;
  title: string;
  type: string;
  description: string;
  requirements: string;
  location: string;
  is_active: boolean;
  is_paid: boolean;
  salary_range: string;
  deadline: string | null;
  created_at: string;
}

const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
  vacancy: { icon: Briefcase, label: "Vacancy", color: "bg-primary/10 text-primary" },
  internship: { icon: GraduationCap, label: "Internship", color: "bg-secondary/10 text-secondary" },
  partnership: { icon: Handshake, label: "Partnership", color: "bg-accent/10 text-accent-foreground" },
};

export default function Careers() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("opportunities")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setOpportunities((data as any[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[45vh] min-h-[350px] flex items-center">
        <img src={culturalTour} alt="Careers" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 safari-overlay-strong" />
        <div className="relative container pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Join Our Team</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground">Careers & Opportunities</h1>
            <p className="text-primary-foreground/80 mt-3 max-w-lg">
              Explore vacancies, internships, and partnership opportunities with Blackwaters Safaris.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Listings */}
      <section className="py-16">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => <div key={i} className="bg-card rounded-lg h-48 animate-pulse" />)}
            </div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-heading font-bold mb-2">No Openings Right Now</h2>
              <p className="text-muted-foreground">Check back soon for new opportunities!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunities.map((opp, i) => {
                const cfg = typeConfig[opp.type] || typeConfig.vacancy;
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => { setSelected(opp); setShowForm(false); }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className={cfg.color}>
                        <Icon className="w-3 h-3 mr-1" /> {cfg.label}
                      </Badge>
                      {!opp.is_paid && <Badge variant="outline" className="text-xs">Free / Unpaid</Badge>}
                    </div>
                    <h3 className="font-heading text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{opp.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{opp.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {opp.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {opp.location}</span>
                      )}
                      {opp.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Deadline: {new Date(opp.deadline).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex items-center text-primary text-sm font-semibold">
                      View Details & Apply <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Detail + Application Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              className="bg-card rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="secondary" className={typeConfig[selected.type]?.color || ""}>
                      {typeConfig[selected.type]?.label || selected.type}
                    </Badge>
                    <h2 className="font-heading text-2xl font-bold mt-2">{selected.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      {selected.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selected.location}</span>}
                      {!selected.is_paid && <Badge variant="outline" className="text-xs">Unpaid / Portfolio Building</Badge>}
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {!showForm ? (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">About This Opportunity</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{selected.description}</p>
                  </div>
                  {selected.requirements && (
                    <div>
                      <h3 className="font-semibold mb-2">Requirements</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{selected.requirements}</p>
                    </div>
                  )}
                  {selected.deadline && (
                    <div className="bg-muted rounded-lg p-3 text-sm">
                      <strong>Application Deadline:</strong>{" "}
                      {new Date(selected.deadline).toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    </div>
                  )}
                  <Button onClick={() => setShowForm(true)} size="lg" className="w-full">
                    <Send className="w-4 h-4 mr-2" /> Apply Now — It's Free
                  </Button>
                </div>
              ) : (
                <ApplicationForm opportunityId={selected.id} onSuccess={() => { setShowForm(false); setSelected(null); }} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ─── Application Form ─── */
function ApplicationForm({ opportunityId, onSuccess }: { opportunityId: string; onSuccess: () => void }) {
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", cover_letter: "",
    portfolio_url: "", social_instagram: "", social_tiktok: "",
    social_youtube: "", social_twitter: "", social_other: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }
    setSubmitting(true);

    let resume_url = "";
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("applications").upload(path, file);
      if (uploadErr) {
        toast.error("Failed to upload document: " + uploadErr.message);
        setSubmitting(false);
        return;
      }
      // Store just the path - bucket is private, admins use signed URLs
      resume_url = path;
    }

    const { error } = await supabase.from("applications").insert({
      opportunity_id: opportunityId,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      cover_letter: form.cover_letter.trim(),
      resume_url,
      portfolio_url: form.portfolio_url.trim(),
      social_instagram: form.social_instagram.trim(),
      social_tiktok: form.social_tiktok.trim(),
      social_youtube: form.social_youtube.trim(),
      social_twitter: form.social_twitter.trim(),
      social_other: form.social_other.trim(),
    });

    if (error) {
      toast.error("Failed to submit application.");
    } else {
      toast.success("Application submitted successfully! We'll be in touch.");
      onSuccess();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
      <h3 className="font-heading font-semibold text-lg">Application Form</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fn">Full Name *</Label>
          <Input id="fn" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required maxLength={100} />
        </div>
        <div>
          <Label htmlFor="em">Email *</Label>
          <Input id="em" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required maxLength={255} />
        </div>
      </div>

      <div>
        <Label htmlFor="ph">Phone</Label>
        <Input id="ph" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+254..." maxLength={20} />
      </div>

      <div>
        <Label htmlFor="cv">Cover Letter / Why You're Interested</Label>
        <Textarea id="cv" value={form.cover_letter} onChange={(e) => update("cover_letter", e.target.value)} rows={4} maxLength={2000} placeholder="Tell us about yourself and why you'd be great for this role..." />
      </div>

      <div>
        <Label htmlFor="resume">Upload CV / Portfolio (PDF, DOC, images)</Label>
        <div className="mt-1">
          <label
            htmlFor="resume"
            className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/30"
          >
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {file ? file.name : "Click to upload document"}
            </span>
          </label>
          <input
            id="resume"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="portfolio">Portfolio / Website URL</Label>
        <Input id="portfolio" value={form.portfolio_url} onChange={(e) => update("portfolio_url", e.target.value)} placeholder="https://..." maxLength={500} />
      </div>

      {/* Socials */}
      <div>
        <Label className="flex items-center gap-1 mb-2"><Instagram className="w-4 h-4" /> Social Media (if applicable)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input placeholder="Instagram @handle" value={form.social_instagram} onChange={(e) => update("social_instagram", e.target.value)} maxLength={100} />
          <Input placeholder="TikTok @handle" value={form.social_tiktok} onChange={(e) => update("social_tiktok", e.target.value)} maxLength={100} />
          <Input placeholder="YouTube channel" value={form.social_youtube} onChange={(e) => update("social_youtube", e.target.value)} maxLength={200} />
          <Input placeholder="Twitter / X @handle" value={form.social_twitter} onChange={(e) => update("social_twitter", e.target.value)} maxLength={100} />
        </div>
        <Input className="mt-3" placeholder="Other social / link" value={form.social_other} onChange={(e) => update("social_other", e.target.value)} maxLength={300} />
      </div>

      <Button type="submit" disabled={submitting} className="w-full" size="lg">
        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
        Submit Application
      </Button>
    </form>
  );
}
