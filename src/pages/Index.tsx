import { Link } from "react-router-dom";
import { ArrowRight, Shield, Users, MapPin, Star, MessageCircle, Globe, Compass, Camera, TreePine, Flame, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { testimonials } from "@/data/tours";
import { supabase } from "@/integrations/supabase/client";
import TourCard from "@/components/TourCard";
import heroImage from "@/assets/hero-safari.jpg";
import safariJeep from "@/assets/safari-jeep.jpg";
import masaiMara from "@/assets/masai-mara.jpg";
import beachHoliday from "@/assets/beach-holiday.jpg";
import hotDealPoster from "@/assets/hot-deal-mara-amboseli-v4.png";
import { useState, useEffect, useCallback, useRef } from "react";
import HotDealCountdown from "@/components/HotDealCountdown";

const partners = [
  "Sarova Hotels", "Serena Hotels", "Fairmont Mara", "Hemingways", "Enashipai Resort",
  "Sopa Lodges", "Voyager Beach", "Diani Reef", "Tamarind", "Olare Mara", "Kempinski", "Ole Sereni"
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const heroSlides = [
  { src: heroImage, alt: "African safari at sunset", tagline: "Where the Wild Things Roam" },
  { src: masaiMara, alt: "Masai Mara wildlife", tagline: "The Great Migration Awaits" },
  { src: beachHoliday, alt: "Kenya beach escape", tagline: "Paradise Found in Kenya" },
  { src: safariJeep, alt: "Safari adventure", tagline: "Your Adventure Starts Here" },
];

const destinations = [
  { name: "Masai Mara", icon: Compass, desc: "The iconic savannah", image: masaiMara },
  { name: "Diani Beach", icon: Globe, desc: "Pristine white sands", image: beachHoliday },
  { name: "Amboseli", icon: Camera, desc: "Kilimanjaro views", image: safariJeep },
  { name: "Tsavo", icon: TreePine, desc: "Vast wilderness", image: heroImage },
];

function AnimatedCounter({ target, suffix = "", duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return unsub;
  }, [rounded]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !triggered.current) {
        triggered.current = true;
        animate(count, target, { duration });
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [count, target, duration]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

export default function Index() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [dealEnd, setDealEnd] = useState<string | null>(null);
  useEffect(() => {
    supabase.from("tours").select("*").eq("is_active", true).order("sort_order").limit(3).then(({ data }) => setFeatured(data || []));
    (supabase as any).from("payment_settings").select("hot_deal_end_date,hot_deal_active").limit(1).maybeSingle().then(({ data }: any) => {
      if (data?.hot_deal_active) setDealEnd(data.hot_deal_end_date);
    });
  }, []);
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {heroSlides.map((slide, i) => (
          <motion.img
            key={slide.alt}
            src={slide.src}
            alt={slide.alt}
            className="absolute inset-0 w-full h-full object-cover"
            initial={false}
            animate={{ opacity: i === currentSlide ? 1 : 0, scale: i === currentSlide ? 1.05 : 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        ))}
        <div className="absolute inset-0 safari-overlay" />

        {/* Slide tagline */}
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-6 right-6 z-10 hidden md:block"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-primary-foreground/60 font-medium bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-full">
            {heroSlides[currentSlide].tagline}
          </span>
        </motion.div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2.5 rounded-full transition-all duration-500 ${i === currentSlide ? "bg-primary w-8" : "bg-primary-foreground/50 w-2.5"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="relative container pt-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-primary font-medium tracking-widest uppercase text-sm mb-4"
            >
              Kenya's Premier Safari Company
            </motion.p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-tight mb-6">
              Discover the Wild Heart of{" "}
              <span className="text-gradient">Africa</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg leading-relaxed">
              Unforgettable safari experiences, beach escapes, and cultural journeys crafted by local experts who know Kenya like home.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8">
                <Link to="/tours">Explore Tours <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary text-primary-foreground bg-primary/20 hover:bg-primary/40 text-base px-8">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-6 bg-primary">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: 2500, suffix: "+", label: "Happy Travelers" },
              { value: 50, suffix: "+", label: "Safari Routes" },
              { value: 15, suffix: "+", label: "Years Experience" },
              { value: 98, suffix: "%", label: "Satisfaction Rate" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-2xl md:text-3xl font-heading font-bold text-primary-foreground">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-primary-foreground/70 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOT DEAL THIS WEEK */}
      <section className="py-16 bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="container relative">
          <motion.div {...fadeUp} className="text-center mb-10">
            <Badge className="mb-3 bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 text-xs uppercase tracking-widest animate-pulse">
              <Flame className="w-3.5 h-3.5 mr-1.5" /> Hot Deal This Week
            </Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-2">
              3-Day <span className="text-primary">Maasai Mara</span> & <span className="text-orange-600">Amboseli</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Two iconic destinations. One unforgettable safari. Limited slots available.</p>
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
              <img src={hotDealPoster} alt="3 Day Maasai Mara and Amboseli Safari" className="relative w-full rounded-2xl shadow-2xl" />
              <Badge className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 shadow-lg animate-pulse">
                <Flame className="w-3.5 h-3.5 mr-1" /> SAVE $350
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
                {[
                  "Transport in 4x4 Safari Vehicle",
                  "Sarova Mara Game Camp (luxury) — 1 night",
                  "Sentrim Amboseli — 1 night",
                  "All meals as per itinerary",
                  "Professional Driver Guide",
                  "Game drives & park entry fees",
                  "Bottled water throughout",
                ].map((item) => (
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
                <div className="flex items-end justify-between flex-wrap gap-3 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground line-through">USD 1,450</p>
                    <p className="text-3xl md:text-4xl font-heading font-bold text-primary">USD 1,100</p>
                    <p className="text-xs text-muted-foreground">per person sharing</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-600 text-white text-sm px-3 py-1.5 mb-1">Group of 4</Badge>
                    <p className="text-sm text-muted-foreground line-through">USD 1,300</p>
                    <p className="text-xl font-heading font-bold text-orange-700 dark:text-orange-400">USD 960<span className="text-xs font-normal text-muted-foreground"> pp</span></p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-4 border-t border-border pt-3">
                  Save more when you travel as a group of 4 sharing.
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Button asChild size="lg" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white shadow-lg font-bold">
                    <Link to="/book?type=tour&id=hot-deal&title=3-Day%20Maasai%20Mara%20%26%20Amboseli&price=143000">
                      <Flame className="w-4 h-4 mr-1.5" /> Book Now
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="flex-1 border-orange-600/40 text-orange-700 hover:bg-orange-50">
                    <a href="https://wa.me/254118596089?text=Hi%2C%20I%27m%20interested%20in%20the%203-Day%20Maasai%20Mara%20%26%20Amboseli%20deal%20(USD%201100%20pp%20sharing%2C%20group%20of%204%20USD%20960%20pp)" target="_blank" rel="noopener noreferrer">
                      WhatsApp Us
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-safari-warm">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-14">
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-2">Why Blackwaters Safaris</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold">Your Safari, Our Expertise</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: MapPin, title: "Local Experts", desc: "Born and raised in Kenya, we know every trail, lodge, and hidden gem." },
              { icon: Shield, title: "Safety First", desc: "Licensed, insured, and committed to the highest safety standards." },
              { icon: Users, title: "Tailored Trips", desc: "Every safari is customized to your interests, pace, and budget." },
              { icon: Star, title: "5-Star Service", desc: "From booking to farewell, we deliver exceptional personal service." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center p-6 rounded-xl hover:bg-card hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-14">
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-2">Top Destinations</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold">Explore Kenya's Finest</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {destinations.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
              >
                <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <dest.icon className="w-4 h-4 text-primary" />
                    <p className="text-xs text-primary font-medium uppercase tracking-wider">{dest.desc}</p>
                  </div>
                  <h3 className="font-heading font-bold text-lg md:text-xl text-white">{dest.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-14">
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-2">Popular Experiences</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold">Featured Tours & Safaris</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((tour, i) => (
              <TourCard key={tour.id} tour={tour} index={i} />
            ))}
          </div>
          <motion.div {...fadeUp} className="text-center mt-10">
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/tours">View All Tours <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* About CTA */}
      <section className="relative py-24">
        <img src={safariJeep} alt="Safari adventure" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 safari-overlay-strong" />
        <div className="relative container text-center">
          <motion.div {...fadeUp} className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-6">
              Ready for the Adventure of a Lifetime?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Let us craft your perfect Kenyan safari. Whether it's your first trip or your tenth, we'll make it unforgettable.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                <Link to="/contact">Plan My Safari</Link>
              </Button>
              <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8">
                <a href="https://wa.me/254118596089" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Us
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-safari-warm">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-14">
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-2">What Our Guests Say</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold">Traveller Reviews</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.slice(0, 4).map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-safari-gold text-safari-gold" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location} — {t.tour}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners / Trusted By */}
      <section className="py-16 border-t border-border bg-background">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-10">
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-2">Our Partners</p>
            <h2 className="text-2xl md:text-3xl font-heading font-bold">Trusted Hotels & Lodges</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">We work with Kenya's finest accommodation partners to deliver exceptional stays.</p>
          </motion.div>

          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="flex gap-4 animate-[scroll_40s_linear_infinite] hover:[animation-play-state:paused]">
              {[...partners, ...partners].map((p, i) => (
                <div key={i} className="flex-shrink-0 px-6 py-4 bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all min-w-[180px] text-center">
                  <p className="font-heading font-semibold text-sm md:text-base whitespace-nowrap">{p}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Partner Hotel</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </section>
    </main>
  );
}
