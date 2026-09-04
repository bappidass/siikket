import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Search, User, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import authStore from "@/store/authStore";
import uiStore from "@/store/uiStore";
import eventStore from "@/store/eventStore";
import logo from "@/assets/blue_logo.png";
import { resolveImageUrl } from "@/utils/constants";

const MAX_RESULTS = 6;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const profile = authStore((s) => s.profile);
  const openProfileSheet = uiStore((s) => s.openProfileSheet);
  const signedIn = !!profile;

  const events = eventStore((s) => s.items);
  const fetchRecords = eventStore((s) => s.fetchRecords);

  // make sure we have events available to search over
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    if (showResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showResults]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return events.filter((e) => e.title?.toLowerCase().includes(q)).slice(0, MAX_RESULTS);
  }, [events, query]);

  const goToEvent = (id: string | number) => {
    setShowResults(false);
    setQuery("");
    navigate({ to: "/events/$id", params: { id: String(id) } });
  };

  const nav = [
    { to: "/", label: "Home" },
    { to: "/events", label: "Events" },
     { to: "/aboutus", label: "About Us" },
    { to: "/contact", label: "Contact Us" },
  ] as const;

  return (
    <header className="w-full px-4 sm:px-8 lg:px-14 pt-6 pb-2">
      <div className="flex items-center gap-4 lg:gap-8">
        <Link to="/" className="shrink-0 text-2xl font-extrabold tracking-tight text-primary">
          <img src={logo} className="h-12.5" />
        </Link>

        <nav className="hidden md:flex flex-1 justify-center">
          <ul className="flex items-center gap-1 rounded-full bg-card/80 backdrop-blur px-3 py-2 shadow-[0_4px_24px_-12px_rgba(30,40,90,0.18)] border border-border/60">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      active
                        ? "text-primary underline underline-offset-8 decoration-2"
                        : "text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div ref={searchRef} className="relative hidden lg:block w-64">
            <div className="flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2 shadow-[0_2px_10px_-6px_rgba(30,40,90,0.15)]">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => {
                  if (query.trim()) setShowResults(true);
                }}
                placeholder="Search for events.."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setShowResults(false);
                  }}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {showResults && query.trim() && (
              <div className="absolute left-0 right-0 z-30 mt-2 rounded-2xl border border-border bg-card p-2 shadow-xl max-h-96 overflow-y-auto">
                {results.length > 0 ? (
                  results.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => goToEvent(event.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-background transition cursor-pointer"
                    >
                      <img
                        src={resolveImageUrl(event.image)}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        {event.city && (
                          <p className="text-xs text-muted-foreground truncate">{event.city}</p>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                    No events found for "{query}"
                  </p>
                )}
              </div>
            )}
          </div>

          {signedIn ? (
            <button
              type="button"
              onClick={openProfileSheet}
              className="h-10 w-10 rounded-full bg-card border border-border grid place-items-center overflow-hidden"
            >
              {profile?.avatar ? (
                <img
                  src={resolveImageUrl(profile.avatar)}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          ) : (
            <>
              <Link
                to="/signin"
                className="rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold hover:opacity-90 transition shadow-[0_8px_20px_-10px_rgba(34,49,210,0.55)]"
              >
                Sign in
              </Link>
              <div className="h-10 w-10 rounded-full bg-card border border-foreground/80 grid place-items-center">
                <User className="h-5 w-5" />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}