/**
 * Mauli Lawns — site content catalogue (demo seed data).
 * Types + seed data used by the public site and the admin demo.
 */

import venueMini from "@/assets/mini-lawn-ceremony.webp";
import miniLawnDining from "@/assets/mini-lawn-dining.webp";
import miniLawnStage from "@/assets/mini-lawn-stage.webp";

import heroMain from "@/assets/gallery/venue-gardens-pool.webp";
import grandStagePink from "@/assets/gallery/grand-stage-pink.webp";
import grandStageBlue from "@/assets/gallery/grand-stage-blue.webp";
import grandGuestSeating from "@/assets/gallery/grand-guest-seating.webp";
import gardenWalkway from "@/assets/gallery/illuminated-garden-walkway.webp";
import venueDroneDay from "@/assets/gallery/venue-drone-day.webp";
import venueGrand from "@/assets/grand-lawn-aerial.webp";
import frontGate from "@/assets/front-gate.webp";
import ctaEvening from "@/assets/cta-evening.jpg";
import decorRoyal from "@/assets/decor-royal.jpg";
import decorPastel from "@/assets/decor-pastel.jpg";
import decorGolden from "@/assets/decor-golden.jpg";
import decorGarden from "@/assets/decor-garden.jpg";
import decorMinimal from "@/assets/decor-minimal.jpg";
import decorFestive from "@/assets/decor-festive.jpg";
import eventWedding from "@/assets/event-wedding.jpg";
import eventEngagement from "@/assets/event-engagement.jpg";
import eventBirthday from "@/assets/event-birthday.jpg";
import eventBabyshower from "@/assets/event-babyshower.jpg";
import eventCorporate from "@/assets/event-corporate.jpg";
import eventFamily from "@/assets/event-family.jpg";
import galleryStage from "@/assets/gallery-stage.jpg";
import galleryLighting from "@/assets/gallery-lighting.jpg";
import galleryDining from "@/assets/gallery-dining.jpg";

/** Website image pool; the public gallery is managed separately in MySQL. */
export const IMAGES: Record<string, string> = {
  "venue-mini": venueMini,
  "mini-lawn-dining": miniLawnDining,
  "mini-lawn-stage": miniLawnStage,
  "hero-main": heroMain,
  "garden-walkway": gardenWalkway,
  "venue-drone-day": venueDroneDay,
  "grand-stage-pink": grandStagePink,
  "grand-stage-blue": grandStageBlue,
  "grand-guest-seating": grandGuestSeating,
  "venue-grand": venueGrand,
  "front-gate": frontGate,
  "cta-evening": ctaEvening,
  "decor-royal": decorRoyal,
  "decor-pastel": decorPastel,
  "decor-golden": decorGolden,
  "decor-garden": decorGarden,
  "decor-minimal": decorMinimal,
  "decor-festive": decorFestive,
  "event-wedding": eventWedding,
  "event-engagement": eventEngagement,
  "event-birthday": eventBirthday,
  "event-babyshower": eventBabyshower,
  "event-corporate": eventCorporate,
  "event-family": eventFamily,
  "gallery-stage": galleryStage,
  "gallery-lighting": galleryLighting,
  "gallery-dining": galleryDining,

};

export const IMAGE_KEYS = Object.keys(IMAGES);

export interface Venue {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  capacityMin: number;
  capacityMax: number;
  price: number | null; // null = request a quote
  originalPrice?: number | null;
  offerLabel?: string;
  description: string;
  longDescription: string;
  idealFor: string[];
  amenities: string[];
  imageKey: string;
  galleryKeys: string[];
  faqs: { question: string; answer: string }[];
}

export interface Package {
  id: string;
  category: "venue" | "event" | "decor";
  name: string;
  description: string;
  inclusions: string[];
  price: number | null; // null = Request a Quote
  priceNote?: string;
  originalPrice?: number | null;
  imageKey?: string;
  popular?: boolean;
}

export interface DecorTheme {
  id: string;
  name: string;
  description: string;
  imageKey: string;
  sample: boolean;
  pricingNote: string;
}

export interface GalleryImage {
  id: string;
  imageKey: string;
  category: string;
  title: string;
}

