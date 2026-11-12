import { createFileRoute } from "@tanstack/react-router";
import { Admin } from "@/components/site/content-studio";
export const Route = createFileRoute("/admin_/gallery")({
  head: () => ({
    meta: [
      { title: "Content Studio | Mauli Lawns" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Admin,
});
