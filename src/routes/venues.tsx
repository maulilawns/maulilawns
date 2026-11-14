import { seoHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { Venues } from "@/components/site/pages";
export const Route = createFileRoute("/venues")({
  head: () => seoHead("/venues"),
  component: Venues,
});