export interface Testimonial {
  id: string;
  name: string;
  event: string;
  quote: string;
}

export interface EventCategory {
  id: string;
  name: string;
  blurb: string;
  imageKey: string;
  slug: string;
}

export interface SiteSettings {
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  mapsQuery: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerImageKey: string;
}

export const CATEGORIES = ["All", "Mini Lawn", "Grand Lawn", "Wedding Decorations", "Stage Setup", "Events"];

export const seedVenues: Venue[] = [
  {
    id: "v-mini",
    slug: "mini-lawn",
    name: "Mauli Mini Lawn",
    tagline: "Intimate celebrations, beautifully close",
    capacityMin: 50,
    capacityMax: 100,
    price: 25000,
    description:
      "An intimate, charming and private green space designed for beautiful celebrations with your closest family and friends.",
    longDescription:
      "Mauli Mini Lawn is a warm, private green corner of the venue — perfect when the guest list is personal and every face matters. The lawn holds elegant seating for up to 100 guests, with gentle lighting and a layout that keeps everyone close to the celebration.",
    idealFor: ["Birthdays", "Baby Showers", "Engagements", "Family Gatherings"],
    amenities: ["Private open-air lawn", "Space for 50–100 guests", "Additional facilities confirmed on inquiry"],
    imageKey: "venue-mini",
    galleryKeys: ["venue-mini", "mini-lawn-dining", "mini-lawn-stage"],
    faqs: [
      { question: "How many guests can the Mini Lawn host?", answer: "The Mini Lawn comfortably seats 50–100 guests for seated functions." },
      { question: "Is decoration included?", answer: "Basic setup is included; decor themes are available separately through our decor partners." },
      { question: "Is parking available?", answer: "Yes, there is convenient on-site parking for guests." },
    ],
  },
  {
    id: "v-grand",
    slug: "grand-lawn",
    name: "Mauli Grand Lawn",
    tagline: "Grand weddings on a sweeping green stage",
    capacityMin: 100,
    capacityMax: 700,
    price: 71000,
    originalPrice: 151000,
    offerLabel: "Special Opening Offer",
    description:
      "A magnificent open-air lawn for grand weddings, receptions and large gatherings — with a stage, sound, changing rooms and everything your celebration needs.",
    longDescription:
      "Mauli Grand Lawn is our flagship space — a sweeping green lawn built for weddings that fill the evening with music, light and laughter. It features an 800 sq. ft. stage, a full sound setup with four speakers and two microphones, two changing rooms, chairs and tables for large guest lists, and dependable generator power backup.",
    idealFor: ["Grand Weddings", "Receptions", "Corporate Events", "Large Gatherings"],
    amenities: [
      "800 sq. ft. Stage",
      "Four Speakers and Two Microphones",
      "Two Changing Rooms",
      "Chairs and Tables",
      "Ample Parking",
      "Generator Power Backup",
      "Kitchen Setup",
    ],
    imageKey: "venue-grand",
    galleryKeys: ["venue-grand", "grand-stage-pink", "grand-stage-blue", "garden-walkway", "grand-guest-seating"],
    faqs: [
      { question: "How many guests can the Grand Lawn host?", answer: "The Grand Lawn hosts 100–700 guests, seated or in flowing layouts." },
      { question: "Is there power backup?", answer: "Yes, a generator provides full power backup throughout your event." },
      { question: "Can we arrange catering?", answer: "A kitchen setup is available on-site; catering can be arranged through vendors of your choice." },
    ],
  },
];

