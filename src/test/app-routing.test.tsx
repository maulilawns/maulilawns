import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { whatsappLink } from "@/data/store";

describe("Public and admin navigation", () => {
  const paths = [
    "/",
    "/about",
    "/venues",
    "/venues/mini-lawn",
    "/venues/grand-lawn",
    "/packages",
    "/decor-themes",
    "/events",
    "/gallery",
    "/contact",
    "/privacy",
    "/admin",
  ];
  it.each(paths)("resolves %s to its own page", (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes(path);
    expect(matches.at(-1)?.pathname).toBe(path);
    expect(matches.at(-1)?.routeId).not.toBe("__root__");
    if (path.startsWith("/venues/")) expect(matches.at(-1)?.routeId).toBe("/venues_/$slug");
  });
  it("encodes selected inquiry details in WhatsApp link", () => {
    const url = new URL(
      whatsappLink("919604310054", "Mauli Grand Lawn", {
        eventType: "Wedding & reception",
        eventDate: "2027-02-12",
        guests: "500",
      }),
    );
    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe("/919604310054");
    const message = url.searchParams.get("text");
    for (const detail of ["Mauli Grand Lawn", "Wedding & reception", "2027-02-12", "500"])
      expect(message).toContain(detail);
  });
});
