import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, ShieldCheck, TicketCheck, CalendarClock } from "lucide-react";
import securityScanStore from "@/store/securityscanStore";
import securityAuthStore from "@/store/authStore";
import { TicketScannerDialog } from "@/components/TicketScannerDialog";
import { ScannedTicketsTable } from "@/components/Tables/ScannedTicketsTable";

export const SecurityCheckerDashboard = () => {
  const { profile } = securityAuthStore();
  const { stats, fetchStats, assignments, fetchAssignments } =
    securityScanStore();

  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchAssignments();
  }, []);

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {profile?.name
              ? `Welcome back, ${profile.name}!`
              : "Welcome back!"}
          </p>
        </div>

        <Button size="lg" onClick={() => setScannerOpen(true)}>
          <QrCode className="w-4 h-4 mr-2" />
          Scan Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <TicketCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Tickets Scanned
              </p>
              <p className="text-2xl font-bold">{stats.total_scanned}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Scanned Today
              </p>
              <p className="text-2xl font-bold">{stats.today_scanned}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="h-4 w-4" /> Your Zone Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assignments.map((a: any) => (
              <div
                key={a.id}
                className="border rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{a.event_title}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.city} ·{" "}
                    {a.event_date
                      ? new Date(a.event_date).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <span className="text-xs font-medium bg-primary/10 text-primary rounded-full px-3 py-1">
                  {a.zone_name}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <ScannedTicketsTable />

      <TicketScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} />
    </main>
  );
};