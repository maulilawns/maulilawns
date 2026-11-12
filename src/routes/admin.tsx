import { createFileRoute } from "@tanstack/react-router";
import { Admin } from "@/components/site/content-studio";
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin | Mauli Lawns" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: Admin,
});
