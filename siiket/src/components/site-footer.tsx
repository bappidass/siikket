import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

import logo from "@/assets/blue_logo.png";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-dark text-dark-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="text-3xl font-extrabold tracking-tight">
            <img src={logo} className="h-12.5"/>
          </div>
          <p className="mt-6 text-sm text-dark-foreground/70">+91 7002560493</p>
          <p className="mt-3 text-sm text-dark-foreground/70">hello@siiket.com</p>
          <div className="mt-6 flex items-center gap-3">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="h-9 w-9 rounded-full border border-dark-foreground/20 grid place-items-center hover:bg-dark-foreground/10 transition"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-5">Quick Links</h4>
          <div className="grid grid-cols-2 gap-y-3 text-sm text-dark-foreground/70">
            <Link to="/events">Latest</Link>
            <Link to="/events">Sports</Link>
            <Link to="/events">Cricket</Link>
            <Link to="/events">Newest</Link>
            <Link to="/events">Live concert</Link>
            <Link to="/events">Football</Link>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-5">About</h4>
          <div className="space-y-3 text-sm text-dark-foreground/70">
            <Link to="/aboutus" className="block">About us</Link>
            
            <Link to="/contact" className="block">Contact us</Link>
            <Link to="/terms" className="block">Terms & Conditions</Link>
            <Link to="/privacy" className="block">Privacy Policy</Link>
            <Link to="/refund" className="block">Cancellation & Refund Policy</Link>
          </div>
        </div>

        <div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary shrink-0 mt-1" />
            <p className="text-sm text-dark-foreground/70 leading-relaxed">
              House No. 04, Bakool Path, Ganesh Nagar Basistha, Kamrup Metro Assam-781029
            </p>
          </div>
          <div className="mt-5 flex items-start gap-3">
            <Phone className="h-5 w-5 text-primary shrink-0 mt-1" />
            <p className="text-sm text-dark-foreground/70">+91 7735051922</p>
          </div>
          <div className="mt-5 flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary shrink-0 mt-1" />
            <p className="text-sm text-dark-foreground/70">hello@siiket.com</p>
          </div>
        </div>
      </div>
      <div className="border-t border-dark-foreground/10 py-5 text-center text-xs text-dark-foreground/50">
        © 2026 SiiKET. All rights reserved.
      </div>
    </footer>
  );
}
