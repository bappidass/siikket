import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Share2, Calendar, Clock, Hourglass, Languages, MapPin } from "lucide-react";
import { PATH_URL } from "@/utils/api";
import eventStore from "@/store/eventStore";
import authStore from "@/store/authStore";

export const Route = createFileRoute("/events/$id")({
  loader: async ({ params }) => {
    const event = await eventStore.getState().fetchOne(params.id);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.event.title ?? "Event"} — SiiKET` },
      {
        name: "description",
        content: `Book tickets for ${loaderData?.event.title} in ${loaderData?.event.city}.`,
      },
      { property: "og:title", content: `${loaderData?.event.title ?? "Event"} — SiiKET` },
      {
        property: "og:description",
        content: `Book tickets for ${loaderData?.event.title} in ${loaderData?.event.city}.`,
      },
      {
        property: "og:image",
        content: loaderData
          ? `${PATH_URL}/${loaderData.event.venue_image ?? loaderData.event.image}`
          : "",
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">
      <p className="text-muted-foreground">Event not found.</p>
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen grid place-items-center">
      <p className="text-muted-foreground">Something went wrong.</p>
    </div>
  ),
  component: EventDetail,
});

function getMinPrice(seatingTypes: { price: string }[] = []) {
  if (!seatingTypes.length) return null;
  return Math.min(...seatingTypes.map((s) => Number(s.price)));
}

function getTotalAvailableSeats(seatingTypes: { available_seats: number }[] = []) {
  if (!seatingTypes.length) return 0;
  return seatingTypes.reduce((sum, s) => sum + (s.available_seats ?? 0), 0);
}

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatEventTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(minutes: number) {
  if (!minutes) return "—";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs && mins) return `${hrs} hr ${mins} min`;
  if (hrs) return `${hrs} hour${hrs > 1 ? "s" : ""}`;
  return `${mins} min`;
}

function EventDetail() {
  const { event } = Route.useLoaderData();
  const navigate = useNavigate();
  const profile = authStore((s) => s.profile);
  const heroImage = `${PATH_URL}/${event.image}`;
  const priceFrom = getMinPrice(event.seating_types);
  const totalAvailableSeats = getTotalAvailableSeats(event.seating_types);

  // Derived booking state:
  // - closed:   event.is_active is false -> "Event Closed"
  // - soldOut:  event is active but no seats left -> "Sold Out"
  // - bookable: active and seats available -> "Book Now"
  const isClosed = !event.is_active;
  const isSoldOut = event.is_active && totalAvailableSeats <= 0;
  const isBookable = event.is_active && totalAvailableSeats > 0;

  const handleBookNow = () => {
    if (!isBookable) return;
    if (!profile) {
      navigate({
        to: "/signin",
        search: { redirect: `/seats/${event.id}` },
      });
      return;
    }
    navigate({ to: "/seats/$id", params: { id: event.id } });
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-extrabold">{event.title}</h1>
            <button className="h-9 w-9 rounded-full grid place-items-center hover:bg-muted transition shrink-0">
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 rounded-3xl overflow-hidden bg-card shadow-[0_20px_60px_-20px_rgba(20,30,80,0.25)]">
            <img src={heroImage} alt={event.title} className="w-full aspect-[16/9] object-cover" />
          </div>

          <h2 className="mt-12 text-2xl font-extrabold">About the event</h2>
          <div className="mt-4 space-y-4 text-sm md:text-base leading-relaxed text-foreground/85">
            <p>{event.description}</p>
          </div>

          {event.zones?.length > 0 && (
            <>
              <h2 className="mt-10 text-xl font-extrabold">Zones</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {event.zones.map((z) => (
                  <span
                    key={z.name}
                    className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium"
                  >
                    {z.name}
                  </span>
                ))}
              </div>
            </>
          )}

          {event.gallery?.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {event.gallery.map((g, i) => (
                <img
                  key={i}
                  src={`${PATH_URL}/${g}`}
                  alt={`${event.title} gallery ${i + 1}`}
                  className="aspect-video w-full object-cover rounded-xl"
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-8 self-start rounded-3xl bg-card p-6 shadow-[0_20px_60px_-25px_rgba(20,30,80,0.25)] border border-border/60">
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <span>{formatEventDate(event.event_date)}</span>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <span>{formatEventTime(event.event_date)}</span>
            </li>
            <li className="flex items-center gap-3">
              <Hourglass className="h-5 w-5 text-primary" />
              <span>{formatDuration(event.duration_minutes)}</span>
            </li>
            <li className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-primary" />
              <span>{event.languages?.join(", ") || "—"}</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <span>{event.address}</span>
            </li>
          </ul>
          <div className="my-5 border-t border-border" />
          <div className="flex items-center justify-between gap-4">
            <div>
              {isBookable && (
                <div>
                  <p className="text-lg font-bold">
                    {priceFrom !== null ? `₹ ${priceFrom.toLocaleString()}/- onwards` : "Price TBA"}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleBookNow}
              disabled={!isBookable}
              className={
                isBookable
                  ? "rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-bold shadow-[0_10px_30px_-10px_rgba(30,40,210,0.55)] hover:opacity-90 transition"
                  : "rounded-xl bg-muted text-muted-foreground px-5 py-3 text-sm font-bold cursor-not-allowed"
              }
            >
              {isClosed ? "Event Closed" : isSoldOut ? "Sold Out" : "Book Now →"}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
