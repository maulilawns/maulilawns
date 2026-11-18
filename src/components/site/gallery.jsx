import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/gallery-api";
import galleryManifest from "@/assets/gallery/manifest.json";

const galleryAssets = import.meta.glob("../../assets/gallery/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
const categoryNames = {
  "grand-lawn": "Grand Lawn",
  "mini-lawn": "Mini Lawn",
  "wedding-decorations": "Wedding Decorations",
  "stage-setup": "Stage Setup",
  events: "Events",
};
const bundledCategories = [
  ...new Set(galleryManifest.map((photo) => photo.category)),
].map((slug) => ({ id: slug, slug, name: categoryNames[slug] || slug }));
const bundledImages = galleryManifest.map((photo, index) => ({
  id: `bundled-${index}`,
  category: photo.category,
  title: photo.title,
  alt_text: photo.title,
  image_url: galleryAssets[`../../assets/gallery/${photo.file}`],
  is_featured: photo.featured,
  display_order: index,
}));

export function LiveGallery({ preview = false }) {
  const [categories, setCategories] = useState([]),
    [filter, setFilter] = useState(""),
    [images, setImages] = useState([]),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [active, setActive] = useState(null);
  const dialog = useRef(null),
    trigger = useRef(null);
  useEffect(() => {
    api("/api/public/gallery/categories")
      .then((r) => setCategories(r.data.length ? r.data : bundledCategories))
      .catch(() => setCategories(bundledCategories));
  }, []);
  useEffect(() => {
    let live = true;
    const pageSize = preview ? 6 : 24;
    const category = categories.find((item) => String(item.slug || item.id) === filter);
    const apiFilter = category && category.id !== category.slug ? category.id : "";
    const localImages = bundledImages.filter(
      (item) => (!preview || item.is_featured) && (!filter || item.category === filter),
    );
    const useBundledImages = () => {
      if (!live) return;
      const start = (page - 1) * pageSize;
      const pageImages = localImages.slice(start, start + pageSize);
      setImages((old) => (page === 1 ? pageImages : [...old, ...pageImages]));
      setTotal(localImages.length);
      setError("");
    };
    setLoading(true);
    if (page === 1) setImages([]);
    setError("");
    api(
      `/api/public/gallery/${preview ? "featured" : "images"}?page=${page}&limit=${pageSize}${apiFilter ? "&category_id=" + apiFilter : ""}`,
    )
      .then((r) => {
        if (live) {
          if (!r.data.length) {
            useBundledImages();
            return;
          }
          setImages((old) => (page === 1 ? r.data : [...old, ...r.data]));
          setTotal(r.pagination.total);
        }
      })
      .catch(useBundledImages)
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [categories, filter, page, preview]);
  useEffect(() => {
    if (active !== null) dialog.current?.showModal();
    else {
      dialog.current?.close();
      trigger.current?.focus();
    }
  }, [active]);
  const move = (n) => setActive((a) => (a + n + images.length) % images.length);
  return (
    <>
      {!preview && (
        <div className="filters" aria-label="Gallery filters">
          {[{ id: "", slug: "", name: "All" }, ...categories].map((c) => (
            <button
              key={c.slug || c.id}
              aria-pressed={(c.slug || String(c.id)) === filter}
              onClick={() => {
                setFilter(c.slug || String(c.id));
                setPage(1);
                setActive(null);
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
      <div className={`masonry${preview ? " gallery-preview" : ""}`} aria-busy={loading}>
        {images.map((g, i) => (
          <button
            className="masonry-item img-zoom"
            key={g.id}
            onClick={(e) => {
              trigger.current = e.currentTarget;
              setActive(i);
            }}
          >
            <img
              src={g.image_url}
              alt={g.alt_text || g.title}
              loading="lazy"
              decoding="async"
              width={g.width}
              height={g.height}
            />
            <span>{g.title} ↗</span>
          </button>
        ))}
        {loading &&
          Array.from({ length: preview ? 3 : 6 }, (_, i) => (
            <div className="gallery-skeleton" key={"s" + i} />
          ))}
      </div>
      {error && (
        <p role="alert">
          {error} <button onClick={() => window.location.reload()}>Try again</button>
        </p>
      )}
      {!loading && !error && !images.length && <p>No photographs found in this category.</p>}
      {!preview && images.length < total && !loading && (
        <button className="button button-outline" onClick={() => setPage((p) => p + 1)}>
          Load more photographs
        </button>
      )}
      <dialog
        ref={dialog}
        className="lightbox"
        onCancel={() => setActive(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") move(-1);
          if (e.key === "ArrowRight") move(1);
        }}
        aria-label="Gallery photograph"
      >
        <button className="lightbox-close" aria-label="Close image" onClick={() => setActive(null)}>
          <X />
        </button>
        {active !== null && images[active] && (
          <>
            <img
              src={images[active].image_url}
              alt={images[active].alt_text || images[active].title}
            />
            <p>
              {images[active].title} · {active + 1} / {images.length}
            </p>
            <div className="lightbox-controls">
              <button aria-label="Previous image" onClick={() => move(-1)}>
                <ChevronLeft />
              </button>
              <button aria-label="Next image" onClick={() => move(1)}>
                <ChevronRight />
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
