import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Pencil,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import authStore from "@/store/authStore";
import bookingStore, { Booking, isBookingComplete } from "@/store/bookingStore";
import uiStore from "@/store/uiStore";
import { ImageUpload } from "@/components/ImageUpload";
import { resolveImageUrl } from "@/utils/constants";

function statusBadge(b: Booking) {
  if (isBookingComplete(b)) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
        <CheckCircle2 className="h-3 w-3" /> Confirmed
      </span>
    );
  }
  if (b.booking_status === "expired") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
        <XCircle className="h-3 w-3" /> Expired
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
      <Clock className="h-3 w-3" /> Pending
    </span>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  const closeSheet = uiStore((s) => s.closeProfileSheet);

  return (
    <Link
      to="/bookings/$bookingId"
      params={{ bookingId: booking.id }}
      onClick={closeSheet}
      className="flex items-center gap-3 py-3 border-b last:border-b-0 border-border/60 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition"
    >
      <img
        src={resolveImageUrl(booking.event_image)}
        alt={booking.event_title}
        className="h-12 w-12 rounded-md object-cover shrink-0 bg-muted"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{booking.event_title}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(booking.event_date).toLocaleDateString()} · {booking.city}
        </p>
      </div>
      {statusBadge(booking)}
    </Link>
  );
}

function BookingRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-b-0 border-border/60 animate-pulse">
      <div className="h-12 w-12 rounded-md bg-muted shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-3.5 w-3/5 rounded bg-muted" />
        <div className="h-3 w-2/5 rounded bg-muted" />
      </div>
      <div className="h-6 w-20 rounded-full bg-muted shrink-0" />
    </div>
  );
}

export function ProfileContent() {
  const navigate = useNavigate();
  const closeSheet = uiStore((s) => s.closeProfileSheet);

  const profile = authStore((s) => s.profile);
  const updateProfileFn = authStore((s) => s.updateProfile);
  const logout = authStore((s) => s.logout);

  const bookings = bookingStore((s) => s.bookings);
  const bookingsLoading = bookingStore((s) => s.loading);
  const fetchMyBookings = bookingStore((s) => s.fetchMyBookings);

  const [bookingsOpen, setBookingsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [avatarKey, setAvatarKey] = useState(profile?.avatar ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingsOpen) {
      fetchMyBookings();
    }
  }, [bookingsOpen, fetchMyBookings]);

  useEffect(() => {
    setName(profile?.name ?? "");
    setEmail(profile?.email ?? "");
    setPhone(profile?.phone ?? "");
    setAvatarKey(profile?.avatar ?? "");
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    const res = await updateProfileFn({ name, email, phone, avatar: avatarKey });
    setSaving(false);
    if (!res.success) setSaveError(res.message ?? "Failed to update profile");
    else setEditOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeSheet();
    navigate({ to: "/" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full overflow-hidden bg-muted grid place-items-center shrink-0">
          {profile?.avatar ? (
            <img
              src={resolveImageUrl(profile.avatar)}
              alt={profile?.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserIcon className="h-7 w-7 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold truncate">{profile?.name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {profile?.phone ?? profile?.email}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
        <button
          onClick={() => setBookingsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5"
        >
          <span className="flex items-center gap-3 font-semibold text-sm">
            <FileText className="h-4 w-4 text-primary" /> My Bookings
          </span>

          {bookingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {bookingsOpen && (
          <div className="px-4 pb-3 border-t border-border/60 max-h-80 overflow-y-auto">
            {bookingsLoading &&
              Array.from({ length: 3 }).map((_, i) => <BookingRowSkeleton key={i} />)}

            {!bookingsLoading && bookings.length === 0 && (
              <p className="text-sm text-muted-foreground py-3">No bookings yet.</p>
            )}

            {!bookingsLoading &&
              bookings.map((b) => <BookingRow key={b.id} booking={b} />)}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
        <button
          onClick={() => setEditOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5"
        >
          <span className="flex items-center gap-3 font-semibold text-sm">
            <Pencil className="h-4 w-4 text-primary" /> Edit Profile
          </span>
          {editOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {editOpen && (
          <div className="px-4 pb-4 border-t border-border/60 space-y-4 pt-4">
            <ImageUpload
              initialImage={resolveImageUrl(avatarKey)}
              onUploadComplete={(key) => setAvatarKey(key)}
              folder="avatars"
            />
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
              />
            </div>
            {saveError && <p className="text-sm text-red-500">{saveError}</p>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 rounded-2xl bg-card border border-border/60 px-4 py-3.5 font-semibold text-left text-sm"
      >
        <LogOut className="h-4 w-4 text-primary" /> Log Out
      </button>
    </div>
  );
}