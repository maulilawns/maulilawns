import { seoHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/components/site/pages";
export const Route = createFileRoute("/")({ head: () => seoHead("/"), component: Home });
