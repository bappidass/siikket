import { apiFetch } from "@/utils/api";
import { getAuth } from "firebase/auth";
import { create } from "zustand";

export type ScanStatus =
  | "not_found"
  | "invalid_booking"
  | "not_assigned"
  | "zone_mismatch"
  | "already_scanned"
  | "scanned";

export interface ScanResult {
  ok: boolean;
  status: ScanStatus;
  message: string;
  record: any | null;
  assigned_zone_name: string | null;
}

interface Store {
  stats: { total_scanned: number; today_scanned: number };
  statsLoading: boolean;

  assignments: any[];
  assignmentsLoading: boolean;

  history: any[];
  historyLoading: boolean;
  historyError: boolean;
  page: number;
  totalPages: number;
  totalItems: number;

  scanning: boolean;
  lastResult: ScanResult | null;

  fetchStats: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  fetchHistory: (page?: number, search?: string) => Promise<void>;
  scanTicket: (code: string) => Promise<ScanResult>;
  clearLastResult: () => void;
}

const authHeader = async () => {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not logged in");
  const token = await user.getIdToken();
  return { Authorization: token };
};

const securityScanStore = create<Store>((set, get) => ({
  stats: { total_scanned: 0, today_scanned: 0 },
  statsLoading: false,

  assignments: [],
  assignmentsLoading: false,

  history: [],
  historyLoading: false,
  historyError: false,
  page: 1,
  totalPages: 1,
  totalItems: 0,

  scanning: false,
  lastResult: null,

  fetchStats: async () => {
    try {
      set({ statsLoading: true });
      const headers = await authHeader();
      const res = await apiFetch("/api/security-checkers/scan/stats", {
        method: "GET",
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      set({
        stats: {
          total_scanned: data.total_scanned,
          today_scanned: data.today_scanned,
        },
        statsLoading: false,
      });
    } catch (e) {
      set({ statsLoading: false });
    }
  },

  fetchAssignments: async () => {
    try {
      set({ assignmentsLoading: true });
      const headers = await authHeader();
      const res = await apiFetch(
        "/api/security-checkers/assignments/mine/list",
        { method: "GET", headers }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      set({ assignments: data.items || [], assignmentsLoading: false });
    } catch (e) {
      set({ assignmentsLoading: false });
    }
  },

  fetchHistory: async (page = 1, search = "") => {
    try {
      set({ historyLoading: true, historyError: false });
      const headers = await authHeader();
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (search) params.set("search", search);

      const res = await apiFetch(
        `/api/security-checkers/scan/history?${params.toString()}`,
        { method: "GET", headers }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      set({
        history: data.items || [],
        page: data.page,
        totalPages: data.total_pages,
        totalItems: data.total,
        historyLoading: false,
      });
    } catch (e) {
      set({ historyLoading: false, historyError: true });
    }
  },

  scanTicket: async (code: string) => {
    set({ scanning: true });
    try {
      const headers = await authHeader();
      const res = await apiFetch("/api/security-checkers/scan", {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const data: ScanResult = await res.json();

      set({ scanning: false, lastResult: data });

      // Keep the stats/history in sync whenever a scan actually succeeds
      if (data.status === "scanned") {
        get().fetchStats();
        get().fetchHistory(1);
      }

      return data;
    } catch (e: any) {
      const fallback: ScanResult = {
        ok: false,
        status: "not_found",
        message: e.message || "Failed to reach server",
        record: null,
        assigned_zone_name: null,
      };
      set({ scanning: false, lastResult: fallback });
      return fallback;
    }
  },

  clearLastResult: () => set({ lastResult: null }),
}));

export default securityScanStore;