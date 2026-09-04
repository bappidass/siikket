import { create } from "zustand";
import { pb } from "@/lib/pocketbase";

interface Store {
    items: any[];
    txns: any[];
    txnItems: any[];
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
    getTxnByFleetId: (id: string) => Promise<{ status: boolean }>;
    getTxnByClientId: (id: string) => Promise<{ status: boolean }>;
    getCSV: (start: String, end: String) => Promise<{ status: boolean }>;
}

const txnStore = create<Store>((set, get) => ({
    items: [],
    txns: [],
    txnItems: [],
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
            const record = await pb.collection("transactions").getList(1, 10, {
                sort: "-created",
                expand: "fleet,client,invoices_via_transaction,consignor_name,consignee_name"
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
                conditions.push(`client.name~"${safeQuery}" || client.phone~"${safeQuery}" || client.email~"${safeQuery}" || fleet.truck_no~"${safeQuery}"`);
            }

            if (start && end) {
                conditions.push(`created >= "${start} 00:00:00"`);
                conditions.push(`created <= "${end} 23:59:59"`);
            }

            const filter = conditions.join(" && ");

            const record = await pb.collection("transactions").getList(1, 10, {
                sort: "-created",
                filter: filter,
                expand: "fleet,client,invoices_via_transaction,consignor_name,consignee_name"
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
            console.log(error)
            return {
                status: false
            }
        }
    },
    saveRecord: async (data: any) => {
        try {
            const record = await pb.collection("transactions").create(data, {
                expand: "fleet,client,invoices_via_transaction,consignor_name,consignee_name"
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
            const updatedRecord = await pb.collection("transactions").update(id, data, {
                expand: "fleet,client,invoices_via_transaction"
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
                conditions.push(`client.name~"${safeQuery}" || client.phone~"${safeQuery}" || client.email~"${safeQuery}" || fleet.truck_no~"${safeQuery}"`);
            }

            if (start && end) {
                conditions.push(`created >= "${start} 00:00:00"`);
                conditions.push(`created <= "${end} 23:59:59"`);
            }

            const filter = conditions.join(" && ");

            const result = await pb
                .collection("transactions")
                .getList(page, 10, {
                    sort: "-created",
                    filter: filter,
                    expand: "fleet,client,invoices_via_transaction,consignor_name,consignee_name"
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
    getTxnByFleetId: async (id: string) => {
        try {
            set({
                txns: [],
            });
            const conditions = [];
            if (id !== '') {
                conditions.push(`fleet = "${id}"`);
            }

            const filter = conditions.join(" && ");

            const record = await pb.collection("transactions").getList(1, 50, {
                sort: "-created",
                filter: `${filter} && challan = ""`,
            });

            set({
                txns: record.items,
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
    getTxnByClientId: async (id: string) => {
        try {
            set({
                txnItems: [],
            });
            const conditions = [];
            if (id !== '') {
                conditions.push(`transaction.client = "${id}"`);
            }

            const filter = conditions.join(" && ");

            const record = await pb.collection("invoices").getList(1, 50, {
                sort: "-created",
                filter: `${filter} && master_invoice = ""`,
            });

            set({
                txnItems: record.items,
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
    getCSV: async (start: string, end: string) => {
        try {
            const conditions = [];

            if (start && end) {
                conditions.push(`created >= "${start} 00:00:00"`);
                conditions.push(`created <= "${end} 23:59:59"`);
            }

            const filter = conditions.join(" && ");

            const items = await pb.collection("transactions").getFullList({
                sort: "-created",
                filter: filter,
                expand: "fleet,client,invoices_via_transaction"
            });

            if (!items || items.length === 0) {
                return {
                    status: true
                }
            }

            const headers = [
                "Slno",
                "CN No",

                // Client Details
                "Client Name",
                "Client Phone",
                "Client Email",
                "Client Aadhaar",
                "Client PAN",
                "Client Address",
                "Client GST",

                // Fleet / Truck Details
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

                // Challan Details
                "From Location",
                "To Location",
                "Loading Weight",
                "Unloading Weight",
                "Date Of Loading",
                "Eway Bill No",
                "Eway Bill Valid Till",
                "Delivery Date",
                "Rate Per Tonne",
                "Tonne",
                "Amount",
                "Freight Charge Per KG",
                "CGST",
                "SGST Amount",
                "IGST Amount",
                "TDS Amount",
                "Insurance",
                "Surcharge",
                "Statistical Charge",
                "Labour Charge",
                "Consignment Note Amount",
                "Guarantee Charge",
                "Is Fixed Charge",
                "Fixed Charge",
                "Total Amount",
                "Advance Amount",
                "Remaining Balance",
                "Vehicle Provider",
                "Client Provider",
                "Vehicle Amount",
                "Client Amount",
                "At Own Risk",
                "Carrier Risk",
            ];

            const rows = items.map((item: any, i: number) => [
                i + 1,
                item.cn_no || "",

                // Client Details
                item.expand.client?.name || "",
                item.expand.client?.phone || "",
                item.expand.client?.email || "",
                item.expand.client?.aadhar || "",
                item.expand.client?.pan || "",
                item.expand.client?.address || "",
                item.expand.client?.gst || "",

                // Fleet / Truck Details
                item.expand.fleet?.truck_no || "",
                item.expand.fleet?.chassis_no || "",
                item.expand.fleet?.engine_no || "",
                item.expand.fleet?.driver_name || "",
                item.expand.fleet?.driver_mobile_no || "",
                item.expand.fleet?.driving_licence_no || "",
                item.expand.fleet?.driver_aadhaar_no || "",
                item.expand.fleet?.truck_owner_name || "",
                item.expand.fleet?.truck_owner_mobile_no || "",
                item.expand.fleet?.truck_owner_aadhaar_no || "",
                item.expand.fleet?.truck_owner_pan_no || "",
                item.expand.fleet?.truck_owner_account_no || "",
                item.expand.fleet?.truck_owner_gst_no || "",
                item.expand.fleet?.truck_owner_address || "",

                // Challan Details
                item.from_location || "",
                item.to_location || "",
                item.loading_point_weight || 0,
                item.unloading_point_weight || 0,
                item.date_of_loading
                    ? new Date(item.date_of_loading).toLocaleDateString()
                    : "",

                item.eway_bill_no || "",

                item.eway_bill_valid_till
                    ? new Date(item.eway_bill_valid_till).toLocaleDateString()
                    : "",

                item.delivery_date
                    ? new Date(item.delivery_date).toLocaleDateString()
                    : "",

                item.rate_per_tonne || 0,
                item.tonne || 0,
                item.amount || 0,
                item.freight_charge_per_kg || 0,
                item.cgst || 0,
                item.sgst_amount || 0,
                item.igst_amount || 0,
                item.tds_amount || 0,
                item.insurance || 0,
                item.surcharge || 0,
                item.statistical_charge || 0,
                item.labour_charge || 0,
                item.consignment_note_amount || 0,
                item.guarantee_charge || 0,
                item.is_fixed_charge || "No",
                item.fixed_charge || 0,
                item.total_amount || 0,
                item.advance_amount || 0,
                item.remaining_balance || 0,
                item.vehicle_provider || "",
                item.client_provider || "",
                item.vehicle_amount || 0,
                item.client_amount || 0,
                item.at_own_risk || "No",
                item.carrier_risk || "No",
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
            link.download = `transactions_${start}_to_${end}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return {
                status : true
            };
        } catch (e) {
            return {
                status : false
            };
        }
    },
}));

export default txnStore;
