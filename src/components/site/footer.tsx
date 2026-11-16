import { NAV_LINKS } from "@/data/navigation";
import { formatPhone } from "@/data/catalog";
import { Link } from "@tanstack/react-router";
import { Phone, MapPin, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import { useSite, whatsappLink } from "@/data/store";

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/mauli_lawns54?mdxt=c3g5eWJrbHY4bm9x&utm_source=qr",
    svg: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
        aria-hidden
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook (coming soon)",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path
          d="M14 8h2.5l.5-3h-3V3.5C14 2.6 14.3 2 15.7 2H17V-.7h-2.6C11.6-0.7 10.6 1 10.6 3.7V5H8v3h2.6v9H14V8z"
          transform="translate(0 2)"
        />
      </svg>
    ),
  },
  {
    label: "YouTube (coming soon)",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.9C18.2 5 12 5 12 5s-6.2 0-7.8.3A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.9c1.6.3 7.8.3 7.8.3s6.2 0 7.8-.3a2.6 2.6 0 0 0 1.8-1.9A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8zM10 15.2V8.8L15.5 12 10 15.2z" />
      </svg>
    ),
  },
];

export function Footer() {
  const { data } = useSite();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer bg-navy-deep text-ivory">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Link
            to="/"
            aria-label="Mauli Lawns home"
            className="mb-4 inline-flex rounded-lg bg-ivory p-3"
          >
            <img src={logo} alt="Mauli Lawns logo" className="h-20 w-auto object-contain" />
          </Link>
          <p className="text-sm leading-relaxed text-ivory/75">
            A premium open-air wedding and event venue in Wagholi, Pune — where beautiful
            celebrations begin, from intimate gatherings to grand weddings.
          </p>
          <div className="mt-4 flex gap-3">
            {SOCIALS.map((social) => social.href ? (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                title={social.label}
                aria-label={social.label}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-ivory/20 text-ivory/70 transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
              >
                {social.svg}
              </a>
            ) : (
              <span
                key={social.label}
                title={social.label}
                aria-label={social.label}
                className="flex h-8 w-8 cursor-default items-center justify-center rounded-full border border-ivory/20 text-ivory/70 transition-colors hover:border-gold hover:text-gold"
              >
                {social.svg}
              </span>
            ))}
          </div>
        </div>

        <nav aria-label="Quick links">
          <h3 className="font-display text-xl text-gold-soft">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-ivory/75 transition-colors hover:text-gold-soft">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Our venues and events">
          <h3 className="font-display text-xl text-gold-soft">Our Venues & Events</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {data.venues.map((venue) => (
              <li key={venue.id}>
                <Link
                  to="/venues/$slug"
                  params={{ slug: venue.slug }}
                  className="text-ivory/75 transition-colors hover:text-gold-soft"
                >
                  {venue.name}
                </Link>
              </li>
            ))}
            {data.eventCategories.map((event) => (
              <li key={event.id}>
                <Link
                  to="/events"
                  hash={event.slug}
                  className="text-ivory/75 transition-colors hover:text-gold-soft"
                >
                  {event.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="font-display text-xl text-gold-soft">Contact Details</h3>
          <ul className="mt-4 space-y-3 text-sm text-ivory/75">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{data.settings.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a
                href={`tel:${data.settings.phone.replace(/\s/g, "")}`}
                className="hover:text-gold-soft"
              >
                {formatPhone(data.settings.phone)}
              </a>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a
                href={whatsappLink(data.settings.whatsapp, "a general enquiry")}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-soft"
              >
                WhatsApp Enquiry
              </a>
            </li>
          </ul>
          <Link
            to="/contact"
            className="btn-gold mt-5 inline-flex rounded-full px-6 py-2.5 text-[0.68rem]"
          >
            Plan Your Event
          </Link>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="footer-bottom mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-4 text-center text-xs text-ivory/60 sm:px-6 lg:px-8">
          <p>
            <Link to="/privacy">Privacy Policy</Link>
          </p>
          <p>
            © {year} Mauli Lawns. All rights reserved. Designed by{" "}
            <a
              href="https://webakoof.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Webakoof
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
