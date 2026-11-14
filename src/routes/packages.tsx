import { seoHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { Packages } from "@/components/site/pages";
export const Route = createFileRoute("/packages")({
  head: () => seoHead("/packages"),
  component: Packages,
});
