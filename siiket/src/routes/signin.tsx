import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import authStore from "@/store/authStore";
import { PhoneOtpForm } from "@/components/PhoneOtpForm";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — SiiKET" },
      { name: "description", content: "Sign in to your SiiKET account to manage bookings." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const loginWithGoogle = authStore((s) => s.loginWithGoogle);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goHome = () => navigate({ to: "/" });

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    const result = await loginWithGoogle();
    setSubmitting(false);
    if (result.success) goHome();
    else setError(result.message || "Failed to sign in with Google");
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-12">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="relative aspect-[5/4] md:aspect-square w-full rounded-3xl bg-dark text-dark-foreground overflow-hidden grid place-items-center">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/15 blur-xl" />
          <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-primary/10 blur-xl" />
          <div className="absolute bottom-12 -left-10 h-40 w-40 rounded-full bg-primary/20" />
          <h1 className="relative text-6xl md:text-7xl font-black tracking-tight">SiiKET</h1>
        </div>

        <div className="px-2 md:px-8">
          <h2 className="text-3xl font-extrabold flex items-center gap-2">
            Welcome Back <span>👋</span>
          </h2>
          <p className="mt-4 text-foreground/75 leading-relaxed max-w-sm">
            Today is a new day. It's your day. You shape it. Sign in to start managing your bookings.
          </p>

          <div className="mt-8 max-w-sm">
            {error && (
              <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <PhoneOtpForm onSuccess={goHome} />

            <div className="relative text-center my-5">
              <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border" />
              <span className="relative bg-background px-3 text-sm text-muted-foreground">Or</span>
            </div>

         
            <p className="text-center text-sm text-foreground/75 mt-5">
              Don't you have an account? <Link to="/signup" className="font-bold text-primary">Sign up</Link>
            </p>
            <p className="text-center text-xs text-muted-foreground pt-4">© 2026 ALL RIGHTS RESERVED</p>
          </div>
        </div>
      </div>
    </div>
  );
}