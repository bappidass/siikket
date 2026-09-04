import { useState } from "react";
import authStore from "@/store/authStore";

export function PhoneOtpForm({ onSuccess }: { onSuccess: () => void }) {
  const otpPhone = authStore((s) => s.otpPhone);
  const sendOtp = authStore((s) => s.sendOtp);
  const verifyOtp = authStore((s) => s.verifyOtp);
  const resetOtp = authStore((s) => s.resetOtp);

  const [phone, setPhone] = useState("+91 ");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await sendOtp(phone);
    setSubmitting(false);
    if (!result.success) setError(result.message || "Failed to send code");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await verifyOtp(code);
    setSubmitting(false);
    if (result.success) onSuccess();
    else setError(result.message || "Invalid code");
  };

  if (!otpPhone) {
    return (
      <form className="space-y-4" onSubmit={handleSend}>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-bold mb-2">Phone number</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex justify-center rounded-xl bg-primary text-primary-foreground py-3 font-bold hover:opacity-95 transition disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send code"}
        </button>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleVerify}>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <p className="text-sm text-foreground/75">
        Enter the code sent to <span className="font-semibold">{otpPhone}</span>
      </p>
      <input
        type="text"
        inputMode="numeric"
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="6-digit code"
        className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
      />
      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex justify-center rounded-xl bg-primary text-primary-foreground py-3 font-bold hover:opacity-95 transition disabled:opacity-60"
      >
        {submitting ? "Verifying…" : "Verify & continue"}
      </button>
      <button
        type="button"
        onClick={resetOtp}
        className="w-full text-center text-sm font-semibold text-primary"
      >
        Use a different number
      </button>
    </form>
  );
}