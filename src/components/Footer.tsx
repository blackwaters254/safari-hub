import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-safari-dark text-safari-dark-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-heading font-bold mb-4">
              Blackwaters<span className="text-primary"> Safaris</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Authentic Kenyan safari experiences crafted with passion. Discover the wild beauty of East Africa with our expert-guided tours.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/about", label: "About Us" },
                { to: "/tours", label: "Tours & Safaris" },
                { to: "/events", label: "Events" },
                { to: "/gallery", label: "Gallery" },
                { to: "/contact", label: "Contact Us" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-muted-foreground hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tour Categories */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Our Safaris</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Wildlife Safaris</li>
              <li>Beach Holidays</li>
              <li>Cultural Tours</li>
              <li>Mountain Trekking</li>
              <li>Custom Itineraries</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                AMBANK Building, Monrovia Street off Koinange Street, Nairobi
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                +254 118 596 089
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                info@blackwaterssafaris.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Blackwaters Safaris. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
