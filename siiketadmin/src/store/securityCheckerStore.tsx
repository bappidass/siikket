import { apiFetch } from "@/utils/api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { create } from "zustand";

interface Store {
    items: any[];
    search: string;
    page: number;
    totalItems: number;
    totalPages: number;
    loading: boolean;
    fetchError: boolean;
    errorMsg: string;
    fetchRecords: () => Promise<void>;
    saveRecord: (data: any) => Promise<{ status: boolean }>;
    updateRecord: (data: any) => Promise<{ status: boolean }>;
    deleteRecord: (id: string) => Promise<{ status: boolean }>;
    loadMore: (page: number) => Promise<{ status: boolean }>;
    searchRecords: (q: string) => Promise<{ status: boolean }>;
    getCheckerAssignments: (
        checkerId: string
    ) => Promise<{ status: boolean; items: any[] }>;
    assignToZone: (
        checkerId: string,
        eventId: string,
        zoneId: string
    ) => Promise<{ status: boolean }>;
    removeAssignment: (
        assignmentId: string
    ) => Promise<{ status: boolean }>;
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

const securityCheckerStore = create<Store>((set, get) => ({
    items: [],
    page: 1,
    totalItems: 0,
    totalPages: 0,
    search: "",
    loading: false,
    fetchError: false,
    errorMsg: "",

    fetchRecords: async () => {
        const state = get();
        if (state?.items.length > 0) return;
        try {
            set({ loading: true });
            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();
            const res = await apiFetch(`/api/security-checkers/records`, {
                method: "GET",
                headers: {
                    "Authorization": token,
                },
            });
            const resData = await res.json();
            if (!res.ok)
                throw new Error(`Failed to fetch record. ${resData.message}`);
            const items: any[] = resData.items;
            set({
                items,
                loading: false,
                fetchError: false,
                totalItems: resData.total,
                totalPages: resData.total_pages,
                page: resData.page,
            });
        } catch (e) {
            set({ items: [], loading: false, fetchError: true });
        }
    },

    searchRecords: async (q: string) => {
        try {
            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();
            const res = await apiFetch(
                `/api/security-checkers/records?search=${q}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": token,
                    },
                }
            );
            const resData = await res.json();

            if (!res.ok)
                throw new Error(`Failed to fetch records. ${resData.message}`);
            const items: any[] = resData.items;
            set({
                items,
                fetchError: false,
                totalItems: resData.total,
                totalPages: resData.total_pages,
                page: 1,
                search: q,
            });
            return {
                status: true,
            };
        } catch (e) {
            return {
                status: false,
            };
        }
    },

    saveRecord: async (data: any) => {
        const state = get();
        try {
            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();
            const res = await apiFetch(`/api/security-checkers/create`, {
                method: "POST",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const resData = await res.json();
            if (!res.ok)
                return {
                    status: false,
                };

            const items = [resData.record, ...state.items];
            set({ items });
            return {
                status: true,
            };
        } catch (e) {
            console.log(e);
            return {
                status: false,
            };
        }
    },

    updateRecord: async (data: any) => {
        const state = get();
        try {
            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();
            const res = await apiFetch(`/api/security-checkers/update`, {
                method: "PUT",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const resData = await res.json();
            if (!res.ok)
                return {
                    status: false,
                };

            const items = [...state.items];
            const index = items.findIndex((e) => e.id == resData.record.id);
            if (index != -1) {
                items[index] = resData.record;
                set({ items });
            }

            return {
                status: true,
            };
        } catch (e) {
            return {
                status: false,
            };
        }
    },

    deleteRecord: async (id: string) => {
        const state = get();
        try {
            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();
            const res = await apiFetch(
                `/api/security-checkers/record/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": token,
                    },
                }
            );
            if (!res.ok)
                return {
                    status: false,
                };

            let items = [...state.items];
            items = items.filter((e) => e.id != id);
            set({ items });
            return {
                status: true,
            };
        } catch (e) {
            return {
                status: false,
            };
        }
    },

    loadMore: async (page: number) => {
        const state = get();
        try {
            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();
            const search = state.search;
            const res = await apiFetch(
                `/api/security-checkers/records?page=${page}&search=${search}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": token,
                    },
                }
            );
            const resData = await res.json();
            if (!res.ok)
                throw new Error(`Failed to fetch record. ${resData.message}`);
            const items: any[] = resData.items;
            set({
                items,
                page,
                totalItems: resData.total,
                totalPages: resData.total_pages,
            });
            return {
                status: true,
            };
        } catch (e) {
            return {
                status: false,
            };
        }
    },
    getCheckerAssignments: async (checkerId: string) => {
        try {
            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();
            const res = await apiFetch(
                `/api/security-checkers/assignments/checker/${checkerId}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": token,
                    },
                }
            );
            const resData = await res.json();
            if (!res.ok) return { status: false, items: [] };
            return { status: true, items: resData.items ?? [] };
        } catch (e) {
            return { status: false, items: [] };
        }
    },

    assignToZone: async (
        checkerId: string,
        eventId: string,
        zoneId: string
    ) => {
        try {
            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();
            const res = await apiFetch(`/api/security-checkers/assignments`, {
                method: "POST",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    event_id: eventId,
                    zone_id: zoneId,
                    checker_id: checkerId,
                }),
            });
            if (!res.ok) return { status: false };
            return { status: true };
        } catch (e) {
            return { status: false };
        }
    },

    removeAssignment: async (assignmentId: string) => {
        try {
            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();
            const res = await apiFetch(
                `/api/security-checkers/assignments/${assignmentId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": token,
                    },
                }
            );
            if (!res.ok) return { status: false };
            return { status: true };
        } catch (e) {
            return { status: false };
        }
    },
}));

export default securityCheckerStore;