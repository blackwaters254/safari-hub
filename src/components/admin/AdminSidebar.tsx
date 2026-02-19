import { LayoutDashboard, Package, Calendar, Sparkles, Users, HeadphonesIcon, UserCog, Hotel, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  { id: "support", label: "Support", icon: HeadphonesIcon },
  { id: "staff", label: "Staff & Drivers", icon: UserCog },
  { id: "hotels", label: "Hotels", icon: Hotel },
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
    <aside className="w-64 shrink-0 bg-sidebar-background text-sidebar-foreground min-h-screen hidden lg:flex flex-col border-r border-sidebar-border">
      {/* Branding */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-sm text-sidebar-primary-foreground">Blackwaters</h2>
            <p className="text-[10px] text-sidebar-foreground/50 font-medium tracking-wide uppercase">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-2">Navigation</p>
        {sections.map((s) => {
          const badge = getBadge(s.id);
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSectionChange(s.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative",
                isActive
                  ? "bg-sidebar-primary/15 text-sidebar-primary font-semibold"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-sidebar-primary rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <s.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{s.label}</span>
              {badge !== null && badge > 0 && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center",
                  isActive
                    ? "bg-sidebar-primary/25 text-sidebar-primary"
                    : "bg-sidebar-foreground/10 text-sidebar-foreground/50"
                )}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
