import { createFileRoute } from "@tanstack/react-router";
import { Contact } from "@/components/site/pages";
export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "contact | Mauli Lawns, Wagholi Pune" },
      {
        name: "description",
        content:
          "Explore contact at Mauli Lawns, premium wedding and event venue in Wagholi, Pune.",
      },
    ],
  }),
  component: Contact,
});
