import { seoHead } from "@/lib/seo";
import { notFound } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { VenueDetails } from "@/components/site/pages";
export const Route = createFileRoute("/venues_/$slug")({
  beforeLoad: ({ params }) => {
    if (!["mini-lawn", "grand-lawn"].includes(params.slug)) throw notFound();
  },
  head: ({ params }) => seoHead(`/venues/${params.slug}`),
  component: Details,
});
function Details() {
  const { slug } = Route.useParams();
  return <VenueDetails slug={slug} />;
}
