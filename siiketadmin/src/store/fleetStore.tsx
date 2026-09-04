import { create } from "zustand";
import type { RecordModel } from "pocketbase";
import { pb } from "@/lib/pocketbase";

interface Store {
    items: any[];
    loading: boolean;
    fetchRecords: () => Promise<void>;
    saveRecord: (data: any) => Promise<{ status: boolean }>;
    updateRecord: (id: string, data: any) => Promise<{ status: boolean }>;
    deleteRecord: (id: string) => Promise<{ status: boolean }>;
}

const fleetStore = create<Store>((set, get) => ({
    items: [],
    loading: false,
    fetchRecords: async () => {
        const state = get();
        if (state.items.length > 0) return;

        try {
            set({ loading: true });

            const items = await pb.collection("fleets").getFullList<RecordModel>({
                sort: "-created",
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
            const record = await pb.collection("fleets").create(data);
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
            const updatedRecord = await pb.collection("fleets").update(id, data);
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
            await pb.collection("fleets").delete(id);
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
}));

export default fleetStore;
