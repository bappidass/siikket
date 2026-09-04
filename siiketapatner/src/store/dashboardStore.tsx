import { create } from "zustand";
import { BASE_URL } from "@/utils/api";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export type MonthlyTrendPoint = {
  month: string;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
};

export type CategoryBreakdown = {
  category: string;
  count: number;
};

export type DashboardData = {
  partner: {
    id: string;
    name: string;
    type: string;
  } | null;
  total_crew: number;
  approved_crew: number;
  pending_crew: number;
  rejected_crew: number;
  monthly_trend: MonthlyTrendPoint[];
  category_breakdown: CategoryBreakdown[];
};

const emptyData: DashboardData = {
  partner: null,
  total_crew: 0,
  approved_crew: 0,
  pending_crew: 0,
  rejected_crew: 0,
  monthly_trend: [],
  category_breakdown: [],
};

const waitForUser = (): Promise<any> =>
  new Promise((resolve, reject) => {
    const auth = getAuth();

    if (auth.currentUser) {
      return resolve(auth.currentUser);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();

      if (user) resolve(user);
      else reject(new Error("Not logged in"));
    });
  });

type DashboardState = {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  fetchData: (eventPartnerId?: string) => Promise<void>;
};

const useDashboardStore = create<DashboardState>((set) => ({
  data: emptyData,
  loading: false,
  error: null,

  fetchData: async (eventPartnerId?: string) => {
    set({ loading: true, error: null });

    try {
      const user = await waitForUser();
      const token = await user.getIdToken();

      const url = new URL(
        `${BASE_URL}/api/partners/dashboard/${eventPartnerId ?? ""}`
      );

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || "Failed to load dashboard data");
      }

      set({
        data: json,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        data: emptyData,
        loading: false,
        error: err?.message || "Failed to load dashboard data",
      });
    }
  },
}));

export default useDashboardStore;