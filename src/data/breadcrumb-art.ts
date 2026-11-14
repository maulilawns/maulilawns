import about from "@/assets/breadcrumb-about.webp";
import venues from "@/assets/breadcrumb-venues.webp";
import packages from "@/assets/breadcrumb-packages.webp";
import facilities from "@/assets/breadcrumb-facilities.webp";
import gallery from "@/assets/breadcrumb-gallery.webp";
import contact from "@/assets/breadcrumb-contact.webp";
import privacy from "@/assets/breadcrumb-privacy.webp";
import events from "@/assets/breadcrumb-mandap.webp";
import decor from "@/assets/breadcrumb-floral.webp";

// Decorative artwork only: venue photographs remain in page content and galleries.
export const BREADCRUMB_ART: Record<string, { src: string; width: number; height: number }> = {
  "/about": { src: about, width: 900, height: 672 },
  "/venues": { src: venues, width: 900, height: 392 },
  "/packages": { src: packages, width: 900, height: 414 },
  "/events": { src: events, width: 1000, height: 755 },
  "/facilities": { src: facilities, width: 900, height: 493 },
  "/gallery": { src: gallery, width: 900, height: 417 },
  "/contact": { src: contact, width: 900, height: 563 },
  "/privacy": { src: privacy, width: 900, height: 604 },
  "/decor-themes": { src: decor, width: 1400, height: 717 },
};
