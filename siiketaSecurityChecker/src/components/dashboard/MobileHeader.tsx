
import { Button } from "@/components/ui/button";
import { Menu, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type MobileHeaderProps = {
  setIsSidebarOpen: (isOpen: boolean) => void;
};

export const MobileHeader = ({ setIsSidebarOpen }: MobileHeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          className="xl:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="xl:hidden">
        </div>
      </div>
      <div className="flex items-center">
      </div>
    </header>
  );
};
