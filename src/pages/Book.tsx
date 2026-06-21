import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Calendar, Users, CreditCard, Check, ArrowLeft, Smartphone, Building2, AlertCircle, Copy, Loader2 } from "lucide-react";
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

  const { currency, format } = useCurrency();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan>("full");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "bank">("mpesa");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [stkStatus, setStkStatus] = useState<"idle" | "sending" | "failed">("idle");
  const [paySettings, setPaySettings] = useState<any>(null);
  const [bookingId, setBookingId] = useState<string>("");

  useEffect(() => {
    (supabase as any).from("payment_settings").select("*").limit(1).maybeSingle().then(({ data }: any) => setPaySettings(data));
  }, []);

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
      setLoading(false);
      return;
    }
    setBookingId(booking.id);
    setMpesaPhone(form.phone || "");
    setStep(3);
    setLoading(false);
  };

  const triggerStkPush = async () => {
    if (!mpesaPhone.trim() || mpesaPhone.replace(/\D/g, "").length < 9) {
      toast.error("Enter a valid M-Pesa phone number");
      return;
    }
    setStkStatus("sending");
    // Simulated STK push — in production this would call an edge function
    await new Promise((r) => setTimeout(r, 3500));
    setStkStatus("failed");
    toast.error("STK push could not be completed. Please use the manual options below.");
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
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
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 4 && <div className={`w-10 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={step}>
          {step === 1 && (
            <div className="bg-card p-8 rounded-lg space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-1">Your Details</h2>
                <p className="text-sm text-muted-foreground">Booking: <span className="font-semibold text-foreground">{itemTitle}</span></p>
                <p className="text-primary font-bold text-lg mt-1">{format(itemPrice)} per person</p>
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
              <Button onClick={() => { if (!form.name.trim() || !form.email.trim()) { toast.error("Please fill in your name and email"); return; } setStep(2); }} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Continue to Payment
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-card p-8 rounded-lg space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-1">Choose Payment Plan</h2>
                <p className="text-sm text-muted-foreground">
                  Total: <span className="font-bold text-foreground text-lg">{format(totalPrice)}</span>
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
                          {format(plan.id === "full" ? totalPrice : plan.id === "deposit" ? depositAmount : installmentAmount)}
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
                    <p>• 1st payment: {format(installmentAmount)} (today)</p>
                    <p>• 2nd payment: {format(installmentAmount)} (Month 2)</p>
                    <p>• 3rd payment: {format(installmentAmount)} (Month 3)</p>
                    <p>• 4th payment: {format(totalPrice - installmentAmount * 3)} (Month 4)</p>
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
                  <p><span className="font-medium text-foreground">Pay Now:</span> <span className="text-primary font-bold">{format(getPayAmount())}</span></p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  {loading ? "Processing..." : "Proceed to Payment"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-card p-6 sm:p-8 rounded-lg space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-1">Complete Payment</h2>
                <p className="text-sm text-muted-foreground">
                  Amount due: <span className="font-bold text-primary text-lg">{format(getPayAmount())}</span>
                </p>
              </div>

              {/* Method tabs */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod("mpesa")}
                  className={`p-3 rounded-lg border-2 text-sm font-semibold flex items-center justify-center gap-2 transition ${paymentMethod === "mpesa" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}
                >
                  <Smartphone className="w-4 h-4" /> M-Pesa
                </button>
                <button
                  onClick={() => setPaymentMethod("bank")}
                  className={`p-3 rounded-lg border-2 text-sm font-semibold flex items-center justify-center gap-2 transition ${paymentMethod === "bank" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}
                >
                  <Building2 className="w-4 h-4" /> Bank Transfer
                </button>
              </div>

              {paymentMethod === "mpesa" && (
                <div className="space-y-4">
                  {stkStatus !== "failed" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">M-Pesa Phone Number</label>
                        <Input
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          placeholder="07XX XXX XXX"
                          disabled={stkStatus === "sending"}
                        />
                      </div>
                      <Button
                        onClick={triggerStkPush}
                        disabled={stkStatus === "sending"}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {stkStatus === "sending" ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending STK push... check your phone</>
                        ) : (
                          <><Smartphone className="w-4 h-4 mr-2" /> Send STK Push ({format(getPayAmount())})</>
                        )}
                      </Button>
                    </div>
                  )}

                  {stkStatus === "failed" && (
                    <div className="space-y-4">
                      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-destructive">STK push failed</p>
                          <p className="text-muted-foreground mt-1">Please pay manually using the Paybill details below, then click "I have paid".</p>
                        </div>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-600/30 rounded-lg p-5 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Smartphone className="w-5 h-5 text-green-600" />
                          <h3 className="font-heading font-bold">Pay via M-Pesa Paybill</h3>
                        </div>
                        {[
                          { label: "Paybill Number", value: paySettings?.paybill_number || "247247" },
                          { label: "Account Number", value: paySettings?.paybill_account || `BWS-${bookingId.slice(0, 6).toUpperCase()}` },
                          { label: "Amount", value: `KSh ${getPayAmount().toLocaleString()}` },
                        ].map((row) => (
                          <div key={row.label} className="flex items-center justify-between gap-2 bg-card rounded-md p-3 border">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{row.label}</p>
                              <p className="font-mono font-bold text-base">{row.value}</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => copy(String(row.value), row.label)}>
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                        <div className="text-xs text-muted-foreground space-y-1 pt-1">
                          <p>1. Go to M-Pesa &gt; Lipa na M-Pesa &gt; Pay Bill</p>
                          <p>2. Enter the Paybill, Account, and Amount above</p>
                          <p>3. Confirm and you'll get a confirmation SMS</p>
                        </div>
                      </div>

                      <Button onClick={() => setStep(4)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        I have paid — Confirm Booking
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setStkStatus("idle")}>
                        Try STK push again
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "bank" && (() => {
                const isIntl = currency !== "KSH";
                const usdRows = [
                  { label: "Bank", value: paySettings?.bank_usd_name || "KCB Bank Kenya" },
                  { label: "Account Name", value: paySettings?.bank_usd_account_name || "Blackwaters Safaris Ltd" },
                  { label: "USD Account Number", value: paySettings?.bank_usd_account_number || "—" },
                  { label: "Branch", value: paySettings?.bank_usd_branch || "Nairobi" },
                  { label: "SWIFT / BIC", value: paySettings?.bank_usd_swift || "—" },
                  { label: "Reference", value: `BWS-${bookingId.slice(0, 8).toUpperCase()}` },
                ];
                const kesRows = [
                  { label: "Bank", value: paySettings?.bank_name || "Equity Bank" },
                  { label: "Account Name", value: paySettings?.bank_account_name || "Blackwaters Safaris Ltd" },
                  { label: "KES Account Number", value: paySettings?.bank_account_number || "0123456789" },
                  { label: "Branch", value: paySettings?.bank_branch || "Nairobi CBD" },
                  ...(paySettings?.bank_swift ? [{ label: "SWIFT", value: paySettings.bank_swift }] : []),
                  { label: "Reference", value: `BWS-${bookingId.slice(0, 8).toUpperCase()}` },
                ];
                const Card = ({ title, rows, accent, badge, recommended }: any) => (
                  <div className={`rounded-xl border-2 p-5 space-y-3 ${recommended ? "border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/15 shadow-md" : "border-border bg-card"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-lg ${accent} flex items-center justify-center`}>
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-heading font-bold">{title}</h3>
                      </div>
                      {recommended && <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-1 rounded-full">{badge}</span>}
                    </div>
                    {rows.map((row: any) => (
                      <div key={row.label} className="flex items-center justify-between gap-2 bg-background rounded-md p-2.5 border">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{row.label}</p>
                          <p className="font-mono font-bold text-sm truncate">{row.value}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => copy(String(row.value), row.label)}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                );
                return (
                  <div className="space-y-4">
                    <div className="bg-muted/40 rounded-lg p-3 text-xs text-center">
                      Amount due: <span className="font-bold text-primary">{currency === "KSH" ? `KSh ${getPayAmount().toLocaleString()}` : `${getPayAmount().toLocaleString()} KSh equivalent`}</span>
                      {isIntl && <span className="block text-muted-foreground mt-1">International clients — use the USD account below for the smoothest transfer.</span>}
                    </div>
                    <div className="grid lg:grid-cols-2 gap-4">
                      {isIntl ? (
                        <>
                          <Card title="USD Account — International" rows={usdRows} accent="bg-emerald-600" badge="Recommended" recommended />
                          <Card title="KES Account — Local" rows={kesRows} accent="bg-blue-600" />
                        </>
                      ) : (
                        <>
                          <Card title="KES Account — Local" rows={kesRows} accent="bg-blue-600" badge="Recommended" recommended />
                          <Card title="USD Account — International" rows={usdRows} accent="bg-emerald-600" />
                        </>
                      )}
                    </div>
                    <Button onClick={() => setStep(4)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12">
                      I have transferred — Confirm Booking
                    </Button>
                  </div>
                );
              })()}

              <p className="text-xs text-center text-muted-foreground">
                Need help? WhatsApp <a href="https://wa.me/254118596089" className="text-primary font-semibold">+254 118 596 089</a>
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="bg-card p-8 rounded-lg text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-2xl font-heading font-bold">Booking Confirmed!</h2>
              <p className="text-muted-foreground">
                Thank you! We'll verify your payment and contact you at <span className="font-semibold">{form.email}</span> within a few hours.
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
