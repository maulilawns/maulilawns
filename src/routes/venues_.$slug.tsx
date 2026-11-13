import { createFileRoute } from "@tanstack/react-router";
import { VenueDetails } from "@/components/site/pages";
export const Route = createFileRoute("/venues_/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug === "mini-lawn" ? "Mini Lawn" : "Grand Lawn"} | Mauli Lawns` },
      {
        name: "description",
        content:
          "Discover venue capacity, facilities and WhatsApp inquiries at Mauli Lawns.",
      },
    ],
  }),
  component: Details,
});
function Details() {
  const { slug } = Route.useParams();
  return <VenueDetails slug={slug} />;
}
