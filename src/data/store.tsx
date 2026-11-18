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
    if (parsed.settings) {
      if (parsed.settings.whatsapp.replace(/\D/g, "") === "919604310054") {
        parsed.settings.whatsapp = seedSettings.whatsapp;
      }
      if (parsed.settings.phone.replace(/\D/g, "") === "919604310054") {
        parsed.settings.phone = seedSettings.phone;
      }
    }
    // Restore non-gallery image choices cleared during the broader image removal.
    parsed.venues = (parsed.venues ?? seedVenues).map((item) => {
      const seed = seedVenues.find((venue) => venue.id === item.id);
      return {
        ...item,
        imageKey: item.imageKey || seed?.imageKey || "",
        longDescription:
          item.id === "v-grand"
            ? (item.longDescription || seed?.longDescription || "").replace(
                /500\s*sq\.?\s*ft\.?\s*stage/gi,
                "800 sq. ft. stage",
              )
            : item.longDescription,
        amenities:
          item.id === "v-grand"
            ? (item.amenities ?? seed?.amenities ?? []).map((amenity) =>
                /500\s*sq\.?\s*ft\.?\s*stage/i.test(amenity)
                  ? "800 sq. ft. Stage"
                  : amenity,
              )
            : item.amenities,
        galleryKeys:
          item.id === "v-grand" && !item.galleryKeys.length
            ? (seed?.galleryKeys ?? [])
            : item.galleryKeys,
      };
    });
    // Replace retired sample photographs for returning Grand Lawn visitors.
    const grandPhotoReplacements: Record<string, string> = {
      "gallery-stage": "grand-stage-pink",
      "gallery-lighting": "grand-stage-blue",
      "decor-royal": "garden-walkway",
      "gallery-dining": "grand-guest-seating",
    };
    parsed.venues = parsed.venues.map((venue) =>
      venue.id === "v-grand"
        ? { ...venue, galleryKeys: venue.galleryKeys.map((key) => grandPhotoReplacements[key] ?? key) }
        : venue,
    );
    parsed.packages = (parsed.packages ?? seedPackages).map((item) => ({
      ...item,
      imageKey: item.imageKey || seedPackages.find((seed) => seed.id === item.id)?.imageKey || "",
      inclusions:
        item.id === "p-grand-rental"
          ? item.inclusions.map((inclusion) =>
              /500\s*sq\.?\s*ft\.?\s*stage/i.test(inclusion)
                ? "800 sq. ft. stage"
                : inclusion,
            )
          : item.inclusions,
    }));
    parsed.decorThemes = (parsed.decorThemes ?? seedDecorThemes).map((item) => ({
      ...item,
      imageKey:
        item.imageKey || seedDecorThemes.find((seed) => seed.id === item.id)?.imageKey || "",
    }));
    parsed.eventCategories = (parsed.eventCategories ?? seedEventCategories).map((item) => ({
      ...item,
      imageKey:
        item.imageKey || seedEventCategories.find((seed) => seed.id === item.id)?.imageKey || "",
    }));
    if (parsed.settings?.bannerImageKey === "venue-mini")
      parsed.settings.bannerImageKey = "hero-main";
    // Upgrade the original Mini Lawn demo photographs for returning visitors.
    parsed.venues = (parsed.venues ?? seedVenues).map((venue) =>
      venue.id === "v-mini" &&
      JSON.stringify(venue.galleryKeys) ===
        JSON.stringify(["venue-mini", "decor-pastel", "gallery-dining", "gallery-lighting"])
        ? { ...venue, galleryKeys: seedVenues.find((item) => item.id === "v-mini")!.galleryKeys }
        : venue,
    );
    // Update the previous Grand Lawn capacity in saved demo content.
    parsed.venues =
      parsed.venues?.map((venue) =>
        venue.id === "v-grand" && venue.capacityMin === 200
          ? {
              ...venue,
              capacityMin: 100,
              faqs: venue.faqs.map((faq) => ({
                ...faq,
                answer: faq.answer.replace("200–700", "100–700"),
              })),
            }
          : venue,
      ) ?? seedVenues;
    parsed.packages =
      parsed.packages?.map((pkg) =>
        pkg.id === "p-mini-rental" &&
        pkg.inclusions.includes("Final facilities confirmed on inquiry")
          ? {
              ...pkg,
              inclusions: seedPackages.find((item) => item.id === "p-mini-rental")!.inclusions,
            }
          : pkg,
      ) ?? seedPackages;
    parsed.packages = parsed.packages.map((pkg) => {
      if (pkg.id !== "p-mini-rental" && pkg.id !== "p-grand-rental") return pkg;
      const inclusions = pkg.inclusions.map((item) =>
        item === "Kitchen setup"
          ? "Kitchen area — 500 sq. ft."
          : pkg.id === "p-mini-rental" && item === "4 speakers & 2 microphones"
            ? "1 speaker & 1 microphone"
            : item,
      );
      if (!inclusions.includes("Separate washrooms available")) {
        inclusions.push("Separate washrooms available");
      }
      if (!inclusions.includes("Water available")) {
        inclusions.push("Water available");
      }
      if (
        pkg.id === "p-grand-rental" &&
        !inclusions.includes("Guest capacity: 100–700 + 200 additional floating guests")
      ) {
        inclusions.unshift("Guest capacity: 100–700 + 200 additional floating guests");
      }
      return { ...pkg, inclusions };
    });
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
      img: (key: string) => IMAGES[key] ?? (/^(https?:\/\/|\/uploads\/)/.test(key) ? key : ""),
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
