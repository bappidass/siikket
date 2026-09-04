import { apiFetch } from "@/utils/api";
import { auth } from "@/utils/firebase";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { create } from "zustand";

interface Store {
  profile: any;
  loading: boolean;
  fetchError: boolean;
  errorMsg: String;
  fetchProfile: () => Promise<void>;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
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

const securityAuthStore = create<Store>((set, get) => ({
  profile: undefined,
  loading: false,
  fetchError: false,
  errorMsg: "",

  fetchProfile: async () => {
    const state = get();
    if (state?.profile) return;
    try {
      set({ loading: true });
      const user = await waitForUser();
      if (!user) throw new Error("Not logged in");
      const token = await user.getIdToken();
      const res = await apiFetch(`/api/security-checkers/record/login`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });
      const resData = await res.json();
      if (!res.ok)
        throw new Error(`Failed to fetch record. ${resData.message}`);
      const record: any = resData.record;
      set({ profile: record, loading: false, fetchError: false });
    } catch (e) {
      set({ profile: null, loading: false, fetchError: true });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true });
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      const res = await apiFetch("/api/security-checkers/record/login", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch record`);
      const data = await res.json();
      const record: any = data.record;
      set({ profile: record, loading: false });
      return { success: true };
    } catch (e: any) {
      set({ loading: false });
      return { success: false, message: e.message };
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ profile: undefined, loading: false });
  },
}));

export default securityAuthStore;