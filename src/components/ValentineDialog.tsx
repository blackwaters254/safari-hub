import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function ValentineDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("valentine-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("valentine-dismissed", "true");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <Heart className="w-7 h-7 text-destructive fill-destructive" />
          </div>
          <DialogTitle className="text-2xl font-heading text-center">
            Valentine's Special 💕
          </DialogTitle>
          <DialogDescription className="text-center text-base leading-relaxed pt-2">
            Celebrate love at the <span className="font-semibold text-foreground">Serena Hotel</span>! 
            Enjoy a romantic getaway with candlelit dinner, couples spa, champagne breakfast, 
            and a scenic sunset experience — all in one unforgettable package.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted rounded-lg p-4 text-center space-y-1">
          <p className="text-sm text-muted-foreground">Starting from</p>
          <p className="text-2xl font-heading font-bold text-primary">KSh 45,000</p>
          <p className="text-xs text-muted-foreground">per couple · all inclusive</p>
        </div>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Maybe Later
          </Button>
          <Button asChild className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">
            <Link to="/book?item=valentine-serena&type=experience&title=Valentine%27s%20Serena%20Hotel%20Package&price=45000" onClick={handleClose}>
              <Heart className="w-4 h-4 mr-1" /> Book Now
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
