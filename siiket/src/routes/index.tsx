import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, SlidersHorizontal } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { PATH_URL } from "@/utils/api";
import { useNavigate } from "@tanstack/react-router";
import bannerMain from "@/assets/bannerMain.png";

import bannerStore from "@/store/bannerStore";
import categoryStore from "@/store/categoryStore";
import eventStore from "@/store/eventStore";

const QUICK_FILTERS = ["Today", "Tomorrow", "This week", "This month"] as const;

// New: time-based tabs
const EVENT_TABS = ["Events", "Past", "Upcoming"] as const;
type EventTab = (typeof EVENT_TABS)[number];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SiiKET — Book Live Events, Concerts & Sports Tickets" },
      {
        name: "description",
        content:
          "From cricket matches to sold-out concerts, SiiKET gets you in. Discover and book tickets for live events near you.",
      },
      { property: "og:title", content: "SiiKET — Your Next Experience Starts Here" },
      {
        property: "og:description",
        content:
          "Discover and book tickets for cricket, football, concerts, comedy and fashion events.",
      },
    ],
  }),
  component: Home,
});

/* ---------------- Skeletons ---------------- */

function EventCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-card overflow-hidden">
      <div className="aspect-[3/4] w-full bg-foreground/10" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 w-3/4 rounded bg-foreground/10" />
        <div className="h-3 w-1/2 rounded bg-foreground/10" />
        <div className="h-3 w-1/3 rounded bg-foreground/10" />
      </div>
    </div>
  );
}

function BannerSkeleton() {
  return (
    <div className="h-70 sm:h-85 md:h-100 w-full max-w-[90%] mx-auto rounded-3xl bg-foreground/10 animate-pulse" />
  );
}

function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-28 w-28 rounded-full bg-foreground/10 animate-pulse" />
      <div className="h-3 w-16 rounded bg-foreground/10 animate-pulse" />
    </div>
  );
}

function TabSkeleton() {
  return <div className="mx-4 my-2 h-4 w-20 rounded bg-foreground/10 animate-pulse" />;
}

/* ---------------- Helpers ---------------- */

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// An event is "upcoming" if it hasn't ended yet (start + duration is still in the future).
// Falls back to just the start time if duration_minutes is missing.
function isUpcomingEvent(eventDateIso: string, durationMinutes?: number) {
  const start = new Date(eventDateIso).getTime();
  const end = start + (durationMinutes ?? 0) * 60_000;
  return end >= Date.now();
}

// EventCard expects: id, title, image (full URL), date (formatted string), city, countdown?
function toEventCardProps(e: {
  id: string;
  title: string;
  image: string;
  event_date: string;
  city: string;
}) {
  return {
    id: e.id,
    title: e.title,
    image: `${PATH_URL}/${e.image}`,
    date: formatEventDate(e.event_date),
    city: e.city,
  };
}

/* ---------------- Page ---------------- */

