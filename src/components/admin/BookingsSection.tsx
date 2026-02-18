import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, CreditCard } from "lucide-react";
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

export default function BookingsSection({ bookings, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status updated"); onRefresh(); }
  };

  const filtered = bookings.filter((b) => {
    const matchSearch = `${b.item_title} ${b.customer_name} ${b.customer_email}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-6">Bookings Management</h2>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search bookings..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
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
        {filtered.map((b) => (
          <div key={b.id} className="bg-card p-4 rounded-lg border border-border">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{b.item_title}</h3>
                <p className="text-sm text-muted-foreground">{b.customer_name} • {b.customer_email}</p>
                {b.customer_phone && <p className="text-sm text-muted-foreground">{b.customer_phone}</p>}
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                  <span>📅 {b.travel_date || "No date"}</span>
                  <span>👥 {b.guests} guests</span>
                  <span className="capitalize">📦 {b.item_type}</span>
                  <span className="capitalize">💳 {b.payment_plan === "installment" ? "Lipa Mdogo Mdogo" : b.payment_plan}</span>
                </div>
                {b.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{b.notes}"</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColors[b.status] || ""}`}>
                  {b.status}
                </span>
                <select
                  className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
                  value={b.status}
                  onChange={(e) => updateStatus(b.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-primary font-bold">
                <CreditCard className="w-3.5 h-3.5" /> KSh {Number(b.total_price).toLocaleString()}
              </span>
              <span className="text-muted-foreground">Paid: KSh {Number(b.amount_paid).toLocaleString()}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No bookings found</p>}
      </div>
    </div>
  );
}
