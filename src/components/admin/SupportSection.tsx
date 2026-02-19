import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, MessageSquare, Send, Copy, Clock } from "lucide-react";

interface Props {
  tickets: any[];
  onRefresh: () => void;
}

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-accent/20 text-accent-foreground",
  high: "bg-primary/20 text-primary",
  urgent: "bg-destructive/20 text-destructive",
};

const statusColors: Record<string, string> = {
  open: "bg-destructive/20 text-destructive",
  in_progress: "bg-accent/20 text-accent-foreground",
  resolved: "bg-secondary/20 text-secondary",
  closed: "bg-muted text-muted-foreground",
};

export default function SupportSection({ tickets, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [adminReply, setAdminReply] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const updateTicket = async (id: string, updates: Record<string, any>) => {
    const { error } = await supabase.from("support_tickets").update(updates).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Ticket updated"); onRefresh(); }
  };

  const loadMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setMessages([]);
    } else {
      setExpandedId(id);
      setAdminReply("");
      loadMessages(id);
    }
  };

  const sendReply = async (ticketId: string) => {
    if (!adminReply.trim()) return;
    setSending(true);
    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: ticketId,
      sender_type: "admin",
      message: adminReply.trim(),
    });
    if (error) {
      toast.error("Failed to send reply");
    } else {
      setAdminReply("");
      loadMessages(ticketId);
      // Also update ticket status to in_progress if it was open
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket?.status === "open") {
        await updateTicket(ticketId, { status: "in_progress" });
      }
    }
    setSending(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = tickets.filter((t) => {
    const matchSearch = `${t.subject} ${t.customer_name} ${t.customer_email} ${t.ticket_code || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const isCodeExpired = (expiresAt: string | null) => {
    if (!expiresAt) return true;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-6">Support Tickets</h2>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tickets or codes..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                {t.ticket_code && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{t.ticket_code}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(t.ticket_code); toast.success("Code copied"); }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {t.code_expires_at && (
                      <span className={`text-[10px] flex items-center gap-1 ${isCodeExpired(t.code_expires_at) ? "text-destructive" : "text-secondary"}`}>
                        <Clock className="w-3 h-3" />
                        {isCodeExpired(t.code_expires_at) ? "Expired" : `Expires ${new Date(t.code_expires_at).toLocaleString()}`}
                      </span>
                    )}
                  </div>
                )}
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
                variant={expandedId === t.id ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => toggleExpand(t.id)}
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                {expandedId === t.id ? "Close Chat" : "View Chat"}
              </Button>
            </div>

            {/* Chat panel */}
            {expandedId === t.id && (
              <div className="mt-3 border-t border-border pt-3">
                <div className="max-h-64 overflow-y-auto space-y-2 mb-3 p-2 bg-background rounded">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.sender_type === "admin"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}>
                        <p className="text-[10px] font-semibold opacity-70 mb-0.5">
                          {msg.sender_type === "admin" ? "Admin" : "Customer"}
                        </p>
                        <p>{msg.message}</p>
                        <p className="text-[10px] opacity-60 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-center text-muted-foreground text-xs py-4">No messages in this ticket yet</p>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Reply to customer..."
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    rows={2}
                    maxLength={1000}
                    className="flex-1 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendReply(t.id);
                      }
                    }}
                  />
                  <Button size="icon" onClick={() => sendReply(t.id)} disabled={sending || !adminReply.trim()} className="self-end">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No tickets found</p>}
      </div>
    </div>
  );
}
