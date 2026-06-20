import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Package, Users, Clock, HeadphonesIcon, DollarSign, Calendar, Activity } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface Props {
  bookings: any[]; members: any[]; tickets: any[]; staff: any[]; events: any[]; experiences: any[]; hotels: any[];
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--destructive))"];

function last14Days(bookings: any[]) {
  const days: { date: string; bookings: number; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const matches = bookings.filter((b) => (b.created_at || "").slice(0, 10) === key);
    days.push({
      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      bookings: matches.length,
      revenue: matches.reduce((s, b) => s + Number(b.amount_paid || 0), 0),
    });
  }
  return days;
}

export default function DashboardCompact({ bookings, members, tickets, staff, events, experiences, hotels }: Props) {
  const series = useMemo(() => last14Days(bookings), [bookings]);
  const totalRevenue = bookings.reduce((s, b) => s + Number(b.amount_paid || 0), 0);
  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const openTickets = tickets.filter((t) => t.status === "open").length;

  const statusData = [
    { name: "Confirmed", value: confirmed },
    { name: "Pending", value: pending },
    { name: "Cancelled", value: cancelled },
  ].filter((x) => x.value > 0);

  const topTours = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach((b) => map.set(b.item_title || "Untitled", (map.get(b.item_title || "Untitled") || 0) + 1));
    return Array.from(map.entries())
      .map(([name, count]) => ({ name: name.length > 22 ? name.slice(0, 22) + "…" : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [bookings]);

  const kpis = [
    { label: "Total Revenue", value: `KSh ${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: "+12%", color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Bookings", value: bookings.length, icon: Package, trend: `${confirmed} confirmed`, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Members", value: members.length, icon: Users, trend: "+8 this week", color: "text-purple-600", bg: "bg-purple-500/10" },
    { label: "Open Tickets", value: openTickets, icon: HeadphonesIcon, trend: `of ${tickets.length}`, color: "text-orange-600", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-heading font-bold">Compact Analytics</h2>
        <p className="text-muted-foreground text-sm mt-1">Data-rich view with trends, distributions, and top performers.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`w-9 h-9 rounded-lg ${k.bg} ${k.color} flex items-center justify-center`}>
                <k.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">{k.trend}</span>
            </div>
            <p className="text-xl font-bold mt-3 tabular-nums">{k.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-sm">Revenue & Bookings (14 days)</h3>
              <p className="text-[11px] text-muted-foreground">Daily activity trend</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={series}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border p-5">
          <h3 className="font-heading font-semibold text-sm mb-1">Booking Status</h3>
          <p className="text-[11px] text-muted-foreground mb-3">Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {statusData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />{s.name}</span>
                <span className="font-semibold tabular-nums">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top tours */}
        <div className="bg-card rounded-xl border p-5">
          <h3 className="font-heading font-semibold text-sm mb-3">Top Tours by Bookings</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topTours} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} width={120} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity feed */}
        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-semibold text-sm">Live Activity</h3>
          </div>
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
            {bookings.slice(0, 8).map((b) => (
              <div key={b.id} className="flex items-center gap-3 text-xs">
                <div className={`w-2 h-2 rounded-full shrink-0 ${b.status === "confirmed" ? "bg-emerald-500" : b.status === "pending" ? "bg-amber-500" : "bg-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{b.customer_name || "Guest"} booked {b.item_title}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(b.created_at).toLocaleString()}</p>
                </div>
                <span className="text-[10px] capitalize px-1.5 py-0.5 rounded bg-muted">{b.status}</span>
              </div>
            ))}
            {bookings.length === 0 && <p className="text-center text-muted-foreground text-xs py-6">No activity yet</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Events", value: events.length, icon: Calendar },
          { label: "Experiences", value: experiences.length, icon: Clock },
          { label: "Staff", value: staff.length, icon: Users },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border p-4 flex items-center gap-3">
            <s.icon className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold tabular-nums">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
