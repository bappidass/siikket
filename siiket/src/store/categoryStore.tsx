import { apiFetch } from "@/utils/api";
import { create } from "zustand";

interface Store {
    category: any[];
    loading: boolean;
    fetchError: boolean;
    errorMsg: string;
    fetchCategory: () => Promise<void>;
}

const categoryStore = create<Store>((set, get) => ({
    category: [],
    loading: false,
    fetchError: false,
    errorMsg: "",
    fetchCategory: async () => {
        const state = get();
        if (state?.category.length > 0) return;
        try {
            set({ loading: true });
            const res = await apiFetch(`/api/categories/records`, {
                method: "GET",
            });

            const resData = await res.json();
               console.log(resData)
            if (!res.ok)
                throw new Error(`Failed to fetch record. ${resData.message}`);
            const category: any[] = resData.items;
            set({ category, loading: false, fetchError: false });
        } catch (e) {
            set({ category: [], loading: false, fetchError: true });
        }
    }
}));

export default categoryStore;