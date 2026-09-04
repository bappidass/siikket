// src/store/uiStore.ts
import { create } from "zustand";

interface UIStore {
  profileSheetOpen: boolean;
  openProfileSheet: () => void;
  closeProfileSheet: () => void;
}

const uiStore = create<UIStore>((set) => ({
  profileSheetOpen: false,
  openProfileSheet: () => set({ profileSheetOpen: true }),
  closeProfileSheet: () => set({ profileSheetOpen: false }),
}));

export default uiStore;