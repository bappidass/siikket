import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, Ticket, User, ChevronUp } from "lucide-react";
import { PATH_URL } from "@/utils/api";
import eventStore from "@/store/eventStore";
import bookingStore from "@/store/bookingStore";
import authStore from "@/store/authStore";

export const Route = createFileRoute("/checkout/$id")({
  validateSearch: (search: Record<string, unknown>) => ({
    seatId: typeof search.seatId === "string" ? search.seatId : undefined,
    quantity: typeof search.quantity === "number" ? search.quantity : 1,
  }),
  loader: async ({ params }) => {
    const event = await eventStore.getState().fetchOne(params.id);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Checkout — ${loaderData?.event.title ?? "Event"}` },
      { name: "description", content: "Confirm your booking and complete payment securely." },
    ],
  }),
  notFoundComponent: () => <div className="p-12 text-center">Event not found.</div>,
  errorComponent: () => <div className="p-12 text-center">Something went wrong.</div>,
  component: CheckoutPage,
});

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
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

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function CheckoutPage() {
  const { event } = Route.useLoaderData();
  const { seatId, quantity } = Route.useSearch();
  const navigate = useNavigate();

  const profile = authStore((s) => s.profile);
  const { createBooking, creating, error: bookingError } = bookingStore();

  const sections = event.seating_types ?? [];
  const selectedSeat = sections.find((s) => s.id === seatId) ?? sections[0];

  const unitPrice = selectedSeat ? Number(selectedSeat.price) : 0;
  const baseAmount = unitPrice * quantity;
  const grandTotal = baseAmount;

  const [contactName, setContactName] = useState(profile?.name ?? "");
  const [contactPhone, setContactPhone] = useState(profile?.phone ?? "");
  const [contactEmail, setContactEmail] = useState(profile?.email ?? "");
  const [payError, setPayError] = useState<string | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  useEffect(() => {
    loadRazorpayScript().then(setRazorpayReady);
  }, []);

  useEffect(() => {
    setContactName(profile?.name ?? "");
    setContactPhone(profile?.phone ?? "");
    setContactEmail(profile?.email ?? "");
  }, [profile]);

  const contactValid =
    contactName.trim().length > 0 &&
    contactPhone.trim().length > 0 &&
    contactEmail.trim().length > 0;

  const handlePayNow = async () => {
    setPayError(null);

    if (!selectedSeat) {
      setPayError("Please select a section.");
      return;
    }
    if (!contactValid) {
      setPayError("Please fill in your name, phone and email.");
      return;
    }
    if (!razorpayReady || !(window as any).Razorpay) {
      setPayError("Payment could not load. Please refresh and try again.");
      return;
    }

    const result = await createBooking({
      event_id: event.id,
      seating_type_id: selectedSeat.id,
      quantity,
      contact_name: contactName.trim(),
      contact_phone: contactPhone.trim(),
      contact_email: contactEmail.trim(),
    });

    if (!result.status || !result.booking) {
      setPayError(result.message ?? "Failed to create booking");
      return;
    }

    const booking = result.booking;

    if (!booking.order_id) {
      setPayError("Could not start payment for this booking. Please try again.");
      return;
    }

    const options = {
      key: "rzp_live_TJdk0dE3dhK3YI",
      amount: Math.round(Number(booking.total_amount) * 100),
      currency: "INR",
      name: event.title,
      description: `Booking for ${event.title}`,
      order_id: booking.order_id,
      prefill: {
        name: contactName,
        email: contactEmail,
        contact: contactPhone,
      },
      handler: () => {
      
        navigate({ to: "/bookings/$bookingId", params: { bookingId: booking.id } });
      },
      modal: {
        ondismiss: () => {
        
        },
      },
      theme: {
        color: "#1e28d2",
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", () => {
      setPayError("Payment failed. Please try again.");
    });
    rzp.open();
  };

  const combinedError = payError ?? bookingError;

  const [timeLeft, setTimeLeft] = useState(10 * 60);
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-8">
        <div className="rounded-2xl bg-success/15 px-6 py-4 flex items-center justify-center gap-3 text-foreground">
          <Clock className="h-5 w-5 text-foreground/80" />
          <span className="font-semibold">Complete your booking</span>
          <span className="text-foreground/70">
            in {minutes}:{seconds}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Confirm details and payment</h1>
            <p className="mt-2 text-sm text-foreground/75">{event.description}</p>

            <div className="mt-6 rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
              <Ticket className="h-5 w-5 text-primary" />
              <span className="text-sm">Entry using the QR code on your app</span>
            </div>

            <div className="mt-3 rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-5 w-5 text-primary" />
                <span>Buying tickets for this event</span>
              </div>
              <div className="mt-2 pl-8 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                <span>{formatEventDate(event.event_date)}</span>
                <span>|</span>
                <span>{event.city}</span>
              </div>
            </div>

            <h2 className="mt-10 text-2xl font-extrabold">Contact details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your tickets and updates will be sent here.
            </p>
            <div className="mt-4 rounded-2xl bg-card border border-border p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  Full name
                </span>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your full name"
                  className="rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  Phone
                </span>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  Email
                </span>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </label>
            </div>

            <h2 className="mt-10 text-2xl font-extrabold">Payment summary</h2>
            <div className="mt-5 rounded-2xl bg-card border border-border p-5">
              <div className="flex items-center justify-between">
                <button className="inline-flex items-center gap-1 text-sm font-semibold">
                  Order amount <ChevronUp className="h-4 w-4" />
                </button>
                <span className="font-bold">₹ {baseAmount.toLocaleString()}/-</span>
              </div>
              <div className="mt-3 pl-2 space-y-2 text-sm text-foreground/75">
                <div className="flex justify-between">
                  <span>
                    {quantity} x {selectedSeat?.name ?? "Ticket"}
                  </span>
                  <span>₹ {baseAmount.toLocaleString()}/-</span>
                </div>
              </div>
              <div className="my-4 border-t border-border" />
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-lg">Grand Total</span>
                <span className="font-extrabold text-lg">₹ {grandTotal.toLocaleString()}/-</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-8 self-start space-y-4">
            <div className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-start gap-4">
                <img
                  src={`${PATH_URL}/${event.image}`}
                  alt={event.title}
                  className="h-20 w-20 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-lg leading-tight">{event.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{event.address}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-foreground/80">
                {formatEventDate(event.event_date)}{" "}
                <span className="mx-2 text-foreground/40">|</span>{" "}
                {formatEventTime(event.event_date)}
              </div>
              {selectedSeat && (
                <div className="mt-4 border-t border-border pt-4 flex items-start justify-between">
                  <div>
                    <p className="text-sm">
                      {quantity} x {selectedSeat.name}
                    </p>
                    <span className="mt-2 inline-flex rounded-md bg-muted px-2 py-0.5 text-xs">
                      Free Seating
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹ {baseAmount.toLocaleString()}</p>
                  </div>
                </div>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Entry using the QR code on your app
              </p>
            </div>

            <button
              onClick={handlePayNow}
              disabled={creating || !selectedSeat}
              className="w-full rounded-2xl bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-[0_15px_40px_-15px_rgba(30,40,210,0.6)] hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-left">
                <p className="text-xs opacity-80">To pay</p>
                <p className="text-lg font-extrabold">₹ {grandTotal.toLocaleString()}/-</p>
              </div>
              <span className="inline-flex items-center gap-1 font-bold">
                {creating ? "Processing…" : "Pay Now →"}
              </span>
            </button>

            {combinedError && (
              <p className="text-sm text-destructive text-center">{combinedError}</p>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
