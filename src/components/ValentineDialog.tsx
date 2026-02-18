import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ValentineDialog() {
  const [showTrigger, setShowTrigger] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("valentine-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setShowTrigger(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    setShowTrigger(false);
    sessionStorage.setItem("valentine-dismissed", "true");
  };

  return (
    <>
      {/* Floating animated heart trigger */}
      <AnimatePresence>
        {showTrigger && !open && (
          <motion.button
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 20 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-destructive text-destructive-foreground shadow-lg flex items-center justify-center cursor-pointer"
            aria-label="Valentine's Special Offer"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="w-7 h-7 fill-current" />
            </motion.div>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              !
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
        <DialogContent className="sm:max-w-md bg-card border-primary/20 overflow-hidden p-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="p-6"
          >
            <DialogHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className="mx-auto mb-3 w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center"
              >
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                  <Heart className="w-7 h-7 text-destructive fill-destructive" />
                </motion.div>
              </motion.div>
              <DialogTitle className="text-2xl font-heading text-center">
                Valentine's Special 💕
              </DialogTitle>
              <DialogDescription className="text-center text-base leading-relaxed pt-2">
                Celebrate love at the <span className="font-semibold text-foreground">Serena Hotel</span>!
                Enjoy a romantic getaway with candlelit dinner, couples spa, champagne breakfast,
                and a scenic sunset experience — all in one unforgettable package.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted rounded-lg p-4 text-center space-y-1 mt-4">
              <p className="text-sm text-muted-foreground">Starting from</p>
              <p className="text-2xl font-heading font-bold text-primary">KSh 45,000</p>
              <p className="text-xs text-muted-foreground">per couple · all inclusive</p>
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Maybe Later
              </Button>
              <Button asChild className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                <Link to="/book?item=valentine-serena&type=experience&title=Valentine%27s%20Serena%20Hotel%20Package&price=45000" onClick={handleClose}>
                  <Heart className="w-4 h-4 mr-1" /> Book Now
                </Link>
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
