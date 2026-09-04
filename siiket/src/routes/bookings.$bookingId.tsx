import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, MapPin, CalendarDays } from "lucide-react";
import bookingStore, { isBookingComplete } from "@/store/bookingStore";
import { resolveImageUrl } from "@/utils/constants";
import { downloadAuthedFile } from "@/utils/download";
import { useEffect, useState } from "react";
import { TicketQRCode } from "@/components/TicketQRCode";

export const Route = createFileRoute("/bookings/$bookingId")({
  component: BookingDetailPage,
});

function BookingDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-muted" />
        <div className="h-4 w-16 rounded bg-muted" />
      </div>

      <div className="rounded-2xl border border-border/60 overflow-hidden">
        <div className="w-full h-48 bg-muted" />
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="h-6 w-48 rounded bg-muted" />
            <div className="h-5 w-20 rounded-full bg-muted" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-4 w-20 rounded bg-muted" />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 border-t border-border/60 pt-4">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-4 w-28 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingDetailPage() {
  const { bookingId } = Route.useParams();

  const booking = bookingStore((s) => s.currentBooking);
  const fetchBookingById = bookingStore((s) => s.fetchBookingById);

  const [busy, setBusy] = useState<"invoice" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (bookingId) {
      setLoading(true);
      Promise.resolve(fetchBookingById(bookingId)).finally(() => {
        if (!cancelled) setLoading(false);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [bookingId, fetchBookingById]);

  if (loading) {
    return <BookingDetailSkeleton />;
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-muted-foreground">
          Booking not found. If you refreshed this page directly, your bookings may not be loaded
          yet — go back to your profile first.
        </p>
        <Link to="/" className="text-primary text-sm underline mt-3 inline-block">
          Go home
        </Link>
      </div>
    );
  }

  const complete = isBookingComplete(booking);

  const handleInvoice = async () => {
    try {
      setBusy("invoice");
      await downloadAuthedFile(`/api/booking/${booking.id}/invoice`, `invoice-${booking.id}.pdf`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link
        to="/"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="rounded-2xl border border-border/60 overflow-hidden">
        <img
          src={resolveImageUrl(booking.event_image)}
          alt={booking.event_title}
          className="w-full h-48 object-cover"
        />
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <h1 className="text-xl font-bold">{booking.event_title}</h1>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                complete
                  ? "bg-green-100 text-green-700"
                  : booking.booking_status === "expired"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {complete
                ? "Confirmed"
                : booking.booking_status === "expired"
                  ? "Expired"
                  : "Pending"}
            </span>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {new Date(booking.event_date).toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {booking.location}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-t border-border/60 pt-4">
            <div>
              <p className="text-muted-foreground">Seating</p>
              <p className="font-medium">{booking.seating_type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-medium">{booking.quantity}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Amount</p>
              <p className="font-medium">₹{booking.total_amount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Order ID</p>
              <p className="font-medium truncate">{booking.order_id ?? "—"}</p>
            </div>
          </div>

          {complete ? (
            <div className="flex items-center gap-4 border-t border-border/60 pt-4">
              <button
                onClick={handleInvoice}
                disabled={busy === "invoice"}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline disabled:opacity-50"
              >
                <FileText className="h-4 w-4" />{" "}
                {busy === "invoice" ? "Downloading…" : "Download invoice"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground border-t border-border/60 pt-4">
              {booking.booking_status === "expired"
                ? "This booking expired before payment was completed — no invoice or ticket is available."
                : "Payment is still pending — invoice and ticket will be available once payment completes."}
            </p>
          )}
        </div>
      </div>

      {complete && booking.tickets && booking.tickets.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            {booking.tickets.length > 1
              ? `Your Tickets (${booking.tickets.length})`
              : "Your Ticket"}
          </h2>
          <p className="text-sm text-muted-foreground -mt-1">
            Show this QR code to security at the gate for scanning.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {booking.tickets.map((ticket) => (
              <TicketQRCode key={ticket.id} ticket={ticket} booking={booking} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}