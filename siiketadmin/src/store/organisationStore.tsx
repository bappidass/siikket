import { apiFetch } from "@/utils/api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { create } from "zustand";

interface Store {
    items: any[];
    search: string,
    page: number,
    totalItems: number,
    totalPages: number,
    loading: boolean;
    fetchError: boolean;
    errorMsg: string;
    fetchRecords: () => Promise<void>;
    saveRecord: (data: any) => Promise<{ status: boolean }>;
    updateRecord: (data: any) => Promise<{ status: boolean }>;
    deleteRecord: (id: string) => Promise<{ status: boolean }>;
    loadMore: (page: number) => Promise<{ status: boolean }>;
    searchRecords: (q: string) => Promise<{ status: boolean }>;
    searchItems: (q: string, type: string) => Promise<{ status: boolean, items: any[] }>;
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

const organisationStore = create<Store>((set, get) => ({
    items: [],
    page: 1,
    totalItems: 0,
    totalPages: 0,
    search: '',
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
            const res = await apiFetch(`/api/partners/records`, {
                method: "GET",
                headers: {
                    "Authorization": token,
                },
            });
            const resData = await res.json();
            if (!res.ok)
                throw new Error(`Failed to fetch record. ${resData.message}`);
            const items: any[] = resData.items;
            set({ items, loading: false, fetchError: false });
        } catch (e) {
            set({ items: [], loading: false, fetchError: true });
        }
    },
    searchRecords: async (q: string) => {
        try {
            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();
            const res = await apiFetch(`/api/partners/records?search=${q}`, {
                method: "GET",
                headers: {
                    "Authorization": token,
                },
            });
            const resData = await res.json();

            if (!res.ok)
                throw new Error(`Failed to fetch records. ${resData.message}`);
            const items: any[] = resData.items;
            set({ items, fetchError: false, totalItems: resData.total, totalPages: resData.totalPages, page: 1, search: q });
            return {
                status: true
            }
        } catch (e) {
            return {
                status: false
            }
        }
    },
    saveRecord: async (data: any) => {
        const state = get();
        try {
            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();
            const res = await apiFetch(`/api/partners/create`, {
                method: "POST",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            const resData = await res.json();
            if (!res.ok)
                return {
                    status: false
                }

            const items = [resData.record, ...state.items];
            set({ items });
            return {
                status: true
            }
        } catch (e) {
            console.log(e)
            return {
                status: false
            }
        }
    },
    updateRecord: async (data: any) => {
        const state = get();
        try {
            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();
            const res = await apiFetch(`/api/partners/update`, {
                method: "PUT",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            const resData = await res.json();
            if (!res.ok)
                return {
                    status: false
                }

            const items = [...state.items];
            const index = items.findIndex((e) => e.id == resData.record.id);
            if (index != -1) {
                items[index] = resData.record;
                set({ items });
            }

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
        const state = get();
        try {
            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();
            const res = await apiFetch(`/api/partners/record/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": token,
                },
            });
            if (!res.ok)
                return {
                    status: false
                }

            let items = [...state.items];
            items = items.filter((e) => e.id != id);
            set({ items })
            return {
                status: true
            }
        } catch (e) {
            return {
                status: false
            }
        }
    },
    loadMore: async (page: number) => {
        const state = get();
        try {
            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();
            const search = state.search;
            const res = await apiFetch(`/api/partners/records?page=${page}&search=${search}`, {
                method: "GET",
                headers: {
                    "Authorization": token,
                },
            });
            const resData = await res.json();
            if (!res.ok)
                throw new Error(`Failed to fetch record. ${resData.message}`);
            const items: any[] = resData.items;
            set({ items: items, page: page });
            return {
                status: true
            }
        } catch (e) {
            return {
                status: false
            }
        }
    },

    searchItems: async (q: string, type: string) => {
        try {
            const user = await waitForUser();
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();
            const res = await apiFetch(`/api/partners/records?search=${q}&type=${type}`, {
                method: "GET",
                headers: {
                    "Authorization": token,
                },
            });
            const resData = await res.json();

            if (!res.ok)
                throw new Error(`Failed to fetch records. ${resData.message}`);
            const items: any[] = resData.items;
            return {
                items: items,
                status: true
            }
        } catch (e) {
            return {
                items: [],
                status: false
            }
        }
    },
}));

export default organisationStore;
