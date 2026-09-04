import { create } from "zustand";
import type { RecordModel } from "pocketbase";
import { pb } from "@/lib/pocketbase";
import challanStore from "./challanStore";

interface Store {
    items: any[];
    loading: boolean;
    fetchRecords: (id: string) => Promise<void>;
    saveRecord: (data: any) => Promise<{ status: boolean }>;
    updateRecord: (id: string, data: any) => Promise<{ status: boolean }>;
    deleteRecord: (id: string) => Promise<{ status: boolean }>;
}

const challanPaymentstore = create<Store>((set, get) => ({
    items: [],
    loading: false,
    fetchRecords: async (id: string) => {
        const state = get();
        if (state.items.length > 0) return;

        try {
            set({ loading: true });

            const items = await pb.collection("challan_payments").getFullList<RecordModel>({
                sort: "-created",
                filter: `challan = "${id}"`
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
            const record = await pb.collection("challan_payments").create(data);
            const currentItems = get().items;
            set({ items: [record, ...currentItems] });
            challanStore.setState((state) => ({
                items: state.items.map((challan) =>
                    challan.id === data.challan
                        ? {
                            ...challan,
                            expand: {
                                ...challan.expand,
                                challan_payments_via_challan: [
                                    ...(challan.expand?.challan_payments_via_challan || []),
                                    record
                                ]
                            }
                        }
                        : challan
                )
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
    updateRecord: async (id: string, data: any) => {
        try {
            const updatedRecord = await pb.collection("challan_payments").update(id, data);
            const currentItems = get().items;
            const updatedItems = currentItems.map((item) =>
                item.id === id ? updatedRecord : item
            );

            set({ items: updatedItems });

            challanStore.setState((state) => ({
                items: state.items.map((challan) => ({
                    ...challan,
                    expand: {
                        ...challan.expand,
                        challan_payments_via_challan:
                            challan.expand?.challan_payments_via_challan?.map((payment) =>
                                payment.id === id ? updatedRecord : payment
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
    deleteRecord: async (id: string) => {
        try {
            await pb.collection("challan_payments").delete(id);
            const currentItems = get().items;
            const updatedItems = currentItems.filter((e) => e.id != id);
            set({ items: updatedItems });
            challanStore.setState((state) => ({
                items: state.items.map((challan) => ({
                    ...challan,
                    expand: {
                        ...challan.expand,
                        challan_payments_via_challan:
                            challan.expand?.challan_payments_via_challan?.filter(
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

export default challanPaymentstore;
