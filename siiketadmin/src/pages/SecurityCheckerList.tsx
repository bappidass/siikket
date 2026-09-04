import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { SecurityCheckerTable } from "@/components/Tables/SecurityCheckerTable";
import securityCheckerStore from "@/store/securityCheckerStore";

const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
) => {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const SecurityCheckerList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const items = securityCheckerStore((state) => state.items);
  const loading = securityCheckerStore((state) => state.loading);
  const fetchData = securityCheckerStore((state) => state.fetchRecords);
  const searchRecords = securityCheckerStore((state) => state.searchRecords);
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setList(items);
  }, [items]);

  const memoizedItemList = useMemo(() => {
    return [...list].sort((a, b) => b.id - a.id);
  }, [list]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (value: string) => {
        await searchRecords(value);
      }, 500),
    [searchRecords]
  );

  const handleSearchChange = (value: string) => {
    debouncedSearch(value);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentActive={"Security Checkers"}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />

        <div className="max-h-screen overflow-y-auto">
          <SecurityCheckerTable
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

export default SecurityCheckerList;