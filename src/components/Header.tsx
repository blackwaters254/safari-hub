import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency, Currency } from "@/contexts/CurrencyContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/tours", label: "Tours & Safaris" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

const currencies: Currency[] = ["KSH", "USD", "EUR"];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { currency, setCurrency } = useCurrency();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-safari-dark/95 backdrop-blur-sm">
      {/* Currency bar */}
      <div className="bg-safari-dark border-b border-border/10">
        <div className="container flex items-center justify-end gap-1 py-1 text-xs">
          {currencies.map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2 py-0.5 rounded transition-colors ${currency === c ? "bg-primary text-primary-foreground" : "text-safari-dark-foreground/70 hover:text-safari-dark-foreground"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-heading font-bold text-primary-foreground tracking-wide">
            Blackwaters<span className="text-primary"> Safaris</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === l.to ? "text-primary" : "text-safari-dark-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <Button asChild size="sm" variant="ghost" className="text-safari-dark-foreground hover:text-primary">
              <Link to="/account"><User className="w-4 h-4 mr-1" /> Account</Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="ghost" className="text-safari-dark-foreground hover:text-primary">
              <Link to="/auth"><LogIn className="w-4 h-4 mr-1" /> Login</Link>
            </Button>
          )}
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/tours">
              <Phone className="w-4 h-4 mr-1" /> Book Now
            </Link>
          </Button>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-safari-dark-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-safari-dark border-t border-border/20 overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-3">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`text-base font-medium py-2 transition-colors hover:text-primary ${
                    pathname === l.to ? "text-primary" : "text-safari-dark-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {user ? (
                <Link to="/account" onClick={() => setOpen(false)} className="text-base font-medium py-2 text-safari-dark-foreground hover:text-primary flex items-center gap-2">
                  <User className="w-4 h-4" /> My Account
                </Link>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="text-base font-medium py-2 text-safari-dark-foreground hover:text-primary flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Login / Sign Up
                </Link>
              )}
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 w-fit mt-2">
                <Link to="/tours" onClick={() => setOpen(false)}>
                  <Phone className="w-4 h-4 mr-1" /> Book Now
                </Link>
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
