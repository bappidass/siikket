import { create } from "zustand";
import { pb } from "@/lib/pocketbase";

interface Store {
    items: any[];
    loading: boolean;
    startDate: string | null;
    endDate: string | null;
    totalItems: number;
    page: number;
    totalPages: number;
    fetchRecords: (client_id: string) => Promise<void>;
    saveRecord: (data: any) => Promise<{ status: boolean }>;
    updateRecord: (id: string, data: any) => Promise<{ status: boolean }>;
    deleteRecord: (id: string) => Promise<{ status: boolean }>;
    searchRecords: (start: string, end: string, query: string) => Promise<{ status: boolean }>;
    loadMore: (page: number, start: string, end: string, query: string) => Promise<{ status: boolean }>;
}

const invoiceStore = create<Store>((set, get) => ({
    items: [],
    loading: false,
    startDate: "",
    endDate: "",
    totalItems: 0,
    page: 1,
    totalPages: 0,
    fetchRecords: async (client_id: string) => {
        const state = get();
        if (state.items.length > 0) return;

        try {
            set({ loading: true });
            const record = await pb.collection("master_invoices").getList(1, 10, {
                sort: "-created",
                filter: `client = "${client_id}"`,
                expand: "client,invoices_via_master_invoice.transaction.fleet, payments_via_master_invoice"
            });

            set({
                items: record.items,
                totalItems: record.totalItems, totalPages: record.totalPages, loading: false, page: 1
            });
        } catch (error: any) {
            set({ loading: false });
        }
    },
    searchRecords: async (start: string, end: string, query: string) => {
        try {
            const conditions = [];
            if (query.trim() !== '') {
                const safeQuery = query.replace(/"/g, '\\"');
                conditions.push(`fleet.truck_no~"${safeQuery}" || mf_no~"${safeQuery}"`);
            }

            if (start && end) {
                conditions.push(`created >= "${start} 00:00:00"`);
                conditions.push(`created <= "${end} 23:59:59"`);
            }

            const filter = conditions.join(" && ");

            const record = await pb.collection("master_invoices").getList(1, 10, {
                sort: "-created",
                filter: filter,
                expand: "client,invoices_via_master_invoice"
            });

            set({
                items: record.items,
                totalItems: record.totalItems, totalPages: record.totalPages, loading: false, page: 1,
                startDate: start, endDate: end
            });
            return {
                status: true
            }
        } catch (error: any) {
            return {
                status: false
            }
        }
    },
    saveRecord: async (data: any) => {
        try {
            const record = await pb.collection("master_invoices").create(data, {
                expand: "client,invoices_via_master_invoice"
            });
            const currentItems = get().items;
            set({ items: [record, ...currentItems] });
            return {
                status: true
            }
        } catch (e) {
            return {
                status: false
            }
        }
    },
    updateRecord: async (id: string, data: any) => {
        try {
            const updatedRecord = await pb.collection("master_invoices").update(id, data, {
                expand: "client,invoices_via_master_invoice"
            });
            const currentItems = get().items;
            const updatedItems = currentItems.map((item) =>
                item.id === id ? updatedRecord : item
            );

            set({ items: updatedItems });

            return {
                status: true
            }
        } catch (e) {
            return {
                status: false
            }
        }
    },
    deleteRecord: async (id: string) => {
        try {
            await pb.collection("transactions").delete(id);
            const currentItems = get().items;
            const updatedItems = currentItems.filter((e) => e.id != id);
            set({ items: updatedItems });
            return {
                status: true
            }
        } catch (e) {
            return {
                status: false
            }
        }
    },
    loadMore: async (page: number, start: string, end: string, query: string) => {
        try {
            const conditions = [];

            if (query.trim() !== '') {
                const safeQuery = query.replace(/"/g, '\\"');
                conditions.push(`fleet.truck_no~"${safeQuery}" || mf_no~"${safeQuery}"`);
            }

            if (start && end) {
                conditions.push(`created >= "${start} 00:00:00"`);
                conditions.push(`created <= "${end} 23:59:59"`);
            }

            const filter = conditions.join(" && ");

            const result = await pb
                .collection("master_invoices")
                .getList(page, 10, {
                    sort: "-created",
                    filter: filter,
                    expand: "client,invoices_via_master_invoice"
                })

            set({ items: result.items, page: page, });
            return {
                status: true
            }
        } catch (error: any) {
            return {
                status: false
            }
        }
    },
}));

export default invoiceStore;
