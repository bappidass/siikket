import { ReactNode } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Ticket,
  CalendarDays,
  Users,
  BarChart3,
} from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  footer?: ReactNode;
}

const AuthLayout = ({
  children,
  title,
  description,
  footer,
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-slate-100 overflow-hidden">
      {/* LEFT PANEL */}
      <div className="hidden md:flex md:w-3/5 relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950">
        {/* Glow Effects */}
        <div className="absolute top-[-120px] right-[-100px] h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[-120px] h-80 w-80 rounded-full bg-pink-500/20 blur-3xl" />

        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl w-fit mb-6">
            <Ticket className="h-4 w-4 text-purple-300" />
            <span className="text-sm font-medium text-purple-100">
              Event Management Platform
            </span>
          </div>

          <h1 className="text-6xl font-black leading-tight">
            Manage Events
            <span className="block bg-gradient-to-r from-purple-300 via-pink-200 to-indigo-300 bg-clip-text text-transparent">
              Like a Pro
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-300 max-w-xl">
            Create events, manage ticket sales, monitor attendees,
            track revenue, and oversee venue operations from a
            centralized administration dashboard.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4 mt-10 max-w-lg">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <CalendarDays className="h-7 w-7 text-purple-300 mb-3" />
              <h4 className="font-semibold">Event Scheduling</h4>
              <p className="text-sm text-slate-400 mt-1">
                Organize and publish events effortlessly.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <Ticket className="h-7 w-7 text-pink-300 mb-3" />
              <h4 className="font-semibold">Ticket Management</h4>
              <p className="text-sm text-slate-400 mt-1">
                Control ticket inventory and pricing.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <Users className="h-7 w-7 text-indigo-300 mb-3" />
              <h4 className="font-semibold">Attendee Tracking</h4>
              <p className="text-sm text-slate-400 mt-1">
                Monitor registrations and check-ins.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <BarChart3 className="h-7 w-7 text-purple-300 mb-3" />
              <h4 className="font-semibold">Sales Analytics</h4>
              <p className="text-sm text-slate-400 mt-1">
                Gain insights into revenue and performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-2/5 relative flex items-center justify-center px-6 py-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-200">
              <Ticket className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              {title}
            </h2>

            {description && (
              <p className="mt-3 text-sm leading-6 text-slate-500 max-w-sm mx-auto">
                {description}
              </p>
            )}
          </div>

          <Card className="overflow-hidden rounded-3xl border-0 bg-white/90 backdrop-blur-xl shadow-2xl shadow-slate-200">
            <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />

            <CardContent className="px-8 py-8">
              {children}
            </CardContent>

            {footer && (
              <CardFooter className="border-t border-slate-100 bg-slate-50/70 px-8 py-5">
                <div className="w-full text-center text-sm text-slate-500">
                  {footer}
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;