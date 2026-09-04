import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import organisationStore from "@/store/organisationStore";
import { EventTable } from "@/components/Tables/EventTable";
import eventStore from "@/store/eventStore";
import categoryStore from "@/store/categoryStore";

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

const EventList = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const {fetchRecords: fetchOrganisation } = organisationStore()
    const {fetchRecords: fetchCategories } = categoryStore();
    const items = eventStore((state) => state.items);
    const loading = eventStore((state) => state.loading);
    const fetchData = eventStore((state) => state.fetchRecords);
    const searchRecords = eventStore((state) => state.searchRecords);
    const [list, setList] = useState<any[]>([]);

    useEffect(() => {
        fetchCategories();
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
                currentActive={"Events"}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />

                <div className="max-h-screen overflow-y-auto">
                    <EventTable
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

export default EventList;