import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { FleetTable } from "@/components/Tables/FleetTable";
import fleetStore from "@/store/fleetStore";

const FleetList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const items = fleetStore((state) => state.items);
  const loading = fleetStore((state) => state.loading);
  const fetchData = fleetStore((state) => state.fetchRecords);
  const [list, setList] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    setList(items);
  }, [items]);

  const memoizedItemList = useMemo(() => {
    return [...list].sort((a, b) => b.id - a.id);
  }, [list]);

  const handleSearchChange = (value: string) => {
    const ar = items.filter((a)=>a.name.toLowerCase().includes(value.toLowerCase()));
    if(value.trim()==''){
      setList(items);
    }else{
      setList(ar);
    }
  };
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentActive={"Fleets"}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />
        <div className="max-h-screen overflow-y-auto">
          <FleetTable
            items={memoizedItemList}
            loading={loading}
            error={false}
            onSearchChange={handleSearchChange}
          />
        </div>
      </div>
    </div>
  );
};

export default FleetList;
