import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Check, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";

import masaiMara from "@/assets/masai-mara.jpg";
import beachHoliday from "@/assets/beach-holiday.jpg";
import culturalTour from "@/assets/cultural-tour.jpg";
import mountKenya from "@/assets/mount-kenya.jpg";
import safariJeep from "@/assets/safari-jeep.jpg";
import safariLodge from "@/assets/safari-lodge.jpg";
import hotDealMaraAmboseli from "@/assets/hot-deal-mara-amboseli-v5.jpg";

const imageMap: Record<string, string> = {
  "masai-mara": masaiMara,
  "beach-holiday": beachHoliday,
  "cultural-tour": culturalTour,
  "mount-kenya": mountKenya,
  "safari-jeep": safariJeep,
  "safari-lodge": safariLodge,
  "hot-deal-mara-amboseli-v5": hotDealMaraAmboseli,
};

export default function TourDetail() {
  const { id } = useParams();
  const { format } = useCurrency();
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      const { data } = await supabase
        .from("tours")
        .select("*")
        .eq("id", id)
        .single();
      setTour(data);
      setLoading(false);
    };
    fetchTour();
  }, [id]);

  if (loading) {
    return (
      <main className="pt-24 pb-16 container text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </main>
    );
  }

  if (!tour) {
    return (
      <main className="pt-24 pb-16 container text-center">
        <h1 className="text-2xl font-heading font-bold mb-4">Tour not found</h1>
        <Button asChild variant="outline">
          <Link to="/tours"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Tours</Link>
        </Button>
      </main>
    );
  }

  const imageKey = tour.image_url || "";
  const imgSrc = imageMap[imageKey] || (imageKey.startsWith("http") || imageKey.startsWith("/") ? imageKey : masaiMara);
  const highlights: string[] = tour.highlights || [];
  const itinerary: { day: string; title: string; description: string }[] = tour.itinerary || [];
  const included: string[] = tour.included || [];
  const excluded: string[] = tour.excluded || [];
  const priceKSH = Number(tour.price_ksh) || 0;

  return (
    <main>
      <section className="relative h-[50vh] min-h-[400px] flex items-end">
        <img src={imgSrc} alt={tour.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 safari-overlay" />
        <div className="relative container pb-10 pt-20">
          <Link to="/tours" className="inline-flex items-center text-primary-foreground/70 hover:text-primary text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> All Tours
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full capitalize">{tour.category}</span>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-primary-foreground mt-3">{tour.title}</h1>
            <div className="flex items-center gap-6 mt-4 text-primary-foreground/80 text-sm">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {tour.duration}</span>
              <span className="text-primary font-bold text-lg">From {format(priceKSH)}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-4">Overview</h2>
                <p className="text-muted-foreground leading-relaxed">{tour.description}</p>
              </div>

              {highlights.length > 0 && (
                <div>
                  <h2 className="text-2xl font-heading font-bold mb-4">Highlights</h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0" /> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {itinerary.length > 0 && (
                <div>
                  <h2 className="text-2xl font-heading font-bold mb-4">Itinerary</h2>
                  <div className="space-y-4">
                    {itinerary.map((day) => (
                      <div key={day.day} className="bg-card p-5 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">{day.day}</span>
                          <h3 className="font-semibold">{day.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{day.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(included.length > 0 || excluded.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {included.length > 0 && (
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-3">What's Included</h3>
                      <ul className="space-y-2">
                        {included.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-secondary shrink-0" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {excluded.length > 0 && (
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-3">What's Excluded</h3>
                      <ul className="space-y-2">
                        {excluded.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <X className="w-4 h-4 text-destructive shrink-0" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card p-6 rounded-lg sticky top-24 space-y-4">
                <h3 className="font-heading font-bold text-xl">Book This Tour</h3>
                <p className="text-2xl font-bold text-primary">From {format(priceKSH)}</p>
                <p className="text-sm text-muted-foreground">{tour.duration}</p>
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to={`/book?type=tour&id=${tour.id}&title=${encodeURIComponent(tour.title)}&price=${priceKSH}`}>Book Now</Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <a href={`https://wa.me/254700000000?text=${encodeURIComponent(`Hi, I'm interested in the ${tour.title} tour.`)}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground text-center">No commitment — we'll get back within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
