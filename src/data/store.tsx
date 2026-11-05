/**
 * Demo site store â€” local state with localStorage persistence.
 * Lets the admin demo edit venues, packages, decor themes, gallery,
 * banners, testimonials and settings. Clearly a demo: no auth, no backend.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  seedVenues,
  seedPackages,
  seedDecorThemes,
  seedGallery,
  seedTestimonials,
  seedEventCategories,
  seedSettings,
  IMAGES,
  type Venue,
  type Package,
  type DecorTheme,
  type GalleryImage,
  type Testimonial,
  type EventCategory,
  type SiteSettings,
  IMAGE_KEYS,
} from "./catalog";

const STORAGE_KEY = "maulilawns-demo-store-v1";

interface SiteData {
  venues: Venue[];
  packages: Package[];
  decorThemes: DecorTheme[];
  gallery: GalleryImage[];
  testimonials: Testimonial[];
  eventCategories: EventCategory[];
  settings: SiteSettings;
}

const seedData: SiteData = {
  venues: seedVenues,
  packages: seedPackages,
  decorThemes: seedDecorThemes,
  gallery: seedGallery,
  testimonials: seedTestimonials,
  eventCategories: seedEventCategories,
  settings: seedSettings,
};

function load(): SiteData {
  if (typeof window === "undefined") return seedData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData;
    const parsed = JSON.parse(raw) as Partial<SiteData>;
    return { ...seedData, ...parsed, settings: { ...seedSettings, ...(parsed.settings ?? {}) } };
  } catch {
    return seedData;
  }
}

interface SiteStore {
  data: SiteData;
  isAdmin: boolean;
  setVenues: (v: Venue[]) => void;
  setPackages: (p: Package[]) => void;
  setDecorThemes: (d: DecorTheme[]) => void;
  setGallery: (g: GalleryImage[]) => void;
  setTestimonials: (t: Testimonial[]) => void;
  setEventCategories: (e: EventCategory[]) => void;
  setSettings: (s: SiteSettings) => void;
  resetAll: () => void;
  /** Resolve an imageKey (or arbitrary URL) to a usable src. */
  img: (key: string) => string;
  imageKeys: string[];
}

const SiteContext = createContext<SiteStore | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(seedData);
  const [isAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setData(load());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage may be unavailable (private mode) â€” demo keeps working in-memory
    }
  }, [data, loaded]);

  const store = useMemo<SiteStore>(
    () => ({
      data,
      isAdmin,
      setVenues: (venues) => setData((d) => ({ ...d, venues })),
      setPackages: (packages) => setData((d) => ({ ...d, packages })),
      setDecorThemes: (decorThemes) => setData((d) => ({ ...d, decorThemes })),
      setGallery: (gallery) => setData((d) => ({ ...d, gallery })),
      setTestimonials: (testimonials) => setData((d) => ({ ...d, testimonials })),
      setEventCategories: (eventCategories) => setData((d) => ({ ...d, eventCategories })),
      setSettings: (settings) => setData((d) => ({ ...d, settings })),
      resetAll: () => setData(seedData),
      img: (key: string) => IMAGES[key] ?? key,
      imageKeys: IMAGE_KEYS,
    }),
    [data, isAdmin],
  );

  return <SiteContext.Provider value={store}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteStore {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}

/** WhatsApp deep link builder with a prefilled enquiry message. */
export function whatsappLink(
  number: string,
  interestedIn: string,
  opts: { eventType?: string; eventDate?: string; guests?: string } = {},
): string {
  const lines = [
    "Hello Mauli Lawns,",
    "",
    "I am interested in booking your venue.",
    "",
    `Interested In: ${interestedIn}`,
  ];
  if (opts.eventType) lines.push(`Event Type: ${opts.eventType}`);
  if (opts.eventDate) lines.push(`Event Date: ${opts.eventDate}`);
  if (opts.guests) lines.push(`Expected Guests: ${opts.guests}`);
  lines.push("", "Please share availability and package details.");
  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
}
