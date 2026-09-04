import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import bookingStore from "@/store/bookingStore";
import { BookingTable } from "@/components/Tables/BookingTable";

const debounce = <T extends (...args: any[]) => void>(func: T, delay: number) => {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};

const BookingsList = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const items = bookingStore((state) => state.items);
    const loading = bookingStore((state) => state.loading);
    const fetchData = bookingStore((state) => state.fetchRecords);
    const searchRecords = bookingStore((state) => state.searchRecords);

    useEffect(() => {
        fetchData();
    }, []);

    const debouncedSearch = useMemo(
        () =>
            debounce(async (value: string) => {
                await searchRecords(value);
            }, 500),
        [searchRecords]
    );

    const handleSearchChange = (value: string) => debouncedSearch(value);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} currentActive={"Bookings"} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />

                <div className="max-h-screen overflow-y-auto">
                    <BookingTable
                        items={items}
                        loading={loading}
                        error={false}
                        onSearchChange={handleSearchChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default BookingsList;