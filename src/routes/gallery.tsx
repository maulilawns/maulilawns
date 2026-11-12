import { createFileRoute } from "@tanstack/react-router";
import { Gallery, PageIntro } from "@/components/site/pages";
export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery | Mauli Lawns" },
      {
        name: "description",
        content: "Explore photographs from Mauli Lawns and our Mini Lawn celebrations.",
      },
    ],
  }),
  component: () => (
    <>
      <PageIntro
        eyebrow="A GLIMPSE OF THE MAGIC"
        title="Moments, beautifully framed."
        description="Photographs from our Mini Lawn."
      />
      <section className="section">
        <Gallery />
      </section>
    </>
  ),
});
