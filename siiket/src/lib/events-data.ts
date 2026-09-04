

import event1 from "@/assets/event1.png";
import event2 from "@/assets/event2.png";
import event3 from "@/assets/event3.png";
import event4 from "@/assets/event4.png";
import event5 from "@/assets/event5.png";
import event6 from "@/assets/event6.png";
import event7 from "@/assets/event7.png";
import event8 from "@/assets/event8.png";

export type Event = {
  id: string;
  title: string;
  category: "Cricket" | "Football" | "Music Concerts" | "Comedy & standup" | "Fashion";
  date: string;
  city: string;
  image: string;
  hero?: string;
  countdown?: boolean;
  priceFrom?: number;
};

export const events: Event[] = [
  {
    id: "apl",
    title: "Assam Premier League",
    category: "Cricket",
    date: "May 6, 2025",
    city: "Guwahati",
    image: event2,
    countdown: true,
    priceFrom: 1900,
  },
  {
    id: "pro-kabaddi",
    title: "Pro Kabaddi Guwahati",
    category: "Cricket",
    date: "May 6, 2025",
    city: "Guwahati",
    image: event1,
    countdown: true,
    priceFrom: 800,
  },
  {
    id: "isl",
    title: "ISL: Group A League",
    category: "Football",
    date: "May 6, 2025",
    city: "Guwahati",
    image: event2,
    priceFrom: 1200,
  },
  {
    id: "fashion-week",
    title: "Assam Fashion Week",
    category: "Fashion",
    date: "May 6, 2025",
    city: "Guwahati",
    image: event4,
    priceFrom: 2500,
  },
  {
    id: "papon-live",
    title: "Papon Live",
    category: "Music Concerts",
    date: "Jan 24, 2026",
    city: "Guwahati",
    image: event5,
    priceFrom: 1500,
  },
  {
    id: "indian-hockey",
    title: "Indian Hockey Tournament",
    category: "Football",
    date: "May 6, 2025",
    city: "Guwahati",
    image: event8,
    priceFrom: 700,
  },
  {
    id: "standup",
    title: "Stand Up Comedy Live",
    category: "Comedy & standup",
    date: "May 6, 2025",
    city: "Guwahati",
    image: event7,
    priceFrom: 500,
  },
  {
    id: "guns-roses",
    title: "Guns N Roses: India Tour 2026",
    category: "Music Concerts",
    date: "May 6, 2025",
    city: "Guwahati",
    image: event6,
    priceFrom: 4500,
  },
  {
    id: "live-singing",
    title: "Live Singing Event",
    category: "Music Concerts",
    date: "May 6, 2025",
    city: "Guwahati",
    image: event8,
    priceFrom: 900,
  },
];
