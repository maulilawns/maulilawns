import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSite } from "@/data/store";
import { LayoutDashboard, ArrowUpRight, Plus, Trash2, Save } from "lucide-react";
type RecordData = Record<string, unknown>;
const modules = [
  "Dashboard",
  "Venues",
  "Packages",
  "Categories",
  "Decor Themes",
  "Gallery",
  "Homepage Banners",
  "Testimonials",
  "Website Settings",
];
export function Admin() {
  const store = useSite();
  const { data } = store;
  const [module, setModule] = useState("Dashboard");
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [message, setMessage] = useState("");
  const collections = {
    Venues: { rows: data.venues, save: store.setVenues },
    Packages: { rows: data.packages, save: store.setPackages },
    Categories: { rows: data.eventCategories, save: store.setEventCategories },
    "Decor Themes": { rows: data.decorThemes, save: store.setDecorThemes },
    Gallery: { rows: data.gallery, save: store.setGallery },
    Testimonials: { rows: data.testimonials, save: store.setTestimonials },
  };
  const collection = collections[module as keyof typeof collections];
  const saveRows = (rows: RecordData[]) => {
    if (collection) (collection.save as (rows: unknown[]) => void)(rows);
  };
  const isSettings = module === "Website Settings" || module === "Homepage Banners";
  const settingKeys = Object.keys(data.settings).filter((k) =>
    module === "Homepage Banners" ? k.startsWith("banner") : !k.startsWith("banner"),
  );
  const begin = (row: unknown) => {
    setEditing({
      ...(module === "Venues" || module === "Packages"
        ? { originalPrice: null, ...(module === "Venues" ? { offerLabel: "" } : {}) }
        : {}),
      ...(structuredClone(row) as RecordData),
    });
    setMessage("");
  };
  return (
    <div className="admin-shell">
      <aside>
        <Link to="/" className="admin-brand">
          Mauli <em>Lawns</em>
        </Link>
        <p className="eyebrow">CONTENT STUDIO · DEMO</p>
        <nav>
          {modules.map((m) => (
            <button
              key={m}
              aria-current={module === m ? "page" : undefined}
              onClick={() => {
                setModule(m);
                setEditing(null);
                setMessage("");
              }}
            >
              {m}
            </button>
          ))}
        </nav>
        <Link to="/">
          View website <ArrowUpRight size={16} />
        </Link>
      </aside>
      <main>
        <header>
          <div>
            <p className="eyebrow">YOUR CELEBRATION, BEAUTIFULLY MANAGED</p>
            <h1>{module}</h1>
          </div>
          <span className="demo-pill">Local demo</span>
        </header>
        <p className="admin-notice">
          Demo interface · No secure authentication or database. Changes are saved only in this
          browser.
        </p>
        {message && (
          <p className="save-message" role="status">
            {message}
          </p>
        )}
        {module === "Dashboard" && (
          <>
            <div className="admin-stats">
              {[
                ["Venues", data.venues.length],
                ["Packages", data.packages.length],
                ["Gallery images", data.gallery.length],
                ["Decor themes", data.decorThemes.length],
              ].map(([name, count]) => (
                <article key={name}>
                  <LayoutDashboard size={20} />
                  <strong>{count}</strong>
                  <span>{name}</span>
                </article>
              ))}
            </div>
            <article className="admin-welcome">
              <h2>Welcome to the Mauli content studio.</h2>
              <p>
                Keep your venues, opening offers and celebration inspiration up to date. Choose a
                module from the sidebar to edit content.
              </p>
              <p>
                All prices and inquiries on the public site use this demo content. No booking or
                payment is processed here.
              </p>
            </article>
          </>
        )}
        {collection && (
          <>
            <div className="admin-toolbar">
              <p>{collection.rows.length} entries</p>
              <button
                className="button"
                onClick={() => {
                  const first = collection.rows[0];
                  const templates: Record<string, RecordData> = {
                    Venues: {
                      id: "",
                      slug: "new-venue",
                      name: "New Venue",
                      tagline: "Your celebration space",
                      capacityMin: 50,
                      capacityMax: 100,
                      price: null,
                      description: "",
                      longDescription: "",
                      idealFor: [],
                      amenities: [],
                      imageKey: "venue-mini",
                      galleryKeys: [],
                      faqs: [],
                    },
                    Packages: {
                      id: "",
                      name: "New Package",
                      category: "event",
                      description: "",
                      inclusions: [],
                      price: null,
                      imageKey: "venue-mini",
                    },
                    Categories: {
                      id: "",
                      name: "New Category",
                      slug: "new-category",
                      blurb: "",
                      imageKey: "event-wedding",
                    },
                    "Decor Themes": {
                      id: "",
                      name: "New Theme",
                      description: "",
                      imageKey: "decor-pastel",
                      sample: true,
                      pricingNote: "Request a Quote",
                    },
                    Gallery: {
                      id: "",
                      title: "New image",
                      imageKey: "venue-mini",
                      category: "Events",
                    },
                    Testimonials: {
                      id: "",
                      name: "Sample Testimonial",
                      event: "Sample event",
                      quote: "",
                    },
                  };
                  begin({
                    ...templates[module],
                    ...(first
                      ? Object.fromEntries(Object.entries(first).filter(([k]) => k === "category"))
                      : {}),
                    id: `demo-${Date.now()}`,
                  });
                }}
              >
                <Plus size={16} /> Add entry
              </button>
            </div>
            <div className="admin-list">
              {collection.rows.map((row) => (
                <article key={row.id}>
                  <div>
                    <strong>
                      {"name" in row ? row.name : "title" in row ? row.title : "Entry"}
                    </strong>
                    <small>{row.id}</small>
                  </div>
                  <button onClick={() => begin(row)}>Edit</button>
                  <button
                    aria-label={`Delete ${row.id}`}
                    onClick={() => {
                      if (window.confirm("Remove this entry from the local demo?")) {
                        saveRows(
                          collection.rows.filter(
                            (r) => r["id"] !== row.id,
                          ) as unknown as RecordData[],
                        );
                        setMessage("Entry removed.");
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
        {isSettings && (
          <form
            className="admin-editor"
            key={module}
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const settings = { ...data.settings };
              settingKeys.forEach((k) => {
                settings[k as keyof typeof settings] = String(f.get(k) || "");
              });
              settings.whatsapp = settings.whatsapp.replace(/\D/g, "");
              store.setSettings(settings);
              setMessage("Settings saved in this browser.");
            }}
          >
            {settingKeys.map((k) => (
              <label key={k}>
                {k.replace(/([A-Z])/g, " $1")}
                <input
                  name={k}
                  defaultValue={data.settings[k as keyof typeof data.settings]}
                  required={k !== "email"}
                />
              </label>
            ))}
            <button type="submit" className="button">
              <Save size={16} /> Save settings
            </button>
            {module === "Website Settings" && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Reset all demo content?")) {
                    store.resetAll();
                    setMessage("Demo content reset.");
                  }
                }}
              >
                Reset all demo content
              </button>
            )}
          </form>
        )}
        {editing && collection && (
          <form
            className="admin-editor"
            onSubmit={(e) => {
              e.preventDefault();
              try {
                const form = new FormData(e.currentTarget);
                const result: RecordData = {};
                Object.entries(editing).forEach(([k, v]) => {
                  const raw = String(form.get(k) ?? "");
                  result[k] = Array.isArray(v)
                    ? k === "faqs"
                      ? JSON.parse(raw)
                      : raw
                          .split("\n")
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : typeof v === "boolean"
                      ? raw === "true"
                      : typeof v === "number" || k.toLowerCase().includes("price")
                        ? raw.trim() === ""
                          ? null
                          : Number(raw)
                        : raw;
                });
                if (
                  Object.values(result).some(
                    (v) => typeof v === "number" && (!Number.isFinite(v) || v < 0),
                  )
                )
                  throw new Error("Enter valid positive numbers.");
                const rows = collection.rows as unknown as RecordData[];
                saveRows(
                  rows.some((r) => r["id"] === result["id"])
                    ? rows.map((r) => (r["id"] === result["id"] ? result : r))
                    : [...rows, result],
                );
                setEditing(null);
                setMessage("Changes saved in this browser.");
              } catch {
                setMessage("Check numeric fields and FAQ JSON before saving.");
              }
            }}
          >
            <h2>Edit entry</h2>
            {Object.entries(editing).map(([k, v]) => (
              <label key={k}>
                {k.replace(/([A-Z])/g, " $1")}
                {Array.isArray(v) ? (
                  <textarea
                    name={k}
                    rows={4}
                    defaultValue={k === "faqs" ? JSON.stringify(v, null, 2) : v.join("\n")}
                  />
                ) : typeof v === "boolean" ? (
                  <select name={k} defaultValue={String(v)}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <input
                    name={k}
                    readOnly={k === "id"}
                    required={["name", "title", "slug"].includes(k)}
                    type={
                      typeof v === "number" || k.toLowerCase().includes("price") ? "number" : "text"
                    }
                    min={0}
                    defaultValue={v == null ? "" : String(v)}
                  />
                )}
                <small>
                  {Array.isArray(v)
                    ? k === "faqs"
                      ? "JSON array of question / answer objects"
                      : "One item per line"
                    : k === "imageKey"
                      ? "Use an asset key below, or an image URL"
                      : k === "price"
                        ? "Leave empty for Request a Quote"
                        : ""}
                </small>
              </label>
            ))}
            <div className="admin-toolbar">
              <button className="button" type="submit">
                <Save size={16} /> Save changes
              </button>
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </form>
        )}
        {(editing || module === "Homepage Banners") && (
          <p className="sample-note">Available image keys: {store.imageKeys.join(", ")}</p>
        )}
      </main>
    </div>
  );
}
