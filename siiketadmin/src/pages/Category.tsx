import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { CategoryTable } from "@/components/Tables/CategoryTable";
import categoryStore from "@/store/categoryStore";

const CategoryList = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const items = categoryStore((state) => state.items);
    const loading = categoryStore((state) => state.loading);
    const fetchData = categoryStore((state) => state.fetchRecords);
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
        const ar = items.filter((a) => a.title.toLowerCase().includes(value.toLowerCase()));
        if (value.trim() == '') {
            setList(items);
        } else {
            setList(ar);
        }
    };
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                currentActive={"Category"}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />
                <div className="max-h-screen overflow-y-auto">
                    <CategoryTable
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

export default CategoryList;
