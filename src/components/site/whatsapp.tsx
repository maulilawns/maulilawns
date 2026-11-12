import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useSite, whatsappLink } from "@/data/store";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.52 3.48A11.85 11.85 0 0 0 12.05 0C5.47 0 .11 5.35.1 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.25-1.64a11.94 11.94 0 0 0 5.8 1.48h.01c6.58 0 11.94-5.35 11.94-11.93 0-3.19-1.24-6.18-3.48-8.43ZM12.06 21.82a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.71.97.99-3.62-.24-.37a9.9 9.9 0 0 1-1.52-5.28c0-5.47 4.46-9.92 9.93-9.92 2.65 0 5.14 1.03 7.01 2.91a9.85 9.85 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.96 9.92Zm5.45-7.43c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.3 1.27.48 1.7.61.72.23 1.37.2 1.88.12.57-.09 1.77-.73 2.02-1.44.25-.7.25-1.31.17-1.44-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

/** Floating WhatsApp button on every public page. */
export function FloatingWhatsApp() {
  const { data } = useSite();
  return (
    <motion.a
      href={whatsappLink(data.settings.whatsapp, "a general enquiry")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Enquire on WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.5 }}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-110"
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-30" />
    </motion.a>
  );
}

/** Reusable WhatsApp enquiry button for venues, packages and decor themes. */
export function EnquireButton({
  interestedIn,
  eventType,
  eventDate,
  guests,
  label = "Enquire on WhatsApp",
  variant = "gold",
  className = "",
  children,
}: {
  interestedIn: string;
  eventType?: string;
  eventDate?: string;
  guests?: string;
  label?: string;
  variant?: "gold" | "navy" | "outline" | "green";
  className?: string;
  children?: ReactNode;
}) {
  const { data } = useSite();
  const opts: { eventType?: string; eventDate?: string; guests?: string } = {};
  if (eventType) opts.eventType = eventType;
  if (eventDate) opts.eventDate = eventDate;
  if (guests) opts.guests = guests;
  const href = whatsappLink(data.settings.whatsapp, interestedIn, opts);
  const styles: Record<string, string> = {
    gold: "btn-gold rounded-full",
    navy: "btn-navy rounded-full",
    outline:
      "rounded-full border border-navy/25 text-navy-deep font-bold uppercase tracking-[0.08em] hover:border-gold hover:text-gold-deep transition-colors",
    green:
      "rounded-full bg-[#25D366] text-white font-bold uppercase tracking-[0.08em] shadow-lg hover:brightness-105 transition",
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-[0.68rem] ${styles[variant]} ${className}`}
    >
      {children ?? <WhatsAppIcon className="h-4 w-4" />}
      {label}
    </a>
  );
}

/** Premium sticky bottom enquiry bar for mobile on key conversion pages. */
export function StickyMobileEnquiry({ interestedIn }: { interestedIn: string }) {
  const { data } = useSite();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-ivory/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="grid grid-cols-2 gap-3">
        <a
          href={`tel:${data.settings.phone.replace(/\s/g, "")}`}
          className="btn-navy flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[0.68rem]"
        >
          Call Venue
        </a>
        <a
          href={whatsappLink(data.settings.whatsapp, interestedIn)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-white"
        >
          <WhatsAppIcon className="h-4 w-4" /> Enquire Now
        </a>
      </div>
    </div>
  );
}