export const seedPackages: Package[] = [
  {
    id: "p-mini-rental",
    category: "venue",
    name: "Mini Lawn Venue Rental",
    description: "Venue rental of the intimate Mauli Mini Lawn for your celebration.",
    inclusions: [
      "Lawn rental (timings confirmed by team)",
      "1 speaker & 1 microphone",
      "Two changing rooms",
      "Chairs and tables",
      "Kitchen area — 500 sq. ft.",
      "Separate washrooms available",
      "Water available",
      "Generator power backup",
    ],
    price: 25000,
    imageKey: "venue-mini",
  },
  {
    id: "p-grand-rental",
    category: "venue",
    name: "Grand Lawn Venue Rental",
    description: "Venue rental of the flagship Mauli Grand Lawn with the listed facilities.",
    inclusions: [
      "Guest capacity: 100–700 + 200 additional floating guests",
      "Lawn rental (timings confirmed by team)",
      "800 sq. ft. stage",
      "4 speakers & 2 microphones",
      "Two changing rooms",
      "Chairs and tables",
      "Kitchen area — 500 sq. ft.",
      "Separate washrooms available",
      "Water available",
      "Generator power backup",
    ],
    price: 71000,
    originalPrice: 151000,
    priceNote: "Special Opening Offer",
    imageKey: "venue-grand",
    popular: true,
  },
  {
    id: "p-wedding-package",
    category: "event",
    name: "Grand Wedding Package",
    description: "Venue, stage setup and coordination for a full wedding celebration.",
    inclusions: ["Grand Lawn rental", "Stage & mandap platform", "Lighting base setup", "Sound & microphones", "Coordinator assistance"],
    price: null,
    imageKey: "event-wedding",
  },
  {
    id: "p-engagement-package",
    category: "event",
    name: "Engagement Ceremony Package",
    description: "A charming setup for ring ceremonies and engagements.",
    inclusions: ["Venue (Mini or Grand Lawn)", "Decorated stage area", "Seating for guests", "Sound system"],
    price: null,
    imageKey: "event-engagement",
  },
  {
    id: "p-birthday-package",
    category: "event",
    name: "Birthday Celebration Package",
    description: "Everything you need for a memorable garden birthday party.",
    inclusions: ["Mini Lawn rental", "Decorated backdrop", "Table arrangements", "Music & sound"],
    price: null,
    imageKey: "event-birthday",
  },
  {
    id: "p-corporate-package",
    category: "event",
    name: "Corporate Event Package",
    description: "Professional, polished setups for company functions and offsites.",
    inclusions: ["Grand or Mini Lawn", "Stage & podium", "AV setup", "Cocktail table arrangements"],
    price: null,
    imageKey: "event-corporate",
  },
  {
    id: "p-decor-royal",
    category: "decor",
    name: "Royal Traditional Wedding Decor",
    description: "Rich reds, golds and marigold grandeur — sample decor theme.",
    inclusions: ["Mandap florals & drapes", "Stage dressing", "Entrance decor", "Aisle styling"],
    price: null,
    imageKey: "decor-royal",
  },
  {
    id: "p-decor-pastel",
    category: "decor",
    name: "Pastel Floral Elegance Decor",
    description: "Soft blush, peach and ivory florals — sample decor theme.",
    inclusions: ["Pastel mandap florals", "Drapes & hanging florals", "Stage styling", "Photo corner"],
    price: null,
    imageKey: "decor-pastel",
  },
];

export const seedDecorThemes: DecorTheme[] = [
  {
    id: "d-royal",
    name: "Royal Traditional Wedding",
    description: "Regal reds and antique golds — ornate garlands, velvet drapes and a majestic mandap for a wedding steeped in tradition.",
    imageKey: "decor-royal",
    sample: true,
    pricingNote: "Request a Quote",
  },
  {
    id: "d-pastel",
    name: "Pastel Floral Elegance",
    description: "Blush, peach and ivory blooms with sheer drapes and hanging florals — soft, romantic and effortlessly graceful.",
    imageKey: "decor-pastel",
    sample: true,
    pricingNote: "Request a Quote",
  },
  {
    id: "d-golden",
    name: "Golden Evening Reception",
    description: "Chandeliers, candlelight and champagne-gold drapery for a reception that glows long into the night.",
    imageKey: "decor-golden",
    sample: true,
    pricingNote: "Request a Quote",
  },
  {
    id: "d-garden",
    name: "Garden Engagement",
    description: "A white-and-green floral arch, petal aisle and wooden chairs — an unhurried garden celebration of your promise.",
    imageKey: "decor-garden",
    sample: true,
    pricingNote: "Request a Quote",
  },
  {
    id: "d-minimal",
    name: "Minimal Elegant Stage",
    description: "Clean lines, orchids and warm neutral light — understated luxury for modern celebrations.",
    imageKey: "decor-minimal",
    sample: true,
    pricingNote: "Request a Quote",
  },
  {
    id: "d-festive",
    name: "Festive Celebration",
    description: "Marigold garlands, brass lanterns and rangoli-inspired colour — joyous decor for festive evenings.",
    imageKey: "decor-festive",
    sample: true,
    pricingNote: "Request a Quote",
  },
];

