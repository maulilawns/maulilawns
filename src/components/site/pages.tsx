import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowDown,
  Leaf,
  Car,
  Mic,
  DoorOpen,
  Zap,
  Utensils,
  House,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSite, whatsappLink } from "@/data/store";
import { WHY_CHOOSE, formatINR, formatPhone, type Venue } from "@/data/catalog";
import { LiveGallery as Gallery } from "./gallery";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { EnquireButton, FloatingWhatsApp, StickyMobileEnquiry } from "./whatsapp";
import { BotanicalBranch, Reveal, SectionHeading } from "./reveal";
import breadcrumbMandap from "@/assets/breadcrumb-mandap.webp";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
export function Photo({
  name,
  alt,
  className = "",
  priority = false,
}: {
  name: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const { img } = useSite();
  const src = img(name);
  return src ? (
    <img
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      src={src}
      alt={alt}
      className={className}
    />
  ) : null;
}
export function PageIntro({
  title,
  eyebrow,
  description,
}: {
  title: string;
  eyebrow: string;
  description?: string;
}) {
  return (
    <header className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      <img src={breadcrumbMandap} className="intro-mandap" alt="" aria-hidden="true" width={1000} height={755} decoding="async" />
    </header>
  );
}
export function VenueSection({ venue, index = 0 }: { venue: Venue; index?: number }) {
  return (
    <Reveal className={`venue-feature ${index % 2 ? "reverse" : ""}`}>
      <Link to="/venues/$slug" params={{ slug: venue.slug }} className="img-zoom venue-photo">
        <Photo name={venue.imageKey} alt={`${venue.name} outdoor celebration setting`} />
      </Link>
      <div className="venue-info">
        <p className="eyebrow">0{index + 1} / OUR SIGNATURE SPACES</p>
        <h3>{venue.name}</h3>
        <p className="venue-tagline">{venue.tagline}</p>
        <p>{venue.description}</p>
        <div className="venue-facts">
          <span>
            {venue.capacityMin}–{venue.capacityMax}
            <small>GUESTS</small>
          </span>
        </div>
        <Link className="text-link" to="/venues/$slug" params={{ slug: venue.slug }}>
          Explore the venue <ArrowRight size={16} />
        </Link>
        <EnquireButton interestedIn={venue.name} variant="outline" />
      </div>
    </Reveal>
  );
}
export function Amenities() {
  const icons = [Leaf, Car, Mic, DoorOpen, Zap, Utensils, House];
  return (
    <section className="section amenities">
      <SectionHeading
        eyebrow="THOUGHTFULLY TAKEN CARE OF"
        title="A little more ease."
        italic="A lot more joy."
      />
      <div className="amenity-grid">
        {WHY_CHOOSE.map((f, i) => {
          const Icon = icons[i]!;
          return (
            <Reveal key={f.title} delay={i * 0.05}>
              <Icon />
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
export function Location() {
  const { data } = useSite();
  return (
    <section className="section location">
      <div>
        <p className="eyebrow">CLOSER THAN YOU IMAGINE</p>
        <h2>
          A beautiful destination.
          <br />
          <em>Right here in Wagholi.</em>
        </h2>
        <p>{data.settings.address}</p>
        <a
          className="text-link"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.settings.mapsQuery)}`}
          target="_blank"
          rel="noreferrer"
        >
          Get directions <ArrowRight size={16} />
        </a>
        <a href={`tel:${data.settings.phone.replace(/\s/g, "")}`}>{formatPhone(data.settings.phone)}</a>
      </div>
      <iframe
        loading="lazy"
        title="Mauli Lawns location in Wagholi, Pune"
        src={`https://maps.google.com/maps?q=${encodeURIComponent(data.settings.mapsQuery)}&output=embed`}
      />
    </section>
  );
}
export function FinalCTA() {
  return (
    <section className="final-cta">
      <Photo name="cta-evening" alt="Warm evening wedding celebration under lights" />
      <div>
        <p className="eyebrow eyebrow-light">LET'S MAKE IT UNFORGETTABLE</p>
        <h2>
          Your Dream Celebration Deserves
          <br />
          <em>a Beautiful Beginning</em>
        </h2>
        <Link className="button" to="/contact">
          Plan Your Event <ArrowRight size={16} />
        </Link>
        <EnquireButton
          interestedIn="planning my celebration"
          label="WhatsApp Us"
          variant="outline"
        />
      </div>
    </section>
  );
}
export { LiveGallery as Gallery } from "./gallery";
export function Testimonials() {
  const { data } = useSite();
  const [index, setIndex] = useState(0);
  const t = data.testimonials[index % Math.max(data.testimonials.length, 1)];
  if (!t) return null;
  return (
    <section className="section testimonial">
      <p className="eyebrow">WORDS OF CELEBRATION · SAMPLE TESTIMONIALS</p>
      <span className="quote-mark">“</span>
      <blockquote>{t.quote}</blockquote>
      <p>{t.name}</p>
      <small>{t.event}</small>
      <div className="carousel-buttons">
        <button
          aria-label="Previous testimonial"
          onClick={() =>
            setIndex((index + data.testimonials.length - 1) % data.testimonials.length)
          }
        >
          <ChevronLeft />
        </button>
        <button
          aria-label="Next testimonial"
          onClick={() => setIndex((index + 1) % data.testimonials.length)}
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
export function Home() {
  const { data } = useSite();
  const [slide, setSlide] = useState(0);
  const grand = data.venues.find((v) => v.slug === "grand-lawn");
  return (
    <>
      <section className="hero">
        <Photo
          name={slide === 0 ? data.settings.bannerImageKey : "cta-evening"}
          alt={
            slide === 0
              ? "Aerial view of Mauli Lawns with the venue building, lush gardens, palm trees and swimming pool"
              : "Evening wedding celebration under lights"
          }
          priority
        />
        <div className="hero-shade" />
        <BotanicalBranch className="hero-botanical" />
        <div className="hero-content">
          <Reveal>
            <p className="eyebrow eyebrow-light">PREMIUM WEDDING & EVENT VENUE · WAGHOLI, PUNE</p>
            <span className="gold-divider">✦</span>
            <h1>
              {data.settings.bannerTitle === "Where Beautiful Celebrations Begin" ? (
                <>
                  Where Beautiful
                  <br />
                  Celebrations <em>Begin</em>
                </>
              ) : (
                data.settings.bannerTitle
              )}
            </h1>
            <p className="hero-description">{data.settings.bannerSubtitle}</p>
            <div className="hero-actions">
              <Link to="/venues" className="button">
                Explore Our Venues <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="button outline">
                Plan Your Celebration
              </Link>
            </div>
          </Reveal>
        </div>
        <div className="hero-bottom">
          <span>
            <MapPin size={13} /> WAGHOLI, PUNE
          </span>
          <a href="#our-story">
            SCROLL TO DISCOVER <ArrowDown size={15} />
          </a>
          <span className="hero-slides">
            <button
              aria-label="Show first venue photograph"
              aria-pressed={slide === 0}
              onClick={() => setSlide(0)}
            >
              01
            </button>
            <i />
            <button
              aria-label="Show second venue photograph"
              aria-pressed={slide === 1}
              onClick={() => setSlide(1)}
            >
              02
            </button>
          </span>
        </div>
      </section>
      <div className="promise-strip">
        <span>TWO DISTINCTIVE LAWNS</span>
        <b>✦</b>
        <span>100–700 GUESTS + 200 FLOATING GUESTS</span>
        <b>✦</b>
        <span>ENDLESS BEAUTIFUL POSSIBILITIES</span>
      </div>
      <section id="our-story" className="section story">
        <div className="story-photos">
          <Photo name="venue-mini" alt="Intimate garden lawn with floral decor" />
          <Photo name="mini-lawn-stage" alt="Mauli Mini Lawn stage with pastel balloon decor and garden seating" />
          <span className="photo-seal">
            Made for
            <br />
            <em>your moments</em>
          </span>
        </div>
        <Reveal>
          <p className="eyebrow">WELCOME TO MAULI LAWNS</p>
          <h2>
            An Extraordinary Setting for Your <em>Most Beautiful Moments</em>
          </h2>
          <p>
            Mauli Lawns is a premier open-air event venue in Wagholi, Pune, offering two distinct
            beautiful spaces for intimate gatherings and grand celebrations.
          </p>
          <p>
            Open skies. Beautiful gardens. The people you love. A setting that makes every moment
            feel a little more special.
          </p>
          <div className="story-highlights">
            <span>Two Beautiful Lawns</span>
            <span>100–700 Guests + 200 Floating Guests</span>
            <span>Convenient Wagholi Location</span>
          </div>
          <Link to="/about" className="text-link">
            Discover Our Story <ArrowRight size={16} />
          </Link>
        </Reveal>
      </section>
      <section className="section venues-section">
        <SectionHeading
          eyebrow="A SPACE FOR EVERY STORY"
          title="Two beautiful lawns."
          italic="One unforgettable celebration."
        />
        {data.venues.map((v, i) => (
          <VenueSection key={v.id} venue={v} index={i} />
        ))}
      </section>
      <section className="section event-section">
        <div className="section-top">
          <SectionHeading
            align="left"
            eyebrow="LIFE'S MOST MEANINGFUL OCCASIONS"
            title="Every occasion,"
            italic="beautifully celebrated."
          />
          <Link to="/events" className="text-link">
            All celebrations <ArrowRight size={16} />
          </Link>
        </div>
        <div className="event-bento">
          {data.eventCategories.map((e) => (
            <Link key={e.id} to="/events" hash={e.slug} className="img-zoom">
              <Photo name={e.imageKey} alt={`${e.name} event inspiration at Mauli Lawns in Wagholi, Pune`} />
              <span>
                <small>MAKE IT MEMORABLE</small>
                <h3>{e.name}</h3>
                <span>Explore Event ↗</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
      {grand && (
        <section className="offer-section">
          <div>
            <p className="eyebrow eyebrow-light">A SPECIAL OPENING INVITATION</p>
            <h2>
              Grand Celebrations,
              <br />
              <em>Exceptional Beginnings</em>
            </h2>
            <p>{grand.name}</p>
            <p>{grand.offerLabel}</p>
            <EnquireButton
              interestedIn={`${grand.name} — ${grand.offerLabel}`}
              label="Enquire About This Offer"
            />
          </div>
          <div className="offer-photo">
            <Photo name="front-gate" alt="Mauli Lawns illuminated front entrance gate at night" />
          </div>
          <BotanicalBranch className="offer-branch" />
        </section>
      )}
      <Amenities />
      <section className="section">
        <SectionHeading eyebrow="A GLIMPSE OF THE MAGIC" title="The Mauli" italic="Gallery" />
        <p className="sample-note">Photographs of our lawns, celebrations and garden spaces.</p>
        <Gallery preview />
        <div className="center">
          <Link to="/gallery" className="text-link">
            View Full Gallery <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="section journey">
        <SectionHeading
          eyebrow="YOUR CELEBRATION STARTS HERE"
          title="From a little inspiration"
          italic="to a beautiful occasion."
        />
        <div>
          {["Explore Our Venues", "Share Your Event Details", "Connect With Our Team"].map(
            (s, i) => (
              <article key={s}>
                <span>0{i + 1}</span>
                <h3>{s}</h3>
                <p>
                  {
                    [
                      <>Find a space that feels right for your occasion and your guest list. <Link to="/packages">Explore venue rental and event packages.</Link></>,
                      "Tell us your date, occasion and ideas through our inquiry form.",
                      "Our team confirms availability, inclusions and booking details directly.",
                    ][i]
                  }
                </p>
              </article>
            ),
          )}
        </div>
      </section>
      <Testimonials />
      <Location />
      <FinalCTA />
    </>
  );
}
export function About() {
  return (
    <>
      <PageIntro
        eyebrow="THE MAULI EXPERIENCE"
        title="About Mauli Lawns in Wagholi, Pune"
        description="Beautiful open spaces, thoughtful details and celebrations that feel like you."
      />
      <section className="section story">
        <Photo
          name="garden-walkway"
          alt="Mauli Lawns garden walkway in Wagholi, Pune, with illuminated floral arches, hanging lanterns and lush greenery"
        />
        <div>
          <p className="eyebrow">OUR STORY</p>
          <h2>
            Rooted in nature.
            <br />
            <em>Made for celebration.</em>
          </h2>
          <p>
            Mauli Lawns brings two distinctive open-air spaces to Wagholi, Pune. From a gathering of
            50 to a celebration of 700, choose a setting that gives your occasion room to unfold.
          </p>
          <p>
            Our Mini Lawn welcomes intimate occasions. Our Grand Lawn brings weddings, receptions
            and large gatherings together with stage, sound and practical facilities.
          </p>
          <Link className="text-link" to="/venues">
            Find your space <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <Amenities />
      <FinalCTA />
    </>
  );
}
export function Venues() {
  const { data } = useSite();
  return (
    <>
      <PageIntro
        eyebrow="OUR SIGNATURE SPACES"
        title="Wedding & Event Lawns in Wagholi"
        description="Intimate or extraordinary. Two open-air lawns for your unique celebration."
      />
      <section className="section">
        {data.venues.map((v, i) => (
          <VenueSection key={v.id} venue={v} index={i} />
        ))}
      </section>
      <FinalCTA />
    </>
  );
}
export function VenueDetails({ slug }: { slug: string }) {
  const { data, img } = useSite();
  const v = data.venues.find((v) => v.slug === slug);
  if (!v) return <PageIntro eyebrow="VENUE NOT FOUND" title="Let's find your perfect space." />;
  const rentalPackageId = {
    "mini-lawn": "p-mini-rental",
    "grand-lawn": "p-grand-rental",
  }[slug];
  const rentalPackage = data.packages.find(
    (p) => p.category === "venue" && p.id === rentalPackageId,
  );
  // Keep venue facilities aligned with the package, including saved package edits.
  const packageFacilities = rentalPackage?.inclusions.filter(
    (inclusion) => !/^lawn rental\b/i.test(inclusion),
  );
  const facilities = packageFacilities?.length
    ? [...new Set([
        ...packageFacilities,
        ...v.amenities.filter((amenity) => /parking/i.test(amenity)),
      ])]
    : v.amenities;
  return (
    <>
      <section className="detail-hero">
        <Photo name={v.imageKey} alt={`${v.name} event venue in Wagholi, Pune`} priority />
        <div>
          <p className="eyebrow eyebrow-light">MAULI LAWNS · WAGHOLI</p>
          <h1>{v.name}</h1>
          <p>{v.tagline}</p>
        </div>
      </section>
      <section className="section detail-layout">
        <div>
          <p className="eyebrow">YOUR CELEBRATION, YOUR SPACE</p>
          <h2>
            A beautiful canvas
            <br />
            <em>for your memories.</em>
          </h2>
          <p>{v.longDescription}</p>
          <h3>Included facilities</h3>
          <ul className="inclusions">
            {facilities.map((a) => (
              <li key={a}>✓ {a}</li>
            ))}
          </ul>
          <h3>Perfect for</h3>
          <p>{v.idealFor.join(" · ")}</p>
          <div className={`detail-photos ${v.id === "v-mini" ? "mini-lawn-photos" : ""}`}>
            {v.galleryKeys
              .filter((key) => img(key))
              .map((k) => (
                <figure key={k}>
                  <Photo
                    name={k}
                    alt={
                      v.id === "v-mini"
                        ? ({
                            "venue-mini":
                              "Mini Lawn with pastel balloon backdrop, purple aisle carpet and white ceremony seating",
                            "mini-lawn-dining":
                              "Mini Lawn celebration with round dining tables and a pastel balloon stage",
                            "mini-lawn-stage":
                              "Mini Lawn garden stage with pastel balloons, white seating and a paved aisle",
                          }[k] ?? v.name)
                        : `${v.name} — ${k.replaceAll("-", " ")}`
                    }
                  />
                </figure>
              ))}
          </div>
          <h3>Frequently asked questions</h3>
          {v.faqs.filter((f) => !f.answer.includes("₹")).map((f) => (
            <details key={f.question}>
              <summary>{f.question}</summary>
              <p>{f.answer}</p>
            </details>
          ))}
          <h3>A little inspiration</h3>
          <p>Discover sample decor themes to complement your celebration.</p>
          <Link className="text-link" to="/decor-themes">
            Explore decor themes <ArrowRight size={16} />
          </Link>
        </div>
        <aside className="inquiry-panel">
          <p className="eyebrow">MAKE IT YOURS</p>
          <h3>{v.name}</h3>
          <p>
            {v.capacityMin}–{v.capacityMax} guests
          </p>
          <EnquireButton interestedIn={v.name} />
          <p className="sample-note">
            Availability, final inclusions and booking details are confirmed directly by our team.
          </p>
        </aside>
      </section>
      <StickyMobileEnquiry interestedIn={v.name} />
    </>
  );
}
export function Packages() {
  const { data } = useSite();
  const [tab, setTab] = useState("venue");
  return (
    <>
      <PageIntro
        eyebrow="THOUGHTFULLY PLANNED"
        title="Wedding Lawn & Event Packages in Wagholi"
        description="Explore venue rentals and sample event concepts. Our team helps you confirm the details."
      />
      <section className="section">
        <div className="filters">
          {[
            ["venue", "Venue Rental"],
            ["event", "Event Packages"],
            ["decor", "Decor Themes"],
          ].map(([id, name]) => (
            <button key={id} aria-pressed={tab === id} onClick={() => setTab(id || "venue")}>
              {name}
            </button>
          ))}
        </div>
        <div className="package-grid">
          {data.packages
            .filter((p) => p.category === tab)
            .map((p) => (
              <article key={p.id} className="package-card">
                {p.imageKey && <Photo name={p.imageKey} alt={p.name} />}
                <div>
                  {p.popular && <p className="eyebrow">SPECIAL OPENING OFFER</p>}
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <ul className="inclusions">
                    {p.inclusions.map((i) => (
                      <li key={i}>✓ {i}</li>
                    ))}
                  </ul>
                  {p.category !== "venue" && (
                    <p className="sample-note">Sample package · final scope by quotation</p>
                  )}
                  <EnquireButton interestedIn={p.name} />
                </div>
              </article>
            ))}
        </div>
        <p className="sample-note">
          Please confirm timings, facilities, taxes and final pricing with the venue team before
          booking.
        </p>
      </section>
      <FinalCTA />
    </>
  );
}
export function Decor() {
  const { data } = useSite();
  return (
    <>
      <PageIntro
        eyebrow="THE ART OF CELEBRATION"
        title="Wedding Decor Themes in Wagholi"
        description="A visual moodboard for your celebration. All themes shown are sample concepts; actual photographs and pricing are to be supplied."
      />
      <section className="section decor-grid">
        {data.decorThemes.map((d, i) => (
          <article key={d.id}>
            <div className="img-zoom">
              <Photo name={d.imageKey} alt={`${d.name} sample decor concept`} />
            </div>
            <div>
              <p className="eyebrow">0{i + 1} / SAMPLE THEME</p>
              <h3>{d.name}</h3>
              <p>{d.description}</p>
              <EnquireButton interestedIn={d.name} label="Request a Quote" variant="outline" />
            </div>
          </article>
        ))}
      </section>
      <FinalCTA />
    </>
  );
}
export function Events() {
  const { data } = useSite();
  return (
    <>
      <PageIntro eyebrow="A REASON TO COME TOGETHER" title="Weddings & Celebrations in Wagholi, Pune" />
      <section className="section">
        {data.eventCategories.map((e, i) => (
          <article id={e.slug} className={`event-row ${i % 2 ? "reverse" : ""}`} key={e.id}>
            <Photo name={e.imageKey} alt={`${e.name} event inspiration at Mauli Lawns in Wagholi, Pune`} />
            <div>
              <p className="eyebrow">CELEBRATION / 0{i + 1}</p>
              <h2>{e.name}</h2>
              <p>{e.blurb} <Link to="/contact">Contact us to plan your {e.name.toLowerCase()}.</Link></p>
              <EnquireButton interestedIn={e.name} eventType={e.name} />
            </div>
          </article>
        ))}
      </section>
      <FinalCTA />
    </>
  );
}
export function Contact() {
  const { data } = useSite();
  const [ready, setReady] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <PageIntro
        eyebrow="LET'S BEGIN SOMETHING BEAUTIFUL"
        title="Contact Mauli Lawns for Your Celebration"
        description="Share a few details. We'll help you explore availability and plan the next step."
      />
      <section className="section contact-layout">
        <div>
          <p className="eyebrow">WE'D LOVE TO HEAR FROM YOU</p>
          <h2>
            Every beautiful beginning
            <br />
            <em>starts with a conversation.</em>
          </h2>
          <p>{data.settings.address}</p>
          <a className="contact-phone" href={`tel:${data.settings.phone.replace(/\s/g, "")}`}>
            {formatPhone(data.settings.phone)}
          </a>
          <EnquireButton interestedIn="planning an event" />
          <p className="sample-note">
            Inquiry only. Our team confirms availability and booking arrangements directly. No
            online payments.
          </p>
        </div>
        <form
          className="inquiry-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (sending) return;
            const form = e.currentTarget;
            const f = new FormData(form);
            if (f.get("botcheck")) return;
            const href = whatsappLink(
              data.settings.whatsapp,
              `${f.get("venue")} | Name: ${f.get("name")} | Phone: ${f.get("phone")} | Notes: ${f.get("notes")}`,
              {
                eventType: String(f.get("type")),
                eventDate: String(f.get("date")),
                guests: String(f.get("guests")),
              },
            );
            setReady(href);
            setSending(true);
            setSent(false);
            setError("");
            f.set("access_key", "7a7fd86f-7490-456e-b057-e25b3d6c6d70");
            f.set("subject", "New event enquiry — Mauli Lawns");
            f.set("from_name", "Mauli Lawns Website");
            try {
              const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: f,
                signal: AbortSignal.timeout(20000),
              });
              const result = await response.json();
              if (!response.ok || !result.success) throw new Error("Submission failed");
              setSent(true);
              form.reset();
            } catch {
              setError("We couldn't confirm your enquiry was sent. Please try again or contact us on WhatsApp.");
            } finally {
              setSending(false);
            }
          }}
        >
          <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" style={{ display: "none" }} aria-hidden="true" />
          <label>
            Your name
            <input name="name" required autoComplete="name" placeholder="Full name" />
          </label>
          <label>
            Phone number
            <input
              name="phone"
              required
              type="tel"
              autoComplete="tel"
              placeholder="Your contact number"
            />
          </label>
          <label>
            Event date
            <input name="date" type="date" required min={new Date().toLocaleDateString("en-CA")} />
          </label>
          <label>
            Event type
            <select name="type">
              {data.eventCategories.map((e) => (
                <option key={e.id}>{e.name}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          </label>
          <label>
            Expected guests
            <input name="guests" type="number" min="1" max="700" required placeholder="e.g. 200" />
          </label>
          <label>
            Preferred venue
            <select name="venue">
              <option>Help me choose</option>
              {data.venues.map((v) => (
                <option key={v.id}>{v.name}</option>
              ))}
            </select>
          </label>
          <label className="full">
            Anything you'd like us to know?
            <textarea name="notes" rows={3} placeholder="Share your ideas…" />
          </label>
          <button className="button full" type="submit" disabled={sending} aria-busy={sending}>
            {sending ? "Sending enquiry…" : "Send Enquiry"} <ArrowRight size={16} />
          </button>
          {sent && <p className="full" role="status">Thank you! Your enquiry has been sent. Our team will contact you to discuss your celebration.</p>}
          {error && <p className="full" role="alert">{error}</p>}
          {ready && !sending && (
            <p className="full" role="status">
              Prefer to chat?{" "}
              <a className="text-link" href={ready} target="_blank" rel="noreferrer">
                Continue in WhatsApp ↗
              </a>
            </p>
          )}
        </form>
      </section>
      <Location />
    </>
  );
}
export function Privacy() {
  const { data } = useSite();
  const sections = [
    {
      id: "enquiries",
      title: "Information you share",
      text: "When you make an enquiry, you may share your name, phone number, event date, event type, expected guest count, preferred venue and any additional notes. Please share only the information needed to help us understand your celebration.",
    },
    {
      id: "whatsapp",
      title: "Enquiries through WhatsApp",
      text: "Our contact form prepares a WhatsApp message using the details you enter. You can review the message in WhatsApp before sending it. The venue uses the details you send to respond to your enquiry and discuss availability and event arrangements. Sending an enquiry does not confirm a booking or make a payment.",
    },
    {
      id: "storage",
      title: "Browser storage & site features",
      text: "The website uses browser local storage to remember site content settings in your browser. The administration area uses session cookies for signed-in access. You can manage cookies and clear stored site data in your browser settings; doing so may reset saved settings or sign you out of the administration area.",
    },
    {
      id: "external-services",
      title: "External services & links",
      text: "Contact form enquiries are processed by Web3Forms and delivered to our team by email. WhatsApp handles messages sent through its platform, and embedded Google Maps provides location information. These providers process information according to their own privacy policies. Links to external websites take you to services managed by their respective operators.",
    },
    {
      id: "photographs",
      title: "Photographs on this website",
      text: "Our gallery shows venue spaces, decorations and event arrangements. If you have a privacy concern about a photograph displayed on the website, contact the venue and identify the image so the team can review your request.",
    },
    {
      id: "your-choices",
      title: "Your choices & questions",
      text: "You can choose which details to include in your enquiry. To ask about information you have shared, request a correction or removal, or raise a question about this page, contact Mauli Lawns using the details below. Please avoid including sensitive personal information in general enquiry messages.",
    },
  ];
  return (
    <>
      <PageIntro
        eyebrow="YOUR PRIVACY MATTERS"
        title="Privacy policy."
        description="How information is shared when you explore our venue and plan your celebration."
      />
      <div className="privacy-layout">
        <aside className="privacy-sidebar">
          <nav aria-label="Privacy policy sections">
            <p className="eyebrow">ON THIS PAGE</p>
            <ol>
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span className="privacy-nav-number">0{index + 1}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="privacy-sidebar-note">
            <span className="eyebrow">HERE TO HELP</span>
            <p>Have a question about your information?</p>
            <a href="#privacy-contact" className="privacy-contact-link">
              Contact the venue <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </aside>
        <article className="privacy-document" aria-label="Mauli Lawns privacy policy">
          <div className="privacy-overview">
            <span className="eyebrow">AT A GLANCE</span>
            <h2>A little clarity, before you enquire.</h2>
            <p>
              This page explains the information you may share with Mauli Lawns, how our
              website features work and how to reach us with a privacy question.
            </p>
          </div>
          {sections.map((section, index) => (
            <section className="privacy-section" id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
              <span className="privacy-section-number" aria-hidden="true">0{index + 1}</span>
              <div>
                <h2 id={`${section.id}-title`}>{section.title}</h2>
                <p>{section.text}</p>
              </div>
            </section>
          ))}
          <section className="privacy-contact" id="privacy-contact" aria-labelledby="privacy-contact-title">
            <span className="eyebrow">LET’S TALK</span>
            <h2 id="privacy-contact-title">Contact Mauli Lawns</h2>
            <p>{data.settings.address}</p>
            <div className="privacy-contact-actions">
              <a className="button" href={`tel:${data.settings.phone.replace(/\s/g, "")}`}>
                Call {formatPhone(data.settings.phone)}
              </a>
              <a
                className="privacy-contact-link"
                href={whatsappLink(data.settings.whatsapp, "a privacy question")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Message on WhatsApp <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}
