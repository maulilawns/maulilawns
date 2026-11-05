import { createFileRoute } from "@tanstack/react-router";
import { Gallery, PageIntro } from "@/components/site/pages";
export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery | Mauli Lawns" },
      {
        name: "description",
        content:
          "Explore sample wedding, lawn, lighting and stage inspiration for your celebration.",
      },
    ],
  }),
  component: () => (
    <>
      <PageIntro
        eyebrow="A GLIMPSE OF THE MAGIC"
        title="Moments, beautifully framed."
        description="Illustrative demo photography. Actual Mauli Lawns photographs will be added."
      />
      <section className="section">
        <Gallery />
      </section>
    </>
  ),
});
