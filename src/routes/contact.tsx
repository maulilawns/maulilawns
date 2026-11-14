import { seoHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { Contact } from "@/components/site/pages";
export const Route = createFileRoute("/contact")({
  head: () => seoHead("/contact"),
  component: Contact,
});
