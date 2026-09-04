import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import securityAuthStore from "@/store/authStore";
import securityScanStore from "@/store/securityscanStore";
import { ScannedTicketsTable } from "@/components/Tables/ScannedTicketsTable";
import { TicketScannerDialog } from "@/components/TicketScannerDialog";

const TicketList = () => {
  const { profile, fetchProfile } = securityAuthStore();
  const { fetchStats } = securityScanStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, profile]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentActive={"Tickets"}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />

        <div className="max-h-screen overflow-y-auto p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Scanned Tickets
              </h1>
              <p className="text-muted-foreground">
                Tickets you've scanned across all assigned events.
              </p>
            </div>

            <Button onClick={() => setScannerOpen(true)}>
              <QrCode className="w-4 h-4 mr-2" />
              Scan Ticket
            </Button>
          </div>

          <ScannedTicketsTable />
        </div>
      </div>

      <TicketScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} />
    </div>
  );
};

export default TicketList;