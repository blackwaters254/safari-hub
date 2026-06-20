import { useEffect, useMemo, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Clock, MapPin, Users, Check, Share2, MessageCircle, Sparkles, Star, Shield, Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import hotDealPoster from "@/assets/hot-deal-mara-amboseli-v5.jpg";

type Promo = {
  slug: string;
  poster: string;
  eyebrow: string;
  title: string;
  tagline: string;
  hook: string;
  bullets: string[];
  itinerary: { day: string; title: string; body: string }[];
  highlights: string[];
  tiers: { label: string; nowKsh: number; wasKsh: number }[];
  whatsappMsg: string;
};

const PROMOS: Record<string, Promo> = {
  "maasai-mara-amboseli": {
    slug: "maasai-mara-amboseli",
    poster: hotDealPoster,
    eyebrow: "Limited Hot Deal",
    title: "3 Days · Maasai Mara & Amboseli",
    tagline: "Where the Great Migration meets Kilimanjaro's shadow.",
    hook: "Two iconic parks. One unforgettable weekend. Big Five sightings, golden savannahs, and elephants framed by Africa's tallest peak — all in 72 unforgettable hours.",
    bullets: [
      "4×4 safari land cruiser with pop-up roof",
      "Professional English-speaking driver-guide",
      "Full board — breakfast, lunch & dinner",
      "Park fees, accommodation & bottled water",
      "Free hotel pickup in Nairobi",
    ],
    itinerary: [
      { day: "Day 1", title: "Nairobi → Maasai Mara", body: "Morning departure through the Great Rift Valley. Afternoon game drive on arrival — your first lions await." },
      { day: "Day 2", title: "Mara to Amboseli", body: "Sunrise game drive in the Mara, then transfer to Amboseli. Evening drive among the herds with Kilimanjaro on the horizon." },
      { day: "Day 3", title: "Amboseli → Nairobi", body: "Early-morning Kilimanjaro game drive. Brunch, then comfortable return to Nairobi by late afternoon." },
    ],
    highlights: ["Big Five sightings", "Mount Kilimanjaro views", "Maasai cultural visit", "Photographer's dream"],
    tiers: [
      { label: "Solo Traveller", nowKsh: 65000, wasKsh: 110000 },
      { label: "Group of 2-4", nowKsh: 48000, wasKsh: 95000 },
      { label: "Group of 7", nowKsh: 88400, wasKsh: 110000 }, // ~$680 at 130
    ],
    whatsappMsg: "Hi Blackwaters! I saw the 3-Day Maasai Mara & Amboseli promo and I'd like to book.",
  },
};

function useCountdown(target?: string | null) {
  const [tl, setTl] = useState({ d: 0, h: 0, m: 0, s: 0, done: !target });
  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) return setTl({ d: 0, h: 0, m: 0, s: 0, done: true });
      setTl({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
        done: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return tl;
}

export default function PromoLanding() {
  const { slug } = useParams();
  const promo = PROMOS[slug || "maasai-mara-amboseli"];
  const { format, currency } = useCurrency();
  const [endDate, setEndDate] = useState<string | null>(null);
  const t = useCountdown(endDate);

  useEffect(() => {
    (supabase as any)
      .from("payment_settings")
      .select("hot_deal_end_date")
      .limit(1)
      .maybeSingle()
      .then(({ data }: any) => setEndDate(data?.hot_deal_end_date || null));

    if (promo) {
      document.title = `${promo.title} — Blackwaters Safaris`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", promo.tagline + " " + promo.hook.slice(0, 100));
    }
  }, [promo]);

  if (!promo) return <Navigate to="/" replace />;

  const share = async () => {
    const url = window.location.href;
    const text = `${promo.title} — ${promo.tagline}`;
    if (navigator.share) {
      try { await navigator.share({ title: promo.title, text, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Promo link copied!");
    }
  };

  const bookLink = `/book?type=tour&id=hot-deal&title=${encodeURIComponent(promo.title)}&price=${promo.tiers[0].nowKsh}`;
  const wa = `https://wa.me/254118596089?text=${encodeURIComponent(promo.whatsappMsg)}`;

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${promo.poster})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        <div className="relative container mx-auto px-4 py-16 md:py-28">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="bg-orange-600 hover:bg-orange-600 text-white border-0 mb-4 px-3 py-1.5">
                <Flame className="w-3.5 h-3.5 mr-1.5" /> {promo.eyebrow}
              </Badge>
              <p className="text-amber-400 uppercase tracking-[0.3em] text-xs font-bold mb-3" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>Blackwaters Safaris</p>
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-4" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>
                {promo.title}
              </h1>
              <p className="text-xl md:text-2xl text-amber-100 font-light italic mb-6" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}>
                {promo.tagline}
              </p>
              <p className="text-white/90 text-base md:text-lg max-w-2xl mb-8" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
                {promo.hook}
              </p>

              {endDate && !t.done && (
                <div className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-white text-sm font-semibold tabular-nums">
                    Ends in {t.d}d {String(t.h).padStart(2,"0")}:{String(t.m).padStart(2,"0")}:{String(t.s).padStart(2,"0")}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white h-14 px-8 text-base font-bold shadow-2xl shadow-orange-900/40 ring-2 ring-orange-300/40">
                  <Link to={bookLink}>
                    <Flame className="w-5 h-5 mr-2" /> Book Now — From {format(promo.tiers[1].nowKsh)} pp
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 border-white/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp Us
                  </a>
                </Button>
                <Button onClick={share} size="lg" variant="ghost" className="h-14 text-white hover:bg-white/10">
                  <Share2 className="w-5 h-5 mr-2" /> Share
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS STRIP */}
      <section className="border-y border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {promo.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-sm md:text-base">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                <span className="font-medium">{h}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-10">
          <p className="text-primary uppercase tracking-widest text-xs font-bold mb-2">Pricing</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Choose Your Group Size</h2>
          <p className="text-muted-foreground mt-2">Prices shown in {currency}. Toggle currency in the top bar anytime.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {promo.tiers.map((tier, i) => {
            const featured = i === 2; // group of 7 special
            return (
              <motion.div
                key={tier.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative rounded-2xl border-2 p-6 ${featured ? "border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 shadow-xl scale-[1.02]" : "border-border bg-card"}`}
              >
                {featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Best Value
                  </div>
                )}
                <Users className="w-7 h-7 text-primary mb-3" />
                <h3 className="font-heading text-xl font-bold">{tier.label}</h3>
                <div className="mt-4 mb-5">
                  <p className="text-sm text-muted-foreground line-through">{format(tier.wasKsh)}</p>
                  <p className="text-3xl md:text-4xl font-black text-foreground">
                    {format(tier.nowKsh)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">/ person</span>
                  </p>
                </div>
                <Button asChild className="w-full" variant={featured ? "default" : "outline"}>
                  <Link to={bookLink}>Book {tier.label} <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ITINERARY */}
      <section className="bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-primary uppercase tracking-widest text-xs font-bold mb-2">The Journey</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Day-by-Day Itinerary</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {promo.itinerary.map((d, i) => (
              <motion.div
                key={d.day}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 bg-card rounded-xl border p-5"
              >
                <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-heading font-bold text-sm">
                  {d.day.replace("Day ", "D")}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg">{d.title}</h3>
                  <p className="text-muted-foreground mt-1">{d.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INCLUDED */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto items-center">
          <div>
            <p className="text-primary uppercase tracking-widest text-xs font-bold mb-2">Package</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-5">Everything Included</h2>
            <p className="text-muted-foreground mb-6">No surprise fees, no hidden costs. Just pack your camera and your sense of wonder — we handle the rest.</p>
            <ul className="space-y-3">
              {promo.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
            <img src={promo.poster} alt={promo.title} className="absolute inset-0 w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-card border-t py-10">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Shield, label: "Licensed & Insured" },
            { icon: Star, label: "4.9★ on Reviews" },
            { icon: Camera, label: "Pro Guides" },
            { icon: Sparkles, label: "100% Custom" },
          ].map((t, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <t.icon className="w-7 h-7 text-amber-500" />
              <p className="text-sm font-semibold">{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-orange-600 via-red-600 to-amber-700 rounded-3xl p-10 md:p-14 text-white shadow-2xl">
          <Flame className="w-12 h-12 mx-auto mb-4 text-amber-200" />
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-3">Limited Spots This Week</h2>
          <p className="text-white/90 text-lg mb-7">Lock in your seat before the deal ends. Pay deposit or full — your choice.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="bg-white text-orange-700 hover:bg-amber-50 h-14 px-8 font-bold">
              <Link to={bookLink}>Reserve My Spot <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 border-white/60 bg-white/10 text-white hover:bg-white/20">
              <a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-5 h-5 mr-2" /> Chat on WhatsApp</a>
            </Button>
          </div>
          <p className="text-white/70 text-xs mt-6 flex items-center justify-center gap-1.5">
            <MapPin className="w-3 h-3" /> AMBANK Building, Monrovia Street, Nairobi · +254 118 596 089
          </p>
        </div>
      </section>
    </div>
  );
}
