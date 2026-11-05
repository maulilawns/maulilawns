import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/site/pages";
export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "about | Mauli Lawns, Wagholi Pune" },
      {
        name: "description",
        content: "Explore about at Mauli Lawns, premium wedding and event venue in Wagholi, Pune.",
      },
    ],
  }),
  component: About,
});