export const seedGallery: GalleryImage[] = [];

export const seedTestimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Sample Testimonial — A. Deshmukh",
    event: "Wedding, Grand Lawn",
    quote:
      "The lawn looked magical by evening — the lights, the stage, the space for our 500 guests. The team walked us through every detail before the big day.",
  },
  {
    id: "t2",
    name: "Sample Testimonial — S. Kulkarni",
    event: "Engagement, Mini Lawn",
    quote:
      "Perfect size for our engagement of 80 people. Private, green and beautifully maintained. Coordination over WhatsApp was quick and clear.",
  },
  {
    id: "t3",
    name: "Sample Testimonial — R. Shaikh",
    event: "Corporate Event, Grand Lawn",
    quote:
      "We hosted our annual day here. Sound and stage setup were exactly as promised, and parking was effortless for our guests.",
  },
];

export const seedEventCategories: EventCategory[] = [
  { id: "e1", slug: "weddings", name: "Grand Weddings", blurb: "Baraats, mandaps and receptions on a sweeping green stage — weddings that fill the night with light and music.", imageKey: "event-wedding" },
  { id: "e2", slug: "engagements", name: "Engagement Ceremonies", blurb: "Ring exchanges and roka ceremonies in a garden setting made for photographs and togetherness.", imageKey: "event-engagement" },
  { id: "e3", slug: "birthdays", name: "Birthday Celebrations", blurb: "Cake tables under fairy lights, pastel backdrops and open sky — birthdays that feel effortlessly special.", imageKey: "event-birthday" },
  { id: "e4", slug: "baby-showers", name: "Baby Showers", blurb: "Traditional seemanth and godh bharai functions with soft florals, brass bells and family warmth.", imageKey: "event-babyshower" },
  { id: "e5", slug: "corporate", name: "Corporate Events", blurb: "Polished open-air setups for annual days, offsites and celebrations with professional AV support.", imageKey: "event-corporate" },
  { id: "e6", slug: "family-gatherings", name: "Family Gatherings", blurb: "Long banquet tables, lounge seating and golden afternoons — reunions that stretch beautifully.", imageKey: "event-family" },
];

export const seedSettings: SiteSettings = {
  whatsapp: "919254245454",
  phone: "+91 92542 45454",
  email: "",
  address: "Wagholi–Lohegaon Road, In front of Rohan Abhilasha Society, Wagholi, Pune – 412207",
  mapsQuery: "Mauli Lawns, Wagholi Lohegaon Road, Pune 412207",
  bannerTitle: "Where Beautiful Celebrations Begin",
  bannerSubtitle: "From intimate gatherings to grand weddings, celebrate your special moments at Mauli Lawns.",
  bannerImageKey: "hero-main",
};

export const WHY_CHOOSE = [
  { title: "Beautiful Open-Air Venue", description: "Manicured green lawns under open Pune skies, ready for any celebration." },
  { title: "Spacious Parking", description: "Ample on-site parking keeps arrivals and departures effortless." },
  { title: "Stage and Sound Facilities", description: "An 800 sq. ft. stage with speakers and microphones ready for your programme." },
  { title: "Bride and Groom Changing Rooms", description: "Private, comfortable changing rooms for the couple and family." },
  { title: "Power Backup", description: "Generator backup keeps your celebration bright, whatever happens." },
  { title: "Kitchen Area", description: "On-site kitchen setup that makes catering arrangements simple." },
  { title: "Villa & Swimming Pool", description: "A welcoming villa with a swimming pool for relaxing and spending time with family around your celebration." },
];

/** Indian Rupee formatting, e.g. ₹71,000 */
export function formatINR(amount: number | null): string {
  if (amount == null) return "Request a Quote";
  return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);
}

/** Display Indian phone numbers in easy-to-read pairs. */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return local.length === 10 ? local.match(/.{2}/g)!.join(" ") : phone;
}
