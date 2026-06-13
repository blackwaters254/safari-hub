import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import hotDealPoster from "@/assets/hot-deal-mara-amboseli-v4.png";

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
  const [open, setOpen] = useState(false);
  const [endDate, setEndDate] = useState<string | null>(null);
  const t = useCountdown(endDate);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("hotDealDismissed");
    if (dismissed) return;
    (supabase as any).from("payment_settings").select("hot_deal_active, hot_deal_end_date").limit(1).maybeSingle().then(({ data }: any) => {
      if (data?.hot_deal_active) {
        setEndDate(data.hot_deal_end_date);
        setTimeout(() => setOpen(true), 1200);
      }
    });
  }, []);

  const close = () => {
    sessionStorage.setItem("hotDealDismissed", "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden border-0 bg-gradient-to-br from-orange-50 via-card to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40">
        <div className="relative">
          <img src={hotDealPoster} alt="Hot deal: 3 day Maasai Mara and Amboseli safari" className="w-full h-44 sm:h-56 object-cover" />
          <Badge className="absolute top-3 left-3 bg-red-600 text-white animate-pulse shadow-lg">
            <Flame className="w-3 h-3 mr-1" /> Hot Deal
          </Badge>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold leading-tight">
              3-Day Maasai Mara & Amboseli
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Sarova Mara (luxury) + Sentrim Amboseli. Limited slots.</p>
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

          <div className="flex items-end justify-between pt-1 gap-3">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground tracking-wider">From</p>
              <p className="text-2xl font-heading font-bold text-primary">USD 1,100</p>
              <p className="text-[10px] text-muted-foreground">per person sharing</p>
              <p className="text-[10px] text-orange-700 dark:text-orange-400 font-semibold mt-0.5">Group of 4: USD 960 pp</p>
            </div>
            <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg" onClick={close}>
              <Link to="/book?type=tour&id=hot-deal&title=3-Day%20Maasai%20Mara%20%26%20Amboseli&price=143000">
                Grab Deal <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
