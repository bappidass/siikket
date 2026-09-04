import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, Download, Loader2, Ticket as TicketIcon } from "lucide-react";
import type { Booking } from "@/store/bookingStore";
import { downloadTicketPdf } from "@/utils/generateTicketPdf";


export interface TicketRecord {
  id: string;
  booking_id: string;
  ticket_number: string;
  serial_number: string;
  is_used: boolean;
  used_at: string | null;
  scanned_by: string | null;
}

type Props = {
  ticket: TicketRecord;
  booking: Pick<
    Booking,
    "event_title" | "event_date" | "city" | "location" | "seating_type" | "contact_name"
  >;
};

export function TicketQRCode({ ticket, booking }: Props) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadTicketPdf(booking, ticket);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
      <div className="flex flex-col items-center gap-3 p-6 bg-muted/30">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <QRCodeSVG
            value={ticket.serial_number}
            size={176}
            level="M"
            marginSize={2}
          />
        </div>

        <p className="font-mono text-xs tracking-wider text-muted-foreground">
          {ticket.serial_number}
        </p>

        {ticket.is_used ? (
          <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
            <CheckCircle2 className="h-3 w-3" />
            Used
            {ticket.used_at &&
              ` · ${new Date(ticket.used_at).toLocaleString()}`}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
            <TicketIcon className="h-3 w-3" />
            Valid for entry
          </span>
        )}
      </div>

      <div className="p-4 space-y-1.5 text-sm">
        <p className="font-semibold">{booking.event_title}</p>
        <p className="text-muted-foreground">
          {new Date(booking.event_date).toLocaleDateString()} · {booking.city}
        </p>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 mt-2">
          <div>
            <p className="text-xs text-muted-foreground">Ticket No.</p>
            <p className="font-medium">{ticket.ticket_number}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Zone</p>
            <p className="font-medium">{booking.seating_type}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Ticket Holder</p>
            <p className="font-medium">{booking.contact_name}</p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-primary border border-primary/30 rounded-lg py-2 hover:bg-primary/5 transition disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {downloading ? "Preparing…" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}