import { seoHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { Facilities } from "@/components/site/facilities";
export const Route = createFileRoute("/facilities")({
  head: () => seoHead("/facilities"),
  component: Facilities,
});
