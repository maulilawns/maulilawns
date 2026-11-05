import { createFileRoute } from "@tanstack/react-router";
import { Events } from "@/components/site/pages";
export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "events | Mauli Lawns, Wagholi Pune" },
      {
        name: "description",
        content: "Explore events at Mauli Lawns, premium wedding and event venue in Wagholi, Pune.",
      },
    ],
  }),
  component: Events,
});
