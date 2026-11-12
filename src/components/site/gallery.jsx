import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/gallery-api";
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
      .then((r) => setCategories(r.data))
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    let live = true;
    setLoading(true);
    if (page === 1) setImages([]);
    setError("");
    api(
      `/api/public/gallery/${preview ? "featured" : "images"}?page=${page}&limit=${preview ? 6 : 24}${filter ? "&category_id=" + filter : ""}`,
    )
      .then((r) => {
        if (live) {
          setImages((old) => (page === 1 ? r.data : [...old, ...r.data]));
          setTotal(r.pagination.total);
        }
      })
      .catch((e) => {
        if (live) setError(e.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [filter, page, preview]);
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
          {[{ id: "", name: "All" }, ...categories].map((c) => (
            <button
              key={c.id}
              aria-pressed={String(c.id) === filter}
              onClick={() => {
                setFilter(String(c.id));
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
