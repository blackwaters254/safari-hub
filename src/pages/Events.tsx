import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import culturalTour from "@/assets/cultural-tour.jpg";

interface Event {
  id: string;
  title: string;
  description: string;
  short_description: string;
  location: string;
  image_url: string;
  start_date: string | null;
  end_date: string | null;
  price: number;
  capacity: number;
  is_active: boolean;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { format } = useCurrency();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: true });
      setEvents((data as Event[]) || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <main>
      <section className="relative h-[45vh] min-h-[350px] flex items-center">
        <img src={culturalTour} alt="Events" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 safari-overlay-strong" />
        <div className="relative container pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Special Experiences</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground">Events & Experiences</h1>
            <p className="text-primary-foreground/80 mt-3 max-w-lg">
              Exclusive events, cultural festivals, and unique experiences across Kenya.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-heading font-bold mb-2">No Events Yet</h2>
              <p className="text-muted-foreground">Check back soon for upcoming events and experiences!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link to={`/events/${event.id}`} className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 block">
                    <div className="relative h-56 overflow-hidden bg-muted">
                      {event.image_url ? (
                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Event
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.short_description || event.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        {event.start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(event.start_date).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {event.location}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-semibold">{format(event.price)}</span>
                        <Button asChild size="sm" variant="ghost" className="text-primary">
                          <Link to={`/book?type=event&id=${event.id}&title=${encodeURIComponent(event.title)}&price=${event.price}`}>
                            Book Now <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
