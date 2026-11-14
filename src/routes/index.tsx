import { seoHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/components/site/pages";
export const Route = createFileRoute("/")({
  head: () => {
    const seo = seoHead("/");
    return {
      ...seo,
      meta: [
        ...seo.meta,
        {
          name: "google-site-verification",
          content: "-d0aHWdq-E1KS-NHwAQJVLz2gN3jD5zKo2yYOQ21wgw",
        },
      ],
    };
  },
  component: Home,
});
