import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, CreditCard, ChevronDown, ChevronUp, CheckCircle2, Circle, Clock, MapPin, Plane, Star, Package } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  bookings: Tables<"bookings">[];
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent",
  confirmed: "bg-secondary/20 text-secondary",
  cancelled: "bg-destructive/20 text-destructive",
  completed: "bg-primary/20 text-primary",
};

// Client journey stages
const journeyStages = [
  { id: "signup", label: "Signed Up", icon: Star, description: "Client registered or contacted" },
  { id: "booking", label: "Booking Made", icon: CheckCircle2, description: "Booking confirmed in system" },
  { id: "payment", label: "Payment", icon: CreditCard, description: "Deposit or full payment received" },
  { id: "on_tour", label: "On Tour", icon: Plane, description: "Client currently on safari" },
  { id: "completed", label: "Completed", icon: MapPin, description: "Tour completed successfully" },
];

function getJourneyStage(booking: Tables<"bookings">): string {
  const status = booking.status as string;
  if (status === "completed") return "completed";
  if (status === "confirmed" && Number(booking.amount_paid) > 0) {
    // Check if travel date is today or past
    if (booking.travel_date) {
      const travelDate = new Date(booking.travel_date);
      const today = new Date();
      if (travelDate <= today) return "on_tour";
    }
    return "payment";
  }
  if (status === "confirmed") return "booking";
  if (status === "pending") return "signup";
  return "signup";
}

function JourneyProgress({ booking }: { booking: Tables<"bookings"> }) {
  const currentStage = getJourneyStage(booking);
  const currentIndex = journeyStages.findIndex((s) => s.id === currentStage);

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Client Journey</p>
      <div className="flex items-center gap-0">
        {journeyStages.map((stage, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;
          return (
            <div key={stage.id} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isDone ? "bg-secondary text-secondary-foreground" :
                  isCurrent ? "bg-primary text-primary-foreground ring-2 ring-primary/30" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isCurrent ? (
                    <Clock className="w-3 h-3" />
                  ) : (
                    <Circle className="w-3 h-3" />
                  )}
                </div>
                <span className={`text-[9px] font-semibold mt-0.5 text-center leading-tight hidden sm:block ${
                  isCurrent ? "text-primary" : isDone ? "text-secondary" : "text-muted-foreground/50"
                }`}>{stage.label}</span>
              </div>
              {idx < journeyStages.length - 1 && (
                <div className={`h-0.5 flex-1 mx-0.5 transition-all ${isDone ? "bg-secondary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-primary font-semibold mt-1">
        Current: {journeyStages.find((s) => s.id === currentStage)?.label}
      </p>
    </div>
  );
}

export default function BookingsSection({ bookings, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [savingRemarks, setSavingRemarks] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status updated"); onRefresh(); }
  };

  const saveRemarks = async (id: string) => {
    setSavingRemarks(id);
    const note = remarks[id] ?? "";
    const { error } = await supabase.from("bookings").update({ notes: note }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Remarks saved"); onRefresh(); }
    setSavingRemarks(null);
  };

  const filtered = bookings.filter((b) => {
    const matchSearch = `${b.item_title} ${b.customer_name} ${b.customer_email}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold">Bookings & Client Flow</h2>
        <p className="text-muted-foreground text-sm mt-1">Track each client's journey from sign-up to tour completion</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email or tour..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((b) => {
          const isExpanded = expandedId === b.id;
          return (
            <div key={b.id} className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Main row */}
              <div className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{b.item_title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[b.status] || ""}`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{b.customer_name} · {b.customer_email}</p>
                    {b.customer_phone && <p className="text-xs text-muted-foreground">{b.customer_phone}</p>}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
                      <span>📅 {b.travel_date || "No date set"}</span>
                      <span>👥 {b.guests} guest{b.guests !== 1 ? "s" : ""}</span>
                      <span className="capitalize">📦 {b.item_type}</span>
                      <span className="capitalize">💳 {b.payment_plan === "installment" ? "Lipa Mdogo Mdogo" : b.payment_plan}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-primary">KSh {Number(b.total_price).toLocaleString()}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Paid: KSh {Number(b.amount_paid).toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      <select
                        className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground"
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : b.id)}
                        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Journey Progress - always visible */}
                <JourneyProgress booking={b} />
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-border/60 bg-muted/30 px-4 py-4 space-y-4">
                  {/* Stage details */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Stage Details</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { label: "Booking Date", value: b.booking_date },
                        { label: "Travel Date", value: b.travel_date || "Not set" },
                        { label: "Total Price", value: `KSh ${Number(b.total_price).toLocaleString()}` },
                        { label: "Amount Paid", value: `KSh ${Number(b.amount_paid).toLocaleString()}` },
                        { label: "Balance", value: `KSh ${(Number(b.total_price) - Number(b.amount_paid)).toLocaleString()}` },
                        { label: "Payment Plan", value: b.payment_plan === "installment" ? "Lipa Mdogo Mdogo" : b.payment_plan },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-card rounded-lg p-2.5 border border-border/50">
                          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
                          <p className="text-xs font-semibold mt-0.5 capitalize">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Remarks / Admin Notes</p>
                    <Textarea
                      placeholder="Add internal notes or remarks about this client's journey..."
                      rows={3}
                      className="text-sm resize-none"
                      value={remarks[b.id] ?? (b.notes || "")}
                      onChange={(e) => setRemarks((prev) => ({ ...prev, [b.id]: e.target.value }))}
                    />
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => saveRemarks(b.id)}
                      disabled={savingRemarks === b.id}
                    >
                      {savingRemarks === b.id ? "Saving..." : "Save Remarks"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
