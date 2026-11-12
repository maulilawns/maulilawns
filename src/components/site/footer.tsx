import { Link } from "@tanstack/react-router";
import { Phone, MapPin, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import { useSite, whatsappLink } from "@/data/store";

const SOCIALS = [
  {
    label: "Instagram (coming soon)",
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
    <footer className="bg-navy-deep text-ivory">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <img src={logo} alt="Mauli Lawns logo" className="mb-5 h-20 w-auto" />
          <p className="text-sm leading-relaxed text-ivory/75">
            A premium open-air wedding and event venue in Wagholi, Pune — where beautiful
            celebrations begin, from intimate gatherings to grand weddings.
          </p>
          <div className="mt-6 flex gap-3">
            {SOCIALS.map(({ svg, label }) => (
              <span
                key={label}
                title={label}
                aria-label={label}
                className="flex h-10 w-10 cursor-default items-center justify-center rounded-full border border-ivory/20 text-ivory/70 transition-colors hover:border-gold hover:text-gold"
              >
                {svg}
              </span>
            ))}
          </div>
        </div>

        <nav aria-label="Quick links">
          <h3 className="font-display text-xl text-gold-soft">Quick Links</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About Us" },
              { to: "/venues", label: "Our Venues" },
              { to: "/packages", label: "Event Packages" },
              { to: "/decor-themes", label: "Decor Themes" },
              { to: "/events", label: "Events We Host" },
              { to: "/facilities", label: "Facilities" },
              { to: "/gallery", label: "Gallery" },
              { to: "/contact", label: "Contact Us" },
            ].map((l) => (
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
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link
                to="/venues/$slug"
                params={{ slug: "mini-lawn" }}
                className="text-ivory/75 transition-colors hover:text-gold-soft"
              >
                Mauli Mini Lawn
              </Link>
            </li>
            <li>
              <Link
                to="/venues/$slug"
                params={{ slug: "grand-lawn" }}
                className="text-ivory/75 transition-colors hover:text-gold-soft"
              >
                Mauli Grand Lawn
              </Link>
            </li>
            <li>
              <Link to="/events" className="text-ivory/75 transition-colors hover:text-gold-soft">
                Grand Weddings
              </Link>
            </li>
            <li>
              <Link to="/events" className="text-ivory/75 transition-colors hover:text-gold-soft">
                Engagement Ceremonies
              </Link>
            </li>
            <li>
              <Link to="/events" className="text-ivory/75 transition-colors hover:text-gold-soft">
                Birthdays & Baby Showers
              </Link>
            </li>
            <li>
              <Link to="/events" className="text-ivory/75 transition-colors hover:text-gold-soft">
                Corporate Events
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="font-display text-xl text-gold-soft">Contact Details</h3>
          <ul className="mt-5 space-y-4 text-sm text-ivory/75">
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
                {data.settings.phone}
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
            className="btn-gold mt-7 inline-flex rounded-full px-6 py-2.5 text-[0.68rem]"
          >
            Plan Your Event
          </Link>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-ivory/60 sm:flex-row sm:px-6 lg:px-8">
          <p>© {year} Mauli Lawns. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <Link to="/privacy">Privacy Policy</Link>
            <span aria-hidden>⬢</span>
            <Link to="/admin" className="transition-colors hover:text-gold-soft">
              Admin (Demo)
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
