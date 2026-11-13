/** Keep API/upload requests in Express and render website requests with Nitro. */
export function createSiteHandler(api, frontend) {
  return (req, res) => {
    const pathname = (req.url || "/").split("?")[0];
    if (!frontend || /^\/(?:api|uploads|health)(?:\/|$)/.test(pathname)) {
      return api(req, res);
    }
    return frontend(req, res);
  };
}
