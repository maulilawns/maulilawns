import { createFileRoute } from "@tanstack/react-router";
import { Privacy } from "@/components/site/pages";
export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Mauli Lawns, Wagholi Pune" },
      {
        name: "description",
        content:
          "Learn how Mauli Lawns handles enquiry information, browser storage and external services, and how to contact us with privacy questions.",
      },
    ],
  }),
  component: Privacy,
});
