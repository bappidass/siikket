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
    fetchRecords: () => Promise<void>;
    saveRecord: (data: any) => Promise<{ status: boolean }>;
    updateRecord: (id: string, data: any) => Promise<{ status: boolean }>;
    deleteRecord: (id: string) => Promise<{ status: boolean }>;
    searchRecords: (start: string, end: string, query: string) => Promise<{ status: boolean }>;
    loadMore: (page: number, start: string, end: string, query: string) => Promise<{ status: boolean }>;
    getCSV: (start: String, end: String) => Promise<{ status: boolean }>;
}

const challanStore = create<Store>((set, get) => ({
    items: [],
    loading: false,
    startDate: "",
    endDate: "",
    totalItems: 0,
    page: 1,
    totalPages: 0,
    fetchRecords: async () => {
        const state = get();
        if (state.items.length > 0) return;

        try {
            set({ loading: true });
            const record = await pb.collection("challans").getList(1, 10, {
                sort: "-created",
                expand: "fleet,transactions,challan_payments_via_challan"
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

            const record = await pb.collection("challans").getList(1, 10, {
                sort: "-created",
                filter: filter,
                expand: "fleet,transactions,challan_payments_via_challan"
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
            const record = await pb.collection("challans").create(data, {
                expand: "fleet,transactions,challan_payments_via_challan"
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
            const updatedRecord = await pb.collection("challans").update(id, data, {
                expand: "fleet,transactions,challan_payments_via_challan"
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
            await pb.collection("challans").delete(id);
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
                .collection("challans")
                .getList(page, 10, {
                    sort: "-created",
                    filter: filter,
                    expand: "fleet,transactions,challan_payments_via_challan"
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
    getCSV: async (start: string, end: string) => {
        try {
            const conditions = [];

            if (start && end) {
                conditions.push(`created >= "${start} 00:00:00"`);
                conditions.push(`created <= "${end} 23:59:59"`);
            }

            const filter = conditions.join(" && ");

            const items = await pb.collection("challans").getFullList({
                sort: "-created",
                filter: filter,
                expand: "fleet,transactions,challan_payments_via_challan"
            });

            if (!items || items.length === 0) {
                return {
                    status: true
                }
            }

            const headers = [
                "Slno",
                "MF No",
                "Destination",

                "Truck Number",
                "Chassis Number",
                "Engine Number",
                "Driver Name",
                "Driver Mobile",
                "Driving Licence No",
                "Driver Aadhaar",
                "Truck Owner Name",
                "Truck Owner Mobile",
                "Truck Owner Aadhaar",
                "Truck Owner PAN",
                "Truck Owner Account No",
                "Truck Owner GST",
                "Truck Owner Address",

                "Freight Per Ton",
                "Total Freight",
                "Freight Amount",
                "Advance Amount",
                "Balance Amount",
                "TDS Amount",
                "Hired Through",
                "Consignment Notes",
                "Payments"
            ];

            const rows = items.map((item: any, i: number) => [
                i + 1,
                item.mf_no || "",
                item.destination || "",

                item.expand.fleet?.truck_no || "",
                item.expand.fleet?.chassis_no || "",
                item.expand.fleet?.engine_no || "",
                item.driver_name || "",
                item.driver_mobile_no || "",
                item.driving_licence_no || "",
                item.driver_aadhaar_no || "",
                item.expand.fleet?.truck_owner_name || "",
                item.expand.fleet?.truck_owner_mobile_no || "",
                item.expand.fleet?.truck_owner_aadhaar_no || "",
                item.expand.fleet?.truck_owner_pan_no || "",
                item.expand.fleet?.truck_owner_account_no || "",
                item.expand.fleet?.truck_owner_gst_no || "",
                item.expand.fleet?.truck_owner_address || "",

                item.freight_per_ton || 0,
                item.total_freight || 0,
                item.freight_rs || 0,
                item.advance_rs || 0,
                item.balance_rs || 0,
                item.tds_rs || 0,
                item.hired_through || "",
                item.expand?.transactions?.map((e:any)=>e.cn_no).join(" | "),
                item.expand?.challan_payments_via_challan?.map((e:any)=>`Paid:${e.paid}, Pending:${e.pending}, date:${new Date(e.created).toLocaleDateString()}`).join(" | ") || ""
            ]);
            const csvContent = [
                headers.join(","),
                ...rows.map((r) =>
                    r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
                ),
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `challans_${start}_to_${end}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return {
                status: true
            };
        } catch (e) {
            return {
                status: false
            };
        }
    },
}));

export default challanStore;
