import { createFileRoute } from "@tanstack/react-router";
import { Venues } from "@/components/site/pages";
export const Route = createFileRoute("/venues")({
  head: () => ({
    meta: [
      { title: "venues | Mauli Lawns, Wagholi Pune" },
      {
        name: "description",
        content: "Explore venues at Mauli Lawns, premium wedding and event venue in Wagholi, Pune.",
      },
    ],
  }),
  component: Venues,
});
