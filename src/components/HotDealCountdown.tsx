import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function HotDealCountdown({ endDate }: { endDate?: string | null }) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0, done: false });
  useEffect(() => {
    if (!endDate) return;
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) return setT({ d: 0, h: 0, m: 0, s: 0, done: true });
      setT({
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
  }, [endDate]);

  if (!endDate || t.done) return null;

  return (
    <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl p-4 shadow-lg">
      <p className="text-[10px] uppercase tracking-widest opacity-90 mb-2 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" /> Offer ends in
      </p>
      <div className="grid grid-cols-4 gap-2">
        {[{ v: t.d, l: "Days" }, { v: t.h, l: "Hrs" }, { v: t.m, l: "Min" }, { v: t.s, l: "Sec" }].map((x) => (
          <div key={x.l} className="bg-white/15 backdrop-blur rounded-lg py-2 text-center">
            <div className="text-2xl font-heading font-bold tabular-nums">{String(x.v).padStart(2, "0")}</div>
            <div className="text-[10px] uppercase opacity-80">{x.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
