import { apiFetch } from "@/utils/api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { create } from "zustand";

export interface BookingFilters {
  event_id?: string;
  booking_status?: string;
  payment_status?: string;
}

interface Store {
  items: any[];
  search: string;
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  filters: BookingFilters;
  loading: boolean;
  loadingMore: boolean;
  fetchError: boolean;
  errorMsg: string;
  fetchRecords: (filters?: BookingFilters) => Promise<void>;
  searchRecords: (q: string, filters?: BookingFilters) => Promise<{ status: boolean }>;
  setFilters: (filters: BookingFilters) => Promise<void>;
  loadMore: () => Promise<{ status: boolean }>;
}

const waitForUser = (): Promise<any> =>
  new Promise((resolve, reject) => {
    const authInstance = getAuth();
    const currentUser = authInstance.currentUser;
    if (currentUser) return resolve(currentUser);
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      unsubscribe();
      if (user) resolve(user);
      else reject(new Error("Not logged in"));
    });
  });

const buildParams = (opts: {
  page: number;
  limit: number;
  search?: string;
  filters?: BookingFilters;
}) => {
  const params = new URLSearchParams({
    page: String(opts.page),
    limit: String(opts.limit),
  });
  if (opts.search) params.append("search", opts.search);
  if (opts.filters?.event_id) params.append("event_id", opts.filters.event_id);
  if (opts.filters?.booking_status) params.append("booking_status", opts.filters.booking_status);
  if (opts.filters?.payment_status) params.append("payment_status", opts.filters.payment_status);
  return params;
};

const bookingStore = create<Store>((set, get) => ({
  items: [],
  search: "",
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 0,
  filters: {},
  loading: false,
  loadingMore: false,
  fetchError: false,
  errorMsg: "",

  fetchRecords: async (filters?: BookingFilters) => {
    try {
      set({ loading: true, fetchError: false });
      const user = await waitForUser();
      if (!user) throw new Error("Not logged in");
      const token = await user.getIdToken();

      const state = get();
      const activeFilters = filters ?? state.filters;
      const params = buildParams({
        page: 1,
        limit: state.limit,
        search: state.search,
        filters: activeFilters,
      });

      const res = await apiFetch(`/api/booking/admin/bookings?${params.toString()}`, {
        method: "GET",
        headers: { Authorization: token },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Failed to fetch bookings");

      set({
        items: resData.records ?? [],
        totalItems: resData.total ?? 0,
        totalPages: Math.ceil((resData.total ?? 0) / state.limit),
        page: 1,
        filters: activeFilters,
        loading: false,
        fetchError: false,
      });
    } catch (e: any) {
      set({ items: [], loading: false, fetchError: true, errorMsg: e?.message ?? "" });
    }
  },

  searchRecords: async (q: string, filters?: BookingFilters) => {
    try {
      set({ loading: true, fetchError: false });
      const user = await waitForUser();
      if (!user) throw new Error("Not logged in");
      const token = await user.getIdToken();

      const state = get();
      const activeFilters = filters ?? state.filters;
      const params = buildParams({
        page: 1,
        limit: state.limit,
        search: q,
        filters: activeFilters,
      });

      const res = await apiFetch(`/api/booking/admin/bookings?${params.toString()}`, {
        method: "GET",
        headers: { Authorization: token },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Failed to search bookings");

      set({
        items: resData.records ?? [],
        totalItems: resData.total ?? 0,
        totalPages: Math.ceil((resData.total ?? 0) / state.limit),
        page: 1,
        search: q,
        filters: activeFilters,
        loading: false,
        fetchError: false,
      });
      return { status: true };
    } catch (e) {
      set({ loading: false, fetchError: true });
      return { status: false };
    }
  },

  setFilters: async (filters: BookingFilters) => {
    set({ filters });
    await get().fetchRecords(filters);
  },

  loadMore: async () => {
    const state = get();
    if (state.loadingMore) return { status: false };
    const nextPage = state.page + 1;
    if (state.totalPages && nextPage > state.totalPages) return { status: false };

    try {
      set({ loadingMore: true });
      const user = await waitForUser();
      if (!user) throw new Error("Not logged in");
      const token = await user.getIdToken();

      const params = buildParams({
        page: nextPage,
        limit: state.limit,
        search: state.search,
        filters: state.filters,
      });

      const res = await apiFetch(`/api/booking/admin/bookings?${params.toString()}`, {
        method: "GET",
        headers: { Authorization: token },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Failed to load more bookings");

      set({
        items: [...state.items, ...(resData.records ?? [])],
        page: nextPage,
        totalItems: resData.total ?? state.totalItems,
        totalPages: Math.ceil((resData.total ?? state.totalItems) / state.limit),
        loadingMore: false,
      });
      return { status: true };
    } catch (e) {
      set({ loadingMore: false });
      return { status: false };
    }
  },
}));

export default bookingStore;