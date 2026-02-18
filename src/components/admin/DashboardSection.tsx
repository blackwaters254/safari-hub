import { Package, Users, HeadphonesIcon, UserCog, Calendar, Sparkles, Hotel, TrendingUp } from "lucide-react";

interface Props {
  bookings: any[];
  members: any[];
  tickets: any[];
  staff: any[];
  events: any[];
  experiences: any[];
  hotels: any[];
}

export default function DashboardSection({ bookings, members, tickets, staff, events, experiences, hotels }: Props) {
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const totalRevenue = bookings.reduce((sum: number, b: any) => sum + Number(b.amount_paid || 0), 0);

  const stats = [
    { label: "Total Members", value: members.length, icon: Users, color: "text-primary" },
    { label: "Total Bookings", value: bookings.length, icon: Package, color: "text-secondary" },
    { label: "Pending Bookings", value: pendingBookings, icon: Calendar, color: "text-accent" },
    { label: "Revenue (KSh)", value: totalRevenue.toLocaleString(), icon: TrendingUp, color: "text-secondary" },
    { label: "Open Tickets", value: openTickets, icon: HeadphonesIcon, color: "text-destructive" },
    { label: "Staff Members", value: staff.length, icon: UserCog, color: "text-primary" },
    { label: "Events", value: events.length, icon: Sparkles, color: "text-accent" },
    { label: "Hotel Partners", value: hotels.length, icon: Hotel, color: "text-secondary" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card p-4 rounded-lg border border-border">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <h3 className="font-heading font-semibold text-lg mb-3">Recent Bookings</h3>
      <div className="space-y-2 mb-8">
        {bookings.slice(0, 5).map((b: any) => (
          <div key={b.id} className="bg-card p-3 rounded-lg border border-border flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">{b.item_title}</span>
              <span className="text-muted-foreground ml-2">— {b.customer_name || "Guest"}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
              b.status === "pending" ? "bg-accent/20 text-accent" :
              b.status === "confirmed" ? "bg-secondary/20 text-secondary" :
              b.status === "cancelled" ? "bg-destructive/20 text-destructive" :
              "bg-primary/20 text-primary"
            }`}>{b.status}</span>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-muted-foreground text-sm">No bookings yet</p>}
      </div>

      {/* Open tickets */}
      <h3 className="font-heading font-semibold text-lg mb-3">Open Support Tickets</h3>
      <div className="space-y-2">
        {tickets.filter((t: any) => t.status === "open").slice(0, 5).map((t: any) => (
          <div key={t.id} className="bg-card p-3 rounded-lg border border-border flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">{t.subject}</span>
              <span className="text-muted-foreground ml-2">— {t.customer_name}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
              t.priority === "urgent" ? "bg-destructive/20 text-destructive" :
              t.priority === "high" ? "bg-accent/20 text-accent" :
              "bg-muted text-muted-foreground"
            }`}>{t.priority}</span>
          </div>
        ))}
        {tickets.filter((t: any) => t.status === "open").length === 0 && <p className="text-muted-foreground text-sm">No open tickets</p>}
      </div>
    </div>
  );
}
