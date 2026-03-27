import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  MessageCircle, X, Send, Loader2, Hash, Phone, ChevronDown, Users, Circle, Minimize2, Plus, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Message { id: string; sender_type: string; message: string; created_at: string; }

interface LiveChatWidgetProps {
  prefilledCode?: string | null;
  onCodeConsumed?: () => void;
  forceOpen?: boolean;
}

const AGENT_NAMES = ["Sarah K.", "James M.", "Amina W.", "Kevin O.", "Grace N."];

function useFluctuating(min: number, max: number, intervalMs: number) {
  const [val, setVal] = useState(Math.floor(Math.random() * (max - min + 1)) + min);
  useEffect(() => {
    const t = setInterval(() => {
      setVal((prev) => {
        const delta = Math.random() < 0.5 ? -1 : 1;
        return Math.max(min, Math.min(max, prev + delta));
      });
    }, intervalMs);
    return () => clearInterval(t);
  }, [min, max, intervalMs]);
  return val;
}

export default function LiveChatWidget({ prefilledCode, onCodeConsumed, forceOpen }: LiveChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [step, setStep] = useState<"home" | "lookup" | "new" | "chat">("home");
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

  // New chat form
  const [ncName, setNcName] = useState("");
  const [ncEmail, setNcEmail] = useState("");
  const [ncPhone, setNcPhone] = useState("");
  const [ncSubject, setNcSubject] = useState("");
  const [ncMessage, setNcMessage] = useState("");

  const agentsOnline = useFluctuating(2, 4, 8000);
  const queueCount = useFluctuating(1, 5, 6000);

  useEffect(() => {
    if (forceOpen) { setOpen(true); setMinimized(false); }
  }, [forceOpen]);

  useEffect(() => {
    if (prefilledCode) {
      setCode(prefilledCode);
      setOpen(true); setMinimized(false);
      setStep("lookup");
      setTimeout(() => autoLookup(prefilledCode), 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledCode]);

  useEffect(() => {
    if (open && !minimized) setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [messages, open, minimized]);

  const simulateAgentTyping = () => {
    setTimeout(() => { setAgentTyping(true); setTimeout(() => setAgentTyping(false), 3500); }, 1200);
  };

  // Store the ticket code for secure message operations
  const [activeTicketCode, setActiveTicketCode] = useState<string | null>(null);

  const autoLookup = async (ticketCode: string) => {
    setLoading(true);
    const { data } = await supabase.rpc("get_ticket_by_code", { _code: ticketCode.trim().toUpperCase() });
    if (data && data.length > 0) await openChat(data[0], ticketCode.trim().toUpperCase());
    setLoading(false);
    onCodeConsumed?.();
  };

  const openChat = async (data: any, ticketCode?: string) => {
    setTicketId(data.id);
    setTicketSubject(data.subject || "General Inquiry");
    setTicketName(data.customer_name || "");
    if (ticketCode) setActiveTicketCode(ticketCode);
    const { data: msgs } = await supabase.rpc("get_messages_by_ticket_code", { _code: ticketCode || activeTicketCode || code.trim().toUpperCase() });
    setMessages(msgs || []);
    setStep("chat");
  };

  const lookupByCode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const codeVal = code.trim().toUpperCase();
    const { data } = await supabase.rpc("get_ticket_by_code", { _code: codeVal });
    if (!data || data.length === 0) { toast.error("Ticket not found or expired."); setLoading(false); return; }
    await openChat(data[0], codeVal); setLoading(false);
  };

  const lookupByPhone = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    // Phone lookup still requires auth — show helpful message for guests
    const { data } = await supabase.rpc("get_ticket_by_code", { _code: phone.trim() });
    if (!data || data.length === 0) { toast.error("No ticket found. Please use your ticket code instead."); setLoading(false); return; }
    await openChat(data[0], phone.trim()); setLoading(false);
  };

  const startNewChat = async () => {
    if (!ncName.trim() || !ncEmail.trim() || !ncMessage.trim()) { toast.error("Please fill name, email and message."); return; }
    setLoading(true);
    const ticketCode = "BW-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase.from("support_tickets").insert({
      customer_name: ncName.trim(),
      customer_email: ncEmail.trim(),
      customer_phone: ncPhone.trim(),
      subject: ncSubject.trim() || "Live Chat",
      message: ncMessage.trim(),
      ticket_code: ticketCode,
      code_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: "medium",
      status: "open",
    }).select().single();

    if (error || !data) { toast.error("Failed to start chat."); setLoading(false); return; }

    await supabase.from("ticket_messages").insert({ ticket_id: data.id, sender_type: "customer", message: ncMessage.trim() });
    toast.success(`Chat started! Your ticket code: ${ticketCode}`);
    await openChat(data);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !ticketId) return;
    setSending(true);
    const text = newMessage.trim();
    setNewMessage("");
    if (activeTicketCode) {
      // Use secure RPC for guest chat
      const { data, error } = await supabase.rpc("send_message_by_ticket_code", { _code: activeTicketCode, _message: text, _sender_type: "customer" });
      if (error) { toast.error("Failed to send"); } else {
        setMessages((prev) => [...prev, { id: data?.id || crypto.randomUUID(), sender_type: "customer", message: text, created_at: new Date().toISOString() }]);
        simulateAgentTyping();
      }
    } else {
      // Authenticated user — direct insert
      const { error } = await supabase.from("ticket_messages").insert({ ticket_id: ticketId, sender_type: "customer", message: text });
      if (error) { toast.error("Failed to send"); } else {
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender_type: "customer", message: text, created_at: new Date().toISOString() }]);
        simulateAgentTyping();
      }
    }
    setSending(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClose = () => {
    setOpen(false); setStep("home"); setCode(""); setPhone(""); setTicketId(null); setMessages([]); setNewMessage(""); setUnread(0);
    setNcName(""); setNcEmail(""); setNcPhone(""); setNcSubject(""); setNcMessage("");
  };

  const handleMinimize = () => setMinimized(true);
  const handleExpand = () => { setMinimized(false); setUnread(0); };
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => { setOpen(true); setMinimized(false); setUnread(0); }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center bg-primary"
            aria-label="Open live chat"
          >
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">{unread}</span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Widget */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-widget"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[370px] max-w-[calc(100vw-24px)] rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-background border border-border"
            style={{ maxHeight: minimized ? "auto" : "560px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 shrink-0 cursor-pointer select-none bg-primary" onClick={minimized ? handleExpand : undefined}>
              <div className="flex -space-x-2 shrink-0">
                {Array.from({ length: Math.min(agentsOnline, 3) }).map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-[10px] font-bold bg-secondary text-secondary-foreground">
                    {AGENT_NAMES[i].charAt(0)}
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight truncate text-primary-foreground">
                  {step === "chat" ? ticketSubject : "Blackwaters Support"}
                </p>
                <div className="flex items-center gap-1.5">
                  <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                  <span className="text-[11px] text-primary-foreground/80">
                    {agentsOnline} agents online
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!minimized && (
                  <button onClick={(e) => { e.stopPropagation(); handleMinimize(); }} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 text-primary-foreground"><Minimize2 className="w-3.5 h-3.5" /></button>
                )}
                {minimized && (
                  <button onClick={(e) => { e.stopPropagation(); handleExpand(); }} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 text-primary-foreground"><ChevronDown className="w-3.5 h-3.5 rotate-180" /></button>
                )}
                <button onClick={(e) => { e.stopPropagation(); handleClose(); }} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 text-primary-foreground"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Queue banner */}
            <AnimatePresence>
              {!minimized && step !== "chat" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 py-2 flex items-center gap-2 text-xs bg-secondary/10 border-b border-border">
                    <Users className="w-3.5 h-3.5 text-secondary shrink-0" />
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-secondary">{queueCount} {queueCount === 1 ? "person" : "people"}</span> in queue · avg wait ~2 min
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Body */}
            <AnimatePresence>
              {!minimized && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col flex-1 min-h-0 overflow-hidden" style={{ maxHeight: 490 }}>

                  {/* HOME step */}
                  {step === "home" && (
                    <div className="p-5 space-y-4 overflow-y-auto">
                      <div className="flex gap-2.5 items-start">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 bg-secondary text-secondary-foreground">
                          {assignedAgent.charAt(0)}
                        </div>
                        <div className="rounded-2xl rounded-tl-none px-3.5 py-2.5 text-sm max-w-[85%] bg-muted">
                          <p className="font-semibold text-[11px] mb-0.5 text-primary">{assignedAgent}</p>
                          <p>Hey there! 👋 How can we help you today?</p>
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-2">
                        <button
                          onClick={() => setStep("new")}
                          className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all text-left group"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <Plus className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Start New Chat</p>
                            <p className="text-xs text-muted-foreground">Begin a new conversation with our team</p>
                          </div>
                        </button>

                        <button
                          onClick={() => setStep("lookup")}
                          className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all text-left group"
                        >
                          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                            <RotateCcw className="w-5 h-5 text-secondary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Continue Conversation</p>
                            <p className="text-xs text-muted-foreground">Resume using ticket code or phone</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* LOOKUP step */}
                  {step === "lookup" && (
                    <div className="p-4 space-y-4 overflow-y-auto">
                      <button onClick={() => setStep("home")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                        ← Back
                      </button>
                      <div className="flex rounded-lg overflow-hidden border border-border">
                        {(["code", "phone"] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setLookupType(type)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${lookupType === type ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                          >
                            {type === "code" ? <Hash className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                            {type === "code" ? "Ticket Code" : "Phone"}
                          </button>
                        ))}
                      </div>

                      <AnimatePresence mode="wait">
                        {lookupType === "code" ? (
                          <motion.div key="code" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-2">
                            <Input placeholder="e.g. BW-A1B2C3" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={10} onKeyDown={(e) => e.key === "Enter" && lookupByCode()} className="font-mono tracking-widest text-center text-base" />
                            <Button onClick={lookupByCode} disabled={loading || !code.trim()} className="w-full">
                              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />} Find My Ticket
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.div key="phone" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-2">
                            <Input placeholder="+254..." value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} type="tel" onKeyDown={(e) => e.key === "Enter" && lookupByPhone()} />
                            <Button onClick={lookupByPhone} disabled={loading || !phone.trim()} className="w-full">
                              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />} Find Conversation
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* NEW CHAT step */}
                  {step === "new" && (
                    <div className="p-4 space-y-3 overflow-y-auto">
                      <button onClick={() => setStep("home")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                        ← Back
                      </button>
                      <p className="text-sm font-semibold">Start a new conversation</p>
                      <div className="space-y-2.5">
                        <div>
                          <Label className="text-xs">Name *</Label>
                          <Input value={ncName} onChange={(e) => setNcName(e.target.value)} placeholder="Your name" maxLength={100} className="h-9 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs">Email *</Label>
                          <Input type="email" value={ncEmail} onChange={(e) => setNcEmail(e.target.value)} placeholder="you@email.com" maxLength={255} className="h-9 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs">Phone</Label>
                          <Input type="tel" value={ncPhone} onChange={(e) => setNcPhone(e.target.value)} placeholder="+254..." maxLength={20} className="h-9 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs">Subject</Label>
                          <Input value={ncSubject} onChange={(e) => setNcSubject(e.target.value)} placeholder="What's this about?" maxLength={200} className="h-9 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs">Message *</Label>
                          <Textarea value={ncMessage} onChange={(e) => setNcMessage(e.target.value)} rows={3} placeholder="How can we help?" maxLength={1000} className="text-sm" />
                        </div>
                        <Button onClick={startNewChat} disabled={loading} className="w-full">
                          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />} Start Chat
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* CHAT step */}
                  {step === "chat" && (
                    <>
                      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 340 }}>
                        <div className="text-center">
                          <span className="text-[10px] px-3 py-1 rounded-full bg-muted text-muted-foreground">
                            Conversation with {assignedAgent}
                          </span>
                        </div>

                        <AnimatePresence initial={false}>
                          {messages.map((msg) => (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 8, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className={`flex ${msg.sender_type === "customer" ? "justify-end" : "justify-start"} items-end gap-2`}
                            >
                              {msg.sender_type !== "customer" && (
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 bg-secondary text-secondary-foreground">
                                  {assignedAgent.charAt(0)}
                                </div>
                              )}
                              <div
                                className={`max-w-[80%] px-3.5 py-2.5 text-sm shadow-sm ${msg.sender_type === "customer" ? "rounded-[18px_18px_4px_18px] bg-primary text-primary-foreground" : "rounded-[18px_18px_18px_4px] bg-muted text-foreground"}`}
                              >
                                {msg.sender_type !== "customer" && (
                                  <p className="text-[10px] font-bold mb-0.5 text-primary">{assignedAgent}</p>
                                )}
                                <p className="leading-relaxed break-words">{msg.message}</p>
                                <p className="text-[10px] mt-1 text-right opacity-60">{formatTime(msg.created_at)}</p>
                              </div>
                              {msg.sender_type === "customer" && (
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 bg-accent text-accent-foreground">
                                  {ticketName.charAt(0).toUpperCase() || "Y"}
                                </div>
                              )}
                            </motion.div>
                          ))}

                          {agentTyping && (
                            <motion.div key="typing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-end gap-2">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 bg-secondary text-secondary-foreground">{assignedAgent.charAt(0)}</div>
                              <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 bg-muted">
                                {[0, 1, 2].map((i) => (
                                  <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {messages.length === 0 && !agentTyping && (
                          <div className="text-center py-8">
                            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                            <p className="text-xs text-muted-foreground">No messages yet. Say hello!</p>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input */}
                      <div className="flex items-end gap-2 px-3 py-3 shrink-0 border-t border-border bg-muted/30">
                        <Textarea
                          ref={inputRef}
                          placeholder="Type a message…"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={1}
                          maxLength={1000}
                          className="flex-1 resize-none text-sm min-h-[36px] max-h-[100px]"
                          style={{ fieldSizing: "content" } as React.CSSProperties}
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={sending || !newMessage.trim()}
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40 bg-primary text-primary-foreground"
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

            {/* Minimized bar */}
            {minimized && (
              <div className="px-4 py-2.5 flex items-center gap-2 cursor-pointer border-t border-border" onClick={handleExpand}>
                <ChevronDown className="w-4 h-4 rotate-180 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {unread > 0 ? `${unread} new message${unread > 1 ? "s" : ""}` : "Click to open chat"}
                </span>
                {unread > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">{unread}</span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
