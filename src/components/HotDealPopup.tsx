import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import hotDealPoster from "@/assets/hot-deal-mara-amboseli-v5.jpg";

function useCountdown(target?: string | null) {
  const [tl, setTl] = useState({ d: 0, h: 0, m: 0, s: 0, done: !target });
  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) return setTl({ d: 0, h: 0, m: 0, s: 0, done: true });
      setTl({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
        done: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return tl;
}

export default function HotDealPopup() {
  const { format } = useCurrency();
  const [open, setOpen] = useState(false);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [promo, setPromo] = useState<any>(null);
  const t = useCountdown(endDate);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("hotDealDismissed");
    if (dismissed) return;
    (supabase as any).from("payment_settings").select("*").limit(1).maybeSingle().then(({ data }: any) => {
      if (data?.hot_deal_active) {
        setPromo(data);
        setEndDate(data.hot_deal_end_date);
        setTimeout(() => setOpen(true), 1200);
      }
    });
  }, []);

  const close = () => {
    sessionStorage.setItem("hotDealDismissed", "1");
    setOpen(false);
  };

  const title = promo?.hot_deal_title || "3-Day Maasai Mara & Amboseli";
  const tiers = [
    { label: promo?.hot_deal_tier1_label || "2 Sharing", now: Number(promo?.hot_deal_tier1_now_ksh ?? 143000) },
    { label: promo?.hot_deal_tier2_label || "Group of 4", now: Number(promo?.hot_deal_tier2_now_ksh ?? 125000) },
    { label: promo?.hot_deal_tier3_label || "Group of 7", now: Number(promo?.hot_deal_tier3_now_ksh ?? 88000) },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden border-0 bg-gradient-to-br from-orange-50 via-card to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40">
        <div className="relative">
          <img src={hotDealPoster} alt={title} className="w-full max-h-[60vh] object-contain bg-black" />
          <Badge className="absolute top-3 left-3 bg-red-600 text-white animate-pulse shadow-lg">
            <Flame className="w-3 h-3 mr-1" /> Hot Deal
          </Badge>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold leading-tight">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{promo?.hot_deal_subtitle || "Sarova Mara (luxury) + Sentrim Amboseli. Limited slots."}</p>
          </div>

          {!t.done && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Offer ends in
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {[{ v: t.d, l: "Days" }, { v: t.h, l: "Hrs" }, { v: t.m, l: "Min" }, { v: t.s, l: "Sec" }].map((x) => (
                  <div key={x.l} className="bg-orange-600 text-white rounded-md py-2 text-center">
                    <div className="text-lg sm:text-xl font-heading font-bold tabular-nums">{String(x.v).padStart(2, "0")}</div>
                    <div className="text-[9px] uppercase opacity-80">{x.l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 text-center">
            {tiers.map((p) => (
              <div key={p.label} className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-lg py-2">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{p.label}</p>
                <p className="text-sm font-heading font-bold text-orange-700 dark:text-orange-400">{format(p.now)}</p>
                <p className="text-[9px] text-muted-foreground">pp</p>
              </div>
            ))}
          </div>
          <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg" onClick={close}>
            <Link to={`/book?type=tour&id=hot-deal&title=${encodeURIComponent(title)}&price=${tiers[0].now}`}>
              Grab Deal <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