function Home() {
  const { fetchBanners, banners, loading: bannersLoading } = bannerStore();
  const { fetchCategory, category, loading: categoryLoading } = categoryStore();
  const { items: events, loading, fetchError, fetchRecords } = eventStore();

  const navigate = useNavigate();

  useEffect(() => {
    fetchBanners();
    fetchCategory();
    fetchRecords({ category: "" });
  }, [fetchBanners, fetchCategory, fetchRecords]);

  const [slide, setSlide] = useState(1);
  const prev = () => setSlide((s) => (s - 1 + banners.length) % banners.length);
  const next = () => setSlide((s) => (s + 1) % banners.length);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setSlide((s) => (s + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);


  const categories = useMemo(
    () => [...category].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [category]
  );

  const [tabTitle, setTabTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!categories.length) return;
    if (!tabTitle || !categories.some((c) => c.title === tabTitle)) {
      setTabTitle(categories[0].title);
    }
  }, [categories, tabTitle]);


  const [eventTab, setEventTab] = useState<EventTab>("Events");

  const timeFiltered = useMemo(() => {
    if (eventTab === "Events") return events;
    return events.filter((e) =>
      eventTab === "Upcoming"
        ? isUpcomingEvent(e.event_date, e.duration_minutes)
        : !isUpcomingEvent(e.event_date, e.duration_minutes)
    );
  }, [events, eventTab]);

  const filtered = tabTitle
    ? timeFiltered.filter((e) => e.category === tabTitle)
    : timeFiltered;

  return (
    <div className="min-h-screen ">
      <section className="px-4 sm:px-8 pt-10">
        <h1 className="text-center text-4xl md:text-5xl font-extrabold tracking-tight">
          Your <span className="text-primary">Next Experience</span> Starts Here
        </h1>
        <p className="mt-4 text-center text-muted-foreground">
          From cricket matches to sold-out concerts, SiiKET gets you in.
        </p>

        <div className="relative mt-10 mx-auto w-full">
          {bannersLoading || banners.length === 0 ? (
            <BannerSkeleton />
          ) : (
            <>
              <div
                className="pointer-events-none absolute -left-4 top-0 z-10 w-15 h-full hidden md:block"
                style={{
                  background: `
                    linear-gradient(
                      to right,
                      white 0%,
                      white 10%,
                      white 20%,
                      rgba(255,255,255,0.98) 30%,
                      rgba(255,255,255,0.92) 45%,
                      rgba(255,255,255,0.75) 60%,
                      rgba(255,255,255,0.45) 75%,
                      rgba(255,255,255,0.2) 88%,
                      transparent 100%
                    )
                  `,
                }}
              />

              <div
                className="pointer-events-none absolute -right-4 top-0 z-10 w-15 h-full hidden md:block"
                style={{
                  background: `
                    linear-gradient(
                      to left,
                      white 0%,
                      white 10%,
                      white 20%,
                      rgba(255,255,255,0.98) 30%,
                      rgba(255,255,255,0.92) 45%,
                      rgba(255,255,255,0.75) 60%,
                      rgba(255,255,255,0.45) 75%,
                      rgba(255,255,255,0.2) 88%,
                      transparent 100%
                    )
                  `,
                }}
              />

              <button
                onClick={prev}
                className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full grid place-items-center transition cursor-pointer bg-card shadow-md md:bg-transparent md:shadow-none"
              >
                <ChevronLeft className="h-5 w-5 md:h-10 md:w-10" />
              </button>
              <button
                onClick={next}
                className="absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full grid place-items-center transition cursor-pointer bg-card shadow-md md:bg-transparent md:shadow-none"
              >
                <ChevronRight className="h-5 w-5 md:h-10 md:w-10" />
              </button>

              <div className="relative w-full overflow-hidden">
                <div className="relative flex items-center justify-center gap-4 h-50 sm:h-85 md:h-100">
                  {banners.map((s, idx) => {
                    const offset = idx - slide;
                    const isActive = offset === 0;
                    const isSide =
                      Math.abs(offset) === 1 || Math.abs(offset) === banners.length - 1;

                    if (!isActive && !isSide) return null;

                    const normalized =
                      offset === banners.length - 1
                        ? -1
                        : offset === -(banners.length - 1)
                          ? 1
                          : offset;

                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          if (s.event) {
                            navigate({
                              to: "/events/$id",
                              params: { id: String(s.event) },
                            });
                          }
                        }}
                        className={`absolute transition-all duration-500 ease-out rounded-3xl overflow-hidden ${
                          isActive
                            ? "w-200 max-w-[90%] h-full z-10"
                            : "w-200 max-w-[90%] h-[96%] z-0"
                        }`}
                        style={{
                          transform: `translateX(${normalized * 70}%) scale(${isActive ? 1 : 0.9})`,
                        }}
                      >
                        <img
                          src={`${PATH_URL}/${s.image}`}
                          alt={`banner-${idx}`}
                          className="w-full h-full object-fill"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === slide ? "w-6 bg-foreground" : "w-2 bg-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="max-w-[96%] mx-auto px-4 sm:px-6 lg:px-12 mt-10">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-4">

          {/* New: Events / Upcoming / Past tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            {EVENT_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setEventTab(t)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer ${
                  eventTab === t
                    ? "bg-card text-primary shadow-sm"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <Link
            to="/events"
            className="text-primary text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all events <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="border-b border-border flex flex-wrap gap-1 md:gap-2 mb-8 overflow-x-auto">
          {categoryLoading && categories.length === 0
            ? Array.from({ length: 5 }).map((_, i) => <TabSkeleton key={i} />)
            : categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setTabTitle(c.title)}
                  className={`px-4 py-2 text-sm font-semibold transition-colors relative cursor-pointer whitespace-nowrap ${
                    tabTitle === c.title
                      ? "text-primary"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {c.title}
                  {tabTitle === c.title && (
                    <span className="absolute -bottom-px left-3 right-3 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : fetchError ? (
          <p className="text-sm text-red-500">Couldn't load events. Please try again.</p>
        ) : (
          <div className="grid  md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filtered.slice(0, 5).map((e) => (
              <EventCard key={e.id} event={toEventCardProps(e) as any} />
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-foreground/50 col-span-full">
                No events in this category yet.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Explore categories — each one opens the events page pre-filtered */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-10">
        <h2 className="text-3xl font-extrabold text-center">Explore categories</h2>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {categoryLoading && categories.length === 0
            ? Array.from({ length: 5 }).map((_, i) => <CategorySkeleton key={i} />)
            : categories.map((c) => (
                <Link
                  key={c.id}
                  to="/events"
                  search={{ category: c.title }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="transition-transform group-hover:scale-105">
                    <img
                      src={`${PATH_URL}/${c.image}`}
                      alt={c.title}
                      className="h-28 w-28 text-foreground/85"
                    />
                  </div>
                  <p className="mt-4 text-sm font-semibold group-hover:text-primary transition-colors">
                    {c.title}
                  </p>
                  {c.sub_title && <p className="text-xs text-muted-foreground">{c.sub_title}</p>}
                </Link>
              ))}
        </div>
      </section>

      {/* Papon live banner */}
      <section className="max-w-[96%] mx-auto px-4 sm:px-6 lg:px-12 mt-10">
        <div className="relative overflow-hidden rounded-sm md:rounded-3xl bg-dark text-dark-foreground aspect-5/1.5 cursor-pointer">
          <img
            src={bannerMain}
            alt="Papon live"
            className="absolute inset-0 h-full w-full object-fill opacity-70"
          />
        </div>
      </section>

      {/* All Events — filters here hand off to the events page */}
      <section className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-12 mt-10">
        <h2 className="text-3xl font-extrabold">All Events</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-lg border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary transition"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Link>
          {QUICK_FILTERS.map((f) => (
            <Link
              key={f}
              to="/events"
              search={{ filter: f }}
              className="rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium hover:border-primary hover:text-primary transition"
            >
              {f}
            </Link>
          ))}
        </div>

        {loading ? (
          <div className="mt-8 grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : fetchError ? (
          <p className="mt-8 text-sm text-red-500">Couldn't load events. Please try again.</p>
        ) : (
          <div className="mt-8 grid  md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.slice(0, 8).map((e) => (
              <EventCard key={e.id} event={toEventCardProps(e) as any} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-8 py-3 font-semibold hover:opacity-90 transition shadow-[0_10px_30px_-10px_rgba(30,40,210,0.5)]"
          >
            View all events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}