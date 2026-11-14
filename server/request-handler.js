import { comingSoonHtml } from "./coming-soon.js";

/** Keep API/upload requests in Express and render website requests with Nitro. */
export function createSiteHandler(api, frontend, { comingSoon = process.env.COMING_SOON !== "false" } = {}) {
  return (req, res) => {
    const pathname = (req.url || "/").split("?")[0];
    const host = (req.headers.host || "").split(":")[0].toLowerCase();
    const isLiveDomain = host === "maulilawns.com" || host === "www.maulilawns.com";
    const servicePath = /^\/(?:api|uploads|health|admin|assets)(?:\/|$)/.test(pathname)
      || ["/coming-soon-logo.png", "/favicon.ico", "/favicon.png", "/favicon-32x32.png", "/apple-touch-icon.png"].includes(pathname);
    if (comingSoon && isLiveDomain && !servicePath) {
      res.writeHead(503, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Retry-After": "3600",
      });
      return res.end(req.method === "HEAD" ? undefined : comingSoonHtml);
    }
    if (!frontend || /^\/(?:api|uploads|health)(?:\/|$)/.test(pathname)) {
      return api(req, res);
    }
    return frontend(req, res);
  };
}
