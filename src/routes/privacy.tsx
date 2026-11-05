import { createFileRoute } from "@tanstack/react-router";
import { Privacy } from "@/components/site/pages";
export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "privacy | Mauli Lawns, Wagholi Pune" },
      {
        name: "description",
        content:
          "Explore privacy at Mauli Lawns, premium wedding and event venue in Wagholi, Pune.",
      },
    ],
  }),
  component: Privacy,
});
