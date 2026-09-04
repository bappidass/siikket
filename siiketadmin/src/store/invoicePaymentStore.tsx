import { create } from "zustand";
import type { RecordModel } from "pocketbase";
import { pb } from "@/lib/pocketbase";
import invoiceStore from "./invoiceStore";

interface Store {
    items: any[];
    loading: boolean;
    fetchRecords: (id: string) => Promise<void>;
    saveRecord: (data: any) => Promise<{ status: boolean }>;
    updateRecord: (id: string, data: any) => Promise<{ status: boolean }>;
    deleteRecord: (id: string) => Promise<{ status: boolean }>;
}

const invoicePaymentstore = create<Store>((set, get) => ({
    items: [],
    loading: false,
    fetchRecords: async (id: string) => {
        const state = get();
        if (state.items.length > 0) return;

        try {
            set({ loading: true });

            const items = await pb.collection("payments").getFullList<RecordModel>({
                sort: "-created",
                filter: `master_invoice = "${id}"`
            });

            set({
                items,
                loading: false,
            });
        } catch (error: any) {
            set({ loading: false });
        }
    },
    saveRecord: async (data: any) => {
        try {
            const record = await pb.collection("payments").create(data);

            const currentItems = get().items;

            invoiceStore.setState((state) => ({
                items: state.items.map((invoice) =>
                    invoice.id === data.master_invoice
                        ? {
                            ...invoice,
                            expand: {
                                ...invoice.expand,
                                payments_via_master_invoice: [
                                    ...(invoice.expand?.payments_via_master_invoice || []),
                                    record
                                ]
                            }
                        }
                        : invoice
                )
            }));

            set({ items: [record, ...currentItems] });

            return { status: true };
        } catch (e) {
            return { status: false };
        }
    },
    updateRecord: async (id: string, data: any) => {
        try {
            const updatedRecord = await pb.collection("payments").update(id, data);

            set((state) => ({
                items: state.items.map((item) =>
                    item.id === id ? updatedRecord : item
                )
            }));

            invoiceStore.setState((state) => ({
                items: state.items.map((invoice) => ({
                    ...invoice,
                    expand: {
                        ...invoice.expand,
                        payments_via_master_invoice:
                            invoice.expand?.payments_via_master_invoice?.map((payment) =>
                                payment.id === id ? updatedRecord : payment
                            ) || []
                    }
                }))
            }));

            return {
                status: true
            };
        } catch (e) {
            return {
                status: false
            };
        }
    },
    deleteRecord: async (id: string) => {
        try {
            await pb.collection("payments").delete(id);
            const currentItems = get().items;
            const updatedItems = currentItems.filter((e) => e.id != id);
            set({ items: updatedItems });
            invoiceStore.setState((state) => ({
                items: state.items.map((invoice) => ({
                    ...invoice,
                    expand: {
                        ...invoice.expand,
                        payments_via_master_invoice:
                            invoice.expand?.payments_via_master_invoice?.filter(
                                (payment) => payment.id !== id
                            ) || []
                    }
                }))
            }));
            return {
                status: true
            }
        } catch (e) {
            return {
                status: false
            }
        }
    },
}));

export default invoicePaymentstore;
