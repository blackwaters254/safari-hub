import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Edit, LogOut, Calendar, MapPin, Users, Package, CreditCard, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editingExp, setEditingExp] = useState<any>(null);

  const [eventForm, setEventForm] = useState({
    title: "", description: "", short_description: "", location: "", image_url: "",
    start_date: "", end_date: "", price: 0, capacity: 0, is_active: true,
  });
  const [expForm, setExpForm] = useState({
    title: "", description: "", short_description: "", location: "", image_url: "",
    duration: "", price: 0, is_active: true,
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      toast.error("Access denied. Admin only.");
      navigate("/");
      return;
    }
    setIsAdmin(true);
    setLoading(false);
    fetchAll();
  };

  const fetchAll = async () => {
    const [b, e, x] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("created_at", { ascending: false }),
      supabase.from("experiences").select("*").order("created_at", { ascending: false }),
    ]);
    setBookings(b.data || []);
    setEvents(e.data || []);
    setExperiences(x.data || []);
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status updated"); fetchAll(); }
  };

  const saveEvent = async () => {
    if (!eventForm.title.trim()) { toast.error("Title required"); return; }
    const payload = {
      ...eventForm,
      start_date: eventForm.start_date || null,
      end_date: eventForm.end_date || null,
    };
    if (editingEvent) {
      const { error } = await supabase.from("events").update(payload).eq("id", editingEvent.id);
      if (error) toast.error(error.message); else toast.success("Event updated");
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) toast.error(error.message); else toast.success("Event created");
    }
    setShowEventForm(false);
    setEditingEvent(null);
    setEventForm({ title: "", description: "", short_description: "", location: "", image_url: "", start_date: "", end_date: "", price: 0, capacity: 0, is_active: true });
    fetchAll();
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); fetchAll(); }
  };

  const saveExperience = async () => {
    if (!expForm.title.trim()) { toast.error("Title required"); return; }
    if (editingExp) {
      const { error } = await supabase.from("experiences").update(expForm).eq("id", editingExp.id);
      if (error) toast.error(error.message); else toast.success("Experience updated");
    } else {
      const { error } = await supabase.from("experiences").insert(expForm);
      if (error) toast.error(error.message); else toast.success("Experience created");
    }
    setShowExpForm(false);
    setEditingExp(null);
    setExpForm({ title: "", description: "", short_description: "", location: "", image_url: "", duration: "", price: 0, is_active: true });
    fetchAll();
  };

  const deleteExperience = async (id: string) => {
    if (!confirm("Delete this experience?")) return;
    const { error } = await supabase.from("experiences").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); fetchAll(); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const statusColors: Record<string, string> = {
    pending: "bg-safari-gold/20 text-safari-gold",
    confirmed: "bg-secondary/20 text-secondary",
    cancelled: "bg-destructive/20 text-destructive",
    completed: "bg-primary/20 text-primary",
  };

  if (loading) return <main className="min-h-screen pt-24 flex items-center justify-center"><p>Loading...</p></main>;
  if (!isAdmin) return null;

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold">Admin Dashboard</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" /> Logout</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: bookings.length, icon: Package, color: "text-primary" },
            { label: "Pending", value: bookings.filter((b) => b.status === "pending").length, icon: Calendar, color: "text-safari-gold" },
            { label: "Events", value: events.length, icon: MapPin, color: "text-secondary" },
            { label: "Experiences", value: experiences.length, icon: Sparkles, color: "text-accent" },
          ].map((s) => (
            <div key={s.label} className="bg-card p-4 rounded-lg">
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="bookings">
          <TabsList className="mb-6">
            <TabsTrigger value="bookings"><Package className="w-4 h-4 mr-1" /> Bookings</TabsTrigger>
            <TabsTrigger value="events"><Calendar className="w-4 h-4 mr-1" /> Events</TabsTrigger>
            <TabsTrigger value="experiences"><Sparkles className="w-4 h-4 mr-1" /> Experiences</TabsTrigger>
          </TabsList>

          {/* BOOKINGS TAB */}
          <TabsContent value="bookings">
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No bookings yet</p>
              ) : bookings.map((b) => (
                <div key={b.id} className="bg-card p-4 rounded-lg">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{b.item_title}</h3>
                      <p className="text-sm text-muted-foreground">{b.customer_name} • {b.customer_email}</p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{b.travel_date || "No date"}</span>
                        <span>{b.guests} guests</span>
                        <span className="capitalize">{b.item_type}</span>
                        <span className="capitalize">{b.payment_plan === "installment" ? "Lipa Mdogo Mdogo" : b.payment_plan}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColors[b.status] || ""}`}>
                        {b.status}
                      </span>
                      <select
                        className="text-xs border rounded px-2 py-1 bg-background"
                        value={b.status}
                        onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-primary font-bold">KSh {Number(b.total_price).toLocaleString()}</span>
                    <span className="text-muted-foreground">Paid: KSh {Number(b.amount_paid).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* EVENTS TAB */}
          <TabsContent value="events">
            <div className="mb-4">
              <Button onClick={() => { setShowEventForm(true); setEditingEvent(null); setEventForm({ title: "", description: "", short_description: "", location: "", image_url: "", start_date: "", end_date: "", price: 0, capacity: 0, is_active: true }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Event
              </Button>
            </div>

            {showEventForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card p-6 rounded-lg mb-6 space-y-4">
                <h3 className="font-heading font-bold text-lg">{editingEvent ? "Edit Event" : "New Event"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input placeholder="Title *" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} maxLength={200} />
                  <Input placeholder="Location" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} maxLength={200} />
                  <Input placeholder="Image URL" value={eventForm.image_url} onChange={(e) => setEventForm({ ...eventForm, image_url: e.target.value })} maxLength={500} />
                  <Input type="number" placeholder="Price (KSh)" value={eventForm.price} onChange={(e) => setEventForm({ ...eventForm, price: parseFloat(e.target.value) || 0 })} />
                  <Input type="datetime-local" placeholder="Start Date" value={eventForm.start_date} onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })} />
                  <Input type="datetime-local" placeholder="End Date" value={eventForm.end_date} onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })} />
                  <Input type="number" placeholder="Capacity" value={eventForm.capacity} onChange={(e) => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) || 0 })} />
                </div>
                <Input placeholder="Short Description" value={eventForm.short_description} onChange={(e) => setEventForm({ ...eventForm, short_description: e.target.value })} maxLength={300} />
                <Textarea placeholder="Full Description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} rows={3} maxLength={2000} />
                <div className="flex gap-2">
                  <Button onClick={saveEvent} className="bg-primary text-primary-foreground hover:bg-primary/90">{editingEvent ? "Update" : "Create"}</Button>
                  <Button variant="outline" onClick={() => { setShowEventForm(false); setEditingEvent(null); }}>Cancel</Button>
                </div>
              </motion.div>
            )}

            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="bg-card p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{ev.title}</h3>
                    <p className="text-sm text-muted-foreground">{ev.location} • KSh {Number(ev.price).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{ev.is_active ? "Active" : "Inactive"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => {
                      setEditingEvent(ev);
                      setEventForm({
                        title: ev.title, description: ev.description || "", short_description: ev.short_description || "",
                        location: ev.location || "", image_url: ev.image_url || "",
                        start_date: ev.start_date ? new Date(ev.start_date).toISOString().slice(0, 16) : "",
                        end_date: ev.end_date ? new Date(ev.end_date).toISOString().slice(0, 16) : "",
                        price: ev.price, capacity: ev.capacity || 0, is_active: ev.is_active,
                      });
                      setShowEventForm(true);
                    }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteEvent(ev.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {events.length === 0 && <p className="text-center text-muted-foreground py-8">No events created yet</p>}
            </div>
          </TabsContent>

          {/* EXPERIENCES TAB */}
          <TabsContent value="experiences">
            <div className="mb-4">
              <Button onClick={() => { setShowExpForm(true); setEditingExp(null); setExpForm({ title: "", description: "", short_description: "", location: "", image_url: "", duration: "", price: 0, is_active: true }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Experience
              </Button>
            </div>

            {showExpForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card p-6 rounded-lg mb-6 space-y-4">
                <h3 className="font-heading font-bold text-lg">{editingExp ? "Edit Experience" : "New Experience"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input placeholder="Title *" value={expForm.title} onChange={(e) => setExpForm({ ...expForm, title: e.target.value })} maxLength={200} />
                  <Input placeholder="Location" value={expForm.location} onChange={(e) => setExpForm({ ...expForm, location: e.target.value })} maxLength={200} />
                  <Input placeholder="Image URL" value={expForm.image_url} onChange={(e) => setExpForm({ ...expForm, image_url: e.target.value })} maxLength={500} />
                  <Input placeholder="Duration (e.g. 3 Hours)" value={expForm.duration} onChange={(e) => setExpForm({ ...expForm, duration: e.target.value })} maxLength={100} />
                  <Input type="number" placeholder="Price (KSh)" value={expForm.price} onChange={(e) => setExpForm({ ...expForm, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <Input placeholder="Short Description" value={expForm.short_description} onChange={(e) => setExpForm({ ...expForm, short_description: e.target.value })} maxLength={300} />
                <Textarea placeholder="Full Description" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} rows={3} maxLength={2000} />
                <div className="flex gap-2">
                  <Button onClick={saveExperience} className="bg-primary text-primary-foreground hover:bg-primary/90">{editingExp ? "Update" : "Create"}</Button>
                  <Button variant="outline" onClick={() => { setShowExpForm(false); setEditingExp(null); }}>Cancel</Button>
                </div>
              </motion.div>
            )}

            <div className="space-y-3">
              {experiences.map((ex) => (
                <div key={ex.id} className="bg-card p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{ex.title}</h3>
                    <p className="text-sm text-muted-foreground">{ex.location} • {ex.duration} • KSh {Number(ex.price).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => {
                      setEditingExp(ex);
                      setExpForm({
                        title: ex.title, description: ex.description || "", short_description: ex.short_description || "",
                        location: ex.location || "", image_url: ex.image_url || "", duration: ex.duration || "", price: ex.price, is_active: ex.is_active,
                      });
                      setShowExpForm(true);
                    }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteExperience(ex.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {experiences.length === 0 && <p className="text-center text-muted-foreground py-8">No experiences created yet</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
