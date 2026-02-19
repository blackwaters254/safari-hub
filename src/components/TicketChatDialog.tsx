import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, MessageCircle, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TicketChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

export default function TicketChatDialog({ open, onOpenChange }: TicketChatDialogProps) {
  const [step, setStep] = useState<"enter-code" | "chat">("enter-code");
  const [code, setCode] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [ticketSubject, setTicketSubject] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setStep("enter-code");
      setCode("");
      setTicketId(null);
      setMessages([]);
      setNewMessage("");
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const lookupTicket = async () => {
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

    setTicketId(data.id);
    setTicketSubject(data.subject);

    // Fetch messages
    const { data: msgs } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", data.id)
      .order("created_at", { ascending: true });

    setMessages(msgs || []);
    setStep("chat");
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
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            {step === "enter-code" ? "Continue Conversation" : ticketSubject}
          </DialogTitle>
        </DialogHeader>

        {step === "enter-code" ? (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Enter the ticket code you received after submitting your inquiry to continue the conversation.
            </p>
            <Input
              placeholder="e.g. BW-A1B2C3"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={10}
              onKeyDown={(e) => e.key === "Enter" && lookupTicket()}
            />
            <Button onClick={lookupTicket} disabled={loading || !code.trim()} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
              Look Up Ticket
            </Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 max-h-[50vh]">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender_type === "customer" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.sender_type === "customer"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className="text-[10px] opacity-60 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {messages.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">
                  No messages yet. Start the conversation below.
                </p>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2 pt-3 border-t border-border">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={2}
                maxLength={1000}
                className="flex-1 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button size="icon" onClick={sendMessage} disabled={sending || !newMessage.trim()} className="self-end">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
