import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, CreditCard, Check, ArrowLeft } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PaymentPlan = Database["public"]["Enums"]["payment_plan"];
type ItemType = Database["public"]["Enums"]["item_type"];

const paymentPlans = [
  {
    id: "full" as PaymentPlan,
    label: "Full Payment",
    desc: "Pay the full amount upfront",
    discount: "Best value",
  },
  {
    id: "deposit" as PaymentPlan,
    label: "Deposit (30%)",
    desc: "Pay 30% now, balance before travel",
    discount: "Secure your spot",
  },
  {
    id: "installment" as PaymentPlan,
    label: "Lipa Mdogo Mdogo",
    desc: "Flexible monthly installments",
    discount: "Pay in 3-6 months",
  },
];

export default function Book() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const itemType = (searchParams.get("type") || "tour") as ItemType;
  const itemId = searchParams.get("id") || "";
  const itemTitle = searchParams.get("title") || "";
  const itemPrice = parseFloat(searchParams.get("price") || "0");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan>("full");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    travelDate: "",
    guests: 1,
    notes: "",
  });

  useEffect(() => {
    supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setForm((prev) => ({
          ...prev,
          email: session.user.email || prev.email,
          name: session.user.user_metadata?.first_name || prev.name,
        }));
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        setForm((prev) => ({
          ...prev,
          email: session.user.email || prev.email,
          name: session.user.user_metadata?.first_name || prev.name,
        }));
      }
    });
  }, []);

  const totalPrice = itemPrice * form.guests;
  const depositAmount = Math.round(totalPrice * 0.3);
  const installmentAmount = Math.round(totalPrice / 4);

  const getPayAmount = () => {
    switch (selectedPlan) {
      case "deposit": return depositAmount;
      case "installment": return installmentAmount;
      default: return totalPrice;
    }
  };

  const [isGuest, setIsGuest] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.travelDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    // If no user, sign in anonymously to get a proper user_id for RLS
    let userId = user?.id;
    if (!userId) {
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
      if (anonError || !anonData?.user) {
        toast.error("Could not create a session. Please try signing in.");
        setLoading(false);
        return;
      }
      userId = anonData.user.id;
      setUser(anonData.user);
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        item_type: itemType,
        item_id: itemId,
        item_title: itemTitle,
        travel_date: form.travelDate,
        guests: form.guests,
        payment_plan: selectedPlan,
        total_price: totalPrice,
        amount_paid: getPayAmount(),
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
        customer_phone: form.phone.trim(),
        notes: form.notes.trim(),
        status: "pending" as const,
      })
      .select()
      .single();

    if (bookingError) {
      toast.error("Booking failed: " + bookingError.message);
      setLoading(false);
      return;
    }

    // Create initial payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      booking_id: booking.id,
      amount: getPayAmount(),
      payment_plan: selectedPlan,
      status: "pending" as const,
      installment_number: 1,
      due_date: new Date().toISOString().split("T")[0],
    });

    if (paymentError) {
      toast.error("Payment record failed: " + paymentError.message);
    } else {
      toast.success("Booking confirmed! We'll contact you shortly.");
      setStep(3);
    }
    setLoading(false);
  };

  if (!itemTitle) {
    return (
      <main className="min-h-screen pt-24 pb-16 container text-center">
        <h1 className="text-2xl font-heading font-bold mb-4">No item selected</h1>
        <Button asChild variant="outline">
          <Link to="/tours"><ArrowLeft className="w-4 h-4 mr-2" /> Browse Tours</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container max-w-3xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={step}>
          {step === 1 && (
            <div className="bg-card p-8 rounded-lg space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-1">Your Details</h2>
                <p className="text-sm text-muted-foreground">Booking: <span className="font-semibold text-foreground">{itemTitle}</span></p>
                <p className="text-primary font-bold text-lg mt-1">KSh {itemPrice.toLocaleString()} per person</p>
              </div>

              {!user && !isGuest && (
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <p className="text-sm">Sign in for a better experience, or continue as guest</p>
                  <div className="flex gap-2">
                    <Button asChild size="sm"><Link to="/auth">Sign In / Sign Up</Link></Button>
                    <Button size="sm" variant="outline" onClick={() => setIsGuest(true)}>Continue as Guest</Button>
                  </div>
                </div>
              )}
              {isGuest && !user && (
                <div className="bg-secondary/10 border border-secondary/30 p-3 rounded-md">
                  <p className="text-sm text-secondary font-medium">Booking as guest — your details will be saved with the reservation.</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Full Name *</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" maxLength={100} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email *</label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" maxLength={255} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254..." maxLength={20} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Travel Date *</label>
                  <Input type="date" value={form.travelDate} onChange={(e) => setForm({ ...form, travelDate: e.target.value })} min={new Date().toISOString().split("T")[0]} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Guests</label>
                  <Input type="number" min={1} max={50} value={form.guests} onChange={(e) => setForm({ ...form, guests: parseInt(e.target.value) || 1 })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Special Requests</label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special requirements..." rows={3} maxLength={500} />
              </div>
              <Button onClick={() => { if (!user && !isGuest) { toast.error("Please sign in or continue as guest"); return; } if (!form.name.trim() || !form.email.trim()) { toast.error("Please fill in your name and email"); return; } setStep(2); }} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={!user && !isGuest}>
                Continue to Payment
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-card p-8 rounded-lg space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-1">Choose Payment Plan</h2>
                <p className="text-sm text-muted-foreground">
                  Total: <span className="font-bold text-foreground text-lg">KSh {totalPrice.toLocaleString()}</span>
                  {form.guests > 1 && <span className="ml-1">({form.guests} guests)</span>}
                </p>
              </div>

              <div className="space-y-3">
                {paymentPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedPlan === plan.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{plan.label}</p>
                        <p className="text-sm text-muted-foreground">{plan.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          KSh {plan.id === "full" ? totalPrice.toLocaleString() : plan.id === "deposit" ? depositAmount.toLocaleString() : installmentAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{plan.discount}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedPlan === "installment" && (
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-1"><CreditCard className="w-4 h-4" /> Lipa Mdogo Mdogo Plan</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• 1st payment: KSh {installmentAmount.toLocaleString()} (today)</p>
                    <p>• 2nd payment: KSh {installmentAmount.toLocaleString()} (Month 2)</p>
                    <p>• 3rd payment: KSh {installmentAmount.toLocaleString()} (Month 3)</p>
                    <p>• 4th payment: KSh {(totalPrice - installmentAmount * 3).toLocaleString()} (Month 4)</p>
                  </div>
                </div>
              )}

              <div className="bg-muted p-4 rounded-md text-sm">
                <h4 className="font-semibold mb-2">Booking Summary</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p><span className="font-medium text-foreground">Tour:</span> {itemTitle}</p>
                  <p><span className="font-medium text-foreground">Date:</span> {form.travelDate}</p>
                  <p><span className="font-medium text-foreground">Guests:</span> {form.guests}</p>
                  <p><span className="font-medium text-foreground">Name:</span> {form.name}</p>
                  <p><span className="font-medium text-foreground">Pay Now:</span> <span className="text-primary font-bold">KSh {getPayAmount().toLocaleString()}</span></p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  {loading ? "Processing..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-card p-8 rounded-lg text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-2xl font-heading font-bold">Booking Confirmed!</h2>
              <p className="text-muted-foreground">
                Your reservation for <span className="font-semibold text-foreground">{itemTitle}</span> has been submitted.
                Our team will contact you at <span className="font-semibold">{form.email}</span> within 24 hours to finalize payment.
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button asChild variant="outline"><Link to="/tours">Browse More Tours</Link></Button>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90"><Link to="/my-bookings">My Bookings</Link></Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
