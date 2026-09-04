import { apiFetch } from "@/utils/api";
import { create } from "zustand";
import { auth } from "@/utils/firebase";

export interface BookingTicket {
  id: string;
  booking_id: string;
  ticket_number: string;
  is_used: boolean;
  used_at: string | null;
  serial_number: string;
}

export interface Booking {
  id: string;
  user_id: string;
  event_id: string;
  seating_type_id: string;
  quantity: number;
  ticket_price: string;
  subtotal: string;
  cgst: string;
  sgst: string;
  igst: string;
  discount_amount: string;
  total_amount: string;
  booking_status: "pending" | "completed" | "expired" | "cancelled" | string;
  payment_status: "pending" | "paid" | "failed" | string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  order_id?: string;
  payment_id?: string | null;
  booked_by: string;
  booked_by_id: string;
  created_at: string;
  updated_at: string;
  payment_type?: string;
  event_title: string;
  event_image: string;
  venue_image: string;
  event_date: string;
  city: string;
  location: string;
  prefix: string;
  seating_type: string;
  tickets?: BookingTicket[];
}

export function isBookingComplete(b: Booking) {
  return b.booking_status === "completed" && b.payment_status === "paid" && !!b.tickets?.length;
}

interface CreateBookingPayload {
  event_id: string;
  seating_type_id: string;
  quantity: number;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

interface CreateBookingResult {
  status: boolean;
  booking?: Booking;
  tickets?: BookingTicket[];
  message?: string;
}

interface Store {
  creating: boolean;
  error: string | null;
  loading: boolean;
  currentBooking: Booking | null;
  tickets: BookingTicket[];
  bookings: Booking[];
  createBooking: (payload: CreateBookingPayload) => Promise<CreateBookingResult>;
  fetchMyBookings: () => Promise<boolean>;
  fetchBookingById: (id: string) => Promise<Booking | null>;

  reset: () => void;
}

const bookingStore = create<Store>((set, get) => ({
  creating: false,
  error: null,
  loading: false,
  currentBooking: null,
  tickets: [],
  bookings: [],

  createBooking: async (payload) => {
    set({ creating: true, error: null });
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Please login first");
      const token = await user.getIdToken();

      const res = await apiFetch("/api/booking/create", {
        method: "POST",
        headers: { Authorization: token, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData?.message ?? "Failed to create booking");

      set({ creating: false, currentBooking: resData.booking, tickets: resData.tickets ?? [] });
      return { status: true, booking: resData.booking, tickets: resData.tickets };
    } catch (e: any) {
      const message = e?.message ?? "Something went wrong";
      set({ creating: false, error: message });
      return { status: false, message };
    }
  },

  fetchMyBookings: async () => {
    set({ loading: true, error: null });
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Please login first");
      const token = await user.getIdToken();

      const res = await apiFetch("/api/booking/my-bookings", {
        method: "GET",
        headers: { Authorization: token },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch bookings");

      set({ loading: false, bookings: data.records ?? data ?? [] });
      return true;
    } catch (e: any) {
      set({ loading: false, error: e.message || "Something went wrong" });
      return false;
    }
  },

  fetchBookingById: async (id) => {
    set({ loading: true, error: null });

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Please login first");

      const token = await user.getIdToken();

      const res = await apiFetch(`/api/booking/user/${id}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch booking");
      }

      set({
        loading: false,
        currentBooking: data.record,
      });

      return data.record;
    } catch (e: any) {
      set({
        loading: false,
        error: e.message || "Something went wrong",
      });

      return null;
    }
  },
  reset: () => set({ creating: false, error: null, currentBooking: null, tickets: [] }),
}));

export default bookingStore;
