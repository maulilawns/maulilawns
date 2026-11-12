import { createFileRoute } from "@tanstack/react-router";
import { Facilities } from "@/components/site/facilities";
export const Route = createFileRoute("/facilities")({
  head: () => ({
    meta: [
      { title: "Facilities | Mauli Lawns" },
      {
        name: "description",
        content:
          "Explore open-air lawns, stage, sound, changing rooms, parking, power backup and celebration facilities at Mauli Lawns in Wagholi, Pune.",
      },
    ],
  }),
  component: Facilities,
});
