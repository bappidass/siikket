
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SecurityCheckerDashboard } from "@/components/dashboard/DashboardContent";
import { useState } from "react";
import { MobileHeader } from "@/components/dashboard/MobileHeader";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} currentActive={"Dashboard"} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />
        <SecurityCheckerDashboard />
      </div>
    </div>
  );
};

export default Index;
