import { apiFetch } from "@/utils/api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { create } from "zustand";

interface DashboardData {
  today_revenue: number;
  weekly_revenue: number;
  monthly_revenue: number;
  total_revenue: number;
}

interface DashboardStore {
  data: DashboardData | null;
  loading: boolean;
  fetchError: boolean;
  errorMsg: string;
  fetchData: () => Promise<void>;
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

const useDashboardStore = create<DashboardStore>((set) => ({
  data: null,
  loading: false,
  fetchError: false,
  errorMsg: "",

  fetchData: async () => {
    try {
      set({ loading: true });

      const user = await waitForUser();
      if (!user) throw new Error("Not logged in");
      const token = await user.getIdToken();

      const res = await apiFetch(`/api/dashboard/admin`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      const resData = await res.json();

      if (!res.ok)
        throw new Error(`Failed to fetch dashboard data. ${resData.message}`);

      set({ data: resData.record, loading: false, fetchError: false });
    } catch (e) {
      set({ loading: false, fetchError: true });
    }
  },
}));

export default useDashboardStore;