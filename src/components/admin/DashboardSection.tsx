import { Package, Users, HeadphonesIcon, UserCog, Calendar, Sparkles, Hotel, TrendingUp, ArrowUpRight, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  bookings: any[];
  members: any[];
  tickets: any[];
  staff: any[];
  events: any[];
  experiences: any[];
  hotels: any[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardSection({ bookings, members, tickets, staff, events, experiences, hotels }: Props) {
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const totalRevenue = bookings.reduce((sum: number, b: any) => sum + Number(b.amount_paid || 0), 0);
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;

  const stats = [
    { label: "Total Members", value: members.length, icon: Users, accent: "from-primary/20 to-primary/5", iconColor: "text-primary" },
    { label: "Total Bookings", value: bookings.length, icon: Package, accent: "from-secondary/20 to-secondary/5", iconColor: "text-secondary" },
    { label: "Pending", value: pendingBookings, icon: Clock, accent: "from-accent/20 to-accent/5", iconColor: "text-accent" },
    { label: "Confirmed", value: confirmedBookings, icon: Calendar, accent: "from-secondary/20 to-secondary/5", iconColor: "text-secondary" },
    { label: "Revenue (KSh)", value: totalRevenue.toLocaleString(), icon: TrendingUp, accent: "from-primary/20 to-primary/5", iconColor: "text-primary" },
    { label: "Open Tickets", value: openTickets, icon: HeadphonesIcon, accent: "from-destructive/20 to-destructive/5", iconColor: "text-destructive" },
    { label: "Staff", value: staff.length, icon: UserCog, accent: "from-primary/20 to-primary/5", iconColor: "text-primary" },
    { label: "Hotels", value: hotels.length, icon: Hotel, accent: "from-secondary/20 to-secondary/5", iconColor: "text-secondary" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="text-2xl md:text-3xl font-heading font-bold">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Welcome back. Here's an overview of your operations.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={item}
            className={`relative overflow-hidden bg-gradient-to-br ${s.accent} backdrop-blur-sm rounded-xl border border-border/50 p-4 md:p-5 group hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg bg-background/80 flex items-center justify-center ${s.iconColor}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
            </div>
            <p className="text-xl md:text-2xl font-bold tracking-tight">{s.value}</p>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-heading font-semibold text-sm">Recent Bookings</h3>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
              {bookings.length} total
            </span>
          </div>
          <div className="divide-y divide-border/50">
            {bookings.slice(0, 5).map((b: any) => (
              <div key={b.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{b.item_title}</p>
                  <p className="text-[11px] text-muted-foreground">{b.customer_name || "Guest"} · {new Date(b.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold shrink-0 ml-3 ${
                  b.status === "pending" ? "bg-accent/15 text-accent" :
                  b.status === "confirmed" ? "bg-secondary/15 text-secondary" :
                  b.status === "cancelled" ? "bg-destructive/15 text-destructive" :
                  "bg-primary/15 text-primary"
                }`}>{b.status}</span>
              </div>
            ))}
            {bookings.length === 0 && <p className="text-muted-foreground text-sm px-5 py-6 text-center">No bookings yet</p>}
          </div>
        </motion.div>

        {/* Open Tickets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-heading font-semibold text-sm">Open Support Tickets</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              openTickets > 0 ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"
            }`}>
              {openTickets} open
            </span>
          </div>
          <div className="divide-y divide-border/50">
            {tickets.filter((t: any) => t.status === "open").slice(0, 5).map((t: any) => (
              <div key={t.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{t.subject}</p>
                  <p className="text-[11px] text-muted-foreground">{t.customer_name} · {new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold shrink-0 ml-3 ${
                  t.priority === "urgent" ? "bg-destructive/15 text-destructive" :
                  t.priority === "high" ? "bg-accent/15 text-accent" :
                  "bg-muted text-muted-foreground"
                }`}>{t.priority}</span>
              </div>
            ))}
            {openTickets === 0 && <p className="text-muted-foreground text-sm px-5 py-6 text-center">No open tickets 🎉</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
