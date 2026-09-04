import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import fleetStore from "@/store/fleetStore";
import clientStore from "@/store/clientStore";
import { ChallanTable } from "@/components/Tables/ChallanTable";
import challanStore from "@/store/challanStore";

const ChallanList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const items = challanStore((state) => state.items);
  const loading = challanStore((state) => state.loading);
  const fetchData = challanStore((state) => state.fetchRecords);
  const { fetchRecords } = fleetStore();
  const { fetchRecords: fetchClients } = clientStore();
  const [list, setList] = useState([]);
  useEffect(() => {
    fetchData();
    fetchClients();
    fetchRecords();
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
        currentActive={"Delivery Challans"}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />
        <div className="max-h-screen overflow-y-auto">
          <ChallanTable
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

export default ChallanList;
