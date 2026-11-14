import { seoHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { Events } from "@/components/site/pages";
export const Route = createFileRoute("/events")({
  head: () => seoHead("/events"),
  component: Events,
});
