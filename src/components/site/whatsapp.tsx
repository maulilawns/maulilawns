import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useSite, whatsappLink } from "@/data/store";

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
      <MessageCircle className="h-6 w-6 fill-white" />
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
      {children ?? <MessageCircle className="h-4 w-4" />}
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
          <MessageCircle className="h-4 w-4" /> Enquire Now
        </a>
      </div>
    </div>
  );
}
