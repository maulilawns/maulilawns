import { IMAGES, seedSettings } from "@/data/catalog";

export const SITE_URL = "https://maulilawns.com";
export const SEO_PAGES: Record<string, { title: string; description: string }> = {
  "/": {
    "title": "Wedding Lawns in Wagholi, Pune | Mauli Lawns",
    "description": "Discover Mauli Lawns in Wagholi, Pune, offering beautiful wedding lawns and event spaces for marriages, engagements, birthdays and special celebrations."
  },
  "/about": {
    "title": "About Mauli Lawns | Wedding Venue in Wagholi, Pune",
    "description": "Discover Mauli Lawns, a wedding venue on Wagholi–Lohegaon Road in Pune. Explore our open-air lawns, celebration spaces and thoughtful event facilities."
  },
  "/venues": {
    "title": "Wedding & Event Lawns in Wagholi | Mauli Lawns",
    "description": "Explore wedding and event lawns in Wagholi, Pune. Compare Mauli Mini Lawn for intimate functions and Grand Lawn for weddings, receptions and gatherings."
  },
  "/packages": {
    "title": "Wedding Lawn Packages in Wagholi | Mauli Lawns",
    "description": "Explore wedding lawn packages in Wagholi, Pune, with Mini and Grand Lawn rentals, stage, sound and practical facilities. Contact Mauli Lawns for details."
  },
  "/events": {
    "title": "Wedding & Party Event Venue in Pune | Mauli Lawns",
    "description": "Plan weddings, engagements, birthdays, baby showers, corporate events and family functions at Mauli Lawns, an open-air event venue in Wagholi, Pune."
  },
  "/facilities": {
    "title": "Wedding Lawn Facilities in Wagholi | Mauli Lawns",
    "description": "Explore wedding lawn facilities at Mauli Lawns in Wagholi, Pune, including stage, sound, changing rooms, parking, kitchen space and generator backup."
  },
  "/gallery": {
    "title": "Wedding Lawn Photos & Gallery | Mauli Lawns Pune",
    "description": "Browse wedding lawn photos from Mauli Lawns in Wagholi, Pune. View real Mini Lawn celebrations, Grand Lawn seating, illuminated stages and garden spaces."
  },
  "/contact": {
    "title": "Contact Mauli Lawns | Wedding Lawn Booking in Wagholi",
    "description": "Contact Mauli Lawns for wedding lawn booking in Wagholi, Pune. Share your event date, guest count and venue preference to discuss your celebration."
  },
  "/venues/mini-lawn": {
    "title": "Mini Lawn for Small Events in Wagholi | Mauli Lawns",
    "description": "Discover Mauli Mini Lawn in Wagholi, Pune, for 50–100 guests. Plan birthdays, engagements and family functions with a stage, sound and changing rooms."
  },
  "/venues/grand-lawn": {
    "title": "Grand Wedding Lawn in Wagholi, Pune | Mauli Lawns",
    "description": "Explore Mauli Grand Lawn in Wagholi, Pune, for 100–700 guests plus 200 floating guests, with a 500 sq. ft. stage, sound, changing rooms and power backup."
  },
  "/decor-themes": {
    "title": "Wedding Decor Themes in Wagholi, Pune | Mauli Lawns",
    "description": "Explore sample wedding decor themes at Mauli Lawns in Wagholi, Pune, from traditional mandaps to pastel floral styling. Enquire about your event decor."
  },
  "/privacy": {
    "title": "Privacy Policy | Mauli Lawns, Wagholi Pune",
    "description": "Read the Mauli Lawns privacy policy to learn how event enquiry details, browser storage and external services are handled, and how to contact our team."
  }
};

const absolute = (path: string) => new URL(path, SITE_URL).href;
export function seoHead(path: string) {
  const page = SEO_PAGES[path];
  if (!page) return { meta: [{ title: "Page not found | Mauli Lawns" }, { name: "robots", content: "noindex, nofollow" }] };
  const url = absolute(path);
  const image = absolute(IMAGES["hero-main"]!);
  const graph: object[] = [];
  if (path === "/") graph.push({ "@type": "WebSite", "@id": SITE_URL + "/#website", url, name: "Mauli Lawns", inLanguage: "en-IN", publisher: { "@id": SITE_URL + "/#business" } });
  else {
    const crumbs = [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" }];
    if (path.startsWith("/venues/")) crumbs.push({ "@type": "ListItem", position: 2, name: "Our Venues", item: SITE_URL + "/venues" });
    crumbs.push({ "@type": "ListItem", position: crumbs.length + 1, name: page.title.split(" | ")[0] ?? page.title, item: url });
    graph.push({ "@type": "BreadcrumbList", itemListElement: crumbs });
  }
  return {
    meta: [
      { title: page.title },
      { name: "description", content: page.description },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: page.title },
      { property: "og:description", content: page.description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Mauli Lawns" },
      { property: "og:locale", content: "en_IN" },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:alt", content: "Mauli Lawns venue building, gardens and swimming pool in Wagholi, Pune" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: page.title },
      { name: "twitter:description", content: page.description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }],
  };
}

export const businessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "EventVenue"],
  "@id": SITE_URL + "/#business",
  name: "Mauli Lawns",
  url: SITE_URL + "/",
  telephone: "+" + seedSettings.phone.replace(/\D/g, ""),
  image: absolute(IMAGES["hero-main"]!),
  address: { "@type": "PostalAddress", streetAddress: "Wagholi-Lohegaon Road, In front of Rohan Abhilasha Society", addressLocality: "Wagholi, Pune", addressRegion: "Maharashtra", postalCode: "412207", addressCountry: "IN" },
};
