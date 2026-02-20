import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, MessageCircle, Loader2, Hash, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TicketChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill a ticket code to auto-lookup on open */
  prefilledCode?: string;
}

interface Message {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

export default function TicketChatDialog({ open, onOpenChange, prefilledCode }: TicketChatDialogProps) {
  const [step, setStep] = useState<"enter-code" | "chat">("enter-code");
  const [lookupType, setLookupType] = useState<"code" | "phone">("code");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [ticketSubject, setTicketSubject] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset & auto-lookup when dialog opens/closes
  useEffect(() => {
    if (open && prefilledCode) {
      setCode(prefilledCode);
      setStep("enter-code");
      // Auto-lookup after a short delay
      setTimeout(() => autoLookup(prefilledCode), 300);
    } else if (!open) {
      setStep("enter-code");
      setCode("");
      setPhone("");
      setTicketId(null);
      setMessages([]);
      setNewMessage("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefilledCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const autoLookup = async (ticketCode: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("ticket_code", ticketCode.trim().toUpperCase())
      .maybeSingle();

    if (!error && data) {
      await openTicketChat(data);
    }
    setLoading(false);
  };

  const openTicketChat = async (data: any) => {
    setTicketId(data.id);
    setTicketSubject(data.subject);
    const { data: msgs } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", data.id)
      .order("created_at", { ascending: true });
    setMessages(msgs || []);
    setStep("chat");
  };

  const lookupByCode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("ticket_code", code.trim().toUpperCase())
      .maybeSingle();

    if (error || !data) {
      toast.error("Invalid ticket code. Please check and try again.");
      setLoading(false);
      return;
    }
    if (data.code_expires_at && new Date(data.code_expires_at) < new Date()) {
      toast.error("This ticket code has expired. Please submit a new inquiry.");
      setLoading(false);
      return;
    }
    await openTicketChat(data);
    setLoading(false);
  };

  const lookupByPhone = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("customer_phone", phone.trim())
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (error || !data) {
      toast.error("No ticket found for that phone number. Try using your ticket code.");
      setLoading(false);
      return;
    }
    await openTicketChat(data);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !ticketId) return;
    setSending(true);
    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: ticketId,
      sender_type: "customer",
      message: newMessage.trim(),
    });
    if (error) {
      toast.error("Failed to send message");
    } else {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), sender_type: "customer", message: newMessage.trim(), created_at: new Date().toISOString() },
      ]);
      setNewMessage("");
    }
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            {step === "enter-code" ? "Continue Conversation" : (
              <span className="truncate">{ticketSubject}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === "enter-code" ? (
          <div className="space-y-4 px-5 py-5">
            <p className="text-sm text-muted-foreground">
              Enter your ticket code or phone number to continue your conversation with our team.
            </p>

            {/* Toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setLookupType("code")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
                  lookupType === "code" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Hash className="w-3 h-3" /> Ticket Code
              </button>
              <button
                onClick={() => setLookupType("phone")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
                  lookupType === "phone" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Phone className="w-3 h-3" /> Phone Number
              </button>
            </div>

            <AnimatePresence mode="wait">
              {lookupType === "code" ? (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-3"
                >
                  <Input
                    placeholder="e.g. BW-A1B2C3"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={10}
                    onKeyDown={(e) => e.key === "Enter" && lookupByCode()}
                    className="font-mono tracking-widest text-center text-lg"
                  />
                  <Button onClick={lookupByCode} disabled={loading || !code.trim()} className="w-full">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Hash className="w-4 h-4 mr-2" />}
                    Find My Ticket
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3"
                >
                  <Input
                    placeholder="+254..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={20}
                    onKeyDown={(e) => e.key === "Enter" && lookupByPhone()}
                    type="tel"
                  />
                  <Button onClick={lookupByPhone} disabled={loading || !phone.trim()} className="w-full">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Phone className="w-4 h-4 mr-2" />}
                    Find My Conversation
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-4 max-h-[50vh]">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender_type === "customer" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender_type !== "customer" && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                        <MessageCircle className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                        msg.sender_type === "customer"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.sender_type !== "customer" && (
                        <p className="text-[10px] font-bold text-primary mb-0.5">Support Team</p>
                      )}
                      <p className="leading-relaxed">{msg.message}</p>
                      <p className="text-[10px] opacity-60 mt-1 text-right">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No messages yet. Start the conversation below.</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 p-4 border-t border-border bg-muted/30 shrink-0">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={2}
                maxLength={1000}
                className="flex-1 resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button
                size="icon"
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className="self-end w-10 h-10 shrink-0"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
