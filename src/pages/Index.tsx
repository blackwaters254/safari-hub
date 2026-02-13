import { Link } from "react-router-dom";
import { ArrowRight, Shield, Users, MapPin, Star, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { tours, testimonials } from "@/data/tours";
import TourCard from "@/components/TourCard";
import heroImage from "@/assets/hero-safari.jpg";
import safariJeep from "@/assets/safari-jeep.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function Index() {
  const featured = tours.slice(0, 3);

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center">
        <img src={heroImage} alt="African safari at sunset" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 safari-overlay" />
        <div className="relative container pt-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
              Kenya's Premier Safari Company
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-tight mb-6">
              Discover the Wild Heart of{" "}
              <span className="text-primary">Africa</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg leading-relaxed">
              Unforgettable safari experiences, beach escapes, and cultural journeys crafted by local experts who know Kenya like home.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8">
                <Link to="/tours">Explore Tours <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8">
                <Link to="/contact">Get a Quote</Link>
              </Button>
            </div>
          </motion.div>
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
                className="text-center p-6"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-20">
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
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8">
                <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer">
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
                className="bg-card p-6 rounded-lg"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-safari-gold text-safari-gold" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 italic leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location} — {t.tour}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
