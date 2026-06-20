import { Button } from "@/components/ui/button";
import { LayoutDashboard, BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardMode = "simple" | "compact" | "classified";

const STORAGE_KEY = "bws_admin_dashboard_mode";

export function getStoredMode(): DashboardMode {
  if (typeof window === "undefined") return "simple";
  const v = localStorage.getItem(STORAGE_KEY) as DashboardMode | null;
  return v === "compact" || v === "classified" ? v : "simple";
}

export function setStoredMode(m: DashboardMode) {
  localStorage.setItem(STORAGE_KEY, m);
}

export default function DashboardModeToggle({
  mode,
  onChange,
}: {
  mode: DashboardMode;
  onChange: (m: DashboardMode) => void;
}) {
  const options: { id: DashboardMode; label: string; icon: any }[] = [
    { id: "simple", label: "Simple", icon: LayoutDashboard },
    { id: "compact", label: "Compact", icon: BarChart3 },
    { id: "classified", label: "Classified", icon: Sparkles },
  ];

  return (
    <div className="inline-flex items-center gap-1 bg-muted/60 p-1 rounded-lg border">
      {options.map((o) => (
        <Button
          key={o.id}
          size="sm"
          variant="ghost"
          onClick={() => onChange(o.id)}
          className={cn(
            "h-8 px-3 text-xs font-semibold gap-1.5 transition-all",
            mode === o.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <o.icon className="w-3.5 h-3.5" />
          {o.label}
        </Button>
      ))}
    </div>
  );
}
