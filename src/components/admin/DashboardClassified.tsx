import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, TrendingUp, DollarSign, Users, Package, Star, Flame, Award, Zap, Crown, Globe, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, RadialBarChart, RadialBar, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PolarAngleAxis,
} from "recharts";

interface Props {
  bookings: any[]; members: any[]; tickets: any[]; staff: any[]; events: any[]; experiences: any[]; hotels: any[];
}

function last30Days(bookings: any[]) {
  const days: { date: string; revenue: number; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const matches = bookings.filter((b) => (b.created_at || "").slice(0, 10) === key);
    days.push({
      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      revenue: matches.reduce((s, b) => s + Number(b.amount_paid || 0), 0),
      count: matches.length,
    });
  }
  return days;
}

export default function DashboardClassified({ bookings, members, tickets, staff, events, experiences, hotels }: Props) {
  const series = useMemo(() => last30Days(bookings), [bookings]);
  const totalRevenue = bookings.reduce((s, b) => s + Number(b.amount_paid || 0), 0);
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const conversionRate = bookings.length ? Math.round((confirmed / bookings.length) * 100) : 0;
  const avgBookingValue = bookings.length ? Math.round(totalRevenue / bookings.length) : 0;

  const funnelData = [
    { name: "Visitors", value: Math.max(members.length * 12, 100), fill: "hsl(var(--primary))" },
    { name: "Members", value: members.length, fill: "hsl(var(--secondary))" },
    { name: "Bookings", value: bookings.length, fill: "hsl(var(--accent))" },
    { name: "Confirmed", value: confirmed, fill: "hsl(143 71% 45%)" },
  ];

  const topAgents = useMemo(() => {
    const map = new Map<string, number>();
    tickets.forEach((t) => {
      const a = t.assigned_to || "Unassigned";
      map.set(a, (map.get(a) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [tickets]);

  const conversion = [{ name: "rate", value: conversionRate, fill: "url(#gradGold)" }];

  return (
    <div className="space-y-6">
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 p-6 md:p-8 text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.25),transparent_60%)]" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-bold">Master Console</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-black mb-1">Classified Dashboard</h2>
          <p className="text-white/70 text-sm">Real-time intelligence across your entire safari operation.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Total Revenue", value: `KSh ${(totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign, glow: "from-emerald-400/30" },
              { label: "Conversion", value: `${conversionRate}%`, icon: TrendingUp, glow: "from-amber-400/30" },
              { label: "Avg Booking", value: `KSh ${(avgBookingValue / 1000).toFixed(1)}K`, icon: Zap, glow: "from-blue-400/30" },
              { label: "Active Tours", value: bookings.length + events.length + experiences.length, icon: Globe, glow: "from-purple-400/30" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.06 }}
                className={`relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${s.glow} to-transparent opacity-50`} />
                <div className="relative">
                  <s.icon className="w-4 h-4 text-amber-300 mb-2" />
                  <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* 30-day revenue */}
        <div className="lg:col-span-2 bg-card rounded-2xl border p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Performance</p>
                <h3 className="font-heading font-bold text-lg">30-Day Revenue Stream</h3>
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-500" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(38 92% 50%)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} interval={3} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10 }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(38 92% 50%)" fill="url(#revGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion radial */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-2xl border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold">Conversion Rate</p>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <h3 className="font-heading font-bold text-lg">Booking Quality</h3>
          <div className="flex-1 flex items-center justify-center -my-2">
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={conversion} startAngle={90} endAngle={-270}>
                <defs>
                  <linearGradient id="gradGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(38 92% 50%)" />
                    <stop offset="100%" stopColor="hsl(20 80% 50%)" />
                  </linearGradient>
                </defs>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-32 mb-12 relative">
            <p className="text-5xl font-black text-amber-600 tabular-nums">{conversionRate}<span className="text-2xl">%</span></p>
            <p className="text-xs text-muted-foreground mt-1">Pending → Confirmed</p>
          </div>
        </div>
      </div>

      {/* Funnel + Agents */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-bold">Customer Journey Funnel</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="font-heading font-bold">Agent Leaderboard</h3>
          </div>
          <div className="space-y-3">
            {topAgents.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No tickets assigned yet</p>}
            {topAgents.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted transition-colors"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                  i === 0 ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" :
                  i === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white" :
                  i === 2 ? "bg-gradient-to-br from-orange-300 to-orange-400 text-white" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{a.name}</p>
                  <p className="text-[11px] text-muted-foreground">{a.count} ticket{a.count !== 1 ? "s" : ""}</p>
                </div>
                {i === 0 && <Crown className="w-4 h-4 text-amber-500" />}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Live ticker */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-300">Live Activity Stream</p>
        </div>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {bookings.slice(0, 10).map((b) => (
            <div key={b.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-white/5 last:border-0">
              <Flame className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="text-white/80 flex-1 truncate">
                <span className="font-semibold text-white">{b.customer_name || "Guest"}</span> booked <span className="text-amber-300">{b.item_title}</span>
              </span>
              <span className="text-white/50 text-[10px] shrink-0">{new Date(b.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          ))}
          {bookings.length === 0 && <p className="text-white/60 text-center text-xs py-4">Awaiting first booking...</p>}
        </div>
      </div>
    </div>
  );
}
