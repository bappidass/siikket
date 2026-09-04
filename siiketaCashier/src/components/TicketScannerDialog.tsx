import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Loader2,
  QrCode,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import securityScanStore, { ScanResult } from "@/store/securityscanStore";


const SCANNER_ELEMENT_ID = "ticket-qr-reader";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const STATUS_UI: Record<
  string,
  { tone: string; icon: JSX.Element; title: string }
> = {
  scanned: {
    tone: "bg-green-50 border-green-200 text-green-800",
    icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
    title: "Ticket scanned",
  },
  already_scanned: {
    tone: "bg-yellow-50 border-yellow-200 text-yellow-800",
    icon: <ShieldAlert className="h-6 w-6 text-yellow-600" />,
    title: "Already scanned",
  },
  zone_mismatch: {
    tone: "bg-red-50 border-red-200 text-red-800",
    icon: <XCircle className="h-6 w-6 text-red-600" />,
    title: "Wrong zone",
  },
  not_assigned: {
    tone: "bg-red-50 border-red-200 text-red-800",
    icon: <XCircle className="h-6 w-6 text-red-600" />,
    title: "Not assigned to this event",
  },
  invalid_booking: {
    tone: "bg-red-50 border-red-200 text-red-800",
    icon: <XCircle className="h-6 w-6 text-red-600" />,
    title: "Invalid booking",
  },
  not_found: {
    tone: "bg-red-50 border-red-200 text-red-800",
    icon: <XCircle className="h-6 w-6 text-red-600" />,
    title: "Ticket not found",
  },
};

export const TicketScannerDialog = ({ open, onOpenChange }: Props) => {
  const { scanTicket, scanning, lastResult, clearLastResult } =
    securityScanStore();

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [busyCode, setBusyCode] = useState<string | null>(null);

  const stopCamera = async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        await scanner.stop();
        await scanner.clear();
      } catch (_) {
      }
      scannerRef.current = null;
    }
  };

  const handleDecoded = async (decodedText: string) => {
    if (busyCode) return; // debounce repeat frames while a scan is in flight
    setBusyCode(decodedText);
    await stopCamera();
    await scanTicket(decodedText.trim());
    setBusyCode(null);
  };

  const startCamera = async () => {
    setCameraError("");
    try {
      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => handleDecoded(decodedText),
        () => {
          /* ignore per-frame decode failures */
        }
      );
    } catch (e: any) {
      setCameraError(
        e?.message || "Could not access camera. Use manual entry below."
      );
    }
  };

  useEffect(() => {
    if (open) {
      clearLastResult();
      setManualCode("");
      // slight delay so the dialog's DOM node exists before Html5Qrcode mounts
      const t = setTimeout(startCamera, 150);
      return () => clearTimeout(t);
    }

    stopCamera();
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => stopCamera, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await stopCamera();
    await scanTicket(manualCode.trim());
  };

  const scanNext = () => {
    clearLastResult();
    setManualCode("");
    startCamera();
  };

  const handleClose = async (nextOpen: boolean) => {
    if (!nextOpen) await stopCamera();
    onOpenChange(nextOpen);
  };

  const result: ScanResult | null = lastResult;
  const statusUi = result ? STATUS_UI[result.status] : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="md:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" /> Scan Ticket
          </DialogTitle>
        </DialogHeader>

        {!result && (
          <div className="space-y-4">
            <div
              id={SCANNER_ELEMENT_ID}
              className="w-full rounded-lg overflow-hidden bg-black/5 min-h-[260px] flex items-center justify-center"
            >
              {scanning && (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              )}
            </div>

            {cameraError && (
              <p className="text-sm text-red-600">{cameraError}</p>
            )}

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <Input
                placeholder="Enter ticket / serial number"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                disabled={scanning}
              />
              <Button type="submit" disabled={scanning || !manualCode.trim()}>
                {scanning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Check"
                )}
              </Button>
            </form>
          </div>
        )}

        {result && statusUi && (
          <div className="space-y-4">
            <div
              className={`flex items-start gap-3 rounded-lg border p-4 ${statusUi.tone}`}
            >
              {statusUi.icon}
              <div>
                <p className="font-semibold">{statusUi.title}</p>
                <p className="text-sm opacity-90">{result.message}</p>
                {result.status === "zone_mismatch" &&
                  result.assigned_zone_name && (
                    <p className="text-sm mt-1">
                      Your zone: <b>{result.assigned_zone_name}</b> · Ticket
                      zone: <b>{result.record?.zone_name || "-"}</b>
                    </p>
                  )}
              </div>
            </div>

            {result.record && (
              <div className="border rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticket #</span>
                  <span className="font-medium">
                    {result.record.ticket_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serial #</span>
                  <span className="font-medium">
                    {result.record.serial_number}
                  </span>
                </div>
                {result.record.event_title && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event</span>
                    <span className="font-medium">
                      {result.record.event_title}
                    </span>
                  </div>
                )}
                {result.record.zone_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zone</span>
                    <span className="font-medium">
                      {result.record.zone_name}
                    </span>
                  </div>
                )}
                {result.record.contact_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Ticket holder
                    </span>
                    <span className="font-medium">
                      {result.record.contact_name}
                    </span>
                  </div>
                )}
                {result.record.is_used && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Scanned by
                      </span>
                      <span className="font-medium">
                        {result.record.scanned_by || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Scanned at
                      </span>
                      <span className="font-medium">
                        {result.record.used_at
                          ? new Date(result.record.used_at).toLocaleString()
                          : "-"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};