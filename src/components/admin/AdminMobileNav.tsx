import { LayoutDashboard, Package, Calendar, Sparkles, Users, HeadphonesIcon, UserCog, Hotel } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const sections = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "members", label: "Members", icon: Users },
  { id: "bookings", label: "Bookings", icon: Package },
  { id: "events", label: "Events", icon: Calendar },
  { id: "experiences", label: "Experiences", icon: Sparkles },
  { id: "support", label: "Support", icon: HeadphonesIcon },
  { id: "staff", label: "Staff", icon: UserCog },
  { id: "hotels", label: "Hotels", icon: Hotel },
];

interface Props {
  activeSection: string;
  onSectionChange: (s: string) => void;
}

export default function AdminMobileNav({ activeSection, onSectionChange }: Props) {
  return (
    <div className="lg:hidden mb-4">
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => onSectionChange(s.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                activeSection === s.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
