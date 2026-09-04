import jsPDF from "jspdf";
import QRCode from "qrcode";



export interface TicketPdfBooking {
  event_title: string;
  event_date: string;
  city: string;
  location: string;
  seating_type: string;
  contact_name: string;
}

export interface TicketPdfTicket {
  ticket_number: string;
  serial_number: string;
}


export async function downloadTicketPdf(
  booking: TicketPdfBooking,
  ticket: TicketPdfTicket
) {
  const qrDataUrl = await QRCode.toDataURL(ticket.serial_number, {
    margin: 1,
    width: 300,
  });

  const pageWidth = 320;
  const pageHeight = 500;
  const doc = new jsPDF({ unit: "pt", format: [pageWidth, pageHeight] });

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(booking.event_title, 20, 40, { maxWidth: pageWidth - 40 });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(
    `${new Date(booking.event_date).toLocaleDateString()} - ${booking.city}`,
    20,
    60
  );

  doc.addImage(qrDataUrl, "PNG", 60, 90, 200, 200);

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(ticket.serial_number, pageWidth / 2, 305, { align: "center" });

  doc.setTextColor(0);
  doc.setFontSize(10);

  let y = 335;
  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "-", 120, y, { maxWidth: pageWidth - 140 });
    y += 22;
  };

  row("Ticket No.", ticket.ticket_number);
  row("Zone", booking.seating_type);
  row("Ticket Holder", booking.contact_name);
  row("Venue", booking.location);

  doc.save(`ticket-${ticket.ticket_number}.pdf`);
}