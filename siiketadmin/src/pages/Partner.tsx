import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { OrganisationTable } from "@/components/Tables/OrganisationTable";
import organisationStore from "@/store/organisationStore";

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

const OrganisationList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const items = organisationStore((state) => state.items);
  const loading = organisationStore((state) => state.loading);
  const fetchData = organisationStore((state) => state.fetchRecords);
  const searchRecords = organisationStore((state) => state.searchRecords);
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
        currentActive={"Organizations"}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />

        <div className="max-h-screen overflow-y-auto">
          <OrganisationTable
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

export default OrganisationList;