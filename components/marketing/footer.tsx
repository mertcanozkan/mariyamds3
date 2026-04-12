import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";
import { Logo } from "@/components/marketing/logo";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container mx-auto px-4 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1">
            <div className="mb-4">
              <Logo size="sm" />
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Your Journey Starts Here.<br />
              Professional driving instruction across London.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 hover:bg-amber/20 flex items-center justify-center transition-colors" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://facebook.com" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/10 hover:bg-amber/20 flex items-center justify-center transition-colors" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://tiktok.com" aria-label="TikTok" className="w-9 h-9 rounded-full bg-white/10 hover:bg-amber/20 flex items-center justify-center transition-colors" target="_blank" rel="noopener noreferrer">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.68a8.17 8.17 0 0 0 4.79 1.53V6.77a4.85 4.85 0 0 1-1.03-.08z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-2.5 text-white/60 text-sm">
              <li>Manual Lessons</li>
              <li>Automatic Lessons</li>
              <li>Intensive Courses</li>
              <li>Mock Tests</li>
              <li>Pass Plus</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2.5 text-white/60 text-sm">
              <li>123 High Street</li>
              <li>London, E1 6RF</li>
              <li><a href="tel:+442071234567" className="hover:text-white transition-colors">020 7123 4567</a></li>
              <li><a href="mailto:hello@mariyamds.co.uk" className="hover:text-white transition-colors">hello@mariyamds.co.uk</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40 text-xs">
          <p>© 2025 Mariyam Driving School Ltd · Company No. 12345678 · 123 High Street, London E1 6RF</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
