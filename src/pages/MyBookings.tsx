import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Package, CreditCard } from "lucide-react";

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchBookings(session.user.id);
    });
  }, [navigate]);

  const fetchBookings = async (userId: string) => {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-safari-gold/20 text-safari-gold",
    confirmed: "bg-secondary/20 text-secondary",
    cancelled: "bg-destructive/20 text-destructive",
    completed: "bg-primary/20 text-primary",
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-heading font-bold mb-8">My Bookings</h1>
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="bg-card rounded-lg h-32 animate-pulse" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold mb-2">No bookings yet</h2>
            <p className="text-muted-foreground mb-4">Start exploring our tours and events!</p>
            <Button asChild><Link to="/tours">Browse Tours</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
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
                    <h3 className="font-heading font-semibold text-lg">{b.item_title}</h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {b.travel_date || "TBD"}</span>
                      <span className="capitalize">{b.item_type}</span>
                      <span>{b.guests} guest{b.guests > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColors[b.status] || ""}`}>
                      {b.status}
                    </span>
                    <p className="text-primary font-bold mt-2">KSh {Number(b.total_price).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="capitalize">{b.payment_plan === "installment" ? "Lipa Mdogo Mdogo" : b.payment_plan}</span>
                    <span className="ml-2">Paid: KSh {Number(b.amount_paid).toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
