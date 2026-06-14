import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Clock, MapPin, Check } from "lucide-react";
import HotDealCountdown from "@/components/HotDealCountdown";
import { useCurrency } from "@/contexts/CurrencyContext";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

interface Props {
  promo: any;
  poster: string;
  dealEnd: string | null;
}

const defaultIncludes = [
  "Transport in 4x4 Safari Vehicle",
  "Sarova Mara Game Camp (luxury) — 1 night",
  "Sentrim Amboseli — 1 night",
  "All meals as per itinerary",
  "Professional Driver Guide",
  "Game drives & park entry fees",
  "Bottled water throughout",
];

export default function HotDealPromoSection({ promo, poster, dealEnd }: Props) {
  const { format } = useCurrency();

  const title = promo?.hot_deal_title || "3-Day Maasai Mara & Amboseli";
  const subtitle = promo?.hot_deal_subtitle || "Two iconic destinations. One unforgettable safari. Limited slots available.";
  const savingsLabel = promo?.hot_deal_savings_label || "SAVE $350";
  const includes: string[] = (promo?.hot_deal_includes && promo.hot_deal_includes.length > 0) ? promo.hot_deal_includes : defaultIncludes;

  const tiers = [
    { label: promo?.hot_deal_tier1_label || "2 Sharing", now: Number(promo?.hot_deal_tier1_now_ksh ?? 143000), was: Number(promo?.hot_deal_tier1_was_ksh ?? 188000), color: "text-primary" },
    { label: promo?.hot_deal_tier2_label || "Group of 4", now: Number(promo?.hot_deal_tier2_now_ksh ?? 125000), was: Number(promo?.hot_deal_tier2_was_ksh ?? 169000), color: "text-orange-700 dark:text-orange-400" },
    { label: promo?.hot_deal_tier3_label || "Group of 7", now: Number(promo?.hot_deal_tier3_now_ksh ?? 88000), was: Number(promo?.hot_deal_tier3_was_ksh ?? 123000), color: "text-green-700 dark:text-green-400" },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="container relative">
        <motion.div {...fadeUp} className="text-center mb-10">
          <Badge className="mb-3 bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 text-xs uppercase tracking-widest animate-pulse">
            <Flame className="w-3.5 h-3.5 mr-1.5" /> Hot Deal This Week
          </Badge>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative group"
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-primary to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition" />
            <img src={poster} alt={title} className="relative w-full rounded-2xl shadow-2xl" />
            <Badge className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 shadow-lg animate-pulse">
              <Flame className="w-3.5 h-3.5 mr-1" /> {savingsLabel}
            </Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="border-primary/40 text-primary px-3 py-1.5"><Clock className="w-3.5 h-3.5 mr-1.5" /> 3 Days / 2 Nights</Badge>
              <Badge variant="outline" className="border-primary/40 text-primary px-3 py-1.5"><MapPin className="w-3.5 h-3.5 mr-1.5" /> Mara + Amboseli</Badge>
            </div>

            <div className="space-y-2.5">
              <h3 className="font-heading font-semibold text-lg">Package includes:</h3>
              {includes.map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>

            <HotDealCountdown endDate={dealEnd} />

            <div className="bg-card border-2 border-primary/30 rounded-xl p-5 shadow-lg">
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                {tiers.map((p) => (
                  <div key={p.label} className="bg-muted/40 rounded-lg p-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{p.label}</p>
                    <p className="text-[11px] text-muted-foreground line-through">{format(p.was)}</p>
                    <p className={`text-base md:text-xl font-heading font-bold ${p.color}`}>{format(p.now)}</p>
                    <p className="text-[9px] text-muted-foreground">per person</p>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mb-4 border-t border-border pt-3">
                Save more when you travel as a larger group sharing.
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Button asChild size="lg" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white shadow-lg font-bold">
                  <Link to={`/book?type=tour&id=hot-deal&title=${encodeURIComponent(title)}&price=${tiers[0].now}`}>
                    <Flame className="w-4 h-4 mr-1.5" /> Book Now
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="flex-1 border-orange-600/40 text-orange-700 hover:bg-orange-50">
                  <a href={`https://wa.me/254118596089?text=${encodeURIComponent("Hi, I'm interested in the " + title + " deal")}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp Us
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
