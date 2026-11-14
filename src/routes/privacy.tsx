import { seoHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { Privacy } from "@/components/site/pages";
export const Route = createFileRoute("/privacy")({
  head: () => seoHead("/privacy"),
  component: Privacy,
});
