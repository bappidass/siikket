import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { PATH_URL } from "@/utils/api";
import eventStore from "@/store/eventStore";

export const Route = createFileRoute("/seats/$id")({
  loader: async ({ params }) => {
    const event = await eventStore.getState().fetchOne(params.id);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Choose your section — ${loaderData?.event.title ?? "Event"}` },
      { name: "description", content: `Pick your seats for ${loaderData?.event.title}.` },
    ],
  }),
  notFoundComponent: () => <div className="p-12 text-center">Event not found.</div>,
  errorComponent: () => <div className="p-12 text-center">Something went wrong.</div>,
  component: SeatsPage,
});

const QUICK_QUANTITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const MAX_QUANTITY = 20;

function QuantityModal({
  value,
  onSelect,
  onClose,
}: {
  value: number;
  onSelect: (n: number) => void;
  onClose: () => void;
}) {
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState(
    QUICK_QUANTITIES.includes(value) ? "" : String(value)
  );

  const submitCustom = () => {
    const n = Number(customValue);
    if (n > 0 && n <= MAX_QUANTITY) {
      onSelect(n);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Select seat(s)</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-border grid place-items-center hover:bg-muted transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!customMode ? (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {QUICK_QUANTITIES.map((n) => {
              const isSelected = value === n;
              return (
                <button
                  key={n}
                  onClick={() => {
                    onSelect(n);
                    onClose();
                  }}
                  className={`h-16 rounded-2xl border text-xl font-semibold transition cursor-pointer ${
                    isSelected
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {n}
                </button>
              );
            })}
            <button
              onClick={() => setCustomMode(true)}
              className="col-span-2 h-16 rounded-2xl border border-border hover:border-primary/50 transition inline-flex items-center justify-center gap-2 text-lg font-medium cursor-pointer"
            >
              <span className="text-foreground/50">⟨</span>
              Custom
              <span className="text-foreground/50">⟩</span>
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <label className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
              Number of seats
            </label>
            <input
              type="number"
              min={1}
              max={MAX_QUANTITY}
              autoFocus
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitCustom()}
              placeholder={`1–${MAX_QUANTITY}`}
              className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-lg font-semibold focus:outline-none focus:border-primary"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setCustomMode(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold hover:bg-muted transition cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={submitCustom}
                disabled={!customValue || Number(customValue) < 1 || Number(customValue) > MAX_QUANTITY}
                className="flex-1 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SeatsPage() {
  const { event } = Route.useLoaderData();
  const sections = event.seating_types ?? [];
  const [selected, setSelected] = useState<string>(sections[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [showQuantityModal, setShowQuantityModal] = useState(false);

  return (
    <div className="min-h-screen">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square max-w-[520px] mx-auto relative">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              {/* outer ring */}
              <circle cx="200" cy="200" r="190" fill="none" stroke="#d1d5db" strokeWidth="40" strokeDasharray="6 4" opacity="0.4" />
              {/* north stand (top) */}
              <path d="M 80 80 A 170 170 0 0 1 320 80 L 290 110 A 130 130 0 0 0 110 110 Z" fill="#d1d5db" />
              {/* north stand (bottom labeled North) */}
              <path d="M 80 320 A 170 170 0 0 0 320 320 L 290 290 A 130 130 0 0 1 110 290 Z" fill="#d1d5db" />
              {/* left north stand */}
              <path d="M 30 200 A 170 170 0 0 1 80 80 L 110 110 A 130 130 0 0 0 70 200 Z" fill="#e5e7eb" />
              <text x="55" y="200" fontSize="14" fontWeight="bold" fill="#6b7280" transform="rotate(-90 55 200)" textAnchor="middle">North Stand</text>
              {/* right north stand */}
              <path d="M 370 200 A 170 170 0 0 0 320 80 L 290 110 A 130 130 0 0 1 330 200 Z" fill="#e5e7eb" />
              <text x="345" y="200" fontSize="14" fontWeight="bold" fill="#6b7280" transform="rotate(90 345 200)" textAnchor="middle">North Stand</text>
              {/* available blue segment bottom-right */}
              <path
                d="M 200 330 A 130 130 0 0 0 320 290 L 360 320 A 170 170 0 0 1 200 370 Z"
                fill={selected ? "oklch(0.46 0.24 264)" : "#d1d5db"}
                className="cursor-pointer"
              />
              {/* field */}
              <circle cx="200" cy="200" r="120" fill="#22c55e" />
              <circle cx="200" cy="200" r="90" fill="#16a34a" opacity="0.85" />
              <circle cx="200" cy="200" r="60" fill="#15803d" opacity="0.7" />
              <rect x="175" y="170" width="50" height="60" fill="none" stroke="white" strokeWidth="2" />
              <line x1="200" y1="170" x2="200" y2="230" stroke="white" strokeWidth="1.5" />
              {/* compass */}
              <g transform="translate(360 30)">
                <path d="M 0 -15 L 5 5 L 0 0 L -5 5 Z" fill="#374151" />
                <text x="0" y="-20" fontSize="10" textAnchor="middle" fill="#374151">N</text>
              </g>
            </svg>
          </div>
          <div className="mt-6 flex justify-center gap-6 text-xs">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-primary rounded-sm" /> Available</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-gray-200 rounded-sm" /> Nearly Sold</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-gray-400 rounded-sm" /> Sold out</span>
          </div>
        </div>

        {/* Sections list */}
        <div>
          <h1 className="text-3xl font-extrabold">Choose your section</h1>
          <button
            onClick={() => setShowQuantityModal(true)}
            className="mt-4 inline-flex items-center gap-3 rounded-lg bg-dark text-dark-foreground px-5 py-2.5 text-sm font-semibold cursor-pointer"
          >
            {quantity} ticket{quantity > 1 ? "s" : ""} <ChevronDown className="h-4 w-4" />
          </button>
          <p className="mt-4 text-sm text-muted-foreground">{sections.length} sections live</p>

          <div className="mt-5 space-y-3">
            {sections.map((s) => {
              const soldOut = s.available_seats <= 0;
              const nearlySold = !soldOut && s.available_seats <= 5;
              return (
                <button
                  key={s.id}
                  disabled={soldOut}
                  onClick={() => setSelected(s.id)}
                  className={`w-full flex items-center gap-4 rounded-2xl bg-card p-3 pr-4 text-left transition border disabled:opacity-50 disabled:cursor-not-allowed ${
                    selected === s.id
                      ? "border-primary shadow-[0_10px_30px_-15px_rgba(30,40,210,0.5)]"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {soldOut ? (
                      <p className="text-xs text-red-500 mb-1 font-semibold">Sold out</p>
                    ) : nearlySold ? (
                      <p className="text-xs text-muted-foreground mb-1">
                        {s.available_seats} seats left!
                      </p>
                    ) : null}
                    <p className="font-bold text-foreground truncate">{s.name}</p>
                    <p className="mt-1 font-semibold">
                      ₹ {Number(s.price).toLocaleString()}
                    </p>
                    <span className="mt-2 inline-flex rounded-md bg-muted px-2 py-0.5 text-xs">
                      Free Seating
                    </span>
                  </div>
                  {s.image && (
                    <img
                      src={`${PATH_URL}/${s.image}`}
                      alt={s.name}
                      className="h-20 w-32 object-cover rounded-xl shrink-0"
                    />
                  )}
                </button>
              );
            })}
            {sections.length === 0 && (
              <p className="text-sm text-muted-foreground">No sections available for this event yet.</p>
            )}
          </div>

          <Link
            to="/checkout/$id"
            params={{ id: event.id }}
            search={{ seatId: selected, quantity }}
            className={`mt-8 w-full inline-flex justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3.5 font-bold shadow-[0_10px_30px_-10px_rgba(30,40,210,0.55)] transition ${
              selected ? "hover:opacity-90" : "opacity-50 pointer-events-none"
            }`}
          >
            Proceed to Checkout
          </Link>
        </div>
      </main>

      {showQuantityModal && (
        <QuantityModal
          value={quantity}
          onSelect={setQuantity}
          onClose={() => setShowQuantityModal(false)}
        />
      )}
    </div>
  );
}