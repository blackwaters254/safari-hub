import { LayoutDashboard, Package, Calendar, Sparkles, Users, HeadphonesIcon, UserCog, Hotel, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  stats: { members: number; bookings: number; tickets: number; staff: number };
}

const sections = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "members", label: "Members", icon: Users },
  { id: "bookings", label: "Bookings", icon: Package },
  { id: "events", label: "Events", icon: Calendar },
  { id: "experiences", label: "Experiences", icon: Sparkles },
  { id: "support", label: "Support Tickets", icon: HeadphonesIcon },
  { id: "staff", label: "Staff & Drivers", icon: UserCog },
  { id: "hotels", label: "Hotels & Partners", icon: Hotel },
];

export default function AdminSidebar({ activeSection, onSectionChange, onLogout, stats }: AdminSidebarProps) {
  const getBadge = (id: string) => {
    if (id === "members") return stats.members;
    if (id === "bookings") return stats.bookings;
    if (id === "support") return stats.tickets;
    if (id === "staff") return stats.staff;
    return null;
  };

  return (
    <aside className="w-60 shrink-0 bg-sidebar-background text-sidebar-foreground min-h-[calc(100vh-4rem)] hidden lg:flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-heading font-bold text-lg text-sidebar-primary">Admin Panel</h2>
        <p className="text-xs text-sidebar-foreground/60">Management Console</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {sections.map((s) => {
          const badge = getBadge(s.id);
          return (
            <button
              key={s.id}
              onClick={() => onSectionChange(s.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                activeSection === s.id
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <s.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{s.label}</span>
              {badge !== null && badge > 0 && (
                <span className="text-[10px] bg-sidebar-primary/20 text-sidebar-primary px-1.5 py-0.5 rounded-full font-semibold">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
