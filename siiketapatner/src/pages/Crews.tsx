import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import crewStore from "@/store/crewStore";
import { CrewTable } from "@/components/Tables/CrewTable";
import authStore from "../store/authStore";

const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number,
) => {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const CrewList = () => {
  const { profile, fetchProfile } = authStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile ,profile ]);

  const id = profile?.id;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const items = crewStore((state) => state.items);
  const loading = crewStore((state) => state.loading);
  const fetchData = crewStore((state) => state.fetchRecords);
  const searchRecords = crewStore((state) => state.searchRecords);
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    fetchData(id);
  }, [id]);
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
    [searchRecords],
  );

  const handleSearchChange = (value: string) => {
    debouncedSearch(value);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentActive={"Crews"}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />

        <div className="max-h-screen overflow-y-auto">
          <CrewTable
            id={id}
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

export default CrewList;
