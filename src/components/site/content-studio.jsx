import { useEffect, useRef, useState } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Images,
  FolderOpen,
  Settings,
  LogOut,
  ArrowUpRight,
  Plus,
  Menu,
  X,
  Eye,
  EyeOff,
  Upload,
  Pencil,
  Trash2,
  Grid2X2,
  List,
  Star,
  Check,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import logo from "@/assets/logo.png";
import loginPhoto from "@/assets/venue-grand.jpg";
import { api, uploadImage } from "@/lib/gallery-api";
import { LegacyAdmin } from "./admin";
const paths = [
  ["/admin/dashboard", "Dashboard", LayoutDashboard],
  ["/admin/gallery", "Gallery Management", Images],
  ["/admin/gallery/categories", "Gallery Categories", FolderOpen],
  ["/admin/settings", "Account Settings", Settings],
];
const date = (value) =>
  new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
function Modal({ title, children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return (
    <dialog className="studio-modal" ref={ref} onCancel={onClose} aria-label={title}>
      <header>
        <h2>{title}</h2>
        <button aria-label="Close dialog" onClick={onClose}>
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
function Field({ label, children }) {
  return (
    <label className="studio-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Status({ value }) {
  return (
    <span className={"studio-status " + value}>
      {value === "published" ? "Published" : "Draft"}
    </span>
  );
}
export function Admin() {
  const path = useRouterState({ select: (s) => s.location.pathname }),
    navigate = useNavigate();
  const [admin, setAdmin] = useState(null),
    [checking, setChecking] = useState(true),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [drawer, setDrawer] = useState(false),
    [legacy, setLegacy] = useState(false);
  const notify = (message) => {
    setToast(message);
  };
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    let live = true;
    api("/api/admin/auth/me")
      .then((r) => {
        if (live) {
          setAdmin(r.data);
          if (path === "/admin" || path === "/admin/login")
            navigate({ to: "/admin/dashboard", replace: true });
        }
      })
      .catch((e) => {
        if (live) {
          setAdmin(null);
          if (e.status === 401) {
            if (path !== "/admin/login") navigate({ to: "/admin/login", replace: true });
          } else setError(e.message);
        }
      })
      .finally(() => {
        if (live) setChecking(false);
      });
    return () => {
      live = false;
    };
  }, [path, navigate]);
  useEffect(() => {
    setDrawer(false);
    setLegacy(false);
    setError("");
  }, [path]);
  async function logout() {
    try {
      await api("/api/admin/auth/logout", { method: "POST" });
      setAdmin(null);
      navigate({ to: "/admin/login" });
    } catch (e) {
      notify(e.message);
    }
  }
  if (checking)
    return (
      <div className="studio-loading" role="status">
        <LoaderCircle className="spin" /> Opening your content studio…
      </div>
    );
  if (!admin)
    return (
      <Login
        onLogin={(a) => {
          setAdmin(a);
          navigate({ to: "/admin/dashboard" });
        }}
        serviceError={error}
      />
    );
  const current = paths.find((p) => p[0] === path)?.[1] || "Dashboard";
  return (
    <div className="studio">
      <aside className={drawer ? "studio-sidebar open" : "studio-sidebar"}>
        <a href="/" className="studio-logo">
          <img src={logo} alt="Mauli Lawns" />
        </a>
        <p className="eyebrow">PRIVATE CONTENT STUDIO</p>
        <nav aria-label="Admin navigation">
          {paths.map(([href, label, Icon]) => (
            <a
              key={href}
              href={href}
              aria-current={path === href && !legacy ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                navigate({ to: href });
              }}
            >
              <Icon size={19} />
              {label}
            </a>
          ))}
          <button
            onClick={() => {
              setLegacy(true);
              setDrawer(false);
            }}
          >
            <FolderOpen size={19} />
            Other Website Content
          </button>
        </nav>
        <div className="studio-sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer">
            View live website <ArrowUpRight size={16} />
          </a>
          <button onClick={logout}>
            <LogOut size={18} />
            Log out
          </button>
          <small>MAULI LAWNS · WAGHOLI, PUNE</small>
        </div>
      </aside>
      {drawer && (
        <button className="studio-shade" aria-label="Close menu" onClick={() => setDrawer(false)} />
      )}
      <div className="studio-body">
        <header className="studio-topbar">
          <button className="studio-menu" aria-label="Open menu" onClick={() => setDrawer(!drawer)}>
            <Menu />
          </button>
          <span>
            Website / <strong>{legacy ? "Other Content" : current}</strong>
          </span>
          <details className="studio-profile">
            <summary>
              <span className="studio-avatar">{admin.full_name.slice(0, 1)}</span>
              <span>
                {admin.full_name}
                <small>Administrator</small>
              </span>
            </summary>
            <div>
              <a href="/admin/settings">Account settings</a>
              <button onClick={logout}>Log out</button>
            </div>
          </details>
        </header>
        <main className="studio-main">
          {legacy ? (
            <>
              <p className="studio-note">
                These existing modules remain browser-local demos. Gallery and account management
                use the secure backend.
              </p>
              <LegacyAdmin />
            </>
          ) : path === "/admin/gallery/categories" ? (
            <Categories notify={notify} />
          ) : path === "/admin/gallery" ? (
            <GalleryManager notify={notify} />
          ) : path === "/admin/settings" ? (
            <Account admin={admin} setAdmin={setAdmin} notify={notify} logout={logout} />
          ) : (
            <Dashboard />
          )}
        </main>
        <footer className="studio-footer">Beautiful celebrations. Thoughtfully managed.</footer>
      </div>
      {toast && (
        <div className="studio-toast" role="status">
          <Check size={18} />
          {toast}
          <button aria-label="Dismiss notification" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function Login({ onLogin, serviceError }) {
  const [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(serviceError),
    [username, setUsername] = useState(""),
    [remember, setRemember] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mauli-remembered-username");
      if (saved) {
        setUsername(saved);
        setRemember(true);
      }
    } catch {
      /* Remembering a username is optional when browser storage is restricted. */
    }
  }, []);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const password = new FormData(e.currentTarget).get("password");
      const r = await api("/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      try {
        if (remember) localStorage.setItem("mauli-remembered-username", username);
        else localStorage.removeItem("mauli-remembered-username");
      } catch {
        /* Authentication succeeds even when optional browser storage is unavailable. */
      }
      onLogin(r.data.admin);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="studio-login">
      <div
        className="studio-login-photo"
        style={{
          backgroundImage: `linear-gradient(0deg,rgba(16,30,40,.72),rgba(16,30,40,.04)),url(${loginPhoto})`,
        }}
      >
        <a href="/">
          <img src={logo} alt="Mauli Lawns" />
        </a>
        <div>
          <p className="eyebrow">THE MAULI EXPERIENCE</p>
          <h2>
            Every beautiful moment
            <br />
            <em>begins here.</em>
          </h2>
          <p>
            Your private space to curate the celebrations
            <br />
            that make Mauli Lawns special.
          </p>
        </div>
        <small>WAGHOLI, PUNE · MADE FOR CELEBRATION</small>
      </div>
      <main className="studio-login-form">
        <a href="/" className="studio-login-home">
          ← Back to website
        </a>
        <form onSubmit={submit}>
          <img className="studio-login-logo" src={logo} alt="Mauli Lawns" />
          <p className="eyebrow">CONTENT STUDIO</p>
          <h1>Welcome Back</h1>
          <p>Sign in to manage your Mauli Lawns website.</p>
          <Field label="Username">
            <input
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={80}
              placeholder="Enter your username"
            />
          </Field>
          <Field label="Password">
            <span className="studio-password">
              <input
                name="password"
                type={show ? "text" : "password"}
                required
                autoComplete="current-password"
                maxLength={128}
                placeholder="Enter your password"
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </Field>
          <label className="studio-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember username
          </label>
          {error && (
            <p className="studio-error" role="alert">
              {error}
            </p>
          )}
          <button className="button studio-signin" disabled={busy}>
            {busy ? (
              <>
                <LoaderCircle className="spin" size={18} />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
          <p className="studio-private">A private space for the Mauli Lawns team.</p>
        </form>
        <small>© {new Date().getFullYear()} Mauli Lawns</small>
      </main>
    </div>
  );
}
function Heading({ title, description, children }) {
  return (
    <div className="studio-heading">
      <div>
        <p className="eyebrow">YOUR CELEBRATION, BEAUTIFULLY MANAGED</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
function Dashboard() {
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    api("/api/admin/dashboard/stats")
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message));
  }, []);
  return (
    <>
      <Heading
        title="Welcome to Mauli Lawns"
        description="Manage your website gallery and content from one place."
      />
      {error && <p role="alert">{error}</p>}
      {!data && !error ? (
        <div className="gallery-skeleton" aria-label="Loading dashboard" />
      ) : (
        data && (
          <>
            <div className="studio-stats">
              {[
                ["Total Gallery Images", data.total_images, Images],
                ["Total Categories", data.total_categories, FolderOpen],
                ["Published Images", data.published_images, Eye],
                ["Draft Images", data.draft_images, Pencil],
              ].map(([label, count, Icon]) => (
                <article key={label}>
                  <Icon size={21} />
                  <strong>{count}</strong>
                  <span>{label}</span>
                </article>
              ))}
            </div>
            <div className="studio-dashboard-grid">
              <section className="studio-panel">
                <div className="studio-panel-title">
                  <h2>Recent Uploads</h2>
                  <a href="/admin/gallery">View all ↗</a>
                </div>
                {!data.recent.length ? (
                  <p>No gallery images yet. Upload your first photograph.</p>
                ) : (
                  data.recent.map((g) => (
                    <article className="studio-recent" key={g.id}>
                      <img src={g.thumbnail_url} alt={g.alt_text || g.title} />
                      <div>
                        <strong>{g.title}</strong>
                        <small>
                          {g.category} · {date(g.created_at)}
                        </small>
                      </div>
                      <Status value={g.status} />
                    </article>
                  ))
                )}
              </section>
              <div>
                <section className="studio-panel">
                  <h2>Quick Actions</h2>
                  {[
                    ["Upload New Images", "/admin/gallery?upload=1"],
                    ["Manage Gallery", "/admin/gallery"],
                    ["Manage Categories", "/admin/gallery/categories"],
                    ["View Live Website", "/"],
                  ].map(([label, href]) => (
                    <a className="studio-quick" href={href} key={label}>
                      {label}
                      <ArrowUpRight size={16} />
                    </a>
                  ))}
                </section>
                <section className="studio-panel">
                  <h2>Gallery Overview</h2>
                  {data.categories.map((c) => (
                    <div className="studio-overview" key={c.id}>
                      <span>
                        {c.name}
                        {!c.is_active ? " (inactive)" : ""}
                      </span>
                      <strong>{c.image_count}</strong>
                    </div>
                  ))}
                </section>
              </div>
            </div>
          </>
        )
      )}
    </>
  );
}
const emptyCategory = { name: "", slug: "", description: "", display_order: 0, is_active: true };
function Categories({ notify }) {
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [edit, setEdit] = useState(null),
    [deleting, setDeleting] = useState(null),
    [target, setTarget] = useState(""),
    [busy, setBusy] = useState(false),
    [thumbnail, setThumbnail] = useState(null);
  const load = () =>
    api("/api/admin/gallery/categories")
      .then((r) => setItems(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      for (const key of Object.keys(emptyCategory)) form.append(key, String(edit[key]));
      if (thumbnail) form.append("thumbnail", thumbnail);
      await api("/api/admin/gallery/categories" + (edit.id ? "/" + edit.id : ""), {
        method: edit.id ? "PUT" : "POST",
        body: form,
      });
      notify(edit.id ? "Changes saved" : "Category created successfully");
      setEdit(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/gallery/categories/" + deleting.id, {
        method: "DELETE",
        body: JSON.stringify(target ? { reassign_to: Number(target) } : {}),
      });
      setDeleting(null);
      notify("Category deleted");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Gallery Categories"
        description="Give every beautiful moment a place to belong."
      >
        <button
          className="button"
          onClick={() => {
            setEdit({ ...emptyCategory });
            setThumbnail(null);
            setError("");
          }}
        >
          <Plus size={17} />
          Add Category
        </button>
      </Heading>
      {error && !edit && !deleting && (
        <p className="studio-error" role="alert">
          {error}
        </p>
      )}
      <section className="studio-panel">
        {loading ? (
          <p role="status">Loading categories…</p>
        ) : !items.length ? (
          <p>No categories available. Create your first gallery category.</p>
        ) : (
          <div className="studio-table-wrap">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Photographs</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="studio-category-name">
                        {c.thumbnail_url && <img src={c.thumbnail_url} alt="" />}
                        <div>
                          <strong>{c.name}</strong>
                          <small>
                            #{c.id} · {c.slug}
                          </small>
                          <small>{c.description}</small>
                          <small>Updated {date(c.updated_at)}</small>
                        </div>
                      </div>
                    </td>
                    <td>{c.image_count}</td>
                    <td>{c.display_order}</td>
                    <td>
                      <span className={"studio-status " + (c.is_active ? "published" : "draft")}>
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        aria-label={"Edit " + c.name}
                        onClick={() => {
                          setEdit({ ...c, is_active: !!c.is_active });
                          setThumbnail(null);
                          setError("");
                        }}
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        aria-label={"Delete " + c.name}
                        onClick={() => {
                          setDeleting(c);
                          setTarget("");
                          setError("");
                        }}
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {edit && (
        <Modal
          title={edit.id ? "Edit Category" : "Add Category"}
          onClose={() => !busy && setEdit(null)}
        >
          <form onSubmit={save}>
            <Field label="Category name">
              <input
                required
                maxLength={120}
                value={edit.name}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    name: e.target.value,
                    ...(!edit.id
                      ? {
                          slug: e.target.value
                            .toLowerCase()
                            .normalize("NFKD")
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, ""),
                        }
                      : {}),
                  })
                }
              />
            </Field>
            <Field label="URL slug">
              <input
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                maxLength={160}
                value={edit.slug}
                onChange={(e) => setEdit({ ...edit, slug: e.target.value })}
              />
            </Field>
            <Field label="Description">
              <textarea
                maxLength={5000}
                value={edit.description}
                onChange={(e) => setEdit({ ...edit, description: e.target.value })}
              />
            </Field>
            <Field label="Display order">
              <input
                type="number"
                min="0"
                required
                value={edit.display_order}
                onChange={(e) => setEdit({ ...edit, display_order: e.target.value })}
              />
            </Field>
            <Field label="Optional thumbnail · JPG, PNG or WEBP">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setThumbnail(e.target.files[0] || null)}
              />
            </Field>
            <label className="studio-check">
              <input
                type="checkbox"
                checked={edit.is_active}
                onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })}
              />
              Active · visible on public gallery
            </label>
            {edit.created_at && <small>Created {date(edit.created_at)}</small>}
            {error && (
              <p className="studio-error" role="alert">
                {error}
              </p>
            )}
            <div className="studio-modal-actions">
              <button type="button" onClick={() => setEdit(null)} disabled={busy}>
                Cancel
              </button>
              <button className="button" disabled={busy}>
                {busy ? "Saving…" : "Save Category"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal title="Delete Category" onClose={() => !busy && setDeleting(null)}>
          <p>Delete “{deleting.name}”? This cannot be undone.</p>
          {Number(deleting.image_count) > 0 && (
            <Field label="Move existing photographs to">
              <select required value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="">Choose a different category</option>
                {items
                  .filter((c) => c.id !== deleting.id)
                  .map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </Field>
          )}
          {error && (
            <p className="studio-error" role="alert">
              {error}
            </p>
          )}
          <div className="studio-modal-actions">
            <button onClick={() => setDeleting(null)} disabled={busy}>
              Cancel
            </button>
            <button
              className="button"
              disabled={busy || (Number(deleting.image_count) > 0 && !target)}
              onClick={remove}
            >
              {busy ? "Deleting…" : "Delete Category"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function GalleryManager({ notify }) {
  const [items, setItems] = useState([]),
    [categories, setCategories] = useState([]),
    [query, setQuery] = useState({ search: "", category_id: "", status: "", sort: "newest" }),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [view, setView] = useState("grid"),
    [upload, setUpload] = useState(false),
    [edit, setEdit] = useState(null),
    [deleting, setDeleting] = useState(null),
    [busy, setBusy] = useState(false),
    [revision, setRevision] = useState(0);
  const refresh = () => setRevision((n) => n + 1);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("upload")) setUpload(true);
    api("/api/admin/gallery/categories")
      .then((r) => setCategories(r.data))
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    let live = true;
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: String(page),
        limit: "24",
        ...Object.fromEntries(Object.entries(query).filter(([, v]) => v)),
      });
      api("/api/admin/gallery/images?" + params)
        .then((r) => {
          if (live) {
            setItems(r.data);
            setTotal(r.pagination.total);
          }
        })
        .catch((e) => {
          if (live) setError(e.message);
        })
        .finally(() => {
          if (live) setLoading(false);
        });
    }, 200);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [query, page, revision]);
  async function remove() {
    setBusy(true);
    try {
      await api("/api/admin/gallery/images/" + deleting.id, { method: "DELETE" });
      notify("Image deleted");
      setDeleting(null);
      refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function publish(g) {
    setBusy(true);
    try {
      await api(`/api/admin/gallery/images/${g.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: g.status === "published" ? "draft" : "published" }),
      });
      notify(g.status === "published" ? "Image moved to drafts" : "Image published");
      refresh();
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  }
  const change = (key, value) => {
    setQuery((q) => ({ ...q, [key]: value }));
    setPage(1);
  };
  return (
    <>
      <Heading
        title="Gallery Management"
        description="Upload, organize, and manage photographs displayed on your website."
      >
        <button className="button" onClick={() => setUpload(true)}>
          <Plus size={18} />
          Upload Images
        </button>
      </Heading>
      <div className="studio-toolbar">
        <input
          aria-label="Search by image title"
          placeholder="Search photographs…"
          value={query.search}
          onChange={(e) => change("search", e.target.value)}
        />
        <select
          aria-label="Category filter"
          value={query.category_id}
          onChange={(e) => change("category_id", e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Status filter"
          value={query.status}
          onChange={(e) => change("status", e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          aria-label="Sort photographs"
          value={query.sort}
          onChange={(e) => change("sort", e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="display_order">Display order</option>
        </select>
        <div className="studio-view">
          <button
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <Grid2X2 size={19} />
          </button>
          <button
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List size={19} />
          </button>
        </div>
      </div>
      <p className="studio-count">{total} photographs · Curated for your celebrations</p>
      {error && (
        <p className="studio-error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <div className="studio-image-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <div className="gallery-skeleton" key={i} />
          ))}
        </div>
      ) : !items.length ? (
        <div className="studio-empty">
          <Images size={40} />
          <h2>
            {query.search || query.category_id || query.status
              ? "No photographs found."
              : "Your gallery begins here."}
          </h2>
          <p>No gallery images yet. Upload your first photograph.</p>
          <button className="button" onClick={() => setUpload(true)}>
            Upload Images
          </button>
        </div>
      ) : (
        <div className={"studio-image-grid " + (view === "list" ? "studio-image-list" : "")}>
          {items.map((g) => (
            <article className="studio-image-card" key={g.id}>
              <div className="studio-image-cover">
                <img src={g.thumbnail_url} alt={g.alt_text || g.title} loading="lazy" />
                {!!g.is_featured && (
                  <span className="studio-featured">
                    <Star size={13} />
                    Featured
                  </span>
                )}
                <Status value={g.status} />
              </div>
              <div className="studio-image-info">
                <small>{g.category}</small>
                <h3>{g.title}</h3>
                <div className="studio-image-actions">
                  <button
                    onClick={() => {
                      setEdit(g);
                      setError("");
                    }}
                  >
                    <Pencil size={15} />
                    Edit
                  </button>
                  <button disabled={busy} onClick={() => publish(g)}>
                    {g.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    aria-label={"Delete " + g.title}
                    onClick={() => {
                      setDeleting(g);
                      setError("");
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {total > 24 && (
        <div className="studio-pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={18} />
            Previous
          </button>
          <span>
            Page {page} of {Math.ceil(total / 24)}
          </span>
          <button disabled={page * 24 >= total} onClick={() => setPage((p) => p + 1)}>
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}
      {upload && (
        <UploadModal
          categories={categories}
          onClose={() => {
            setUpload(false);
            refresh();
          }}
          notify={notify}
        />
      )}
      {edit && (
        <EditImage
          image={edit}
          categories={categories}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            refresh();
            notify("Changes saved");
          }}
        />
      )}
      {deleting && (
        <Modal title="Delete Photograph" onClose={() => !busy && setDeleting(null)}>
          <p>
            Delete “{deleting.title}”? The photograph will be removed from your public gallery and
            storage. This cannot be undone.
          </p>
          {error && (
            <p role="alert" className="studio-error">
              {error}
            </p>
          )}
          <div className="studio-modal-actions">
            <button disabled={busy} onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button className="button" disabled={busy} onClick={remove}>
              {busy ? "Deleting…" : "Delete Image"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function CategorySelect({ categories, value, onChange }) {
  return (
    <select required value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select a category</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
          {!c.is_active ? " (inactive)" : ""}
        </option>
      ))}
    </select>
  );
}
function ImageFields({ value, onChange, categories }) {
  const update = (key, v) => onChange({ ...value, [key]: v });
  return (
    <>
      <Field label="Image title">
        <input
          required
          maxLength={200}
          value={value.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </Field>
      <Field label="Category">
        <CategorySelect
          categories={categories}
          value={value.category_id}
          onChange={(v) => update("category_id", v)}
        />
      </Field>
      <Field label="Caption (optional)">
        <textarea
          maxLength={5000}
          value={value.caption || ""}
          onChange={(e) => update("caption", e.target.value)}
        />
      </Field>
      <Field label="Alt text (recommended)">
        <input
          maxLength={500}
          value={value.alt_text || ""}
          onChange={(e) => update("alt_text", e.target.value)}
        />
      </Field>
      <div className="studio-form-pair">
        <Field label="Status">
          <select value={value.status} onChange={(e) => update("status", e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <Field label="Display order">
          <input
            type="number"
            min="0"
            required
            value={value.display_order || 0}
            onChange={(e) => update("display_order", e.target.value)}
          />
        </Field>
      </div>
      <label className="studio-check">
        <input
          type="checkbox"
          checked={!!value.is_featured}
          onChange={(e) => update("is_featured", e.target.checked)}
        />
        Featured on the homepage
      </label>
    </>
  );
}
function EditImage({ image, categories, onClose, onSaved }) {
  const [value, setValue] = useState({ ...image, is_featured: !!image.is_featured }),
    [file, setFile] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function save(e) {
    e.preventDefault();
    if (
      file &&
      !window.confirm(
        "Replace this photograph? The previous file will be permanently removed after saving.",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      for (const key of [
        "title",
        "category_id",
        "caption",
        "alt_text",
        "status",
        "display_order",
        "is_featured",
      ])
        form.append(key, String(value[key] ?? ""));
      if (file) form.append("image", file);
      await api("/api/admin/gallery/images/" + image.id, { method: "PUT", body: form });
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Edit Photograph" onClose={() => !busy && onClose()}>
      <form onSubmit={save}>
        <img className="studio-edit-preview" src={image.thumbnail_url} alt={image.title} />
        <ImageFields value={value} onChange={setValue} categories={categories} />
        <Field label="Replace image (optional)">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </Field>
        <small>
          {image.width} × {image.height} · {Math.round(image.file_size / 1024)} KB ·{" "}
          {image.mime_type}
        </small>
        {error && (
          <p role="alert" className="studio-error">
            {error}
          </p>
        )}
        <div className="studio-modal-actions">
          <button type="button" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button className="button" disabled={busy}>
            {busy ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function UploadModal({ categories, onClose, notify }) {
  const [queue, setQueue] = useState([]),
    [common, setCommon] = useState(""),
    [status, setStatus] = useState("draft"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [featured, setFeatured] = useState(false);
  const files = useRef(null),
    urls = useRef([]);
  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);
  function add(list) {
    setError("");
    const incoming = Array.from(list);
    if (queue.length + incoming.length > 20) {
      setError("Select up to 20 photographs at once.");
      return;
    }
    const accepted = [];
    for (const file of incoming) {
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 10 * 1024 * 1024
      ) {
        setError("Invalid file. Choose JPG, PNG or WEBP images under 10 MB each.");
        continue;
      }
      const url = URL.createObjectURL(file);
      urls.current.push(url);
      accepted.push({
        key: crypto.randomUUID(),
        file,
        url,
        title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        category_id: common,
        caption: "",
        alt_text: "",
        display_order: 0,
        state: "ready",
        progress: 0,
        error: "",
      });
    }
    setQueue((old) => [...old, ...accepted]);
  }
  const update = (key, patch) =>
    setQueue((q) => q.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  async function submit(e) {
    e.preventDefault();
    setError("");
    const pending = queue.filter((q) => q.state !== "success");
    if (!pending.length) return;
    if (pending.some((q) => !q.title.trim() || !q.category_id)) {
      setError("Every photograph needs a title and category.");
      return;
    }
    setBusy(true);
    let successes = 0;
    for (const item of pending) {
      update(item.key, { state: "uploading", error: "" });
      const form = new FormData();
      form.append("image", item.file);
      for (const key of ["title", "category_id", "caption", "alt_text", "display_order"])
        form.append(key, String(item[key]));
      form.append("status", status);
      form.append("is_featured", String(featured));
      try {
        await uploadImage(form, (progress) => update(item.key, { progress }));
        update(item.key, { state: "success", progress: 100 });
        successes++;
      } catch (err) {
        update(item.key, { state: "failed", error: err.message });
      }
    }
    setBusy(false);
    if (successes)
      notify(
        `${successes} photograph${successes > 1 ? "s" : ""} uploaded successfully${status === "published" ? " and published" : ""}`,
      );
  }
  return (
    <Modal title="Upload Photographs" onClose={() => !busy && onClose()}>
      <form onSubmit={submit}>
        <p>
          Add up to 20 photographs. Give each a title, choose a category, then save a draft or
          publish.
        </p>
        {!categories.length && (
          <p className="studio-error">Create a gallery category before uploading photographs.</p>
        )}
        <div
          className="studio-drop"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!busy) add(e.dataTransfer.files);
          }}
        >
          <Upload size={30} />
          <strong>Drag photographs here</strong>
          <span>JPG, PNG or WEBP · up to 10 MB each</span>
          <button
            type="button"
            className="button button-outline"
            disabled={busy}
            onClick={() => files.current.click()}
          >
            Browse Files
          </button>
          <input
            hidden
            ref={files}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              add(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <fieldset disabled={busy}>
          <div className="studio-form-pair">
            <Field label="Common category">
              <CategorySelect
                categories={categories}
                value={common}
                onChange={(v) => {
                  setCommon(v);
                  setQueue((q) =>
                    q.map((i) => (i.state === "success" ? i : { ...i, category_id: v })),
                  );
                }}
              />
            </Field>
            <Field label="Save as">
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
          </div>
          <label className="studio-check">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            Feature these photographs on the homepage
          </label>
          {queue.map((item) => (
            <article className="studio-upload-item" key={item.key}>
              <img src={item.url} alt={item.title} />
              <div>
                <Field label="Image title">
                  <input
                    required
                    disabled={item.state === "success"}
                    value={item.title}
                    maxLength={200}
                    onChange={(e) => update(item.key, { title: e.target.value })}
                  />
                </Field>
                <Field label="Category">
                  <CategorySelect
                    categories={categories}
                    value={item.category_id}
                    onChange={(v) => update(item.key, { category_id: v })}
                  />
                </Field>
                <details>
                  <summary>Caption, alt text & display order</summary>
                  <Field label="Caption">
                    <textarea
                      value={item.caption}
                      maxLength={5000}
                      onChange={(e) => update(item.key, { caption: e.target.value })}
                    />
                  </Field>
                  <Field label="Alt text">
                    <input
                      value={item.alt_text}
                      maxLength={500}
                      onChange={(e) => update(item.key, { alt_text: e.target.value })}
                    />
                  </Field>
                  <Field label="Display order">
                    <input
                      type="number"
                      min="0"
                      value={item.display_order}
                      onChange={(e) => update(item.key, { display_order: e.target.value })}
                    />
                  </Field>
                </details>
                {item.state === "uploading" && (
                  <>
                    <progress max="100" value={item.progress} />
                    <small>
                      {item.progress === 100
                        ? "Optimizing and saving…"
                        : `${item.progress}% uploaded`}
                    </small>
                  </>
                )}
                {item.state === "success" ? (
                  <p className="studio-success">✓ Uploaded successfully</p>
                ) : item.error ? (
                  <p className="studio-error" role="alert">
                    {item.error}
                  </p>
                ) : null}
              </div>
              {item.state !== "success" && (
                <button
                  type="button"
                  aria-label={"Remove " + item.title}
                  onClick={() => setQueue((q) => q.filter((i) => i.key !== item.key))}
                >
                  <X size={18} />
                </button>
              )}
            </article>
          ))}
        </fieldset>
        {error && (
          <p className="studio-error" role="alert">
            {error}
          </p>
        )}
        <div className="studio-modal-actions">
          <button type="button" disabled={busy} onClick={onClose}>
            {queue.some((q) => q.state === "success") ? "Done" : "Cancel"}
          </button>
          <button
            className="button"
            disabled={busy || !queue.some((q) => q.state !== "success") || !categories.length}
          >
            {busy ? "Uploading…" : status === "published" ? "Upload & Publish" : "Upload Drafts"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function Account({ admin, setAdmin, notify, logout }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e, password = false) {
    e.preventDefault();
    const form = e.currentTarget,
      data = Object.fromEntries(new FormData(form));
    setBusy(true);
    setError("");
    try {
      const r = await api("/api/admin/account" + (password ? "/password" : ""), {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!password) setAdmin(r.data);
      else form.reset();
      notify(
        password ? "Password changed. Other sessions have been invalidated." : "Changes saved",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Account Settings"
        description="Manage your profile and keep your account secure."
      />
      {error && (
        <p role="alert" className="studio-error">
          {error}
        </p>
      )}
      <div className="studio-account-grid">
        <form className="studio-panel" onSubmit={(e) => submit(e)}>
          <h2>Your Profile</h2>
          <Field label="Username">
            <input value={admin.username} disabled />
          </Field>
          <Field label="Display name">
            <input name="full_name" required maxLength={160} defaultValue={admin.full_name} />
          </Field>
          <Field label="Email">
            <input type="email" name="email" required maxLength={254} defaultValue={admin.email} />
          </Field>
          <button className="button" disabled={busy}>
            {busy ? "Saving…" : "Save Profile"}
          </button>
        </form>
        <form className="studio-panel" onSubmit={(e) => submit(e, true)}>
          <h2>Change Password</h2>
          <p>Use 12–72 characters with uppercase, lowercase and a number.</p>
          <Field label="Current password">
            <input
              type="password"
              name="current_password"
              autoComplete="current-password"
              required
            />
          </Field>
          <Field label="New password">
            <input
              type="password"
              name="new_password"
              autoComplete="new-password"
              minLength={12}
              maxLength={72}
              required
            />
          </Field>
          <Field label="Confirm new password">
            <input type="password" name="confirm_password" autoComplete="new-password" required />
          </Field>
          <button className="button" disabled={busy}>
            {busy ? "Saving…" : "Change Password"}
          </button>
        </form>
      </div>
      <button className="studio-logout" onClick={logout}>
        <LogOut size={18} />
        Log out of your account
      </button>
    </>
  );
}
