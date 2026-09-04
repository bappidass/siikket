import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";

import { EventCard } from "@/components/event-card";
import { PATH_URL } from "@/utils/api";

import categoryStore from "@/store/categoryStore";
import eventStore, { type EventRecord } from "@/store/eventStore";

const FILTERS = ["Today", "Tomorrow", "This week", "This month"] as const;
type QuickFilter = (typeof FILTERS)[number];

const SORT_OPTIONS = [
  { value: "date_asc", label: "Date: Soonest first" },
  { value: "date_desc", label: "Date: Latest first" },
  { value: "price_asc", label: "Price: Low to high" },
  { value: "price_desc", label: "Price: High to low" },
  { value: "az", label: "Name: A to Z" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

type EventsSearch = {
  // events.category stores the category TITLE (e.g. "Cricket"), not the id
  category?: string;
  filter?: QuickFilter;
};

export const Route = createFileRoute("/events/")({
  validateSearch: (search: Record<string, unknown>): EventsSearch => {
    const category = typeof search.category === "string" ? search.category : undefined;
    const filter = FILTERS.includes(search.filter as QuickFilter)
      ? (search.filter as QuickFilter)
      : undefined;
    return { category, filter };
  },
  head: () => ({
    meta: [
      { title: "All Events — SiiKET" },
      {
        name: "description",
        content:
          "Browse all upcoming concerts, sports matches, comedy and fashion events. Filter by date and book instantly.",
      },
      { property: "og:title", content: "Browse All Events — SiiKET" },
      {
        property: "og:description",
        content: "Browse all upcoming concerts, sports matches and live experiences.",
      },
    ],
  }),
  component: EventsPage,
});

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

function getMinPrice(seatingTypes: { price: string }[] = []) {
  if (!seatingTypes.length) return null;
  return Math.min(...seatingTypes.map((s) => Number(s.price)));
}

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function matchesQuickFilter(iso: string, filter: QuickFilter | null): boolean {
  if (!filter) return true;

  const eventDate = new Date(iso);
  if (Number.isNaN(eventDate.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case "Today": {
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
      return eventDate >= startOfToday && eventDate < startOfTomorrow;
    }
    case "Tomorrow": {
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
      const startOfDayAfter = new Date(startOfToday);
      startOfDayAfter.setDate(startOfDayAfter.getDate() + 2);
      return eventDate >= startOfTomorrow && eventDate < startOfDayAfter;
    }
    case "This week": {
      const startOfNextWeek = new Date(startOfToday);
      startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
      return eventDate >= startOfToday && eventDate < startOfNextWeek;
    }
    case "This month": {
      return (
        eventDate.getFullYear() === now.getFullYear() &&
        eventDate.getMonth() === now.getMonth() &&
        eventDate >= startOfToday
      );
    }
    default:
      return true;
  }
}

function enrichEvent(event: EventRecord) {
  return {
    ...event,
    cardImage: `${PATH_URL}/${event.image}`,
    cardDate: formatEventDate(event.event_date),
    minPrice: getMinPrice(event.seating_types),
  };
}

type EnrichedEvent = ReturnType<typeof enrichEvent>;

function EventsPage() {
  const navigate = Route.useNavigate();
  const { category: categoryParam, filter: filterParam } = Route.useSearch();

  const { fetchCategory, category, loading: categoryLoading } = categoryStore();
  const {
    items: events,
    loading,
    fetchError,
    fetchRecords,
    loadMore,
    page,
    totalPages,
  } = eventStore();

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortValue>("date_asc");
  const panelRef = useRef<HTMLDivElement>(null);

  // API returns categories descending; sort_order 1 should come first
  const categories = useMemo(
    () => [...category].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [category]
  );

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  // the URL is the source of truth — refetch whenever ?category changes
  useEffect(() => {
    fetchRecords({ category: categoryParam ?? "" });
  }, [fetchRecords, categoryParam]);

  // draft selection inside the panel, committed on Apply
  const [draftCategory, setDraftCategory] = useState<string | null>(categoryParam ?? null);

  useEffect(() => {
    setDraftCategory(categoryParam ?? null);
  }, [categoryParam]);

  const appliedCategory = categories.find((c) => c.title === categoryParam) ?? null;
  const active = filterParam ?? null;

  const setActive = (next: QuickFilter | null) => {
    navigate({
      search: (prev) => ({ ...prev, filter: next ?? undefined }),
      replace: true,
    });
  };

  const setCategoryParam = (next: string | null) => {
    navigate({
      search: (prev) => ({ ...prev, category: next ?? undefined }),
      replace: true,
    });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    };
    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

  const toggleDraftCategory = (title: string) => {
    setDraftCategory((prev) => (prev === title ? null : title));
  };

  const applyFilters = () => {
    setCategoryParam(draftCategory);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setDraftCategory(null);
    setSortBy("date_asc");
    navigate({ search: {}, replace: true });
  };

  const activeFilterCount =
    (categoryParam ? 1 : 0) + (sortBy !== "date_asc" ? 1 : 0) + (active ? 1 : 0);

  const filteredEvents: EnrichedEvent[] = useMemo(() => {
    let list = events.map(enrichEvent);

    if (active) {
      list = list.filter((e) => matchesQuickFilter(e.event_date, active));
    }

    switch (sortBy) {
      case "date_asc":
        list.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
        break;
      case "date_desc":
        list.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
        break;
      case "price_asc":
        list.sort((a, b) => (a.minPrice ?? 0) - (b.minPrice ?? 0));
        break;
      case "price_desc":
        list.sort((a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0));
        break;
      case "az":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return list;
  }, [events, sortBy, active]);

  return (
    <div className="min-h-screen">
      <main className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-12 mt-8">
        <h1 className="text-3xl md:text-4xl font-extrabold">{categoryParam ?? "All Events"}</h1>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                showFilters || activeFilterCount > 0
                  ? "border-primary text-primary bg-primary/5"
                  : "border-foreground/20 bg-card"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>

            {showFilters && (
              <div className="absolute left-0 z-30 mt-2 w-80 max-w-[90vw] rounded-2xl border border-border bg-card p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">Filter events</p>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-foreground/50 hover:text-foreground cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                    Category
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categoryLoading &&
                      categories.length === 0 &&
                      Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-7 w-20 rounded-full bg-foreground/10 animate-pulse"
                        />
                      ))}

                    {categories.map((c) => {
                      const isSelected = draftCategory === c.title;
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleDraftCategory(c.title)}
                          aria-pressed={isSelected}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background hover:border-primary/50"
                          }`}
                        >
                          {c.image && (
                            <img
                              src={`${PATH_URL}/${c.image}`}
                              alt=""
                              className="h-4 w-4 rounded-full object-cover"
                            />
                          )}
                          {c.title}
                        </button>
                      );
                    })}

                    {!categoryLoading && categories.length === 0 && (
                      <p className="text-xs text-foreground/50">No categories found.</p>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                    Sort by
                  </p>
                  <div className="mt-3 space-y-1">
                    {SORT_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-background cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="sortBy"
                          value={opt.value}
                          checked={sortBy === opt.value}
                          onChange={() => setSortBy(opt.value)}
                          className="accent-primary"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-foreground/60 hover:text-foreground cursor-pointer"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={applyFilters}
                    className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(active === f ? null : f)}
              className={`rounded-lg border px-5 py-2 text-sm font-medium transition cursor-pointer ${
                active === f
                  ? "border-primary text-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary hover:text-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {(categoryParam || active) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {active && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {active}
                <button onClick={() => setActive(null)} className="cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {categoryParam && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {appliedCategory?.title ?? categoryParam}
                <button onClick={() => setCategoryParam(null)} className="cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="mt-10 grid  md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : fetchError ? (
          <p className="mt-16 text-center text-sm text-red-500">
            Couldn't load events. Please try again.
          </p>
        ) : (
          <>
            <div className="mt-10 grid sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {filteredEvents.map((e) => (
                <EventCard
                  key={e.id}
                  event={
                    {
                      id: e.id,
                      title: e.title,
                      image: e.cardImage,
                      date: e.cardDate,
                      city: e.city,
                    } as any
                  }
                />
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <p className="mt-16 text-center text-sm text-foreground/60">
                No events match your filters.
              </p>
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-3">
                <button
                  disabled={page <= 1}
                  onClick={() => loadMore(page - 1)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition"
                >
                  Previous
                </button>
                <span className="flex items-center text-sm text-foreground/60">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => loadMore(page + 1)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}