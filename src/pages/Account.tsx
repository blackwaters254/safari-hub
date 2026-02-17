import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { User, Mail, Phone, Calendar, Package, CreditCard, LogOut, Edit2, Save } from "lucide-react";

export default function Account() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { format } = useCurrency();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      fetchData(session.user.id);
    });
  }, [navigate]);

  const fetchData = async (userId: string) => {
    const [profileRes, bookingsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("bookings").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    if (profileRes.data) {
      setProfile(profileRes.data);
      setForm({
        first_name: profileRes.data.first_name || "",
        last_name: profileRes.data.last_name || "",
        phone: profileRes.data.phone || "",
        email: profileRes.data.email || "",
      });
    }
    setBookings(bookingsRes.data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: form.first_name, last_name: form.last_name, phone: form.phone })
      .eq("user_id", user.id);
    if (error) toast.error("Failed to update profile");
    else {
      toast.success("Profile updated!");
      setProfile({ ...profile, ...form });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Signed out");
  };

  const statusColors: Record<string, string> = {
    pending: "bg-safari-gold/20 text-safari-gold",
    confirmed: "bg-secondary/20 text-secondary",
    cancelled: "bg-destructive/20 text-destructive",
    completed: "bg-primary/20 text-primary",
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16">
        <div className="container max-w-3xl">
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="bg-card rounded-lg h-20 animate-pulse" />)}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold">My Account</h1>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-destructive border-destructive/30 hover:bg-destructive/10">
            <LogOut className="w-4 h-4 mr-1" /> Sign Out
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card p-6 rounded-lg space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold">{profile?.first_name} {profile?.last_name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
                  <Edit2 className="w-4 h-4 mr-1" /> {editing ? "Cancel" : "Edit"}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={form.first_name} disabled={!editing} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={form.last_name} disabled={!editing} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input value={form.email} disabled className="pl-10" />
                  </div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input value={form.phone} disabled={!editing} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="pl-10" placeholder="+254..." />
                  </div>
                </div>
              </div>

              {editing && (
                <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="bookings">
            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-lg">
                <Package className="w-14 h-14 text-muted-foreground mx-auto mb-3" />
                <h2 className="text-lg font-heading font-bold mb-1">No bookings yet</h2>
                <p className="text-sm text-muted-foreground mb-4">Explore our tours and events!</p>
                <Button asChild><Link to="/tours">Browse Tours</Link></Button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card p-5 rounded-lg"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-heading font-semibold">{b.item_title}</h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {b.travel_date || "TBD"}</span>
                          <span className="capitalize">{b.item_type}</span>
                          <span>{b.guests} guest{b.guests > 1 ? "s" : ""}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColors[b.status] || ""}`}>
                          {b.status}
                        </span>
                        <p className="text-primary font-bold mt-2">{format(Number(b.total_price))}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span className="capitalize">{b.payment_plan === "installment" ? "Lipa Mdogo Mdogo" : b.payment_plan}</span>
                        <span className="ml-2">Paid: {format(Number(b.amount_paid))}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
