import { createFileRoute } from "@tanstack/react-router";
import { Admin } from "@/components/site/admin";
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Demo Admin | Mauli Lawns" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: Admin,
});
