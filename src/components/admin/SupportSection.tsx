import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, MessageSquare } from "lucide-react";

interface Props {
  tickets: any[];
  onRefresh: () => void;
}

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-accent/20 text-accent",
  high: "bg-primary/20 text-primary",
  urgent: "bg-destructive/20 text-destructive",
};

const statusColors: Record<string, string> = {
  open: "bg-destructive/20 text-destructive",
  in_progress: "bg-accent/20 text-accent",
  resolved: "bg-secondary/20 text-secondary",
  closed: "bg-muted text-muted-foreground",
};

export default function SupportSection({ tickets, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const updateTicket = async (id: string, updates: Record<string, any>) => {
    const { error } = await supabase.from("support_tickets").update(updates).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Ticket updated"); onRefresh(); setExpandedId(null); }
  };

  const filtered = tickets.filter((t) => {
    const matchSearch = `${t.subject} ${t.customer_name} ${t.customer_email}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-6">Support Tickets</h2>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tickets..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((t) => (
          <div key={t.id} className="bg-card p-4 rounded-lg border border-border">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                  <h3 className="font-semibold">{t.subject}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{t.customer_name} • {t.customer_email}</p>
                <p className="text-sm mt-2">{t.message}</p>
                {t.admin_notes && <p className="text-xs text-muted-foreground mt-1 italic border-l-2 border-primary/30 pl-2">Admin: {t.admin_notes}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${statusColors[t.status]}`}>{t.status.replace("_", " ")}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${priorityColors[t.priority]}`}>{t.priority}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-border flex flex-wrap gap-2 items-center">
              <select
                className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
                value={t.status}
                onChange={(e) => updateTicket(t.id, { status: e.target.value })}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
                value={t.priority}
                onChange={(e) => updateTicket(t.id, { priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => { setExpandedId(expandedId === t.id ? null : t.id); setAdminNotes(t.admin_notes || ""); }}
              >
                Add Note
              </Button>
            </div>
            {expandedId === t.id && (
              <div className="mt-3 space-y-2">
                <Textarea placeholder="Admin notes..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} maxLength={1000} />
                <Button size="sm" onClick={() => updateTicket(t.id, { admin_notes: adminNotes })}>Save Note</Button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No tickets found</p>}
      </div>
    </div>
  );
}
