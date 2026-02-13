import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, Phone, MapPin, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "sonner";
import culturalTour from "@/assets/cultural-tour.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function Contact() {
  const [searchParams] = useSearchParams();
  const tourParam = searchParams.get("tour") || "";
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    tour: tourParam,
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    // Simulate sending
    setTimeout(() => {
      setSending(false);
      toast.success("Thank you! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", phone: "", tour: "", message: "" });
    }, 1000);
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center">
        <img src={culturalTour} alt="Contact us" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 safari-overlay-strong" />
        <div className="relative container pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Get in Touch</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground">Contact Us</h1>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <motion.div {...fadeUp} className="space-y-8">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-2">Let's Talk Safari</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Have a question or ready to book? Reach out and our team will help you plan the perfect adventure.
                </p>
              </div>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: "Visit Us", value: "Nairobi, Kenya" },
                  { icon: Phone, label: "Call Us", value: "+254 700 000 000" },
                  { icon: Mail, label: "Email Us", value: "info@blackwaterssafaris.com" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" /> Chat on WhatsApp
                </a>
              </Button>
            </motion.div>

            {/* Form */}
            <motion.div {...fadeUp} className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg space-y-5">
                <h3 className="font-heading font-bold text-xl mb-2">Send Us a Message</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name *</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email *</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      maxLength={255}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone</label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+254..."
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Interested Tour</label>
                    <Input
                      value={form.tour}
                      onChange={(e) => setForm({ ...form, tour: e.target.value })}
                      placeholder="e.g. Masai Mara Safari"
                      maxLength={200}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Message *</label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your dream safari..."
                    rows={5}
                    maxLength={1000}
                  />
                </div>
                <Button type="submit" disabled={sending} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  {sending ? "Sending..." : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
