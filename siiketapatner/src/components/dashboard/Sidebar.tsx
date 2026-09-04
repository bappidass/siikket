import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Users2,
  User,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import useAuthStore from "@/store/authStore";

type SidebarProps = {
  isOpen: boolean;
  currentActive: string;
  setIsOpen: (isOpen: boolean) => void;
};

type MenuItemProps = {
  icon: React.ReactNode;
  title: string;
  isActive?: boolean;
  hasSubmenu?: boolean;
  children?: React.ReactNode;
};

const MenuItem = ({
  icon,
  title,
  isActive = false,
  hasSubmenu = false,
  children,
}: MenuItemProps) => {
  const [isExpanded, setIsExpanded] = useState(() => hasSubmenu && isActive);
  useEffect(() => {
    if (hasSubmenu && isActive) {
      setIsExpanded(true);
    }
  }, [isActive, hasSubmenu]);
  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => hasSubmenu && setIsExpanded(!isExpanded)}
        className={cn(
          "flex w-full justify-between items-center mb-1 px-3",
          isActive ? "bg-gray-100 text-primary" : "hover:bg-muted",
        )}
      >
        <div className="flex items-center">
          <div className="mr-2 h-5 w-5">{icon}</div>
          <span className="font-medium">{title}</span>
        </div>
        {hasSubmenu && (
          <div className="h-5 w-5">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        )}
      </Button>
      {hasSubmenu && isExpanded && (
        <div className="pl-9 pr-3 py-1 space-y-1">{children}</div>
      )}
    </div>
  );
};

export const Sidebar = ({ isOpen, setIsOpen, currentActive }: SidebarProps) => {
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);
  const hanldeLogout = () => {
    logout();
  };
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center mr-2">
                <span className="text-white font-bold">S</span>
              </div>
              <h1 className="text-xl  font-semibold">SIIKET PARTNERS</h1>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              <Link to="/">
                <MenuItem
                  icon={<LayoutDashboard className="h-5 w-5" />}
                  title="Dashboard"
                  isActive={currentActive == "Dashboard"}
                />
              </Link>

              <Link to="/crew-members">
                <MenuItem
                  icon={<Users2 className="h-5 w-5" />}
                  isActive={currentActive == "Crews"}
                  title="Crew Members"
                />
              </Link>
              <Link to="/events">
                <MenuItem
                  icon={<FileText className="h-5 w-5" />}
                  isActive={currentActive == "Events"}
                  title="Events"
                />
              </Link>

              <Link to="/profile">
                <MenuItem
                  icon={<User className="h-5 w-5" />}
                  isActive={currentActive == "Profile"}
                  title="Profile"
                />
              </Link>
            </nav>
          </div>

          <div className="border-t border-gray-200 p-4">
            {profile && (
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {profile?.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.email}
                  </p>
                </div>
              </div>
            )}
            <Button
              onClick={() => hanldeLogout()}
              variant="ghost"
              className="w-full justify-start mt-3 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
