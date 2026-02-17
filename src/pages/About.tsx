import { Link } from "react-router-dom";
import { ArrowRight, Heart, Eye, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import safariLodge from "@/assets/safari-lodge.jpg";
import logo from "@/assets/logo.jpeg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function About() {
  return (
    <main>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center">
        <img src={safariLodge} alt="Safari lodge" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 safari-overlay-strong" />
        <div className="relative container pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">About Us</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground">Our Story</h1>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Who We Are</p>
              <h2 className="text-3xl font-heading font-bold mb-6">Passionate About Kenya's Wild Beauty</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Blackwaters Safaris was founded by a team of passionate Kenyan conservationists and travel experts who believe that every visitor deserves an authentic, transformative experience in the wild.
                </p>
                <p>
                  Based in Nairobi, we've been guiding travelers through Kenya's most spectacular landscapes for years — from the endless plains of the Masai Mara to the pristine beaches of the Indian Ocean coast.
                </p>
                <p>
                  Our team consists of certified safari guides, experienced tour operators, and hospitality professionals who share one mission: to showcase Kenya's beauty while supporting local communities and wildlife conservation.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-lg overflow-hidden"
            >
              <img src={logo} alt="Blackwaters Safaris logo" className="w-full h-[400px] object-contain rounded-lg bg-primary-foreground p-8" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-20 bg-safari-warm">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Our Mission", desc: "To deliver world-class safari experiences that connect travelers with nature while empowering local communities and preserving Kenya's wildlife heritage." },
              { icon: Eye, title: "Our Vision", desc: "To be East Africa's most trusted safari company, known for authenticity, sustainability, and creating memories that last a lifetime." },
              { icon: Heart, title: "Our Values", desc: "Conservation, community, excellence, and integrity guide everything we do — from how we treat our guests to how we protect the ecosystems we explore." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-card p-8 rounded-lg text-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container text-center">
          <motion.div {...fadeUp} className="max-w-xl mx-auto">
            <h2 className="text-3xl font-heading font-bold mb-4">Let's Plan Your Safari</h2>
            <p className="text-muted-foreground mb-8">Get in touch with our team to start planning your dream Kenyan adventure.</p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
              <Link to="/contact">Contact Us <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
