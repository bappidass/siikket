import { apiFetch } from "@/utils/api";
import { create } from "zustand";

interface Store {
  banners: any[];
  loading: boolean;
  fetchError: boolean;
  errorMsg: string;
  fetchBanners: () => Promise<void>;
}

const bannerStore = create<Store>((set, get) => ({
  banners: [],
  loading: false,
  fetchError: false,
  errorMsg: "",
  fetchBanners: async () => {
    const state = get();
    if (state?.banners.length > 0) return;
    try {
      set({ loading: true });
      console.log("trying to fetch banners");

      const res = await apiFetch(`/api/banners/records`, {
        method: "GET",
      });
      const resData = await res.json();

      if (!res.ok) throw new Error(`Failed to fetch record. ${resData.message}`);
      const banners: any[] = resData.items;
      set({ banners, loading: false, fetchError: false });
    } catch (e) {
      set({ banners: [], loading: false, fetchError: true });
    }
  },
}));

export default bannerStore;
