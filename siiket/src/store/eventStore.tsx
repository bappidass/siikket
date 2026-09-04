import { apiFetch } from "@/utils/api";
import { create } from "zustand";

export interface SeatingType {
    id: string;
    event_id: string;
    name: string;
    price: string;
    total_seats: number;
    available_seats: number;
    sort_order: number;
    image?: string;
}

export interface EventRecord {
    id: string;
    image: string;
    venue_image?: string;
    category: string;
    title: string;
    description: string;
    city: string;
    address: string;
    event_date: string;
    duration_minutes: number;
    languages: string[];
    is_active: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    gallery: string[];
    prefix: string;
    zones: { name: string }[];
    organizer_id: string | null;
    seating_types: SeatingType[];
}

interface Filters {
    search?: string;
    category?: string;
    city?: string;
}

interface Store {
    items: EventRecord[];
    search: string;
    category: string;
    city: string;
    page: number;
    totalItems: number;
    totalPages: number;
    loading: boolean;
    fetchError: boolean;
    errorMsg: string;
    // Fetches page 1 with the given filters (sent as query params, matching
    // getEvents on the backend: search / category / city). Pass {} to clear
    // filters. Skips the request if the filters are unchanged and data is
    // already loaded.
    fetchRecords: (filters?: Filters) => Promise<void>;
    // Loads a given page using whatever filters are currently active.
    loadMore: (page: number) => Promise<{ status: boolean }>;
    searchRecords: (q: string) => Promise<{ status: boolean }>;
    fetchOne: (id: string) => Promise<EventRecord | null>;
}

function buildQuery(params: Record<string, string | number | undefined>) {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            usp.set(key, String(value));
        }
    });
    const qs = usp.toString();
    return qs ? `?${qs}` : "";
}

const eventStore = create<Store>((set, get) => ({
    items: [],
    page: 1,
    totalItems: 0,
    totalPages: 0,
    search: "",
    category: "",
    city: "",
    loading: false,
    fetchError: false,
    errorMsg: "",

    fetchRecords: async (filters = {}) => {
        const state = get();
        const search = filters.search ?? state.search;
        const category = filters.category ?? "";
        const city = filters.city ?? "";

        const unchanged =
            state.items.length > 0 &&
            state.search === search &&
            state.category === category &&
            state.city === city;
        if (unchanged) return;

        try {
            set({ loading: true, fetchError: false });
            const qs = buildQuery({ search, category, city });
            const res = await apiFetch(`/api/events/records${qs}`, {
                method: "GET",
            });
            const resData = await res.json();
            if (!res.ok)
                throw new Error(`Failed to fetch records. ${resData.message}`);
            const items: EventRecord[] = resData.items;
            set({
                items,
                loading: false,
                fetchError: false,
                page: resData.page ?? 1,
                totalItems: resData.total ?? items.length,
                totalPages: resData.total_pages ?? 1,
                search,
                category,
                city,
            });
        } catch (e: any) {
            set({
                items: [],
                loading: false,
                fetchError: true,
                errorMsg: e?.message ?? "Something went wrong",
            });
        }
    },

    searchRecords: async (q: string) => {
        const state = get();
        try {
            set({ loading: true, fetchError: false });
            const qs = buildQuery({
                search: q,
                category: state.category,
                city: state.city,
            });
            const res = await apiFetch(`/api/events/records${qs}`, {
                method: "GET",
            });
            const resData = await res.json();
            if (!res.ok)
                throw new Error(`Failed to fetch records. ${resData.message}`);
            const items: EventRecord[] = resData.items;
            set({
                items,
                loading: false,
                fetchError: false,
                totalItems: resData.total,
                totalPages: resData.total_pages,
                page: 1,
                search: q,
            });
            return { status: true };
        } catch (e) {
            set({ loading: false, fetchError: true });
            return { status: false };
        }
    },

    fetchOne: async (id: string) => {
        try {
            const res = await apiFetch(`/api/events/record/${id}`, {
                method: "GET",
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData?.message ?? "Event not found");
            return resData.record as EventRecord;
        } catch (e) {
            return null;
        }
    },

    loadMore: async (page: number) => {
        const state = get();
        try {
            set({ loading: true });
            const qs = buildQuery({
                page,
                search: state.search,
                category: state.category,
                city: state.city,
            });
            const res = await apiFetch(`/api/events/records${qs}`, {
                method: "GET",
            });
            const resData = await res.json();
            if (!res.ok)
                throw new Error(`Failed to fetch records. ${resData.message}`);
            const items: EventRecord[] = resData.items;
            set({
                items,
                page: resData.page ?? page,
                totalItems: resData.total,
                totalPages: resData.total_pages,
                loading: false,
            });
            return { status: true };
        } catch (e) {
            set({ loading: false });
            return { status: false };
        }
    },
}));

export default eventStore;