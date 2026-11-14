import { PageIntro } from "./pages";
import {
  Armchair,
  Car,
  DoorOpen,
  Flower2,
  Maximize,
  Trees,
  UtensilsCrossed,
  Volume2,
  Zap,
} from "lucide-react";

const facilities = [
  {
    title: "Two Open-air Lawns",
    description: "Mini Lawn for 50–100 guests and Grand Lawn for 100–700 guests, plus 200 additional floating guests.",
    icon: Trees,
  },
  {
    title: "500 sq ft Stage",
    description: "A spacious stage included in the Grand Lawn package.",
    icon: Maximize,
  },
  {
    title: "Sound System",
    description: "4 speakers and 2 microphones included in the Grand Lawn package.",
    icon: Volume2,
  },
  {
    title: "Changing Rooms",
    description: "2 changing rooms for the bride and groom in the Grand Lawn package.",
    icon: DoorOpen,
  },
  {
    title: "Chairs & Tables",
    description: "Chairs and tables included in the Grand Lawn package.",
    icon: Armchair,
  },
  {
    title: "Ample Parking",
    description: "Parking space included with the Grand Lawn package.",
    icon: Car,
  },
  {
    title: "Power Backup",
    description: "Generator power backup included in the Grand Lawn package.",
    icon: Zap,
  },
  {
    title: "Kitchen & Catering Space",
    description: "Kitchen setup included in the Grand Lawn package; catering space is available.",
    icon: UtensilsCrossed,
  },
  {
    title: "Stage & Light Decoration",
    description:
      "Stage and lighting decoration services are available. Enquire for themes and details.",
    icon: Flower2,
  },
];

export function Facilities() {
  return (
    <div className="facilities-page">
      <PageIntro
        eyebrow="THOUGHTFUL DETAILS"
        title="Wedding Lawn Facilities in Wagholi"
        description="Spaces and arrangements that help your celebration flow effortlessly."
      />
      <section className="facilities-grid" aria-label="Venue facilities">
        {facilities.map(({ title, description, icon: Icon }) => (
          <article className="facility-card" key={title}>
            <Icon size={32} aria-hidden="true" />
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
