import { seoHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { Decor } from "@/components/site/pages";
export const Route = createFileRoute("/decor-themes")({
  head: () => seoHead("/decor-themes"),
  component: Decor,
});
