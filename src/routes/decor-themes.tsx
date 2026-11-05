import { createFileRoute } from "@tanstack/react-router";
import { Decor } from "@/components/site/pages";
export const Route = createFileRoute("/decor-themes")({
  head: () => ({
    meta: [
      { title: "decor-themes | Mauli Lawns, Wagholi Pune" },
      {
        name: "description",
        content:
          "Explore decor-themes at Mauli Lawns, premium wedding and event venue in Wagholi, Pune.",
      },
    ],
  }),
  component: Decor,
});
