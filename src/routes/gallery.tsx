import { seoHead } from "@/lib/seo";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Gallery, PageIntro } from "@/components/site/pages";
export const Route = createFileRoute("/gallery")({
  head: () => seoHead("/gallery"),
  component: () => (
    <>
      <PageIntro
        eyebrow="A GLIMPSE OF THE MAGIC"
        title="Mauli Lawns Wedding & Event Gallery"
        description="Explore real photographs of our Mini Lawn, Grand Lawn and garden celebrations in Wagholi, Pune."
      />
      <section className="section">
        <Gallery />
        <Link to="/venues" className="text-link">Explore our Mini Lawn and Grand Lawn venues</Link>
      </section>
    </>
  ),
});
