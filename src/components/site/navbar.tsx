import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import { useSite, whatsappLink } from "@/data/store";

import { NAV_LINKS } from "@/data/navigation";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data, img } = useSite();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const menu = document.querySelector<HTMLElement>('[aria-label="Mobile menu"]');
    const elements = menu?.querySelectorAll<HTMLElement>("a,button");
    elements?.[0]?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
      if (event.key === "Tab" && elements?.length) {
        const first = elements[0],
          last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 nav-glass py-4"
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Mauli Lawns home">
            <img
              src={logo}
              alt="Mauli Lawns logo — gold botanical wreath with ML monogram"
              className="h-14 w-auto"
            />
            <span
              className="hidden flex-col leading-tight sm:flex lg:hidden xl:flex"
            >
              <span
                className="font-display text-lg font-semibold tracking-wide text-navy-deep"
              >
                Mauli Lawns
              </span>
              <span
                className="text-[0.6rem] uppercase tracking-[0.28em] text-gold-deep"
              >
                Wedding & Event Venue
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-3 xl:gap-4 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`link-gold text-[0.875rem] font-semibold tracking-[0.16em] transition-colors ${
                  scrolled || pathname !== "/"
                    ? "text-navy-deep hover:text-gold-deep"
                    : "text-black hover:text-gold-deep"
                }`}
                data-active={pathname === l.to}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`tel:${data.settings.phone.replace(/\s/g, "")}`}
              aria-label="Call Mauli Lawns"
              className={`hidden h-10 w-10 items-center justify-center rounded-full border transition-colors sm:flex lg:hidden 2xl:flex ${
                scrolled
                  ? "border-gold/40 text-navy-deep hover:bg-gold-soft/40"
                  : "border-ivory/40 text-ivory hover:bg-ivory/10"
              }`}
            >
              <Phone className="h-4 w-4" />
            </a>
            <a
              href={whatsappLink(data.settings.whatsapp, "a general enquiry")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Mauli Lawns"
              className={`hidden h-10 w-10 items-center justify-center rounded-full border transition-colors sm:flex lg:hidden 2xl:flex ${
                scrolled
                  ? "border-gold/40 text-navy-deep hover:bg-gold-soft/40"
                  : "border-ivory/40 text-ivory hover:bg-ivory/10"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <Link
              to="/contact"
              className="btn-gold hidden rounded-full px-6 py-2.5 text-[0.68rem] md:inline-flex"
            >
              Plan Your Event
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-navy/20 text-navy-deep transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-navy-deep/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="absolute right-0 top-0 flex h-full w-[84%] max-w-sm flex-col bg-ivory shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              aria-label="Mobile menu"
            >
              <div className="flex items-center justify-between border-b border-gold/20 px-6 py-5">
                <img src={logo} alt="Mauli Lawns logo" className="h-11 w-auto" />
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-navy-deep"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-6 py-6" aria-label="Mobile">
                <ul className="space-y-1">
                  {NAV_LINKS.map((l, i) => (
                    <motion.li
                      key={l.to}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 * i + 0.1 }}
                    >
                      <Link
                        to={l.to}
                        className={`block rounded-xl px-4 py-3 font-display text-xl transition-colors ${
                          pathname === l.to
                            ? "bg-gold-soft/40 text-navy-deep"
                            : "text-navy hover:bg-gold-soft/20"
                        }`}
                      >
                        {l.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="space-y-3 border-t border-gold/20 px-6 py-6">
                <Link
                  to="/contact"
                  className="btn-gold flex w-full items-center justify-center rounded-full px-6 py-3 text-xs"
                >
                  Plan Your Event
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${data.settings.phone.replace(/\s/g, "")}`}
                    className="btn-navy flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[0.68rem]"
                  >
                    <Phone className="h-4 w-4" /> Call Us
                  </a>
                  <a
                    href={whatsappLink(data.settings.whatsapp, "a general enquiry")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full border border-navy/25 px-4 py-3 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-navy-deep"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
