import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { useParams } from "react-router-dom";
import { InvoicePaymentTable } from "@/components/Tables/InvoicePaymentTable";
import invoicePaymentstore from "@/store/invoicePaymentStore";

const InvoicePayments = () => {
  const {id} = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const items = invoicePaymentstore((state) => state.items);
  const loading = invoicePaymentstore((state) => state.loading);
  const fetchData = invoicePaymentstore((state) => state.fetchRecords);
  const [list, setList] = useState([]);
  useEffect(() => {
    fetchData(id);
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
          <InvoicePaymentTable
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

export default InvoicePayments;
