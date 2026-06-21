import { LayoutDashboard, Package, Calendar, Sparkles, Users, HeadphonesIcon, UserCog, Hotel, Shield, Briefcase, Map, CreditCard, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "members", label: "Members", icon: Users },
  { id: "bookings", label: "Bookings", icon: Package },
  { id: "tours", label: "Tours", icon: Map },
  { id: "events", label: "Events", icon: Calendar },
  { id: "experiences", label: "Experiences", icon: Sparkles },
  { id: "support", label: "Support", icon: HeadphonesIcon },
  { id: "staff", label: "Staff", icon: UserCog },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "opportunities", label: "Jobs", icon: Briefcase },
  { id: "payments", label: "Payments", icon: CreditCard },
];

interface Props {
  activeSection: string;
  onSectionChange: (s: string) => void;
}

export default function AdminMobileNav({ activeSection, onSectionChange }: Props) {
  return (
    <div className="lg:hidden bg-sidebar border-b border-sidebar-border px-3 py-2">
      {/* Branding row */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
          <Shield className="w-3 h-3 text-primary-foreground" />
        </div>
        <span className="text-xs font-bold text-sidebar-foreground">Blackwaters Admin</span>
      </div>
      {/* Scrollable nav */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => onSectionChange(s.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0",
              activeSection === s.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground"
            )}
          >
            <s.icon className="w-3 h-3" />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
