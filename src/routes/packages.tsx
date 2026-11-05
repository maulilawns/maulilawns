import { createFileRoute } from "@tanstack/react-router";
import { Packages } from "@/components/site/pages";
export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "packages | Mauli Lawns, Wagholi Pune" },
      {
        name: "description",
        content:
          "Explore packages at Mauli Lawns, premium wedding and event venue in Wagholi, Pune.",
      },
    ],
  }),
  component: Packages,
});
