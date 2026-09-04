import { apiFetch } from "@/utils/api";
import { auth } from "@/utils/firebase";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithCustomToken,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { create } from "zustand";

interface Store {
  profile: any;
  loading: boolean;
  fetchError: boolean;
  errorMsg: string;
  otpPhone: string | null;
  initialized: boolean;
  initAuth: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (data: {
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  sendOtp: (phone: string) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (otp: string) => Promise<{ success: boolean; message?: string }>;
  resetOtp: () => void;
  logout: () => void;
}

async function syncProfile(
  token: string,
  opts: {
    name: string;
    email?: string;
    phone?: string;
    login_type: "email_auth" | "google_auth" | "phone_auth";
  },
) {
  const authHeaders = { Authorization: token, "Content-Type": "application/json" };

  const loginRes = await apiFetch("/api/users/login", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(opts),
  });
  if (!loginRes.ok) {
    const err = await loginRes.json().catch(() => ({}));
    throw new Error(err?.message || "Failed to log in");
  }

  const recordRes = await apiFetch("/api/users/record/self", {
    method: "GET",
    headers: authHeaders,
  });
  if (!recordRes.ok) throw new Error("Failed to fetch profile");
  const data = await recordRes.json();
  return data.record;
}

async function fetchProfile(token: string) {
  const res = await apiFetch("/api/users/record/login", {
    method: "GET",
    headers: { Authorization: `${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  const data = await res.json();
  return data.record;
}

let authListenerAttached = false;

const authStore = create<Store>((set, get) => ({
  profile: undefined,
  loading: false,
  fetchError: false,
  errorMsg: "",
  otpPhone: null,
  initialized: false,

  initAuth: () => {
    if (authListenerAttached) return;
    authListenerAttached = true;
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        set({ profile: undefined, initialized: true });
        return;
      }
      try {
        const token = await user.getIdToken();
        const record = await fetchProfile(token);
        set({ profile: record, initialized: true });
      } catch (e) {
        set({ profile: undefined, initialized: true });
      }
    });
  },

  login: async (email, password) => {
    try {
      set({ loading: true, fetchError: false });
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      const record = await syncProfile(token, {
        name: cred.user.displayName || email,
        email,
        login_type: "email_auth",
      });
      set({ profile: record, loading: false });
      return { success: true };
    } catch (e: any) {
      set({ loading: false, fetchError: true, errorMsg: e.message });
      return { success: false, message: e.message };
    }
  },

  signup: async (name, email, password) => {
    try {
      set({ loading: true, fetchError: false });
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const token = await cred.user.getIdToken();
      const record = await syncProfile(token, { name, email, login_type: "email_auth" });
      set({ profile: record, loading: false });
      return { success: true };
    } catch (e: any) {
      set({ loading: false, fetchError: true, errorMsg: e.message });
      return { success: false, message: e.message };
    }
  },

  loginWithGoogle: async () => {
    try {
      set({ loading: true, fetchError: false });
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const token = await cred.user.getIdToken();
      if (!cred.user.email) throw new Error("Google account has no email");
      const record = await syncProfile(token, {
        name: cred.user.displayName || cred.user.email,
        email: cred.user.email,
        login_type: "google_auth",
      });
      set({ profile: record, loading: false });
      return { success: true };
    } catch (e: any) {
      set({ loading: false, fetchError: true, errorMsg: e.message });
      return { success: false, message: e.message };
    }
  },

  sendOtp: async (phone) => {
    try {
      set({ loading: true, fetchError: false });
      const res = await apiFetch("/api/users/sendOTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to send OTP");
      }
      set({ loading: false, otpPhone: phone });
      return { success: true };
    } catch (e: any) {
      set({ loading: false, fetchError: true, errorMsg: e.message });
      return { success: false, message: e.message };
    }
  },

  verifyOtp: async (otp) => {
    const phone = get().otpPhone;
    if (!phone) return { success: false, message: "Send a code first" };
    try {
      set({ loading: true, fetchError: false });
      const res = await apiFetch("/api/users/verifyOTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Invalid OTP");
      }
      const { token } = await res.json();
      const cred = await signInWithCustomToken(auth, token);
      const token2 = await cred.user.getIdToken();
      console.log(token2);
      const record = await syncProfile(token2, {
        name: cred.user.displayName || `User ${phone.slice(-4)}`,
        phone,
        login_type: "phone_auth",
      });
      set({ profile: record, loading: false, otpPhone: null });
      return { success: true };
    } catch (e: any) {
      set({ loading: false, fetchError: true, errorMsg: e.message });
      return { success: false, message: e.message };
    }
  },

  resetOtp: () => set({ otpPhone: null, fetchError: false, errorMsg: "" }),

  logout: async () => {
    await signOut(auth);
    set({ profile: undefined, loading: false, fetchError: false, errorMsg: "", otpPhone: null });
  },

  updateProfile: async ({ name, email, phone, avatar }) => {
    try {
      set({ loading: true, fetchError: false });

      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");

      const token = await user.getIdToken();

      const res = await apiFetch("/api/users/record/update", {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          avatar,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to update profile");
      }

      const data = await res.json();

      set({
        profile: data.record,
        loading: false,
      });

      return { success: true };
    } catch (e: any) {
      set({
        loading: false,
        fetchError: true,
        errorMsg: e.message,
      });

      return {
        success: false,
        message: e.message,
      };
    }
  },
}));

export default authStore;
