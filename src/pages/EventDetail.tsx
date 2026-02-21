import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";

interface EventData {
  id: string;
  title: string;
  description: string;
  short_description: string;
  location: string;
  image_url: string;
  start_date: string | null;
  end_date: string | null;
  price: number;
  capacity: number | null;
  is_active: boolean;
}

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const { format } = useCurrency();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
      setEvent(data as EventData | null);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center pt-24 gap-4">
        <h1 className="text-2xl font-heading font-bold">Event Not Found</h1>
        <Button asChild variant="outline"><Link to="/events"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Events</Link></Button>
      </main>
    );
  }

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        <div className="absolute inset-0 safari-overlay-strong" />
        <div className="relative container pb-10 pt-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/events" className="text-primary-foreground/70 hover:text-primary flex items-center gap-1 text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </Link>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-primary-foreground">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-primary-foreground/80">
              {event.start_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.start_date).toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  {event.end_date && ` — ${new Date(event.end_date).toLocaleDateString("en-KE", { month: "long", day: "numeric" })}`}
                </span>
              )}
              {event.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>}
              {event.capacity && <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {event.capacity} spots</span>}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-8">
            {/* Price card */}
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Price per person</p>
                <p className="text-3xl font-heading font-bold text-primary">{format(event.price)}</p>
              </div>
              <Button asChild size="lg">
                <Link to={`/book?type=event&id=${event.id}&title=${encodeURIComponent(event.title)}&price=${event.price}`}>
                  Book Now <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-heading text-2xl font-bold mb-4">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {event.description || event.short_description || "More details coming soon."}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
