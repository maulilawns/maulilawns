import { seoHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/site/pages";
export const Route = createFileRoute("/about")({
  head: () => seoHead("/about"),
  component: About,
});
