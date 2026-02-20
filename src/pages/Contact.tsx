import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, Phone, MapPin, MessageCircle, Send, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import LiveChatWidget from "@/components/LiveChatWidget";
import culturalTour from "@/assets/cultural-tour.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BW-";
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

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
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [forceOpenChat, setForceOpenChat] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);

    const code = generateTicketCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from("support_tickets").insert({
      subject: form.tour ? `Inquiry: ${form.tour}` : "General Inquiry",
      customer_name: form.name.trim(),
      customer_email: form.email.trim(),
      customer_phone: form.phone.trim() || "",
      message: form.message.trim(),
      ticket_code: code,
      code_expires_at: expiresAt,
      priority: "medium",
      status: "open",
    });

    if (error) {
      toast.error("Failed to send message. Please try again.");
      setSending(false);
      return;
    }

    // Add initial message to ticket
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("id")
      .eq("ticket_code", code)
      .maybeSingle();

    if (ticket) {
      await supabase.from("ticket_messages").insert({
        ticket_id: ticket.id,
        sender_type: "customer",
        message: form.message.trim(),
      });
    }

    setTicketCode(code);
    toast.success("Message sent! Opening your conversation...");
    setForm({ name: "", email: "", phone: "", tour: "", message: "" });
    setSending(false);

    // Auto-open chat after brief delay
    setTimeout(() => setChatOpen(true), 800);
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
                  { icon: MapPin, label: "Visit Us", value: "AMBANK Building, Monrovia Street off Koinange Street, Nairobi" },
                  { icon: Phone, label: "Call Us", value: "+254 118 596 089" },
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
              <div className="space-y-3">
                <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full sm:w-auto">
                  <a href="https://wa.me/254118596089" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 mr-2" /> Chat on WhatsApp
                  </a>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setForceOpenChat(true)}
                  className="w-full sm:w-auto border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
                >
                  <Ticket className="w-4 h-4 mr-2" /> Continue a Conversation
                </Button>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div {...fadeUp} className="lg:col-span-2">
              {ticketCode ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card p-8 rounded-xl border border-border text-center space-y-4"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center">
                    <Ticket className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="font-heading font-bold text-xl">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm">Your ticket code is:</p>
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-3xl font-mono font-bold text-primary tracking-widest">{ticketCode}</p>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Save this code — it's valid for 24 hours. You can also use your phone number to continue the conversation.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button onClick={() => setChatOpen(true)} className="gap-2">
                      <MessageCircle className="w-4 h-4" /> Open Chat
                    </Button>
                    <Button variant="outline" onClick={() => setTicketCode(null)}>
                      Send Another Message
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-card p-8 rounded-xl border border-border space-y-5">
                  <h3 className="font-heading font-bold text-xl mb-2">Send Us a Message</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Name *</label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" maxLength={100} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email *</label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" maxLength={255} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone</label>
                      <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254..." maxLength={20} type="tel" />
                      <p className="text-[10px] text-muted-foreground mt-0.5">Used to continue chat later</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Interested Tour</label>
                      <Input value={form.tour} onChange={(e) => setForm({ ...form, tour: e.target.value })} placeholder="e.g. Masai Mara Safari" maxLength={200} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Message *</label>
                    <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your dream safari..." rows={5} maxLength={1000} />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button type="submit" disabled={sending} className="px-8">
                      {sending ? "Sending..." : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setForceOpenChat(true)}
                      className="border-2 border-secondary/60 bg-secondary/5 text-secondary hover:bg-secondary hover:text-secondary-foreground font-semibold ring-2 ring-secondary/20"
                    >
                      <Ticket className="w-4 h-4 mr-2" /> Continue a Conversation
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <LiveChatWidget
        prefilledCode={ticketCode || undefined}
        onCodeConsumed={() => setChatOpen(false)}
        forceOpen={forceOpenChat}
      />
    </main>
  );
}
