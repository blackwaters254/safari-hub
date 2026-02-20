import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Hash,
  Phone,
  ChevronDown,
  Users,
  Circle,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

interface LiveChatWidgetProps {
  /** If provided, auto-opens and auto-looks up this code */
  prefilledCode?: string | null;
  /** Called when widget wants to clear its prefilled code */
  onCodeConsumed?: () => void;
  /** Force the widget open */
  forceOpen?: boolean;
}

// Simulated queue — 2-3 agents, realistic feel
const AGENT_NAMES = ["Sarah K.", "James M.", "Amina W."];
const ONLINE_COUNT = 2; // agents online

export default function LiveChatWidget({ prefilledCode, onCodeConsumed, forceOpen }: LiveChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [step, setStep] = useState<"lookup" | "chat">("lookup");
  const [lookupType, setLookupType] = useState<"code" | "phone">("code");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketName, setTicketName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [assignedAgent] = useState(AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-open when a code is provided or forceOpen changes
  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      setMinimized(false);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (prefilledCode) {
      setCode(prefilledCode);
      setOpen(true);
      setMinimized(false);
      setTimeout(() => autoLookup(prefilledCode), 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledCode]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages, open, minimized]);

  // Simulate agent typing indicator after customer sends
  const simulateAgentTyping = () => {
    setTimeout(() => {
      setAgentTyping(true);
      setTimeout(() => setAgentTyping(false), 3500);
    }, 1200);
  };

  // Count unread when minimized
  useEffect(() => {
    if (minimized && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender_type !== "customer") {
        setUnread((p) => p + 1);
      }
    }
  }, [messages]);

  const clearUnread = () => setUnread(0);

  const autoLookup = async (ticketCode: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("ticket_code", ticketCode.trim().toUpperCase())
      .maybeSingle();
    if (data) {
      await openChat(data);
    }
    setLoading(false);
    onCodeConsumed?.();
  };

  const openChat = async (data: any) => {
    setTicketId(data.id);
    setTicketSubject(data.subject || "General Inquiry");
    setTicketName(data.customer_name || "");
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
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("ticket_code", code.trim().toUpperCase())
      .maybeSingle();
    if (!data) {
      toast.error("Ticket not found. Check your code and try again.");
      setLoading(false);
      return;
    }
    await openChat(data);
    setLoading(false);
  };

  const lookupByPhone = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("customer_phone", phone.trim())
      .order("created_at", { ascending: false })
      .maybeSingle();
    if (!data) {
      toast.error("No ticket found for that phone number.");
      setLoading(false);
      return;
    }
    await openChat(data);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !ticketId) return;
    setSending(true);
    const text = newMessage.trim();
    setNewMessage("");
    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: ticketId,
      sender_type: "customer",
      message: text,
    });
    if (error) {
      toast.error("Failed to send message");
    } else {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), sender_type: "customer", message: text, created_at: new Date().toISOString() },
      ]);
      simulateAgentTyping();
    }
    setSending(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClose = () => {
    setOpen(false);
    setStep("lookup");
    setCode("");
    setPhone("");
    setTicketId(null);
    setMessages([]);
    setNewMessage("");
    setUnread(0);
  };

  const handleMinimize = () => {
    setMinimized(true);
    clearUnread();
  };

  const handleExpand = () => {
    setMinimized(false);
    clearUnread();
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Floating toggle button (when chat is closed) */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => { setOpen(true); setMinimized(false); clearUnread(); }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
            style={{ background: "hsl(var(--primary))" }}
            aria-label="Open live chat"
          >
            <MessageCircle className="w-6 h-6" style={{ color: "hsl(var(--primary-foreground))" }} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Widget */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-widget"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              background: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              maxHeight: minimized ? "auto" : "540px",
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center gap-3 px-4 py-3 shrink-0 cursor-pointer select-none"
              style={{ background: "hsl(var(--primary))" }}
              onClick={minimized ? handleExpand : undefined}
            >
              {/* Avatar stack */}
              <div className="flex -space-x-2 shrink-0">
                {Array.from({ length: ONLINE_COUNT }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                    style={{
                      borderColor: "hsl(var(--primary))",
                      background: i === 0 ? "hsl(var(--secondary))" : "hsl(var(--accent))",
                      color: "hsl(var(--primary-foreground))",
                    }}
                  >
                    {AGENT_NAMES[i].charAt(0)}
                  </div>
                ))}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight truncate" style={{ color: "hsl(var(--primary-foreground))" }}>
                  {step === "chat" ? ticketSubject : "Blackwaters Support"}
                </p>
                <div className="flex items-center gap-1.5">
                  <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                  <span className="text-[11px]" style={{ color: "hsl(var(--primary-foreground) / 0.8)" }}>
                    {ONLINE_COUNT} agents online · usually replies in minutes
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!minimized && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMinimize(); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
                    style={{ color: "hsl(var(--primary-foreground))" }}
                    aria-label="Minimize"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {minimized && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleExpand(); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20"
                    style={{ color: "hsl(var(--primary-foreground))" }}
                    aria-label="Expand"
                  >
                    <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleClose(); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20"
                  style={{ color: "hsl(var(--primary-foreground))" }}
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Queue banner (only shown on lookup step) ── */}
            <AnimatePresence>
              {!minimized && step === "lookup" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-4 py-2.5 flex items-center gap-2 text-xs"
                    style={{ background: "hsl(var(--secondary) / 0.12)", borderBottom: "1px solid hsl(var(--border))" }}
                  >
                    <Users className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(var(--secondary))" }} />
                    <span style={{ color: "hsl(var(--muted-foreground))" }}>
                      <span className="font-semibold" style={{ color: "hsl(var(--secondary))" }}>3 people</span> in queue ·{" "}
                      <span className="font-semibold" style={{ color: "hsl(var(--secondary))" }}>{assignedAgent}</span> will assist you
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Body ── */}
            <AnimatePresence>
              {!minimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col flex-1 min-h-0 overflow-hidden"
                  style={{ maxHeight: 480 }}
                >
                  {step === "lookup" ? (
                    <div className="p-4 space-y-4 overflow-y-auto">
                      {/* Welcome msg */}
                      <div className="flex gap-2.5 items-start">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                          style={{ background: "hsl(var(--secondary))", color: "hsl(var(--secondary-foreground))" }}
                        >
                          {assignedAgent.charAt(0)}
                        </div>
                        <div
                          className="rounded-2xl rounded-tl-none px-3.5 py-2.5 text-sm max-w-[85%]"
                          style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
                        >
                          <p className="font-semibold text-[11px] mb-0.5" style={{ color: "hsl(var(--primary))" }}>{assignedAgent}</p>
                          <p>Hey there! 👋 Enter your ticket code or phone number to continue your conversation.</p>
                        </div>
                      </div>

                      {/* Lookup toggle */}
                      <div
                        className="flex rounded-lg overflow-hidden"
                        style={{ border: "1px solid hsl(var(--border))" }}
                      >
                        {(["code", "phone"] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setLookupType(type)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors"
                            style={{
                              background: lookupType === type ? "hsl(var(--primary))" : "transparent",
                              color: lookupType === type ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                            }}
                          >
                            {type === "code" ? <Hash className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                            {type === "code" ? "Ticket Code" : "Phone Number"}
                          </button>
                        ))}
                      </div>

                      <AnimatePresence mode="wait">
                        {lookupType === "code" ? (
                          <motion.div key="code" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-2">
                            <Input
                              placeholder="e.g. BW-A1B2C3"
                              value={code}
                              onChange={(e) => setCode(e.target.value.toUpperCase())}
                              maxLength={10}
                              onKeyDown={(e) => e.key === "Enter" && lookupByCode()}
                              className="font-mono tracking-widest text-center text-base"
                            />
                            <Button onClick={lookupByCode} disabled={loading || !code.trim()} className="w-full">
                              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
                              Find My Ticket
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.div key="phone" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-2">
                            <Input
                              placeholder="+254..."
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              maxLength={20}
                              type="tel"
                              onKeyDown={(e) => e.key === "Enter" && lookupByPhone()}
                            />
                            <Button onClick={lookupByPhone} disabled={loading || !phone.trim()} className="w-full">
                              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                              Find My Conversation
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <>
                      {/* Messages area */}
                      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 340 }}>
                        {/* Chat started banner */}
                        <div className="text-center">
                          <span
                            className="text-[10px] px-3 py-1 rounded-full"
                            style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}
                          >
                            Conversation with {assignedAgent}
                          </span>
                        </div>

                        <AnimatePresence initial={false}>
                          {messages.map((msg) => (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 8, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              className={`flex ${msg.sender_type === "customer" ? "justify-end" : "justify-start"} items-end gap-2`}
                            >
                              {msg.sender_type !== "customer" && (
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                                  style={{ background: "hsl(var(--secondary))", color: "hsl(var(--secondary-foreground))" }}
                                >
                                  {assignedAgent.charAt(0)}
                                </div>
                              )}
                              <div
                                className="max-w-[80%] px-3.5 py-2.5 text-sm shadow-sm"
                                style={{
                                  borderRadius: msg.sender_type === "customer"
                                    ? "18px 18px 4px 18px"
                                    : "18px 18px 18px 4px",
                                  background: msg.sender_type === "customer"
                                    ? "hsl(var(--primary))"
                                    : "hsl(var(--muted))",
                                  color: msg.sender_type === "customer"
                                    ? "hsl(var(--primary-foreground))"
                                    : "hsl(var(--foreground))",
                                }}
                              >
                                {msg.sender_type !== "customer" && (
                                  <p className="text-[10px] font-bold mb-0.5" style={{ color: "hsl(var(--primary))" }}>{assignedAgent}</p>
                                )}
                                <p className="leading-relaxed break-words">{msg.message}</p>
                                <p className="text-[10px] mt-1 text-right opacity-60">{formatTime(msg.created_at)}</p>
                              </div>
                              {msg.sender_type === "customer" && (
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                                  style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}
                                >
                                  {ticketName.charAt(0).toUpperCase() || "Y"}
                                </div>
                              )}
                            </motion.div>
                          ))}

                          {/* Agent typing indicator */}
                          {agentTyping && (
                            <motion.div
                              key="typing"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-end gap-2"
                            >
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                                style={{ background: "hsl(var(--secondary))", color: "hsl(var(--secondary-foreground))" }}
                              >
                                {assignedAgent.charAt(0)}
                              </div>
                              <div
                                className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
                                style={{ background: "hsl(var(--muted))" }}
                              >
                                {[0, 1, 2].map((i) => (
                                  <motion.span
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: "hsl(var(--muted-foreground))" }}
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {messages.length === 0 && !agentTyping && (
                          <div className="text-center py-8">
                            <MessageCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(var(--muted-foreground) / 0.4)" }} />
                            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>No messages yet. Say hello!</p>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input bar */}
                      <div
                        className="flex items-end gap-2 px-3 py-3 shrink-0"
                        style={{ borderTop: "1px solid hsl(var(--border))", background: "hsl(var(--muted) / 0.3)" }}
                      >
                        <Textarea
                          ref={inputRef}
                          placeholder="Type a message…"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={1}
                          maxLength={1000}
                          className="flex-1 resize-none text-sm min-h-[36px] max-h-[100px]"
                          style={{ fieldSizing: "content" } as React.CSSProperties}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={sending || !newMessage.trim()}
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
                          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                          aria-label="Send"
                        >
                          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Minimized peek bar */}
            {minimized && (
              <div
                className="px-4 py-2.5 flex items-center gap-2 cursor-pointer"
                style={{ borderTop: "1px solid hsl(var(--border))" }}
                onClick={handleExpand}
              >
                <ChevronDown className="w-4 h-4 rotate-180" style={{ color: "hsl(var(--muted-foreground))" }} />
                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {unread > 0 ? `${unread} new message${unread > 1 ? "s" : ""}` : "Click to open chat"}
                </span>
                {unread > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
